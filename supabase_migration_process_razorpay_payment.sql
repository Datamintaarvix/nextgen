-- ============================================================================
-- NEXTGEN DMA VENTURES - ATOMIC RAZORPAY PAYMENT CONCURRENCY RPC MIGRATION
-- ============================================================================
-- Function: public.process_razorpay_payment
-- Purpose : Atomically verify business rules, enforce row-level concurrency locks,
--           prevent double-crediting across browser callbacks and webhooks, and
--           safely handle unique-constraint races on razorpay_payment_id.
-- Target  : Review carefully before executing in Supabase Dashboard SQL Editor.

CREATE OR REPLACE FUNCTION public.process_razorpay_payment(
    p_order_id TEXT,
    p_payment_id TEXT,
    p_registration_id TEXT,
    p_amount NUMERIC,
    p_currency TEXT DEFAULT 'INR',
    p_signature TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
    v_reg RECORD;
    v_payment RECORD;
    v_existing_payment RECORD;
    v_new_amount_paid NUMERIC;
    v_new_remaining NUMERIC;
    v_new_status TEXT;
BEGIN
    -- 1. Strict Input Validation
    IF p_order_id IS NULL OR btrim(p_order_id) = '' THEN
        RAISE EXCEPTION 'Invalid payment parameters: p_order_id must be non-empty.';
    END IF;

    IF p_payment_id IS NULL OR btrim(p_payment_id) = '' THEN
        RAISE EXCEPTION 'Invalid payment parameters: p_payment_id must be non-empty.';
    END IF;

    IF p_registration_id IS NULL OR btrim(p_registration_id) = '' THEN
        RAISE EXCEPTION 'Invalid payment parameters: p_registration_id must be non-empty.';
    END IF;

    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'Invalid payment amount: p_amount must be a positive number.';
    END IF;

    -- Explicitly require INR; NULL or non-INR currency must be rejected
    IF p_currency IS NULL OR btrim(p_currency) <> 'INR' THEN
        RAISE EXCEPTION 'Invalid currency: expected INR, received %.', COALESCE(p_currency, 'NULL');
    END IF;

    -- 2. Consistent Row-Lock Ordering (registrations -> payments) to prevent deadlocks
    SELECT * INTO v_reg
    FROM public.registrations
    WHERE registration_id = p_registration_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Registration record not found: %', p_registration_id;
    END IF;

    SELECT * INTO v_payment
    FROM public.payments
    WHERE razorpay_order_id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment record not found for order: %', p_order_id;
    END IF;

    -- 3. Ownership and Exact Amount Validation (without unintended rounding)
    IF v_payment.registration_id <> p_registration_id THEN
        RAISE EXCEPTION 'Order % does not belong to registration %.', p_order_id, p_registration_id;
    END IF;

    -- Stored payment currency must exactly match the validated incoming currency
    IF v_payment.currency IS DISTINCT FROM p_currency THEN
        RAISE EXCEPTION 'Payment currency mismatch: stored currency is %, received currency is %.',
            COALESCE(v_payment.currency, 'NULL'),
            p_currency;
    END IF;

    IF v_payment.amount <> p_amount THEN
        RAISE EXCEPTION 'Payment amount mismatch: stored payment amount is %, received %.',
            v_payment.amount, p_amount;
    END IF;

    -- 4. Idempotency & Replay Protection (evaluated post-commit after acquiring locks)
    -- Case 4A: Identical order and payment ID already processed -> idempotent duplicate
    IF v_payment.payment_status = 'success' THEN
        IF v_payment.razorpay_payment_id = p_payment_id THEN
            RETURN pg_catalog.jsonb_build_object(
                'success', true,
                'already_processed', true,
                'is_new', false,
                'payment_id', p_payment_id,
                'order_id', p_order_id,
                'registration_id', p_registration_id,
                'amount', v_payment.amount,
                'currency', 'INR',
                'payment_status', v_payment.payment_status,
                'registration_status', v_reg.registration_status,
                'total_amount_paid', v_reg.total_amount_paid,
                'remaining_balance', v_reg.remaining_balance,
                'message', 'Transaction already verified and processed.'
            );
        END IF;

        -- Case 4B: Different payment ID attempting to credit an already-completed order
        RAISE EXCEPTION 'Order % is already completed with payment ID %; cannot credit again with %.',
            p_order_id, COALESCE(v_payment.razorpay_payment_id, 'NULL'), p_payment_id;
    END IF;

    -- Only pending ('created') payment records may advance to 'success'
    IF v_payment.payment_status IS DISTINCT FROM 'created' THEN
        RAISE EXCEPTION 'Payment record for order % cannot be processed in status %.',
            p_order_id, v_payment.payment_status;
    END IF;

    -- Case 4C: Ensure p_payment_id is not already assigned to another order
    SELECT * INTO v_existing_payment
    FROM public.payments
    WHERE razorpay_payment_id = p_payment_id;

    IF FOUND AND v_existing_payment.id <> v_payment.id THEN
        RAISE EXCEPTION 'Payment ID % is already assigned to another order (%).',
            p_payment_id, v_existing_payment.razorpay_order_id;
    END IF;

    -- 5. Exact Business Rules Enforcement
    IF v_reg.registration_status = 'Payment Cancelled' THEN
        RAISE EXCEPTION 'Registration % has been cancelled and cannot accept payments.', p_registration_id;
    END IF;

    IF v_reg.registration_status = 'Fully Paid' OR COALESCE(v_reg.remaining_balance, 0) <= 0 THEN
        RAISE EXCEPTION 'Registration % is already fully paid.', p_registration_id;
    END IF;

    IF v_payment.payment_type = 'advance' THEN
        IF v_reg.payment_type <> 'advance' THEN
            RAISE EXCEPTION 'Advance payment requires registration payment_type to be advance (found: %).',
                v_reg.payment_type;
        END IF;

        IF COALESCE(v_reg.total_amount_paid, 0) <> 0 THEN
            RAISE EXCEPTION 'Advance payment requires zero previous paid amount (found: %).',
                COALESCE(v_reg.total_amount_paid, 0);
        END IF;

        IF p_amount <> 2499 THEN
            RAISE EXCEPTION 'Advance payment must be exactly 2499 INR (received: %).', p_amount;
        END IF;

    ELSIF v_payment.payment_type = 'full' THEN
        IF v_reg.payment_type <> 'full' THEN
            RAISE EXCEPTION 'Full payment requires registration payment_type to be full (found: %).',
                v_reg.payment_type;
        END IF;

        IF COALESCE(v_reg.total_amount_paid, 0) <> 0 THEN
            RAISE EXCEPTION 'Full payment requires zero previous paid amount (found: %).',
                COALESCE(v_reg.total_amount_paid, 0);
        END IF;

        IF p_amount <> v_reg.total_course_fee THEN
            RAISE EXCEPTION 'Full payment amount (%) must equal total_course_fee (%).',
                p_amount, v_reg.total_course_fee;
        END IF;

    ELSIF v_payment.payment_type = 'balance' THEN
        IF COALESCE(v_reg.total_amount_paid, 0) <= 0 THEN
            RAISE EXCEPTION 'Balance payment requires existing paid amount greater than 0 (found: %).',
                COALESCE(v_reg.total_amount_paid, 0);
        END IF;

        IF NOT EXISTS (
            SELECT 1
            FROM public.payments
            WHERE registration_id = p_registration_id
              AND payment_status = 'success'
              AND amount > 0
        ) THEN
            RAISE EXCEPTION 'Balance payment requires an existing successful prior payment record for registration %.',
                p_registration_id;
        END IF;

    ELSE
        RAISE EXCEPTION 'Unsupported payment_type % for order %.', v_payment.payment_type, p_order_id;
    END IF;

    -- Overpayment prevention
    v_new_amount_paid := COALESCE(v_reg.total_amount_paid, 0) + p_amount;
    IF v_new_amount_paid > v_reg.total_course_fee THEN
        RAISE EXCEPTION 'Overpayment rejected: new total paid (%) would exceed total course fee (%).',
            v_new_amount_paid, v_reg.total_course_fee;
    END IF;

    v_new_remaining := v_reg.total_course_fee - v_new_amount_paid;

    -- Preserve original registration status progression
    IF v_new_remaining = 0 THEN
        v_new_status := 'Fully Paid';
    ELSIF v_payment.payment_type = 'advance' THEN
        v_new_status := 'Advance Paid';
    ELSE
        v_new_status := 'Balance Pending';
    END IF;

    -- 6. Atomic Update with Safe Unique-Constraint Race Guard
    -- Updating payments first ensures any unique_violation on razorpay_payment_id aborts before registration totals change.
    -- Only unique_violation is intercepted; unrelated database errors propagate untouched.
    BEGIN
        UPDATE public.payments
        SET razorpay_payment_id = p_payment_id,
            razorpay_signature = COALESCE(p_signature, razorpay_signature),
            payment_status = 'success',
            verified_at = NOW()
        WHERE id = v_payment.id;

        UPDATE public.registrations
        SET total_amount_paid = v_new_amount_paid,
            remaining_balance = v_new_remaining,
            registration_status = v_new_status,
            updated_at = NOW()
        WHERE registration_id = p_registration_id;

    EXCEPTION
        WHEN unique_violation THEN
            -- Re-inspect committed state strictly for the exact same order & payment ID race
            SELECT * INTO v_payment
            FROM public.payments
            WHERE razorpay_order_id = p_order_id;

            IF FOUND
               AND v_payment.registration_id = p_registration_id
               AND v_payment.payment_status = 'success'
               AND v_payment.razorpay_payment_id = p_payment_id THEN
                SELECT * INTO v_reg
                FROM public.registrations
                WHERE registration_id = p_registration_id;

                RETURN pg_catalog.jsonb_build_object(
                    'success', true,
                    'already_processed', true,
                    'is_new', false,
                    'payment_id', p_payment_id,
                    'order_id', p_order_id,
                    'registration_id', p_registration_id,
                    'amount', v_payment.amount,
                    'currency', 'INR',
                    'payment_status', v_payment.payment_status,
                    'registration_status', v_reg.registration_status,
                    'total_amount_paid', v_reg.total_amount_paid,
                    'remaining_balance', v_reg.remaining_balance,
                    'message', 'Transaction already verified and processed by concurrent request.'
                );
            END IF;

            -- Genuine cross-order payment ID collision or unrelated unique violation: propagate error
            RAISE;
    END;

    -- 7. Return Newly Processed JSONB Result
    RETURN pg_catalog.jsonb_build_object(
        'success', true,
        'already_processed', false,
        'is_new', true,
        'payment_id', p_payment_id,
        'order_id', p_order_id,
        'registration_id', p_registration_id,
        'amount', p_amount,
        'currency', 'INR',
        'payment_status', 'success',
        'registration_status', v_new_status,
        'total_amount_paid', v_new_amount_paid,
        'remaining_balance', v_new_remaining,
        'message', 'Payment verified and processed successfully.'
    );
END;
$$;

-- Security Hardening: Restrict RPC execution strictly to backend service_role
REVOKE ALL ON FUNCTION public.process_razorpay_payment(
    TEXT, TEXT, TEXT, NUMERIC, TEXT, TEXT
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_razorpay_payment(TEXT, TEXT, TEXT, NUMERIC, TEXT, TEXT) TO service_role;
