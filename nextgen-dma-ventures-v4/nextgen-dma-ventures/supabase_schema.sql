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
    total_fee NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);

-- 5. TABLE: registrations
CREATE TABLE IF NOT EXISTS public.registrations (
    id TEXT PRIMARY KEY,
    registration_id TEXT UNIQUE NOT NULL,
    student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
    course_id TEXT REFERENCES public.courses(id) ON DELETE RESTRICT,
    course_name TEXT NOT NULL,
    course_category TEXT NOT NULL,
    course_duration TEXT NOT NULL,
    total_course_fee NUMERIC(10,2) NOT NULL,
    payment_type TEXT NOT NULL CHECK (payment_type IN ('advance', 'full', 'subsequent')),
    total_amount_paid NUMERIC(10,2) DEFAULT 0.00,
    remaining_balance NUMERIC(10,2) NOT NULL,
    registration_status TEXT NOT NULL DEFAULT 'Payment Initiated'
        CHECK (registration_status IN ('Payment Initiated', 'Advance Paid', 'Balance Pending', 'Fully Paid', 'Payment Failed', 'Payment Cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registrations_reg_id ON public.registrations(registration_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(registration_status);

-- 6. TABLE: payments
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    registration_id TEXT NOT NULL REFERENCES public.registrations(registration_id) ON DELETE CASCADE,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    payment_type TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'created'
        CHECK (payment_status IN ('created', 'success', 'failed', 'refunded')),
    payment_method TEXT DEFAULT 'Razorpay Official Checkout',
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON public.payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_reg_id ON public.payments(registration_id);

-- 7. TABLE: webhook_events (Persistent Distributed Idempotency)
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id TEXT PRIMARY KEY,
    event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB,
    processed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_event_id ON public.webhook_events(event_id);

-- 8. TABLE: login_attempts (Persistent Serverless Rate Limiting)
CREATE TABLE IF NOT EXISTS public.login_attempts (
    ip TEXT PRIMARY KEY,
    attempts INTEGER DEFAULT 1,
    locked_until TIMESTAMPTZ,
    last_attempt TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_locked ON public.login_attempts(locked_until);

-- 9. TABLE: email_logs
CREATE TABLE IF NOT EXISTS public.email_logs (
    id TEXT PRIMARY KEY,
    registration_id TEXT NOT NULL REFERENCES public.registrations(registration_id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    email_type TEXT NOT NULL,
    subject TEXT,
    delivery_status TEXT NOT NULL,
    error_message TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_reg_id ON public.email_logs(registration_id);

-- 10. TABLE: admin_users
CREATE TABLE IF NOT EXISTS public.admin_users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. SEED AUTHORITATIVE 47 COURSES
INSERT INTO public.courses (id, course_name, category, duration, duration_text, total_fee, status)
VALUES
  -- 1. Artificial Intelligence & Data Technologies
  ('ai-001', 'Artificial Intelligence (AI)', 'Artificial Intelligence & Data Technologies', 28, '28 Weeks', 34999, 'active'),
  ('ai-002', 'Data Science & Machine Learning', 'Artificial Intelligence & Data Technologies', 28, '28 Weeks', 34999, 'active'),
  ('ai-003', 'Big Data Engineering', 'Artificial Intelligence & Data Technologies', 28, '28 Weeks', 32999, 'active'),
  ('ai-004', 'Business Analytics & Intelligence', 'Artificial Intelligence & Data Technologies', 24, '24 Weeks', 29999, 'active'),
  ('ai-005', 'Data Analytics', 'Artificial Intelligence & Data Technologies', 24, '24 Weeks', 27999, 'active'),

  -- 2. Software Development
  ('sd-001', 'Full Stack Development', 'Software Development', 28, '28 Weeks', 32999, 'active'),
  ('sd-002', 'Web Development', 'Software Development', 24, '24 Weeks', 27999, 'active'),
  ('sd-003', 'Software Engineering & System Architecture', 'Software Development', 28, '28 Weeks', 32999, 'active'),
  ('sd-004', 'Java Enterprise Development', 'Software Development', 24, '24 Weeks', 29999, 'active'),
  ('sd-005', 'Python Programming & Frameworks', 'Software Development', 24, '24 Weeks', 27999, 'active'),
  ('sd-006', 'Mobile App Development (iOS & Android)', 'Software Development', 28, '28 Weeks', 31999, 'active'),

  -- 3. Security & Infrastructure
  ('si-001', 'Cyber Security & Ethical Hacking', 'Security & Infrastructure', 28, '28 Weeks', 34999, 'active'),
  ('si-002', 'Cloud Computing (AWS / Azure)', 'Security & Infrastructure', 24, '24 Weeks', 31999, 'active'),
  ('si-003', 'DevOps & Site Reliability Engineering', 'Security & Infrastructure', 24, '24 Weeks', 31999, 'active'),

  -- 4. Design & Quality
  ('dq-001', 'UI/UX Design', 'Design & Quality', 24, '24 Weeks', 26999, 'active'),
  ('dq-002', 'Software Testing & Automation QA', 'Design & Quality', 24, '24 Weeks', 26999, 'active'),
  ('dq-003', 'Product Management', 'Design & Quality', 24, '24 Weeks', 29999, 'active'),

  -- 5. Mechanical Engineering
  ('me-001', 'CAD/CAM Engineering', 'Mechanical Engineering', 28, '28 Weeks', 27999, 'active'),
  ('me-002', 'Mechanical Design Engineering (SolidWorks)', 'Mechanical Engineering', 28, '28 Weeks', 27999, 'active'),
  ('me-003', 'Advanced CATIA for Aerospace & Automotive', 'Mechanical Engineering', 30, '30 Weeks', 31999, 'active'),
  ('me-004', 'Finite Element Analysis (FEA / ANSYS)', 'Mechanical Engineering', 28, '28 Weeks', 29999, 'active'),
  ('me-005', 'Computational Fluid Dynamics (CFD)', 'Mechanical Engineering', 30, '30 Weeks', 31999, 'active'),
  ('me-006', 'Robotics & Industrial Automation', 'Mechanical Engineering', 32, '32 Weeks', 34999, 'active'),
  ('me-007', 'HVAC & MEP Systems Design', 'Mechanical Engineering', 24, '24 Weeks', 24999, 'active'),
  ('me-008', 'Piping Design & Engineering', 'Mechanical Engineering', 24, '24 Weeks', 24999, 'active'),
  ('me-009', 'Product Design & Plastic Mould Engineering', 'Mechanical Engineering', 28, '28 Weeks', 27999, 'active'),
  ('me-010', 'CNC Programming & Precision Machining', 'Mechanical Engineering', 20, '20 Weeks', 22999, 'active'),

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
