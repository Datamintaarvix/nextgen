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

const app = express();
const PORT = process.env.PORT || 5000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'nextgen_session_secret_default_2026_xyz!';

// Initialize Razorpay Client
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_placeholder';

let razorpayClient = null;
if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET && !RAZORPAY_KEY_ID.includes('placeholder')) {
  try {
    razorpayClient = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET
    });
    console.log('[Razorpay] Initialized with Key ID:', RAZORPAY_KEY_ID);
  } catch (err) {
    console.warn('[Razorpay] Failed to initialize live SDK client, fallback active:', err.message);
  }
} else {
  console.log('[Razorpay] Test/Dev placeholder mode active. Set valid keys in .env for live transactions.');
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

// Static frontend asset directory resolution (supports both root and nested folder execution)
const nestedDir = path.join(__dirname, 'nextgen-dma-ventures-v4', 'nextgen-dma-ventures');
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
// PUBLIC API: CONFIG & COURSES
// ============================================================================

app.get('/api/config/public-key', (req, res) => {
  res.json({
    keyId: RAZORPAY_KEY_ID,
    advanceAmount: 2499,
    isTestMode: RAZORPAY_KEY_ID.startsWith('rzp_test') || RAZORPAY_KEY_ID.includes('placeholder'),
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

    let razorpayOrderId = null;

    if (razorpayClient) {
      // Real Razorpay order creation via SDK
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
      razorpayOrderId = order.id;
    } else {
      // Development mock order creation
      razorpayOrderId = `order_ndv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    }

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

    if (!registration_id || !razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ error: 'Missing required payment verification parameters.' });
    }

    const reg = await RegistrationsRepo.findByRegId(registration_id);
    if (!reg) {
      return res.status(404).json({ error: 'Registration record not found.' });
    }

    // Verify order ID belongs to this registration
    let paymentRecord = await PaymentsRepo.findByOrderId(razorpay_order_id);
    if (paymentRecord && paymentRecord.registration_id !== registration_id) {
      return res.status(400).json({ error: 'Transaction order ID does not match this registration record.' });
    }

    const student = await StudentsRepo.findByRegId(registration_id);

    // Idempotency check: Return existing verified receipt if this payment was already verified
    if (paymentRecord && paymentRecord.payment_status === 'success' && paymentRecord.razorpay_payment_id === razorpay_payment_id) {
      return res.json({
        success: true,
        verified: true,
        registration_id,
        status: reg.registration_status,
        message: 'Transaction already verified and processed.',
        receipt: {
          student_name: student ? student.full_name : 'Student',
          email: student ? student.email : '',
          course_name: reg.course_name,
          duration: reg.course_duration,
          total_fee: reg.total_course_fee,
          amount_paid: reg.total_amount_paid,
          remaining_balance: reg.remaining_balance,
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id,
          payment_type: paymentRecord.payment_type
        }
      });
    }

    // Signature Verification Logic
    let isSignatureValid = false;

    if (RAZORPAY_KEY_SECRET && !RAZORPAY_KEY_SECRET.includes('placeholder')) {
      const generatedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      isSignatureValid = (generatedSignature === razorpay_signature);
    } else {
      // In Dev/Test placeholder mode, simulate successful verification
      isSignatureValid = true;
      console.log(`[Dev Verification] Test mode verified for Order: ${razorpay_order_id}, Payment: ${razorpay_payment_id}`);
    }

    if (!isSignatureValid) {
      console.warn(`[Payment Verification Failed] Signature mismatch for Order: ${razorpay_order_id}`);
      await RegistrationsRepo.update(registration_id, { registration_status: 'Payment Failed' });
      if (paymentRecord) {
        await PaymentsRepo.update(paymentRecord.id, { payment_status: 'failed' });
      }
      return res.status(400).json({ error: 'Payment signature verification failed. Invalid transaction signature.' });
    }

    // Calculate verified payment updates
    const verifiedAmount = paymentRecord ? Number(paymentRecord.amount) : (reg.payment_type === 'advance' ? 2499 : Number(reg.total_course_fee));
    const currentPaid = Number(reg.total_amount_paid || 0);
    const totalFee = Number(reg.total_course_fee);
    const newPaid = Math.min(totalFee, currentPaid + verifiedAmount);
    const newRemaining = Math.max(0, totalFee - newPaid);

    let finalStatus;
    if (newRemaining === 0) {
      finalStatus = 'Fully Paid';
    } else if (reg.payment_type === 'advance' && newPaid === 2499) {
      finalStatus = 'Advance Paid';
    } else {
      finalStatus = 'Balance Pending';
    }

    // 1. Update/Record Payment Record
    if (paymentRecord) {
      await PaymentsRepo.update(paymentRecord.id, {
        razorpay_payment_id,
        razorpay_signature,
        payment_status: 'success',
        verified_at: new Date().toISOString()
      });
    } else {
      paymentRecord = await PaymentsRepo.create({
        registration_id,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount: verifiedAmount,
        currency: 'INR',
        payment_type: reg.payment_type,
        payment_status: 'success',
        verified_at: new Date().toISOString()
      });
    }

    // 2. Update Registration Record
    const updatedReg = await RegistrationsRepo.update(registration_id, {
      total_amount_paid: newPaid,
      remaining_balance: newRemaining,
      registration_status: finalStatus
    });

    // 3. Send Automatic Branded Email Receipt
    let emailResult = { success: false };
    if (student && student.email) {
      emailResult = await sendPaymentReceipt({
        registrationId: registration_id,
        studentName: student.full_name,
        studentEmail: student.email,
        courseName: reg.course_name,
        courseDuration: reg.course_duration,
        totalCourseFee: reg.total_course_fee,
        paymentType: paymentRecord.payment_type,
        amountPaid: verifiedAmount,
        remainingBalance: newRemaining,
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        paymentDate: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      });
    }

    res.json({
      success: true,
      verified: true,
      registration_id,
      status: finalStatus,
      receipt: {
        student_name: student ? student.full_name : 'Student',
        email: student ? student.email : '',
        course_name: reg.course_name,
        duration: reg.course_duration,
        total_fee: reg.total_course_fee,
        amount_paid: verifiedAmount,
        total_paid_to_date: newPaid,
        remaining_balance: newRemaining,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        payment_type: paymentRecord.payment_type,
        email_sent: emailResult.success
      }
    });
  } catch (err) {
    console.error('[Payment Verification Exception]', err);
    res.status(500).json({ error: 'Server error during payment verification: ' + err.message });
  }
});

// ============================================================================
// PUBLIC API: PAYMENT FAILURE NOTIFIER
// ============================================================================

app.post('/api/payment/payment-failed', async (req, res) => {
  try {
    const { registration_id, razorpay_order_id, error_description } = req.body;
    if (registration_id) {
      await RegistrationsRepo.update(registration_id, {
        registration_status: 'Payment Failed',
        notes: `Payment failed at checkout: ${error_description || 'User cancelled or gateway rejected'}`
      });
    }
    if (razorpay_order_id) {
      const p = await PaymentsRepo.findByOrderId(razorpay_order_id);
      if (p) await PaymentsRepo.update(p.id, { payment_status: 'failed' });
    }
    res.json({ success: true, status: 'Payment Failed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// PUBLIC API: RAZORPAY WEBHOOK (Automated Background Capture)
// ============================================================================

app.post('/api/payment/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.body;

    if (RAZORPAY_WEBHOOK_SECRET && !RAZORPAY_WEBHOOK_SECRET.includes('placeholder')) {
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.warn('[Webhook Error] Invalid Razorpay webhook signature');
        return res.status(400).send('Invalid signature');
      }
    }

    const event = JSON.parse(rawBody.toString());
    const eventId = req.headers['x-razorpay-event-id'] || event.id || `evt_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

    // Atomic Persistent Webhook Idempotency Check & Insert
    const { alreadyProcessed } = await WebhookEventsRepo.recordOrSkip(eventId, event.event, event);
    if (alreadyProcessed) {
      console.log(`[Webhook Notice] Event ${eventId} was already processed or is processing concurrently. Skipping duplicate execution.`);
      return res.json({ status: 'already_processed', event_id: eventId });
    }
    console.log(`[Webhook Event Processed] ID: ${eventId}, Type: ${event.event}`);

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const notes = paymentEntity.notes || {};
      const regId = notes.registration_id;

      if (regId) {
        const reg = await RegistrationsRepo.findByRegId(regId);
        if (reg && reg.registration_status !== 'Fully Paid') {
          const verifiedAmount = Number(paymentEntity.amount) / 100;
          const currentPaid = Number(reg.total_amount_paid || 0);
          const totalFee = Number(reg.total_course_fee);
          const newPaid = Math.min(totalFee, currentPaid + verifiedAmount);
          const newRemaining = Math.max(0, totalFee - newPaid);

          let finalStatus;
          if (newRemaining === 0) {
            finalStatus = 'Fully Paid';
          } else if (reg.payment_type === 'advance' && newPaid === 2499) {
            finalStatus = 'Advance Paid';
          } else {
            finalStatus = 'Balance Pending';
          }

          let paymentRecord = await PaymentsRepo.findByPaymentId(paymentId);
          if (!paymentRecord) {
            paymentRecord = await PaymentsRepo.findByOrderId(orderId);
          }

          if (paymentRecord) {
            await PaymentsRepo.update(paymentRecord.id, {
              razorpay_payment_id: paymentId,
              payment_status: 'success',
              verified_at: new Date().toISOString()
            });
          } else {
            await PaymentsRepo.create({
              registration_id: regId,
              razorpay_order_id: orderId,
              razorpay_payment_id: paymentId,
              amount: verifiedAmount,
              currency: 'INR',
              payment_type: notes.payment_type || reg.payment_type,
              payment_status: 'success',
              verified_at: new Date().toISOString()
            });
          }

          await RegistrationsRepo.update(regId, {
            total_amount_paid: newPaid,
            remaining_balance: newRemaining,
            registration_status: finalStatus
          });

          const student = await StudentsRepo.findByRegId(regId);
          if (student && student.email) {
            await sendPaymentReceipt({
              registrationId: regId,
              studentName: student.full_name,
              studentEmail: student.email,
              courseName: reg.course_name,
              courseDuration: reg.course_duration,
              totalCourseFee: reg.total_course_fee,
              paymentType: notes.payment_type || reg.payment_type,
              amountPaid: verifiedAmount,
              remainingBalance: newRemaining,
              razorpayPaymentId: paymentId,
              razorpayOrderId: orderId
            });
          }
        }
      }
    }

    res.json({ status: 'ok', event_id: eventId });
  } catch (err) {
    console.error('[Webhook Processing Error]', err);
    res.status(500).send('Webhook error');
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
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n============================================================`);
    console.log(`🚀 NEXTGEN DMA VENTURES SERVER RUNNING`);
    console.log(`🌐 Public Website: http://localhost:${PORT}`);
    console.log(`🔒 Admin Panel   : http://localhost:${PORT}/admin`);
    console.log(`🔑 Admin Login   : ${defaultAdminEmail}`);
    console.log(`🔐 Admin Status  : ${defaultAdminPassword || defaultAdminHash ? '[SECURED VIA ENV]' : '[PENDING CONFIGURATION]'}`);
    console.log(`💳 Razorpay Mode : ${RAZORPAY_KEY_ID.startsWith('rzp_test') ? 'TEST' : (RAZORPAY_KEY_ID.includes('placeholder') ? 'DEV-SIMULATOR' : 'LIVE')}`);
    console.log(`============================================================\n`);
  });
}

// Export for Vercel Serverless Function Handler
module.exports = app;

