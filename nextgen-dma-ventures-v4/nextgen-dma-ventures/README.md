# NEXTGEN DNA VENTURES
## Course Booking, Razorpay Payments, Email Receipts & Secure Admin Panel

Production-ready course registration, payment management, automated email receipts, and administrative dashboard built for **NEXTGEN DNA VENTURES**.

---

## 1. Quick Start & Execution

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or pnpm

### Installation
In the project directory (`nextgen-dma-ventures-v4/nextgen-dma-ventures`):
```bash
npm install
```

### Running the Server
```bash
npm start
```
By default, the server runs on `http://localhost:5000`:
- **Public Website & Course Booking:** `http://localhost:5000`
- **Secure Admin Panel:** `http://localhost:5000/admin`

---

## 2. Environment Variables Configuration (`.env`)

Create or update your `.env` file based on `.env.example`:

```env
# Server Port & Mode
PORT=5000
NODE_ENV=development

# Razorpay Credentials (Test or Live)
# Obtain from Razorpay Dashboard -> Settings -> API Keys
RAZORPAY_KEY_ID=rzp_test_yourKeyHere
RAZORPAY_KEY_SECRET=yourSecretHere
RAZORPAY_WEBHOOK_SECRET=yourWebhookSecretHere

# SMTP Configuration (Nodemailer) for Automated Email Receipts
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=admissions@nextgendma.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=admissions@nextgendma.com
SMTP_FROM_NAME=NEXTGEN DNA VENTURES Admissions

# Admin Authentication
ADMIN_EMAIL=admin@nextgendma.com
ADMIN_DEFAULT_PASSWORD=NextgenAdmin2026!
SESSION_SECRET=nextgen_dna_ventures_super_secret_session_key_2026_xyz!

# Database Configuration (Supabase PostgreSQL / Cloud Data Store)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_secret_key
DATABASE_URL=
```

> **Supabase Cloud Database Setup:**
> 1. Open your Supabase Dashboard: `https://supabase.com/dashboard/project/your_project_id`
> 2. Go to the **SQL Editor** tab.
> 3. Open [`supabase_schema.sql`](supabase_schema.sql) in this directory, copy its content, and click **Run**.
> 4. All tables (`students`, `courses`, `registrations`, `payments`, `email_logs`, `admin_users`) and the 47 official courses are automatically seeded.
> 
> **Note on Email & Razorpay in Test Mode:**
> If Razorpay keys are not yet provided or set to placeholders, the server operates in safe development simulator mode. If SMTP credentials are blank, payment receipts are simulated and fully logged to the console and saved to `email_logs` in the database.

---

## 3. Course Booking Architecture

### 1. View Details & Booking Comparison
- Clicking **View Details** on any of the 47 courses renders a full modal with:
  - Official fee, duration, overview, skills, learning outcomes, capstone internship details.
  - **Book Your Slot – ₹2,499** banner with clear distinction between:
    - **Advance Payment (₹2,499):** Fixed slot reservation. Adjusted against the course fee. Displays dynamic remaining balance (`Total Fee - ₹2,499`). Status: `Advance Paid – Slot Reserved`.
    - **Full Course Fee:** Full one-time payment. Displays remaining balance `₹0`. Status: `Fully Paid`.

### 2. Student Registration Form
- Collects: Full Name, Email, Mobile Number, WhatsApp Number, College/Institution, Department, Year of Study, State, Selected Course, Duration, Total Fee, and Payment Option.
- Generates a sequential unique Registration ID (e.g. `NDV2026-1001`).

### 3. Razorpay Payment Workflow
1. Client calls `POST /api/registration/initiate` to register student record.
2. Client calls `POST /api/payment/create-order` to generate Razorpay Order ID on the backend.
3. Razorpay checkout popup opens with brand theme `#65D2C5`.
4. On transaction completion, Razorpay returns signature credentials.
5. Client posts to `POST /api/payment/verify-payment`.
6. Server verifies HMAC SHA256 signature (`crypto.createHmac('sha256', secret)`).
7. Server atomically updates registration status to `Advance Paid – Slot Reserved` or `Fully Paid`.
8. Server sends an automated branded payment receipt email to the student via Nodemailer.
9. Displays the verified payment confirmation modal with receipt download link.

---

## 4. Secure Admin Panel (`/admin`)

- **URL:** `http://localhost:5000/admin`
- **Default Login:**
  - **Email:** `admin@nextgendma.com`
  - **Password:** `NextgenAdmin2026!`
- **Security Features:**
  - Password hashing with bcrypt.
  - Rate limiting (blocks brute force attacks after 8 failed attempts for 15 minutes).
  - Secure HTTP-only JWT session cookie (`ndv_admin_token`).
  - Protected API routes (`/api/admin/*`).

### Admin Dashboard Capabilities
1. **8 Core Stat Cards:**
   - Total Registrations
   - Advance Payments (₹2,499)
   - Fully Paid
   - Total Revenue Collected
   - Outstanding Balances
   - Failed / Cancelled Payments
   - Pending Payments
   - Today's Registrations
2. **Search & Filter Table:**
   - Live search across student name, registration ID, email, phone, course, and payment ID.
   - Filter by status (`Advance Paid`, `Fully Paid`, `Payment Pending`, `Payment Failed`).
   - Filter by all 7 official course categories.
3. **Student Profile Drawer:**
   - Detailed academic & contact info.
   - Course track summary.
   - Transaction history with Razorpay Order ID & Payment ID.
   - **Record Subsequent Balance Payment** (adjusts balance without exceeding total course fee).
   - **Resend Receipt Email** button.
   - **Print / Download Official Receipt**.
   - **Internal Notes** with instant save.
4. **Data Exports:**
   - One-click CSV/Excel export of all registrations (`/api/admin/export/registrations`).
   - One-click CSV/Excel export of all transactions (`/api/admin/export/payments`).

---

## 5. Database Schema

The database persists automatically in `./data/nextgen_production.json` with write-and-rename atomic transactions and rolling backup (`.backup.json`):

- **Students (`students`):** `id`, `registration_id`, `full_name`, `email`, `phone`, `whatsapp`, `college`, `department`, `year_of_study`, `state`, `created_at`
- **Courses (`courses`):** All 47 official programs pre-seeded with categories, durations, and fees.
- **Registrations (`registrations`):** `id`, `registration_id`, `student_id`, `course_id`, `total_course_fee`, `payment_type`, `total_amount_paid`, `remaining_balance`, `registration_status`, `notes`, `created_at`, `updated_at`
- **Payments (`payments`):** `id`, `registration_id`, `razorpay_order_id`, `razorpay_payment_id`, `amount`, `currency`, `payment_type`, `payment_status`, `verified_at`, `created_at`
- **Email Logs (`email_logs`):** `id`, `registration_id`, `email`, `email_type`, `subject`, `delivery_status`, `sent_at`
- **Admin Users (`admin_users`):** `id`, `email`, `password_hash`, `role`, `created_at`

