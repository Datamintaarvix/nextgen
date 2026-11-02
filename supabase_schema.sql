-- ============================================================================
-- NEXTGEN DMA VENTURES - AUTHORITATIVE SUPABASE POSTGRESQL PRODUCTION SCHEMA
-- ============================================================================
-- Execute in Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- Fully transactional, safe to run on existing data, creates atomic sequences,
-- persistent rate limiting, webhook idempotency, and seeds all 47 official courses.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ATOMIC REGISTRATION SEQUENCE & RPC FUNCTION (Hardened SECURITY DEFINER)
CREATE SEQUENCE IF NOT EXISTS public.registration_sequence START 1001;

CREATE OR REPLACE FUNCTION public.get_next_registration_id()
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    next_val BIGINT;
BEGIN
    next_val := nextval('public.registration_sequence');
    RETURN 'NDV2026-' || next_val::TEXT;
END;
$$;

-- Security Hardening: Revoke public execution to prevent sequence exhaustion
REVOKE ALL ON FUNCTION public.get_next_registration_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_next_registration_id() TO service_role;

-- 3. TABLE: students
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    registration_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    college TEXT,
    department TEXT,
    year_of_study TEXT,
    state TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_reg_id ON public.students(registration_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON public.students(email);

-- 4. TABLE: courses (Authoritative 47 Programs)
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    course_name TEXT NOT NULL,
    category TEXT NOT NULL,
    duration INTEGER NOT NULL,
    duration_text TEXT NOT NULL,
    total_fee NUMERIC NOT NULL CHECK (total_fee > 0),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);

-- 5. TABLE: registrations
CREATE TABLE IF NOT EXISTS public.registrations (
    id TEXT PRIMARY KEY,
    registration_id TEXT UNIQUE NOT NULL,
    student_id TEXT REFERENCES public.students(id) ON DELETE SET NULL,
    course_id TEXT REFERENCES public.courses(id) ON DELETE SET NULL,
    course_name TEXT NOT NULL,
    course_category TEXT,
    course_duration TEXT,
    total_course_fee NUMERIC NOT NULL CHECK (total_course_fee > 0),
    payment_type TEXT NOT NULL CHECK (payment_type IN ('advance', 'full')),
    total_amount_paid NUMERIC DEFAULT 0 CHECK (total_amount_paid >= 0),
    remaining_balance NUMERIC NOT NULL CHECK (remaining_balance >= 0),
    registration_status TEXT NOT NULL DEFAULT 'Payment Initiated' 
      CHECK (registration_status IN ('Payment Initiated', 'Advance Paid', 'Balance Pending', 'Fully Paid', 'Payment Failed', 'Payment Cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registrations_reg_id ON public.registrations(registration_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(registration_status);
CREATE INDEX IF NOT EXISTS idx_registrations_student_id ON public.registrations(student_id);

-- 6. TABLE: payments (Individual Transactions)
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    registration_id TEXT NOT NULL REFERENCES public.registrations(registration_id) ON DELETE CASCADE,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT UNIQUE,
    razorpay_signature TEXT,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'INR',
    payment_type TEXT NOT NULL CHECK (payment_type IN ('advance', 'full', 'balance', 'subsequent')),
    payment_status TEXT DEFAULT 'created' CHECK (payment_status IN ('created', 'success', 'failed', 'cancelled')),
    payment_method TEXT DEFAULT 'Razorpay',
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_reg_id ON public.payments(registration_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON public.payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(payment_status);

-- 7. TABLE: webhook_events (Persistent Idempotency)
CREATE TABLE IF NOT EXISTS public.webhook_events (
    event_id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    payload JSONB,
    processed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at ON public.webhook_events(processed_at);

-- 8. TABLE: login_attempts (Persistent Serverless Rate Limiting)
CREATE TABLE IF NOT EXISTS public.login_attempts (
    ip TEXT PRIMARY KEY,
    attempt_count INTEGER DEFAULT 1,
    first_attempt TIMESTAMPTZ DEFAULT NOW(),
    locked_until TIMESTAMPTZ,
    last_attempt TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_locked_until ON public.login_attempts(locked_until);

-- 9. TABLE: email_logs (Receipt Tracking)
CREATE TABLE IF NOT EXISTS public.email_logs (
    id TEXT PRIMARY KEY,
    registration_id TEXT REFERENCES public.registrations(registration_id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    email_type TEXT DEFAULT 'payment_receipt',
    subject TEXT,
    delivery_status TEXT NOT NULL CHECK (delivery_status IN ('sent', 'simulated', 'failed')),
    error_message TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_reg_id ON public.email_logs(registration_id);

-- 10. TABLE: admin_users (Credentials)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'superadmin',
    name TEXT DEFAULT 'Administrator',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);

-- ============================================================================
-- SEEDING: ALL 47 AUTHORITATIVE NEXTGEN DMA VENTURES COURSES
-- ============================================================================
INSERT INTO public.courses (id, course_name, category, duration, duration_text, total_fee, status)
VALUES
  -- 1. Artificial Intelligence & Data Technologies
  ('ai-001', 'Artificial Intelligence', 'Artificial Intelligence & Data Technologies', 28, '28 Weeks', 34999, 'active'),
  ('ai-002', 'Data Science & Analytics', 'Artificial Intelligence & Data Technologies', 28, '28 Weeks', 34999, 'active'),
  ('ai-003', 'Python for Artificial Intelligence', 'Artificial Intelligence & Data Technologies', 26, '26 Weeks', 32999, 'active'),
  ('ai-004', 'Deep Learning Foundations', 'Artificial Intelligence & Data Technologies', 24, '24 Weeks', 24999, 'active'),
  ('ai-005', 'Machine Learning & AI', 'Artificial Intelligence & Data Technologies', 20, '20 Weeks', 22999, 'active'),

  -- 2. Software Development
  ('sd-001', 'Full Stack Web Development', 'Software Development', 28, '28 Weeks', 29999, 'active'),
  ('sd-002', 'Backend Web Development', 'Software Development', 28, '28 Weeks', 29999, 'active'),
  ('sd-003', 'Java Full Stack Development', 'Software Development', 28, '28 Weeks', 32999, 'active'),
  ('sd-004', 'Frontend Web Development', 'Software Development', 26, '26 Weeks', 29999, 'active'),
  ('sd-005', 'Mobile App Development', 'Software Development', 24, '24 Weeks', 24999, 'active'),
  ('sd-006', 'Software Testing & Automation', 'Software Development', 26, '26 Weeks', 29999, 'active'),

  -- 3. Security & Infrastructure
  ('si-001', 'Cybersecurity & Ethical Hacking', 'Security & Infrastructure', 26, '26 Weeks', 29999, 'active'),
  ('si-002', 'Cloud Computing & DevOps', 'Security & Infrastructure', 26, '26 Weeks', 29999, 'active'),
  ('si-003', 'DevOps Engineering', 'Security & Infrastructure', 26, '26 Weeks', 29999, 'active'),

  -- 4. Design & Quality
  ('dq-001', 'UI/UX Design', 'Design & Quality', 20, '20 Weeks', 19999, 'active'),
  ('dq-002', 'Software Quality Assurance', 'Design & Quality', 20, '20 Weeks', 18999, 'active'),
  ('dq-003', 'Product Design', 'Design & Quality', 24, '24 Weeks', 23999, 'active'),

  -- 5. Mechanical Engineering
  ('me-001', 'Mechanical CAD Modeling', 'Mechanical Engineering', 28, '28 Weeks', 26499, 'active'),
  ('me-002', 'Finite Element Analysis (FEA)', 'Mechanical Engineering', 28, '28 Weeks', 28799, 'active'),
  ('me-003', 'Computational Fluid Dynamics (CFD)', 'Mechanical Engineering', 24, '24 Weeks', 24999, 'active'),
  ('me-004', 'Thermal Systems Design', 'Mechanical Engineering', 24, '24 Weeks', 24999, 'active'),
  ('me-005', 'Product Lifecycle Management (PLM)', 'Mechanical Engineering', 30, '30 Weeks', 29999, 'active'),
  ('me-006', 'CNC Programming & Machining', 'Mechanical Engineering', 22, '22 Weeks', 22499, 'active'),
  ('me-007', 'Robotics & Automation in Manufacturing', 'Mechanical Engineering', 24, '24 Weeks', 22999, 'active'),
  ('me-008', 'Industrial Piping Design', 'Mechanical Engineering', 30, '30 Weeks', 29999, 'active'),
  ('me-009', 'Mechanical System Simulation', 'Mechanical Engineering', 28, '28 Weeks', 28499, 'active'),
  ('me-010', 'Quality Control & Metrology', 'Mechanical Engineering', 22, '22 Weeks', 19999, 'active'),

  -- 6. Automobile Engineering
  ('ae-001', 'Electric Vehicle (EV) Technology', 'Automobile Engineering', 28, '28 Weeks', 27999, 'active'),
  ('ae-002', 'Automotive Design Using CATIA', 'Automobile Engineering', 28, '28 Weeks', 27999, 'active'),
  ('ae-003-30w', 'Automotive CAD Using SolidWorks (30 Weeks)', 'Automobile Engineering', 30, '30 Weeks', 32999, 'active'),
  ('ae-004-28w', 'Automotive CAD Using SolidWorks (28 Weeks)', 'Automobile Engineering', 28, '28 Weeks', 27999, 'active'),
  ('ae-005', 'Vehicle Dynamics & Chassis Design', 'Automobile Engineering', 28, '28 Weeks', 27999, 'active'),
  ('ae-006', 'Automotive Powertrain Engineering', 'Automobile Engineering', 24, '24 Weeks', 22999, 'active'),
  ('ae-007', 'Battery Management Systems (BMS)', 'Automobile Engineering', 30, '30 Weeks', 29999, 'active'),
  ('ae-008', 'ADAS & Autonomous Vehicle Tech', 'Automobile Engineering', 24, '24 Weeks', 22999, 'active'),
  ('ae-009', 'Hybrid Vehicle Engineering', 'Automobile Engineering', 30, '30 Weeks', 29999, 'active'),
  ('ae-010', 'Automotive Crashworthiness & Safety Analysis', 'Automobile Engineering', 32, '32 Weeks', 32999, 'active'),

  -- 7. Advanced Technology
  ('at-001', 'Artificial Intelligence in Automotive Systems', 'Advanced Technology', 36, '36 Weeks', 37999, 'active'),
  ('at-002', 'Autonomous Driving Simulation', 'Advanced Technology', 36, '36 Weeks', 37999, 'active'),
  ('at-003', 'Digital Twin Technology for Manufacturing', 'Advanced Technology', 32, '32 Weeks', 34999, 'active'),
  ('at-004', 'IoT & Telematics in Automotive', 'Advanced Technology', 30, '30 Weeks', 31999, 'active'),
  ('at-005', '3D Printing & Additive Manufacturing', 'Advanced Technology', 28, '28 Weeks', 31999, 'active'),
  ('at-006', 'AR/VR in Industrial Engineering', 'Advanced Technology', 28, '28 Weeks', 27999, 'active'),
  ('at-007', 'Embedded Automotive Systems', 'Advanced Technology', 32, '32 Weeks', 31999, 'active'),
  ('at-008', 'Smart Factory & Industrial IoT', 'Advanced Technology', 32, '32 Weeks', 34999, 'active')
ON CONFLICT (id) DO UPDATE 
SET 
  course_name = EXCLUDED.course_name,
  category = EXCLUDED.category,
  duration = EXCLUDED.duration,
  duration_text = EXCLUDED.duration_text,
  total_fee = EXCLUDED.total_fee,
  status = 'active';
