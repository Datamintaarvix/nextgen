/**
 * NEXTGEN DMA VENTURES - STAGE A SECURITY REMEDIATION TEST SUITE
 * Pure in-process test runner (no network sockets required)
 */

const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { Readable, Duplex } = require('stream');
const { EventEmitter } = require('events');

const projectRoot = path.resolve(__dirname, '..');

let testsPassed = 0;
let testsFailed = 0;
const results = [];

function assert(condition, testName, details = '') {
  if (condition) {
    testsPassed++;
    results.push({ name: testName, status: 'PASS', details });
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    testsFailed++;
    results.push({ name: testName, status: 'FAIL', details });
    console.error(`  ❌ FAIL: ${testName} - ${details}`);
  }
}

function dispatch(app, { method = 'GET', url = '/', headers = {}, body = null }) {
  return new Promise((resolve) => {
    let payloadBuffer = null;
    if (body !== null && body !== undefined) {
      if (Buffer.isBuffer(body)) {
        payloadBuffer = body;
      } else if (typeof body === 'string') {
        payloadBuffer = Buffer.from(body, 'utf8');
      } else {
        payloadBuffer = Buffer.from(JSON.stringify(body), 'utf8');
      }
    }

    const req = new Readable({
      read() {
        if (payloadBuffer) {
          this.push(payloadBuffer);
          payloadBuffer = null;
        } else {
          this.push(null);
        }
      }
    });

    req.method = method;
    req.url = url;
    req.originalUrl = url;
    req.headers = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
    if (body && !req.headers['content-type']) {
      req.headers['content-type'] = 'application/json';
    }
    if (payloadBuffer) {
      req.headers['content-length'] = String(payloadBuffer.length);
    }
    const socket = new Duplex({ read() {}, write(c, e, cb) { cb(); } });
    socket.remoteAddress = '127.0.0.1';
    req.socket = socket;

    const res = new EventEmitter();
    let resBody = '';
    res.statusCode = 200;
    res._headers = {};
    res.setHeader = (k, v) => { res._headers[k.toLowerCase()] = v; };
    res.getHeader = (k) => res._headers[k.toLowerCase()];
    res.status = (code) => { res.statusCode = code; return res; };
    res.cookie = () => res;
    res.clearCookie = () => res;

    const finish = () => {
      let json = null;
      try { json = JSON.parse(resBody); } catch (e) {}
      resolve({ statusCode: res.statusCode, headers: res._headers, body: resBody, json });
    };

    res.write = (chunk) => { if (chunk) resBody += chunk.toString(); return true; };
    res.end = (chunk) => {
      if (chunk) resBody += chunk.toString();
      finish();
    };
    res.send = (data) => {
      if (typeof data === 'object') {
        res.setHeader('content-type', 'application/json');
        resBody = JSON.stringify(data);
      } else {
        resBody = String(data);
      }
      finish();
    };
    res.json = (data) => {
      res.setHeader('content-type', 'application/json');
      resBody = JSON.stringify(data);
      finish();
    };

    app(req, res, (err) => {
      if (err) {
        resolve({ statusCode: 500, headers: {}, body: err.message, json: { error: err.message } });
      } else {
        resolve({ statusCode: 404, headers: {}, body: 'Not Found', json: { error: 'Not Found' } });
      }
    });
  });
}

function clearRequireCache() {
  Object.keys(require.cache).forEach(key => {
    if (key.includes(projectRoot)) {
      delete require.cache[key];
    }
  });
}

async function runTests() {
  console.log('============================================================');
  console.log('🚀 RUNNING STAGE A PAYMENT SECURITY TEST SUITE');
  console.log('============================================================\n');

  // TEST SUITE 1: Static Code Verification in script.js
  console.log('--- Test Suite 1: script.js Mock Verification Elimination ---');
  const scriptContent = fs.readFileSync(path.join(projectRoot, 'script.js'), 'utf8');
  assert(!scriptContent.includes('pay_mock_'), 'script.js does not contain pay_mock_ credentials');
  assert(!scriptContent.includes('sig_mock_'), 'script.js does not contain sig_mock_ credentials');
  assert(scriptContent.includes('Razorpay secure checkout could not be loaded'), 'script.js displays error when Razorpay checkout SDK is missing');
  assert(scriptContent.includes('!verifyData.verified'), 'script.js strictly validates verifyData.verified');

  // TEST SUITE 2: Server Behavior with Missing Credentials
  console.log('\n--- Test Suite 2: Server Behavior with Missing Razorpay Credentials ---');
  delete process.env.RAZORPAY_KEY_ID;
  delete process.env.RAZORPAY_KEY_SECRET;
  delete process.env.RAZORPAY_WEBHOOK_SECRET;
  process.env.NODE_ENV = 'test';
  delete process.env.VERCEL;
  clearRequireCache();

  const appMissing = require(path.join(projectRoot, 'server.js'));

  const configRes = await dispatch(appMissing, { url: '/api/config/public-key', method: 'GET' });
  assert(configRes.statusCode === 200 && configRes.json.keyId === null && configRes.json.isConfigured === false,
    'Public key endpoint returns keyId: null and isConfigured: false when keys are missing');

  const createOrderRes = await dispatch(appMissing, {
    url: '/api/payment/create-order',
    method: 'POST',
    body: { registration_id: 'NDV2026-TEST1' }
  });
  assert(createOrderRes.statusCode === 503,
    'Order creation returns 503 Service Unavailable when Razorpay keys are missing', `status: ${createOrderRes.statusCode}`);
  assert(createOrderRes.json && createOrderRes.json.error.includes('unavailable'),
    'Order creation returns user-friendly error without leaking secrets');

  const verifyRes = await dispatch(appMissing, {
    url: '/api/payment/verify-payment',
    method: 'POST',
    body: {
      registration_id: 'NDV2026-TEST1',
      razorpay_order_id: 'order_test_123',
      razorpay_payment_id: 'pay_test_123',
      razorpay_signature: 'sig_test_123'
    }
  });
  assert(verifyRes.statusCode === 503,
    'Payment verification returns 503 when Razorpay secret is missing (no auto-approval)', `status: ${verifyRes.statusCode}`);

  const webhookRes = await dispatch(appMissing, {
    url: '/api/payment/webhook',
    method: 'POST',
    headers: { 'x-razorpay-signature': 'dummy_sig' },
    body: JSON.stringify({ event: 'payment.captured' })
  });
  assert(webhookRes.statusCode === 503,
    'Webhook returns 503 when webhook secret is missing (never processes unverified payloads)');

  // TEST SUITE 3: Server Behavior with Placeholder Credentials
  console.log('\n--- Test Suite 3: Server Behavior with Placeholder Credentials ---');
  process.env.RAZORPAY_KEY_ID = 'rzp_test_placeholder';
  process.env.RAZORPAY_KEY_SECRET = 'rzp_secret_placeholder';
  process.env.RAZORPAY_WEBHOOK_SECRET = 'rzp_webhook_placeholder';
  clearRequireCache();

  const appPlaceholder = require(path.join(projectRoot, 'server.js'));

  const configPlaceholderRes = await dispatch(appPlaceholder, { url: '/api/config/public-key', method: 'GET' });
  assert(configPlaceholderRes.statusCode === 200 && configPlaceholderRes.json.keyId === null && configPlaceholderRes.json.isConfigured === false,
    'Public key endpoint treats placeholder credentials as unconfigured');

  const createOrderPlaceholderRes = await dispatch(appPlaceholder, {
    url: '/api/payment/create-order',
    method: 'POST',
    body: { registration_id: 'NDV2026-TEST2' }
  });
  assert(createOrderPlaceholderRes.statusCode === 503,
    'Order creation returns 503 with placeholder credentials (no mock order created)');

  const verifyPlaceholderRes = await dispatch(appPlaceholder, {
    url: '/api/payment/verify-payment',
    method: 'POST',
    body: {
      registration_id: 'NDV2026-TEST2',
      razorpay_order_id: 'order_test_456',
      razorpay_payment_id: 'pay_test_456',
      razorpay_signature: 'dummy_sig_here'
    }
  });
  assert(verifyPlaceholderRes.statusCode === 503,
    'Payment verification returns 503 with placeholder credentials (never approves automatically)');

  const webhookPlaceholderRes = await dispatch(appPlaceholder, {
    url: '/api/payment/webhook',
    method: 'POST',
    headers: { 'x-razorpay-signature': 'dummy_sig' },
    body: JSON.stringify({ event: 'payment.captured' })
  });
  assert(webhookPlaceholderRes.statusCode === 503,
    'Webhook returns 503 with placeholder credentials');

  // TEST SUITE 4: Verification Parameter Validation & Mock Rejection
  console.log('\n--- Test Suite 4: Parameter Validation & Mock Rejection ---');
  const TEST_SECRET = 'super_secret_test_key_razorpay_999!';
  const TEST_WEBHOOK_SECRET = 'super_webhook_test_secret_razorpay_888!';
  process.env.RAZORPAY_KEY_ID = 'rzp_test_genuine_key123';
  process.env.RAZORPAY_KEY_SECRET = TEST_SECRET;
  process.env.RAZORPAY_WEBHOOK_SECRET = TEST_WEBHOOK_SECRET;
  clearRequireCache();

  const appLive = require(path.join(projectRoot, 'server.js'));
  const { RegistrationsRepo, PaymentsRepo, StudentsRepo, EmailLogsRepo } = require(path.join(projectRoot, 'db.js'));

  // Missing signature
  const missingSigRes = await dispatch(appLive, {
    url: '/api/payment/verify-payment',
    method: 'POST',
    body: {
      registration_id: 'NDV2026-TEST3',
      razorpay_order_id: 'order_123',
      razorpay_payment_id: 'pay_123'
    }
  });
  assert(missingSigRes.statusCode === 400 && missingSigRes.json.error.includes('Missing required payment verification parameters'),
    'Verification fails with 400 when razorpay_signature is omitted');

  // Missing payment_id
  const missingPayIdRes = await dispatch(appLive, {
    url: '/api/payment/verify-payment',
    method: 'POST',
    body: {
      registration_id: 'NDV2026-TEST3',
      razorpay_order_id: 'order_123',
      razorpay_signature: 'sig_123'
    }
  });
  assert(missingPayIdRes.statusCode === 400,
    'Verification fails with 400 when razorpay_payment_id is omitted');

  // Missing order_id
  const missingOrderIdRes = await dispatch(appLive, {
    url: '/api/payment/verify-payment',
    method: 'POST',
    body: {
      registration_id: 'NDV2026-TEST3',
      razorpay_payment_id: 'pay_123',
      razorpay_signature: 'sig_123'
    }
  });
  assert(missingOrderIdRes.statusCode === 400,
    'Verification fails with 400 when razorpay_order_id is omitted');

  // Missing registration_id
  const missingRegIdRes = await dispatch(appLive, {
    url: '/api/payment/verify-payment',
    method: 'POST',
    body: {
      razorpay_order_id: 'order_123',
      razorpay_payment_id: 'pay_123',
      razorpay_signature: 'sig_123'
    }
  });
  assert(missingRegIdRes.statusCode === 400,
    'Verification fails with 400 when registration_id is omitted');

  // Mock payment ID rejection
  const mockPayRes = await dispatch(appLive, {
    url: '/api/payment/verify-payment',
    method: 'POST',
    body: {
      registration_id: 'NDV2026-TEST3',
      razorpay_order_id: 'order_123',
      razorpay_payment_id: 'pay_mock_173000000',
      razorpay_signature: 'sig_mock_173000000'
    }
  });
  assert(mockPayRes.statusCode === 400 && mockPayRes.json.error.includes('Mock or simulated'),
    'Verification explicitly rejects pay_mock_ identifiers with 400 Bad Request');

  // Mock order ID rejection
  const mockOrderRes = await dispatch(appLive, {
    url: '/api/payment/verify-payment',
    method: 'POST',
    body: {
      registration_id: 'NDV2026-TEST3',
      razorpay_order_id: 'order_ndv_173000000',
      razorpay_payment_id: 'pay_test_123',
      razorpay_signature: 'sig_test_123'
    }
  });
  assert(mockOrderRes.statusCode === 400 && mockOrderRes.json.error.includes('Mock or simulated'),
    'Verification explicitly rejects order_ndv_ identifiers with 400 Bad Request');


  // In-memory atomic payment simulation hook for regression suites 5 & 6
  const inMemoryPaymentsCaptured = new Set();
  PaymentsRepo.processRazorpayPayment = async ({ p_order_id, p_payment_id, p_registration_id, p_amount }) => {
    const isNew = !inMemoryPaymentsCaptured.has(p_payment_id);
    inMemoryPaymentsCaptured.add(p_payment_id);
    if (isNew) {
      const reg = await RegistrationsRepo.findByRegId(p_registration_id);
      if (reg) {
        const newPaid = Number(reg.total_amount_paid || 0) + Number(p_amount);
        const newRem = Math.max(0, Number(reg.total_course_fee) - newPaid);
        await RegistrationsRepo.update(p_registration_id, {
          total_amount_paid: newPaid,
          remaining_balance: newRem,
          registration_status: newRem === 0 ? 'Fully Paid' : 'Advance Paid'
        });
      }
      const pay = await PaymentsRepo.findByOrderId(p_order_id);
      if (pay) {
        await PaymentsRepo.update(pay.id, {
          razorpay_payment_id: p_payment_id,
          payment_status: 'success',
          verified_at: new Date().toISOString()
        });
      }
    }
    return { success: true, is_new: isNew, already_processed: !isNew };
  };

  // TEST SUITE 5: Invalid Payment Signature Handling
  console.log('\n--- Test Suite 5: Invalid Payment Signature Handling ---');
  const testRegId = `NDV2026-${Date.now().toString().slice(-4)}`;
  const testOrderId = `order_test_${Date.now()}`;
  const testPaymentId = `pay_test_${Date.now()}`;

  await StudentsRepo.create({
    registration_id: testRegId,
    full_name: 'Test Student Security',
    email: 'security.test@example.com',
    phone: '9876543210'
  });
  await RegistrationsRepo.create({
    registration_id: testRegId,
    student_id: 'stu_test_sec',
    course_id: 'ai-001',
    course_name: 'Artificial Intelligence',
    total_course_fee: 34999,
    payment_type: 'advance',
    total_amount_paid: 0,
    remaining_balance: 32500,
    registration_status: 'Payment Initiated'
  });
  await PaymentsRepo.create({
    registration_id: testRegId,
    razorpay_order_id: testOrderId,
    amount: 2499,
    payment_type: 'advance',
    payment_status: 'created'
  });

  const badSigRes = await dispatch(appLive, {
    url: '/api/payment/verify-payment',
    method: 'POST',
    body: {
      registration_id: testRegId,
      razorpay_order_id: testOrderId,
      razorpay_payment_id: testPaymentId,
      razorpay_signature: 'definitely_an_invalid_forged_signature_hash_00000000000000000000'
    }
  });
  assert(badSigRes.statusCode === 400 && badSigRes.json.error.includes('verification failed'),
    'Verification fails with 400 on signature mismatch');

  const regAfterBadSig = await RegistrationsRepo.findByRegId(testRegId);
  assert(regAfterBadSig.registration_status === 'Payment Initiated',
    'Registration status remains unchanged (Payment Initiated) upon invalid signature');

  const payAfterBadSig = await PaymentsRepo.findByOrderId(testOrderId);
  assert(payAfterBadSig.payment_status === 'created',
    'Payment record status remains unchanged (created) upon invalid signature');

  const emailLogsBadSig = await EmailLogsRepo.findByRegId(testRegId);
  assert(emailLogsBadSig.length === 0,
    'No receipt email is sent upon invalid signature');

  // Prove a later valid payment verification for the same registration and order succeeds
  if (appLive._setRazorpayClient) {
    appLive._setRazorpayClient({
      payments: {
        fetch: async (payId) => ({
          id: payId,
          order_id: testOrderId,
          status: 'captured',
          captured: true,
          amount: 249900,
          currency: 'INR'
        })
      }
    });
  }

  const legitSig = crypto.createHmac('sha256', TEST_SECRET)
    .update(`${testOrderId}|${testPaymentId}`)
    .digest('hex');

  const laterValidRes = await dispatch(appLive, {
    url: '/api/payment/verify-payment',
    method: 'POST',
    body: {
      registration_id: testRegId,
      razorpay_order_id: testOrderId,
      razorpay_payment_id: testPaymentId,
      razorpay_signature: legitSig
    }
  });
  assert(laterValidRes.statusCode === 200 && laterValidRes.json.verified === true,
    'A later valid payment verification for the same registration and order succeeds');

  const regAfterLaterValid = await RegistrationsRepo.findByRegId(testRegId);
  assert(regAfterLaterValid.registration_status === 'Advance Paid',
    'Registration status advances to Advance Paid following later valid payment');

  // TEST SUITE 6: Legitimate Test Payment Signature Verification
  console.log('\n--- Test Suite 6: Legitimate Test Payment Signature Verification ---');
  const legitRegId = `NDV2026-${(Date.now() + 1).toString().slice(-4)}`;
  const legitOrderId = `order_legit_${Date.now()}`;
  const legitPaymentId = `pay_legit_${Date.now()}`;

  // Mock Razorpay SDK payments.fetch for unit testing
  if (appLive._setRazorpayClient) {
    appLive._setRazorpayClient({
      orders: {
        create: async (opts) => ({ id: `order_mock_${Date.now()}`, ...opts })
      },
      payments: {
        fetch: async (payId) => ({
          id: payId,
          order_id: legitOrderId,
          status: 'captured',
          captured: true,
          amount: 249900,
          currency: 'INR'
        })
      }
    });
  }


  await StudentsRepo.create({
    registration_id: legitRegId,
    full_name: 'Legit Test Candidate',
    email: 'legit.candidate@example.com',
    phone: '9988776655'
  });
  await RegistrationsRepo.create({
    registration_id: legitRegId,
    student_id: 'stu_test_legit',
    course_id: 'ai-001',
    course_name: 'Artificial Intelligence',
    course_duration: '28 Weeks',
    total_course_fee: 34999,
    payment_type: 'advance',
    total_amount_paid: 0,
    remaining_balance: 32500,
    registration_status: 'Payment Initiated'
  });
  await PaymentsRepo.create({
    registration_id: legitRegId,
    razorpay_order_id: legitOrderId,
    amount: 2499,
    payment_type: 'advance',
    payment_status: 'created'
  });

  // Compute authentic cryptographic HMAC
  const genuineSignature = crypto
    .createHmac('sha256', TEST_SECRET)
    .update(`${legitOrderId}|${legitPaymentId}`)
    .digest('hex');

  const legitVerifyRes = await dispatch(appLive, {
    url: '/api/payment/verify-payment',
    method: 'POST',
    body: {
      registration_id: legitRegId,
      razorpay_order_id: legitOrderId,
      razorpay_payment_id: legitPaymentId,
      razorpay_signature: genuineSignature
    }
  });

  assert(legitVerifyRes.statusCode === 200 && legitVerifyRes.json.success === true && legitVerifyRes.json.verified === true,
    'Legitimate payment verified successfully with 200 and verified: true');
  assert(legitVerifyRes.json.status === 'Advance Paid',
    'Registration status correctly advanced to Advance Paid');
  assert(legitVerifyRes.json.receipt && legitVerifyRes.json.receipt.amount_paid === 2499,
    'Official receipt generated with correct verified amount');

  // TEST SUITE 7: Duplicate Verification Idempotency
  console.log('\n--- Test Suite 7: Duplicate Verification Request Idempotency ---');
  const duplicateRes = await dispatch(appLive, {
    url: '/api/payment/verify-payment',
    method: 'POST',
    body: {
      registration_id: legitRegId,
      razorpay_order_id: legitOrderId,
      razorpay_payment_id: legitPaymentId,
      razorpay_signature: genuineSignature
    }
  });

  assert(duplicateRes.statusCode === 200 && duplicateRes.json.verified === true,
    'Duplicate verification request returns 200 OK');
  assert(duplicateRes.json.message && duplicateRes.json.message.includes('already verified'),
    'Duplicate verification returns idempotency message without re-crediting');

  const regAfterDup = await RegistrationsRepo.findByRegId(legitRegId);
  assert(regAfterDup.total_amount_paid === 2499,
    'Total amount paid remains ₹2,499 (no duplicate addition)');

  // TEST SUITE 8: Webhook Signature Verification
  console.log('\n--- Test Suite 8: Webhook Signature Verification ---');
  const webhookRawBody = JSON.stringify({
    entity: 'event',
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: `pay_hook_${Date.now()}`,
          order_id: legitOrderId,
          amount: 249900,
          currency: 'INR',
          status: 'captured',
          captured: true,
          notes: { registration_id: legitRegId }
        }
      }
    }
  });

  // Webhook with invalid signature
  const badWebhookRes = await dispatch(appLive, {
    url: '/api/payment/webhook',
    method: 'POST',
    headers: {
      'x-razorpay-signature': 'invalid_webhook_sig_hex_1234567890',
      'x-razorpay-event-id': `evt_test_bad_${Date.now()}`,
      'Content-Type': 'application/json'
    },
    body: Buffer.from(webhookRawBody, 'utf8')
  });
  assert(badWebhookRes.statusCode === 400,
    'Webhook fails with 400 on invalid HMAC signature');

  // Webhook with valid signature
  const validWebhookSig = crypto
    .createHmac('sha256', TEST_WEBHOOK_SECRET)
    .update(webhookRawBody)
    .digest('hex');

  const goodWebhookRes = await dispatch(appLive, {
    url: '/api/payment/webhook',
    method: 'POST',
    headers: {
      'x-razorpay-signature': validWebhookSig,
      'x-razorpay-event-id': `evt_test_good_${Date.now()}`,
      'Content-Type': 'application/json'
    },
    body: Buffer.from(webhookRawBody, 'utf8')
  });
  assert(goodWebhookRes.statusCode === 200,
    'Webhook succeeds with 200 on authentic cryptographic HMAC signature');

  // TEST SUITE 9: Payment Failed Notifier (Non-Authoritative Security Verification)
  console.log('\n--- Test Suite 9: Payment Failed Notifier Endpoint ---');

  // Spy on RegistrationsRepo.update and PaymentsRepo.update
  let regUpdateCalls = [];
  let payUpdateCalls = [];
  const origRegUpdate = RegistrationsRepo.update;
  const origPayUpdate = PaymentsRepo.update;
  RegistrationsRepo.update = async (...args) => {
    regUpdateCalls.push(args);
    return origRegUpdate.apply(RegistrationsRepo, args);
  };
  PaymentsRepo.update = async (...args) => {
    payUpdateCalls.push(args);
    return origPayUpdate.apply(PaymentsRepo, args);
  };

  // Record initial state for testRegId
  const regBeforeNotice = await RegistrationsRepo.findByRegId(testRegId);
  const payBeforeNotice = await PaymentsRepo.findByOrderId(testOrderId);

  const failNoticeRes = await dispatch(appLive, {
    url: '/api/payment/payment-failed',
    method: 'POST',
    body: {
      registration_id: testRegId,
      razorpay_order_id: testOrderId,
      error_description: 'Card declined by issuer bank'
    }
  });

  // Verify neutral acknowledgement HTTP 202
  assert(
    failNoticeRes.statusCode === 202 &&
    failNoticeRes.json.success === true &&
    failNoticeRes.json.status === 'notification_received',
    '/api/payment/payment-failed returns neutral 202 acknowledgement without claiming failure'
  );

  // Verify no updates performed on repositories
  assert(
    regUpdateCalls.length === 0,
    '/api/payment/payment-failed does not invoke RegistrationsRepo.update'
  );
  assert(
    payUpdateCalls.length === 0,
    '/api/payment/payment-failed does not invoke PaymentsRepo.update'
  );

  // Verify registration and payment records remain completely untouched
  const regAfterNotice = await RegistrationsRepo.findByRegId(testRegId);
  const payAfterNotice = await PaymentsRepo.findByOrderId(testOrderId);
  assert(
    regAfterNotice && regAfterNotice.registration_status === regBeforeNotice.registration_status &&
    regAfterNotice.total_amount_paid === regBeforeNotice.total_amount_paid,
    'Registration status and amounts remain unchanged after failure notification'
  );
  assert(
    payAfterNotice && payAfterNotice.payment_status === payBeforeNotice.payment_status,
    'Payment record status remains unchanged after failure notification'
  );

  // Regression Test (Requirement 7): Attacker submits another student's registration ID & order ID
  console.log('\n--- Test Suite 9b: Malicious Cross-Registration Failure Spoofing Defense ---');
  const victimRegId = `NDV2026-VICTIM-${Date.now().toString().slice(-4)}`;
  const victimOrderId = `order_victim_${Date.now()}`;

  await RegistrationsRepo.create({
    registration_id: victimRegId,
    course_name: 'Cybersecurity & Ethical Hacking',
    total_course_fee: 29999,
    payment_type: 'advance',
    total_amount_paid: 2499,
    remaining_balance: 27500,
    registration_status: 'Advance Paid',
    notes: 'Legitimate confirmed enrollment'
  });

  await PaymentsRepo.create({
    registration_id: victimRegId,
    razorpay_order_id: victimOrderId,
    amount: 2499,
    payment_type: 'advance',
    payment_status: 'success'
  });

  regUpdateCalls = [];
  payUpdateCalls = [];

  const spoofAttackRes = await dispatch(appLive, {
    url: '/api/payment/payment-failed',
    method: 'POST',
    body: {
      registration_id: victimRegId,
      razorpay_order_id: victimOrderId,
      error_description: 'Malicious cancellation payload attempting to spoil confirmed registration'
    }
  });

  assert(
    spoofAttackRes.statusCode === 202 &&
    spoofAttackRes.json.status === 'notification_received',
    'Cross-registration failure notification returns neutral 202 without acting on victim'
  );

  assert(
    regUpdateCalls.length === 0 && payUpdateCalls.length === 0,
    'Cross-registration attack does not invoke any repository updates'
  );

  const victimRegAfter = await RegistrationsRepo.findByRegId(victimRegId);
  assert(
    victimRegAfter.registration_status === 'Advance Paid' &&
    victimRegAfter.total_amount_paid === 2499 &&
    victimRegAfter.notes === 'Legitimate confirmed enrollment',
    'Victim registration status, amounts, and notes remain 100% intact and uncorrupted'
  );

  const victimPayAfter = await PaymentsRepo.findByOrderId(victimOrderId);
  assert(
    victimPayAfter.payment_status === 'success',
    'Victim payment status remains success without being set to failed'
  );

  // Restore repository methods
  RegistrationsRepo.update = origRegUpdate;
  PaymentsRepo.update = origPayUpdate;

  console.log('\n============================================================');
  console.log(`TEST RUN COMPLETE: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('============================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
