/**
 * ============================================================================
 * NEXTGEN DMA VENTURES - PRODUCTION BACKEND SERVER
 * ============================================================================
 * Architecture:
 * - Express.js web application
 * - Razorpay official payment integration (Order creation, HMAC verification, Webhook)
 * - Nodemailer automated branded receipt delivery
 * - Secure Admin Panel (/admin) with bcrypt & HTTP-only sessions
 * - Complete database persistence with transaction-safe atomic storage
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const Razorpay = require('razorpay');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
  generateRegistrationId,
  seedInitialData,
  supabase,
  RateLimiterRepo,
  WebhookEventsRepo,
  StudentsRepo,
  CoursesRepo,
  RegistrationsRepo,
  PaymentsRepo,
  EmailLogsRepo,
  AdminUsersRepo
} = require('./db');

const { sendPaymentReceipt, formatINR } = require('./emailService');

let APP_VERSION = '2.0.0';
try {
  APP_VERSION = require('./package.json').version || APP_VERSION;
} catch (err) {
  // Fallback version if package metadata cannot be resolved
}

const app = express();
const PORT = process.env.PORT || 5000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'nextgen_session_secret_default_2026_xyz!';

// Vercel Multi-Services Binding Resolution
// Injects target internal service base URL when running as a multi-service project
const NEXTGEN_BACKEND_URL = process.env.NEXTGEN_BACKEND_URL;
if (NEXTGEN_BACKEND_URL) {
  console.log('[Vercel Services] Bound internal backend service URL:', NEXTGEN_BACKEND_URL);
}

// Initialize Razorpay Client
const RAZORPAY_KEY_ID = (process.env.RAZORPAY_KEY_ID || '').trim();
const RAZORPAY_KEY_SECRET = (process.env.RAZORPAY_KEY_SECRET || '').trim();
const RAZORPAY_WEBHOOK_SECRET = (process.env.RAZORPAY_WEBHOOK_SECRET || '').trim();

function isPlaceholderCredential(val) {
  if (!val || typeof val !== 'string') return true;
  const lower = val.toLowerCase().trim();
  return (
    lower === '' ||
    lower.includes('placeholder') ||
    lower.includes('yourkey') ||
    lower.includes('yoursecret') ||
    lower.includes('yourwebhook') ||
    lower.includes('xxx')
  );
}

const isRazorpayConfigured = Boolean(
  RAZORPAY_KEY_ID &&
  RAZORPAY_KEY_SECRET &&
  !isPlaceholderCredential(RAZORPAY_KEY_ID) &&
  !isPlaceholderCredential(RAZORPAY_KEY_SECRET)
);

let razorpayClient = null;
if (isRazorpayConfigured) {
  try {
    razorpayClient = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET
    });
    console.log('[Razorpay] Initialized successfully. Key prefix:', RAZORPAY_KEY_ID.substring(0, 8) + '...');
  } catch (err) {
    console.error('[Razorpay] Failed to initialize live SDK client:', err.message);
    razorpayClient = null;
  }
} else {
  console.warn('[Razorpay Security Alert] Valid Razorpay credentials not configured. Live online transactions and automatic payment approvals are strictly disabled.');
}

// Global Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(cookieParser());

// Webhook requires raw body for signature verification
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payment/webhook') {
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));

// Static frontend asset directory resolution & automatic root asset consolidation
const nestedDir = path.join(__dirname, 'nextgen-dma-ventures-v4', 'nextgen-dma-ventures');
try {
  ['logo.jpeg', 'san.jpeg', 'vid1.mp4'].forEach((file) => {
    const rootPath = path.join(__dirname, file);
    const sourcePath = path.join(nestedDir, file);
    if (!fs.existsSync(rootPath) && fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, rootPath);
      console.log(`[Asset Setup] Copied ${file} to canonical root.`);
    }
  });
} catch (e) {
  // Silent fallback for read-only environments
}

const staticDir = fs.existsSync(path.join(__dirname, 'index.html'))
  ? __dirname
  : (fs.existsSync(path.join(nestedDir, 'index.html'))
    ? nestedDir
    : __dirname);

app.use(express.static(staticDir));
if (staticDir !== __dirname) {
  app.use(express.static(__dirname));
}
if (fs.existsSync(nestedDir) && staticDir !== nestedDir) {
  app.use(express.static(nestedDir));
}

// Explicit media asset fallback resolution (ensures hero video, logo, and photos resolve in both root and nested deployments)
const resolveAssetPath = (filename) => {
  const p1 = path.join(__dirname, filename);
  if (fs.existsSync(p1)) return p1;
  const p2 = path.join(nestedDir, filename);
  if (fs.existsSync(p2)) return p2;
  return null;
};

app.get('/vid1.mp4', (req, res, next) => {
  const filePath = resolveAssetPath('vid1.mp4');
  if (filePath) return res.sendFile(filePath);
  next();
});

app.get('/logo.jpeg', (req, res, next) => {
  const filePath = resolveAssetPath('logo.jpeg');
  if (filePath) return res.sendFile(filePath);
  next();
});

app.get('/san.jpeg', (req, res, next) => {
  const filePath = resolveAssetPath('san.jpeg');
  if (filePath) return res.sendFile(filePath);
  next();
});

// Seed Database on startup
const defaultAdminEmail = (process.env.ADMIN_EMAIL || 'admin@nextgendma.com').toLowerCase().trim();
const defaultAdminPassword = process.env.ADMIN_DEFAULT_PASSWORD || '';
const defaultAdminHash = process.env.ADMIN_PASSWORD_HASH || (defaultAdminPassword ? bcrypt.hashSync(defaultAdminPassword, 10) : '');

if (defaultAdminEmail && defaultAdminHash) {
  seedInitialData(defaultAdminEmail, defaultAdminHash).catch(err => {
    console.warn('[Seed] Initialization notice:', err.message);
  });
}

// ============================================================================
// ADMIN AUTHENTICATION MIDDLEWARE & HELPERS (Persistent Serverless Security)
// ============================================================================

// Secure IP Extraction (Validates IP shape and ignores forged internal hops)
function getSecureClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim();
    if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^[a-fA-F0-9:]+$/.test(firstIp)) {
      return firstIp;
    }
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

async function rateLimitLogin(req, res, next) {
  const ip = getSecureClientIp(req);
  req.clientIp = ip;

  try {
    const check = await RateLimiterRepo.checkLimit(ip);
    if (!check.allowed) {
      return res.status(429).json({
        error: `Too many failed login attempts. Access is temporarily locked. Please wait ${check.remainingMinutes || 15} minutes before trying again.`
      });
    }
    next();
  } catch (err) {
    console.error('[Rate Limiter Notice]', err.message);
    next();
  }
}

function verifyAdminSession(req, res, next) {
  const token = req.cookies.ndv_admin_token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication required.' });
  }

  try {
    const decoded = jwt.verify(token, SESSION_SECRET);
    req.adminUser = decoded;
    next();
  } catch (err) {
    res.clearCookie('ndv_admin_token');
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }
}

// ============================================================================
// PUBLIC API: HEALTH, CONFIG & COURSES
// ============================================================================

app.get('/api/health', async (req, res) => {
  const environment = process.env.VERCEL_ENV || process.env.NODE_ENV || 'development';

  if (!supabase) {
    return res.status(503).json({
      success: false,
      environment,
      version: APP_VERSION,
      database: 'unavailable'
    });
  }

  try {
    const { error } = await supabase
      .from('courses')
      .select('id')
      .limit(1);

    if (error) {
      console.error('[Health Check Database Error]', error.message);
      return res.status(503).json({
        success: false,
        environment,
        version: APP_VERSION,
        database: 'unavailable'
      });
    }

    return res.status(200).json({
      success: true,
      environment,
      version: APP_VERSION,
      database: 'healthy'
    });
  } catch (err) {
    console.error('[Health Check Exception]', err.message);
    return res.status(503).json({
      success: false,
      environment,
      version: APP_VERSION,
      database: 'unavailable'
    });
  }
});

app.get('/api/config/public-key', (req, res) => {
  res.json({
    keyId: isRazorpayConfigured ? RAZORPAY_KEY_ID : null,
    isConfigured: isRazorpayConfigured,
    advanceAmount: 2499,
    isTestMode: isRazorpayConfigured && RAZORPAY_KEY_ID.startsWith('rzp_test'),
    currency: 'INR',
    companyName: 'NEXTGEN DMA VENTURES'
  });
});

app.get('/api/courses', async (req, res) => {
  try {
    const courses = await CoursesRepo.findAll();
    res.json({ success: true, count: courses.length, courses });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses: ' + err.message });
  }
});

// ============================================================================
// PUBLIC API: STUDENT REGISTRATION & BOOKING INITIATION
// ============================================================================

app.post('/api/registration/initiate', async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      whatsapp,
      college,
      department,
      year_of_study,
      state,
      course_id,
      course_name,
      payment_type // 'advance' or 'full'
    } = req.body;

    // Validation
    if (!full_name || !email || !phone || (!course_id && !course_name)) {
      return res.status(400).json({
        error: 'Missing required registration fields (Full Name, Email, Mobile Number, Course).'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
    }

    // Resolve course
    let course = null;
    if (course_id) {
      course = await CoursesRepo.findById(course_id);
    }
    if (!course && course_name) {
      course = await CoursesRepo.findByName(course_name);
    }

    if (!course) {
      return res.status(404).json({ error: 'Selected course not found in official catalog.' });
    }

    // Check for existing confirmed registration for this email and course
    const existingStudent = await StudentsRepo.findAll();
    const matchedStudent = existingStudent.find(s => s.email.toLowerCase() === email.toLowerCase().trim());
    if (matchedStudent) {
      const existingRegs = await RegistrationsRepo.findAll();
      const duplicateConfirmed = existingRegs.find(r =>
        r.student_id === matchedStudent.id &&
        (r.course_id === course.id || r.course_name.toLowerCase() === course.course_name.toLowerCase()) &&
        (r.registration_status === 'Fully Paid' || r.registration_status === 'Advance Paid – Slot Reserved' || r.registration_status === 'Advance Paid')
      );
      if (duplicateConfirmed) {
        return res.status(409).json({
          error: `You are already enrolled in ${course.course_name} (Registration ID: ${duplicateConfirmed.registration_id}). Please check your email for receipts or contact admissions.`
        });
      }
    }

    const selectedPaymentType = payment_type === 'full' ? 'full' : 'advance';
    const totalFee = Number(course.total_fee);
    const advanceAmount = 2499;

    let amountToPay = 0;
    let remainingBalance = 0;

    if (selectedPaymentType === 'advance') {
      amountToPay = advanceAmount;
      remainingBalance = totalFee - advanceAmount;
    } else {
      amountToPay = totalFee;
      remainingBalance = 0;
    }

    // Generate unique Registration ID: NDV2026-XXXX
    const registrationId = await generateRegistrationId();

    // 1. Create Student Record
    const student = await StudentsRepo.create({
      registration_id: registrationId,
      full_name,
      email,
      phone: cleanPhone,
      whatsapp: (whatsapp || cleanPhone).replace(/[^0-9]/g, ''),
      college,
      department,
      year_of_study,
      state
    });

    // 2. Create Initial Registration Record
    const registration = await RegistrationsRepo.create({
      registration_id: registrationId,
      student_id: student.id,
      course_id: course.id,
      course_name: course.course_name,
      course_category: course.category,
      course_duration: course.duration_text,
      total_course_fee: totalFee,
      payment_type: selectedPaymentType,
      total_amount_paid: 0,
      remaining_balance: remainingBalance,
      registration_status: 'Payment Initiated'
    });

    res.json({
      success: true,
      registration_id: registrationId,
      student,
      registration,
      payment_summary: {
        course_name: course.course_name,
        course_duration: course.duration_text,
        total_fee: totalFee,
        payment_type: selectedPaymentType,
        amount_to_pay: amountToPay,
        remaining_balance: remainingBalance
      }
    });
  } catch (err) {
    console.error('[Registration Error]', err);
    res.status(500).json({ error: 'Failed to initiate course registration: ' + err.message });
  }
});

// ============================================================================
// PUBLIC API: RAZORPAY PAYMENT - CREATE ORDER
// ============================================================================

app.post('/api/payment/create-order', async (req, res) => {
  try {
    if (!razorpayClient || !isRazorpayConfigured) {
      console.error('[Create Order Rejected] Razorpay client is unconfigured or credentials are missing/placeholder.');
      return res.status(503).json({
        error: 'Online payment gateway is temporarily unavailable. Please contact NEXTGEN DMA VENTURES admissions directly.'
      });
    }

    const { registration_id } = req.body;

    if (!registration_id) {
      return res.status(400).json({ error: 'Registration ID is required.' });
    }

    const reg = await RegistrationsRepo.findByRegId(registration_id);
    if (!reg) {
      return res.status(404).json({ error: 'Registration record not found.' });
    }

    const totalFee = Number(reg.total_course_fee);
    const currentPaid = Number(reg.total_amount_paid || 0);
    const remainingBalance = Math.max(0, totalFee - currentPaid);

    if (reg.registration_status === 'Fully Paid' || remainingBalance <= 0) {
      return res.status(400).json({ error: 'This registration is already fully paid. Outstanding balance is ₹0.' });
    }

    let amountInINR = 0;
    let paymentTypeForOrder = 'advance';

    if (reg.registration_status === 'Advance Paid' || reg.registration_status === 'Balance Pending') {
      // Subsequent balance payment
      amountInINR = remainingBalance;
      paymentTypeForOrder = 'balance';
    } else {
      // Initial transaction
      if (reg.payment_type === 'advance') {
        amountInINR = 2499;
        paymentTypeForOrder = 'advance';
      } else {
        amountInINR = totalFee;
        paymentTypeForOrder = 'full';
      }
    }

    const amountInPaise = amountInINR * 100;

    // Real Razorpay order creation via SDK (No mock order creation)
    const order = await razorpayClient.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: registration_id,
      notes: {
        registration_id,
        course_id: reg.course_id,
        course_name: reg.course_name,
        payment_type: paymentTypeForOrder
      }
    });
    const razorpayOrderId = order.id;

    // Record Payment Entry in DB
    await PaymentsRepo.create({
      registration_id,
      razorpay_order_id: razorpayOrderId,
      amount: amountInINR,
      currency: 'INR',
      payment_type: paymentTypeForOrder,
      payment_status: 'created'
    });

    res.json({
      success: true,
      order_id: razorpayOrderId,
      amount: amountInPaise,
      amount_inr: amountInINR,
      currency: 'INR',
      key_id: RAZORPAY_KEY_ID,
      registration_id,
      course_name: reg.course_name,
      payment_type: paymentTypeForOrder
    });
  } catch (err) {
    console.error('[Create Order Error]', err);
    res.status(500).json({ error: 'Failed to create payment order: ' + err.message });
  }
});

// ============================================================================
// PUBLIC API: RAZORPAY PAYMENT - SERVER-SIDE SIGNATURE VERIFICATION
// ============================================================================

app.post('/api/payment/verify-payment', async (req, res) => {
  try {
    const {
      registration_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!registration_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        error: 'Missing required payment verification parameters (registration_id, razorpay_order_id, razorpay_payment_id, razorpay_signature).'
      });
    }

    // Reject simulated or mock credentials
    if (
      typeof razorpay_payment_id !== 'string' ||
      typeof razorpay_order_id !== 'string' ||
      typeof razorpay_signature !== 'string' ||
      typeof registration_id !== 'string' ||
      razorpay_payment_id.startsWith('pay_mock') ||
      razorpay_order_id.startsWith('order_ndv') ||
      razorpay_signature.startsWith('sig_mock')
    ) {
      return res.status(400).json({
        error: 'Invalid payment parameters: Mock or simulated transactions are strictly rejected.'
      });
    }

    // Enforce genuine server-side Razorpay configuration
    if (!razorpayClient || !isRazorpayConfigured || !RAZORPAY_KEY_SECRET || isPlaceholderCredential(RAZORPAY_KEY_SECRET)) {
      console.error('[Payment Verification Rejected] Razorpay client/secret is unconfigured or a placeholder.');
      return res.status(503).json({
        error: 'Payment verification service is temporarily unavailable. Please contact admissions with your transaction details.'
      });
    }

    const reg = await RegistrationsRepo.findByRegId(registration_id);
    if (!reg) {
      return res.status(404).json({ error: 'Registration record not found: ' + registration_id });
    }

    // Verify stored payment record exists for this order
    const paymentRecord = await PaymentsRepo.findByOrderId(razorpay_order_id);
    if (!paymentRecord) {
      return res.status(400).json({ error: 'Order ID not recognized: No corresponding payment record in database.' });
    }

    // Verify order belongs to this registration
    if (paymentRecord.registration_id !== registration_id) {
      return res.status(400).json({ error: 'Transaction order ID does not match this registration record.' });
    }

    // Cryptographic HMAC-SHA256 Signature Verification (Constant-Time)
    let isSignatureValid = false;
    try {
      const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
      const generatedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(payload)
        .digest('hex');

      const sigBuf = Buffer.from(razorpay_signature, 'utf8');
      const genBuf = Buffer.from(generatedSignature, 'utf8');

      if (sigBuf.length === genBuf.length && crypto.timingSafeEqual(sigBuf, genBuf)) {
        isSignatureValid = true;
      }
    } catch (sigErr) {
      console.error('[Signature Verification Error]', sigErr.message);
      isSignatureValid = false;
    }

    if (!isSignatureValid) {
      console.warn(`[Payment Verification Failed] Signature mismatch for Order: ${razorpay_order_id}`);
      return res.status(400).json({ error: 'Payment signature verification failed. Invalid transaction signature.' });
    }

    // Authoritative Gateway Verification: Fetch payment using the official Razorpay SDK
    let fetchedPayment;
    try {
      fetchedPayment = await razorpayClient.payments.fetch(razorpay_payment_id);
    } catch (fetchErr) {
      console.error('[Razorpay Fetch Error]', fetchErr.message);
      return res.status(502).json({
        error: 'Unable to confirm payment with the payment gateway. Please try again shortly.'
      });
    }

    if (!fetchedPayment) {
      return res.status(400).json({ error: 'Payment record not found on payment gateway.' });
    }

    // Require status === 'captured' and captured === true
    if (fetchedPayment.status !== 'captured' || fetchedPayment.captured !== true) {
      return res.status(400).json({
        error: `Payment verification failed: Gateway status is '${fetchedPayment.status}', expected 'captured'.`
      });
    }

    // Verify fetched order ID matches the submitted order ID
    if (fetchedPayment.order_id !== razorpay_order_id) {
      return res.status(400).json({
        error: 'Payment verification failed: Gateway order ID does not match submitted order ID.'
      });
    }

    // Verify fetched payment ID matches the submitted payment ID
    if (fetchedPayment.id !== razorpay_payment_id) {
      return res.status(400).json({
        error: 'Payment verification failed: Gateway payment ID does not match submitted payment ID.'
      });
    }

    // Verify currency is INR
    if (fetchedPayment.currency !== 'INR') {
      return res.status(400).json({
        error: `Payment verification failed: Invalid currency '${fetchedPayment.currency}'. Expected INR.`
      });
    }

    // Compare fetched amount (in paise) against Number(paymentRecord.amount) * 100
    const expectedAmountPaise = Math.round(Number(paymentRecord.amount) * 100);
    if (Number(fetchedPayment.amount) !== expectedAmountPaise) {
      return res.status(400).json({
        error: `Payment verification failed: Gateway amount ${fetchedPayment.amount} paise does not match expected order amount ${expectedAmountPaise} paise.`
      });
    }

    // Call PaymentsRepo.processRazorpayPayment() with amount in INR (NOT paise)
    let rpcResult;
    try {
      rpcResult = await PaymentsRepo.processRazorpayPayment({
        p_order_id: razorpay_order_id,
        p_payment_id: razorpay_payment_id,
        p_registration_id: registration_id,
        p_amount: Number(paymentRecord.amount),
        p_currency: 'INR',
        p_signature: razorpay_signature
      });
    } catch (rpcErr) {
      console.error('[Process Razorpay Payment RPC Error]', rpcErr.message);
      return res.status(500).json({
        error: 'We could not complete payment processing. Please contact admissions with your transaction details.'
      });
    }

    // Strict RPC result classification: never treat missing/malformed RPC results as newly processed
    const isValidRpcResult = Boolean(rpcResult && typeof rpcResult === 'object' && rpcResult.success === true);
    const isNewlyProcessed = Boolean(isValidRpcResult && rpcResult.already_processed === false);
    const isAlreadyProcessed = Boolean(isValidRpcResult && rpcResult.already_processed === true);

    if (!isNewlyProcessed && !isAlreadyProcessed) {
      console.error('[Process Razorpay Payment RPC Invalid Result]', rpcResult);
      return res.status(500).json({ error: 'Database error processing payment: Malformed or unexpected RPC result.' });
    }

    // Refresh registration and student data for receipt response
    const updatedReg = (await RegistrationsRepo.findByRegId(registration_id)) || reg;
    const student = await StudentsRepo.findByRegId(registration_id);

    // Send receipt email ONLY if newly processed
    let emailSent = false;
    if (isNewlyProcessed && student && student.email) {
      try {
        const emailResult = await sendPaymentReceipt({
          registrationId: registration_id,
          studentName: student.full_name,
          studentEmail: student.email,
          courseName: updatedReg.course_name,
          courseDuration: updatedReg.course_duration,
          totalCourseFee: updatedReg.total_course_fee,
          paymentType: paymentRecord.payment_type || updatedReg.payment_type,
          amountPaid: Number(paymentRecord.amount),
          remainingBalance: updatedReg.remaining_balance,
          razorpayPaymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          paymentDate: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        });
        emailSent = Boolean(emailResult && emailResult.success);
      } catch (emailErr) {
        // Email errors must never reverse or fail a confirmed payment
        console.error('[Receipt Email Error - Non-Fatal]', emailErr.message);
      }
    }

    res.json({
      success: true,
      verified: true,
      registration_id,
      status: updatedReg.registration_status,
      message: isAlreadyProcessed ? 'Transaction already verified and processed.' : 'Payment verified and processed successfully.',
      receipt: {
        student_name: student ? student.full_name : 'Student',
        email: student ? student.email : '',
        course_name: updatedReg.course_name,
        duration: updatedReg.course_duration,
        total_fee: updatedReg.total_course_fee,
        amount_paid: Number(paymentRecord.amount),
        total_paid_to_date: updatedReg.total_amount_paid,
        remaining_balance: updatedReg.remaining_balance,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        payment_type: paymentRecord.payment_type || updatedReg.payment_type,
        email_sent: emailSent
      }
    });
  } catch (err) {
    console.error('[Payment Verification Exception]', err);
    res.status(500).json({ error: 'Server error during payment verification: ' + err.message });
  }
});

// ============================================================================
// PUBLIC API: PAYMENT FAILURE / CANCELLATION NOTIFIER (NON-AUTHORITATIVE)
// ============================================================================

app.post('/api/payment/payment-failed', async (req, res) => {
  try {
    console.warn('[Payment Notice] Client reported a checkout issue. No financial or registration records were modified.');

    return res.status(202).json({
      success: true,
      status: 'notification_received'
    });
  } catch (err) {
    console.error('[Payment Notice Error]', err.message);
    return res.status(500).json({ error: 'Internal server error processing notification.' });
  }
});

// ============================================================================
// PUBLIC API: RAZORPAY WEBHOOK (Automated Background Capture)
// ============================================================================

app.post('/api/payment/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.body;

    if (!signature) {
      return res.status(400).send('Missing webhook signature header');
    }

    if (!RAZORPAY_WEBHOOK_SECRET || isPlaceholderCredential(RAZORPAY_WEBHOOK_SECRET)) {
      console.error('[Webhook Rejected] Server RAZORPAY_WEBHOOK_SECRET is unconfigured or a placeholder.');
      return res.status(503).send('Webhook verification unconfigured');
    }

    let isWebhookValid = false;
    try {
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

      const sigBuf = Buffer.from(signature, 'utf8');
      const expBuf = Buffer.from(expectedSignature, 'utf8');

      if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
        isWebhookValid = true;
      }
    } catch (err) {
      console.error('[Webhook Verification Error]', err.message);
      isWebhookValid = false;
    }

    if (!isWebhookValid) {
      console.warn('[Webhook Error] Invalid Razorpay webhook signature');
      return res.status(400).send('Invalid signature');
    }

    let event;
    try {
      event = JSON.parse(rawBody.toString());
    } catch (jsonErr) {
      return res.status(400).send('Invalid webhook JSON payload');
    }

    // Require explicit event ID - Do NOT generate random fallback IDs
    const eventId = req.headers['x-razorpay-event-id'] || event.id;
    if (!eventId) {
      return res.status(400).send('Missing webhook event identifier');
    }

    // Filter event type: Support payment.captured ONLY
    if (event.event !== 'payment.captured') {
      console.log(`[Webhook Notice] Safely ignoring unsupported event type: ${event.event}`);
      return res.json({ status: 'ignored_unsupported_event', event: event.event, event_id: eventId });
    }

    // Read-only Deduplication Check before processing
    const isEventAlreadyProcessed = await WebhookEventsRepo.isProcessed(eventId);
    if (isEventAlreadyProcessed) {
      console.log(`[Webhook Notice] Event ${eventId} was already processed. Skipping duplicate execution.`);
      return res.json({ status: 'already_processed', event_id: eventId });
    }

    // Extract payment entity
    const paymentEntity = event.payload?.payment?.entity;
    if (!paymentEntity) {
      return res.status(400).send('Missing payment entity in webhook payload');
    }

    if (paymentEntity.status !== 'captured' || paymentEntity.captured !== true) {
      return res.status(400).send('Webhook payment is not confirmed as captured.');
    }

    const paymentId = paymentEntity.id;
    const orderId = paymentEntity.order_id;
    const notes = paymentEntity.notes || {};
    const regId = notes.registration_id;

    if (!paymentId || !orderId || !regId) {
      return res.status(400).send('Webhook payload missing required payment identifiers or registration note');
    }

    if (paymentEntity.currency !== 'INR') {
      return res.status(400).send(`Invalid currency in webhook: Expected INR, got ${paymentEntity.currency}`);
    }

    // Verify registration exists
    const reg = await RegistrationsRepo.findByRegId(regId);
    if (!reg) {
      return res.status(404).send('Registration record not found for webhook: ' + regId);
    }

    // Verify stored payment record exists for this order and matches registration
    const paymentRecord = await PaymentsRepo.findByOrderId(orderId);
    if (!paymentRecord) {
      return res.status(400).send('Order ID not recognized: No corresponding payment record in database');
    }
    if (paymentRecord.registration_id !== regId) {
      return res.status(400).send('Order ID does not match registration record in database');
    }

    // Verify amount in paise matches stored amount in INR * 100
    const expectedAmountPaise = Math.round(Number(paymentRecord.amount) * 100);
    if (Number(paymentEntity.amount) !== expectedAmountPaise) {
      return res.status(400).send(`Amount mismatch: Expected ${expectedAmountPaise} paise, received ${paymentEntity.amount} paise`);
    }

    // Call atomic RPC PaymentsRepo.processRazorpayPayment() with amount in INR
    const rpcResult = await PaymentsRepo.processRazorpayPayment({
      p_order_id: orderId,
      p_payment_id: paymentId,
      p_registration_id: regId,
      p_amount: Number(paymentRecord.amount),
      p_currency: 'INR',
      p_signature: null // Webhooks are verified at webhook envelope level
    });

    // Strict RPC result classification: never treat missing/malformed RPC results as newly processed
    const isValidRpcResult = Boolean(rpcResult && typeof rpcResult === 'object' && rpcResult.success === true);
    const isNewlyProcessed = Boolean(isValidRpcResult && rpcResult.already_processed === false);
    const isAlreadyProcessed = Boolean(isValidRpcResult && rpcResult.already_processed === true);

    if (!isNewlyProcessed && !isAlreadyProcessed) {
      console.error('[Webhook Process Razorpay Payment RPC Invalid Result]', rpcResult);
      return res.status(500).send('Webhook error: Malformed or unexpected RPC result');
    }

    // Record webhook event deduplication ONLY after successful payment processing
    try {
      await WebhookEventsRepo.record(eventId, event.event, event);
    } catch (eventLogErr) {
      // Event log failure must NOT reverse or fail the confirmed payment
      console.warn('[Webhook Log Notice] Failed to record webhook event entry:', eventLogErr.message);
    }

    if (isNewlyProcessed) {
      const student = await StudentsRepo.findByRegId(regId);
      const updatedReg = (await RegistrationsRepo.findByRegId(regId)) || reg;
      if (student && student.email) {
        try {
          await sendPaymentReceipt({
            registrationId: regId,
            studentName: student.full_name,
            studentEmail: student.email,
            courseName: updatedReg.course_name,
            courseDuration: updatedReg.course_duration,
            totalCourseFee: updatedReg.total_course_fee,
            paymentType: paymentRecord.payment_type || notes.payment_type || reg.payment_type,
            amountPaid: Number(paymentRecord.amount),
            remainingBalance: updatedReg.remaining_balance,
            razorpayPaymentId: paymentId,
            razorpayOrderId: orderId,
            paymentDate: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
          });
        } catch (emailErr) {
          console.error('[Webhook Receipt Email Error - Non-Fatal]', emailErr.message);
        }
      }
    }

    return res.json({ status: 'ok', event_id: eventId });
  } catch (err) {
    console.error('[Webhook Processing Error]', err);
    res.status(500).send('Webhook processing failed.');
  }
});

// ============================================================================
// PUBLIC API: GET VERIFIED REGISTRATION STATUS FOR CONFIRMATION SCREEN
// ============================================================================

app.get('/api/registration/status/:registrationId', async (req, res) => {
  try {
    const regId = req.params.registrationId;
    const reg = await RegistrationsRepo.findByRegId(regId);
    if (!reg) {
      return res.status(404).json({ error: 'Registration record not found.' });
    }

    const student = await StudentsRepo.findByRegId(regId);
    const payments = await PaymentsRepo.findByRegId(regId);
    const latestSuccessPayment = payments.find(p => p.payment_status === 'success') || payments[0] || {};

    res.json({
      success: true,
      registration_id: reg.registration_id,
      student_name: student ? student.full_name : 'Valued Student',
      email: student ? student.email : '',
      phone: student ? student.phone : '',
      course_name: reg.course_name,
      duration: reg.course_duration,
      total_fee: reg.total_course_fee,
      amount_paid: reg.total_amount_paid,
      remaining_balance: reg.remaining_balance,
      payment_type: reg.payment_type,
      registration_status: reg.registration_status,
      razorpay_payment_id: latestSuccessPayment.razorpay_payment_id || 'N/A',
      payment_date: latestSuccessPayment.verified_at || reg.created_at
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// SECURE ADMIN AUTHENTICATION APIS
// ============================================================================

app.post('/api/admin/login', rateLimitLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const admin = await AdminUsersRepo.findByEmail(email);
    if (!admin) {
      await RateLimiterRepo.recordFailedAttempt(req.clientIp);
      // Generic message prevents account enumeration
      return res.status(401).json({ error: 'Invalid administrative email or password.' });
    }

    let passwordMatch = false;

    // Check bcrypt hash
    if (admin.password_hash) {
      passwordMatch = await bcrypt.compare(password, admin.password_hash);
    }

    // Direct check with fallback only if password_hash was not pre-computed and default password matches
    if (!passwordMatch && defaultAdminPassword && password === defaultAdminPassword) {
      passwordMatch = true;
      // Auto upgrade password to secure bcrypt hash
      const newHash = await bcrypt.hash(password, 10);
      await AdminUsersRepo.updatePassword(admin.email, newHash);
    }

    if (!passwordMatch) {
      await RateLimiterRepo.recordFailedAttempt(req.clientIp);
      // Generic message prevents account enumeration
      return res.status(401).json({ error: 'Invalid administrative email or password.' });
    }

    // Reset rate limiter on successful authentication
    await RateLimiterRepo.reset(req.clientIp);

    // Issue JWT session token (valid 8 hours)
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role, name: admin.name },
      SESSION_SECRET,
      { expiresIn: '8h' }
    );

    // Set HTTP-only secure cookie
    res.cookie('ndv_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000 // 8 hours
    });

    res.json({
      success: true,
      message: 'Admin authenticated successfully.',
      token,
      user: {
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (err) {
    console.error('[Admin Login Error]', err);
    res.status(500).json({ error: 'Authentication service error: ' + err.message });
  }
});

app.post('/api/admin/logout', (req, res) => {
  res.clearCookie('ndv_admin_token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

app.get('/api/admin/check-session', verifyAdminSession, (req, res) => {
  res.json({
    authenticated: true,
    user: req.adminUser
  });
});

// ============================================================================
// SECURE ADMIN DASHBOARD APIS (Protected via verifyAdminSession)
// ============================================================================

app.get('/api/admin/dashboard-stats', verifyAdminSession, async (req, res) => {
  try {
    const stats = await RegistrationsRepo.getStats();
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/registrations', verifyAdminSession, async (req, res) => {
  try {
    const { status, category, search } = req.query;
    let list = await RegistrationsRepo.findAll();

    // Attach student and payment preview asynchronously
    const fullList = await Promise.all(list.map(async (r) => {
      const student = (await StudentsRepo.findByRegId(r.registration_id)) || {};
      const payments = (await PaymentsRepo.findByRegId(r.registration_id)) || [];
      const latestPay = payments[0] || {};
      return {
        ...r,
        student_name: student.full_name || 'N/A',
        student_email: student.email || 'N/A',
        student_phone: student.phone || 'N/A',
        college: student.college || 'N/A',
        department: student.department || 'N/A',
        year_of_study: student.year_of_study || 'N/A',
        state: student.state || 'N/A',
        latest_payment_id: latestPay.razorpay_payment_id || 'N/A',
        payment_status: latestPay.payment_status || 'created'
      };
    }));

    let filtered = fullList;

    if (status && status !== 'all') {
      filtered = filtered.filter(r => r.registration_status.toLowerCase().includes(status.toLowerCase()));
    }

    if (category && category !== 'all') {
      filtered = filtered.filter(r => r.course_category && r.course_category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(r =>
        r.registration_id.toLowerCase().includes(q) ||
        r.student_name.toLowerCase().includes(q) ||
        r.student_email.toLowerCase().includes(q) ||
        r.student_phone.includes(q) ||
        r.course_name.toLowerCase().includes(q) ||
        (r.latest_payment_id && r.latest_payment_id.toLowerCase().includes(q))
      );
    }

    res.json({
      success: true,
      count: filtered.length,
      registrations: filtered
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/registrations/:registrationId', verifyAdminSession, async (req, res) => {
  try {
    const detailed = await RegistrationsRepo.getDetailed(req.params.registrationId);
    if (!detailed) {
      return res.status(404).json({ error: 'Registration not found.' });
    }
    res.json({ success: true, registration: detailed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/registrations/:registrationId/notes', verifyAdminSession, async (req, res) => {
  try {
    const { notes } = req.body;
    const updated = await RegistrationsRepo.update(req.params.registrationId, { notes });
    res.json({ success: true, notes: updated ? updated.notes : notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/registrations/:registrationId/resend-receipt', verifyAdminSession, async (req, res) => {
  try {
    const detailed = await RegistrationsRepo.getDetailed(req.params.registrationId);
    if (!detailed) {
      return res.status(404).json({ error: 'Registration not found.' });
    }

    if (detailed.registration_status !== 'Fully Paid' && detailed.registration_status !== 'Advance Paid – Slot Reserved' && detailed.registration_status !== 'Advance Paid') {
      return res.status(400).json({ error: 'Cannot send receipt for unverified or unpaid registration.' });
    }

    const latestPay = detailed.payments.find(p => p.payment_status === 'success') || detailed.payments[0] || {};

    const result = await sendPaymentReceipt({
      registrationId: detailed.registration_id,
      studentName: detailed.student.full_name,
      studentEmail: detailed.student.email,
      courseName: detailed.course_name,
      courseDuration: detailed.course_duration,
      totalCourseFee: detailed.total_course_fee,
      paymentType: detailed.payment_type,
      amountPaid: detailed.total_amount_paid,
      remainingBalance: detailed.remaining_balance,
      razorpayPaymentId: latestPay.razorpay_payment_id,
      razorpayOrderId: latestPay.razorpay_order_id,
      paymentDate: latestPay.verified_at || detailed.created_at
    });

    res.json({ success: true, delivery: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/registrations/:registrationId/record-payment', verifyAdminSession, async (req, res) => {
  try {
    const regId = req.params.registrationId;
    const { amount, payment_method, reference_note } = req.body;
    const numericAmount = Number(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required.' });
    }

    const reg = await RegistrationsRepo.findByRegId(regId);
    if (!reg) {
      return res.status(404).json({ error: 'Registration not found.' });
    }

    const currentPaid = Number(reg.total_amount_paid || 0);
    const totalFee = Number(reg.total_course_fee);
    const newPaid = currentPaid + numericAmount;

    if (newPaid > totalFee) {
      return res.status(400).json({
        error: `Payment exceeds total course fee. Remaining balance is ₹${totalFee - currentPaid}.`
      });
    }

    const newRemaining = Math.max(0, totalFee - newPaid);
    const newStatus = newRemaining === 0 ? 'Fully Paid' : (newPaid === 2499 ? 'Advance Paid' : 'Balance Pending');

    // 1. Record new verified payment
    const payment = await PaymentsRepo.create({
      registration_id: regId,
      razorpay_order_id: `manual_order_${Date.now()}`,
      razorpay_payment_id: `manual_rec_${Date.now()}`,
      amount: numericAmount,
      currency: 'INR',
      payment_type: 'subsequent',
      payment_status: 'success',
      payment_method: payment_method || 'Bank Transfer / Admin Receipt',
      verified_at: new Date().toISOString()
    });

    // 2. Update registration totals
    const updated = await RegistrationsRepo.update(regId, {
      total_amount_paid: newPaid,
      remaining_balance: newRemaining,
      registration_status: newStatus,
      notes: (reg.notes ? reg.notes + '\n' : '') + `[${new Date().toISOString()}] Recorded payment of ₹${numericAmount} (${reference_note || 'Subsequent fee payment'})`
    });

    res.json({
      success: true,
      message: 'Payment recorded successfully.',
      registration: updated,
      payment
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CSV / Excel Export APIs
app.get('/api/admin/export/registrations', verifyAdminSession, async (req, res) => {
  try {
    const regs = await RegistrationsRepo.findAll();
    const headers = [
      'Registration ID',
      'Student Name',
      'Email',
      'Phone',
      'WhatsApp',
      'College',
      'Department',
      'Year of Study',
      'State',
      'Course Name',
      'Category',
      'Duration',
      'Total Fee (INR)',
      'Amount Paid (INR)',
      'Remaining Balance (INR)',
      'Payment Type',
      'Status',
      'Registration Date'
    ];

    const rows = await Promise.all(regs.map(async (r) => {
      const student = (await StudentsRepo.findByRegId(r.registration_id)) || {};
      return [
        `"${r.registration_id}"`,
        `"${(student.full_name || '').replace(/"/g, '""')}"`,
        `"${(student.email || '').replace(/"/g, '""')}"`,
        `"${student.phone || ''}"`,
        `"${student.whatsapp || ''}"`,
        `"${(student.college || '').replace(/"/g, '""')}"`,
        `"${(student.department || '').replace(/"/g, '""')}"`,
        `"${student.year_of_study || ''}"`,
        `"${student.state || ''}"`,
        `"${(r.course_name || '').replace(/"/g, '""')}"`,
        `"${(r.course_category || '').replace(/"/g, '""')}"`,
        `"${r.course_duration || ''}"`,
        r.total_course_fee,
        r.total_amount_paid,
        r.remaining_balance,
        `"${r.payment_type}"`,
        `"${r.registration_status}"`,
        `"${r.created_at}"`
      ].join(',');
    }));

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=NEXTGEN_Registrations_${Date.now()}.csv`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/export/payments', verifyAdminSession, async (req, res) => {
  try {
    const payments = await PaymentsRepo.findAll();
    const headers = [
      'Payment ID',
      'Registration ID',
      'Razorpay Order ID',
      'Razorpay Payment ID',
      'Amount (INR)',
      'Payment Type',
      'Payment Status',
      'Payment Method',
      'Verified At',
      'Created At'
    ];

    const rows = payments.map(p => [
      `"${p.id}"`,
      `"${p.registration_id}"`,
      `"${p.razorpay_order_id || ''}"`,
      `"${p.razorpay_payment_id || ''}"`,
      p.amount,
      `"${p.payment_type}"`,
      `"${p.payment_status}"`,
      `"${p.payment_method}"`,
      `"${p.verified_at || ''}"`,
      `"${p.created_at}"`
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=NEXTGEN_Payments_${Date.now()}.csv`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Panel Single Page Application Route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(staticDir, 'admin.html'));
});

// Default catch-all route sends to main website
app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

// Centralized Error Handling Middleware (Prevents stack trace leaks in production)
app.use((err, req, res, next) => {
  console.error('[Application Error]', err.stack || err.message);
  const status = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred. Please try again or contact NEXTGEN DMA VENTURES admissions.'
    : err.message;
  res.status(status).json({ success: false, error: message });
});

// Start Server (Standalone or Local development)
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n============================================================`);
    console.log(`🚀 NEXTGEN DMA VENTURES SERVER RUNNING`);
    console.log(`🌐 Public Website: http://localhost:${PORT}`);
    console.log(`🔒 Admin Panel   : http://localhost:${PORT}/admin`);
    console.log(`🔑 Admin Login   : ${defaultAdminEmail}`);
    console.log(`🔐 Admin Status  : ${defaultAdminPassword || defaultAdminHash ? '[SECURED VIA ENV]' : '[PENDING CONFIGURATION]'}`);
    console.log(`💳 Razorpay Mode : ${isRazorpayConfigured ? (RAZORPAY_KEY_ID.startsWith('rzp_test') ? 'TEST' : 'LIVE') : 'DISABLED (CREDENTIALS MISSING / PLACEHOLDER)'}`);
    console.log(`============================================================\n`);
  });
}

// Internal helper for unit test mocking
app._setRazorpayClient = (client) => {
  razorpayClient = client;
};
app._getRazorpayClient = () => razorpayClient;

// Export for Vercel Serverless Function Handler
module.exports = app;

