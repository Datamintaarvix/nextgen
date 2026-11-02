/**
 * ============================================================================
 * NEXTGEN DMA VENTURES - EMAIL RECEIPT SERVICE (Nodemailer)
 * ============================================================================
 * Generates and sends branded HTML payment receipts upon verified payment.
 * Logs delivery status into the database.
 */

const nodemailer = require('nodemailer');
const { EmailLogsRepo } = require('./db');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASSWORD || '';

  if (user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });
  } else {
    // Development fallback transporter (logs to console)
    transporter = {
      sendMail: async (options) => {
        console.log('\n================================================================');
        console.log('📨 [DEV EMAIL SIMULATION - SMTP Credentials not set in .env]');
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log('----------------------------------------------------------------');
        console.log(options.text || '(HTML Email generated successfully)');
        console.log('================================================================\n');
        return { messageId: `sim_${Date.now()}` };
      }
    };
  }

  return transporter;
}

/**
 * Format currency in INR: ₹34,999
 */
function formatINR(amount) {
  return '₹' + Number(amount || 0).toLocaleString('en-IN');
}

/**
 * Send Payment Receipt to Student
 */
async function sendPaymentReceipt(receiptData) {
  const {
    registrationId,
    studentName,
    studentEmail,
    courseName,
    courseDuration,
    totalCourseFee,
    paymentType,
    amountPaid,
    remainingBalance,
    razorpayPaymentId,
    razorpayOrderId,
    paymentDate
  } = receiptData;

  const isAdvance = paymentType === 'advance' || amountPaid === 2499;
  const paymentTypeTitle = isAdvance ? 'Advance Payment – Slot Reservation' : (paymentType === 'balance' ? 'Subsequent Course Fee Balance Payment' : 'Full Course Fee Payment');
  
  const paymentNote = isAdvance
    ? 'Your slot reservation advance of ₹2,499 has been received and adjusted against your total course fee. Your admission slot has been reserved.'
    : (remainingBalance === 0 
        ? 'Your course fee is now fully paid. Your registration is complete and 100% confirmed.'
        : `Your payment of ${formatINR(amountPaid)} has been received. Remaining balance: ${formatINR(remainingBalance)}.`);

  const formattedDate = paymentDate || new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const subject = `Payment Successful – NEXTGEN DMA VENTURES Course Registration (${registrationId})`;

  const textBody = `
Dear ${studentName},

Your payment has been successfully received by NEXTGEN DMA VENTURES.

PAYMENT RECEIPT
------------------------------------------------------------
Registration ID : ${registrationId}
Student Name    : ${studentName}
Course Name     : ${courseName}
Course Duration : ${courseDuration}
Total Course Fee: ${formatINR(totalCourseFee)}
Payment Type    : ${paymentTypeTitle}
Amount Paid     : ${formatINR(amountPaid)}
Remaining Balance: ${formatINR(remainingBalance)}
Payment ID      : ${razorpayPaymentId || 'N/A'}
Order ID        : ${razorpayOrderId || 'N/A'}
Payment Date    : ${formattedDate}
Payment Status  : SUCCESSFUL
------------------------------------------------------------
Note: ${paymentNote}

Campus Location:
NEXTGEN DMA VENTURES
HSR Layout, Sector 1, Bangalore, Karnataka - 560102
Admissions Helpline: +91 9787076296 | Email: admissions@nextgendma.com
`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment Receipt - NEXTGEN DMA VENTURES</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f12; color: #172126; margin: 0; padding: 24px; }
    .receipt-card { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; }
    .receipt-header { background: #000000; color: #ffffff; padding: 32px 30px; border-bottom: 3px solid #65D2C5; text-align: center; }
    .brand-title { font-size: 24px; font-weight: 900; letter-spacing: 0.1em; margin: 0; text-transform: uppercase; }
    .brand-accent { color: #65D2C5; }
    .brand-sub { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #94a3b8; margin-top: 6px; font-family: monospace; }
    .status-badge { display: inline-block; background: #65D2C5; color: #000000; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; padding: 6px 16px; border-radius: 9999px; margin-top: 14px; }
    .receipt-body { padding: 32px 30px; }
    .greeting { font-size: 16px; color: #000000; line-height: 1.6; margin-bottom: 24px; }
    .receipt-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-bottom: 24px; }
    .receipt-row { display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13px; }
    .receipt-row:last-child { border-bottom: none; }
    .label { color: #64748b; font-weight: 500; }
    .value { color: #000000; font-weight: 700; text-align: right; }
    .value-mint { color: #008779; font-weight: 800; }
    .highlight-box { background: #e6fbf8; border-left: 4px solid #65D2C5; padding: 14px 18px; border-radius: 8px; font-size: 13px; color: #004d45; line-height: 1.5; margin-bottom: 24px; }
    .receipt-footer { background: #f1f5f9; padding: 20px 30px; text-align: center; font-size: 11px; color: #64748b; font-family: monospace; border-top: 1px solid #e2e8f0; }
    .contact-link { color: #008779; text-decoration: none; font-weight: 700; }
  </style>
</head>
<body>
  <div class="receipt-card">
    <div class="receipt-header">
      <div class="brand-title">NEXTGEN <span class="brand-accent">DMA</span> VENTURES</div>
      <div class="brand-sub">Tech Academy &bull; Enterprise Innovation Hub</div>
      <div class="status-badge">&check; PAYMENT VERIFIED &bull; OFFICIAL RECEIPT</div>
    </div>

    <div class="receipt-body">
      <div class="greeting">
        Dear <strong>${studentName}</strong>,<br>
        Your payment has been successfully received and verified by <strong>NEXTGEN DMA VENTURES</strong>.
      </div>

      <div class="receipt-box">
        <div class="receipt-row">
          <span class="label">Registration ID</span>
          <span class="value" style="font-family: monospace; color:#008779;">${registrationId}</span>
        </div>
        <div class="receipt-row">
          <span class="label">Course Name</span>
          <span class="value">${courseName}</span>
        </div>
        <div class="receipt-row">
          <span class="label">Program Duration</span>
          <span class="value">${courseDuration}</span>
        </div>
        <div class="receipt-row">
          <span class="label">Total Official Course Fee</span>
          <span class="value">${formatINR(totalCourseFee)}</span>
        </div>
        <div class="receipt-row">
          <span class="label">Payment Type</span>
          <span class="value">${paymentTypeTitle}</span>
        </div>
        <div class="receipt-row" style="background:#e6fbf8; padding: 10px 12px; border-radius: 8px; margin: 4px 0;">
          <span class="label" style="color:#004d45; font-weight:700;">Amount Paid</span>
          <span class="value-mint" style="font-size: 16px;">${formatINR(amountPaid)}</span>
        </div>
        <div class="receipt-row">
          <span class="label">Remaining Balance</span>
          <span class="value" style="color: ${remainingBalance > 0 ? '#b91c1c' : '#15803d'};">${formatINR(remainingBalance)}</span>
        </div>
        <div class="receipt-row">
          <span class="label">Razorpay Payment ID</span>
          <span class="value" style="font-family: monospace; font-size:11px;">${razorpayPaymentId || 'N/A'}</span>
        </div>
        <div class="receipt-row">
          <span class="label">Razorpay Order ID</span>
          <span class="value" style="font-family: monospace; font-size:11px;">${razorpayOrderId || 'N/A'}</span>
        </div>
        <div class="receipt-row">
          <span class="label">Payment Date & Time</span>
          <span class="value">${formattedDate}</span>
        </div>
        <div class="receipt-row">
          <span class="label">Payment Status</span>
          <span class="value" style="color:#15803d;">SUCCESSFUL &bull; CONFIRMED</span>
        </div>
      </div>

      <div class="highlight-box">
        <strong>Payment Note:</strong> ${paymentNote}
      </div>

      <p style="font-size: 12px; color: #475569; line-height: 1.6;">
        Our senior student counsellor will connect with you before batch orientation to share the complete module repository, schedule, and onboarding instructions.
      </p>
    </div>

    <div class="receipt-footer">
      <div>NEXTGEN DMA VENTURES &bull; HSR Layout, Sector 1, Bangalore, Karnataka - 560102</div>
      <div style="margin-top: 4px;">Helpline: <a href="tel:+919787076296" class="contact-link">+91 9787076296</a> | Email: <a href="mailto:admissions@nextgendma.com" class="contact-link">admissions@nextgendma.com</a></div>
      <div style="margin-top: 8px; color: #94a3b8;">This is an electronically generated receipt for your verified payment.</div>
    </div>
  </div>
</body>
</html>
`;

  try {
    const mailer = getTransporter();
    const fromEmail = process.env.SMTP_FROM_EMAIL || 'admissions@nextgendma.com';
    const fromName = process.env.SMTP_FROM_NAME || 'NEXTGEN DMA VENTURES Admissions';

    const info = await mailer.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: studentEmail,
      subject,
      text: textBody,
      html: htmlBody
    });

    const isSimulated = info && info.messageId && info.messageId.startsWith('sim_');
    const deliveryStatus = isSimulated ? 'simulated' : 'sent';

    await EmailLogsRepo.create({
      registration_id: registrationId,
      email: studentEmail,
      email_type: 'payment_receipt',
      subject,
      delivery_status: deliveryStatus
    });

    return {
      success: true,
      deliveryStatus,
      messageId: info.messageId
    };
  } catch (err) {
    console.error(`[Email Error] Failed to send receipt to ${studentEmail}:`, err.message);

    try {
      await EmailLogsRepo.create({
        registration_id: registrationId,
        email: studentEmail,
        email_type: 'payment_receipt',
        subject,
        delivery_status: 'failed',
        error_message: err.message
      });
    } catch (logErr) {}

    return {
      success: false,
      deliveryStatus: 'failed',
      error: err.message
    };
  }
}

module.exports = {
  sendPaymentReceipt,
  formatINR
};
