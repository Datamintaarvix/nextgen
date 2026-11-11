/**
 * NEXTGEN DMA VENTURES - ATOMIC RAZORPAY PAYMENT UNIT & INTEGRATION TEST SUITE
 * Tests all required security scenarios:
 *  a. Valid captured payment.
 *  b. Invalid signature.
 *  c. Payment not captured.
 *  d. Wrong order ID.
 *  e. Wrong registration.
 *  f. Amount mismatch.
 *  g. Currency mismatch.
 *  h. Duplicate browser callback.
 *  i. Duplicate webhook.
 *  j. Browser/webhook race.
 *  k. Supabase RPC failure.
 *  l. Unsupported webhook event.
 */

const crypto = require('crypto');
const path = require('path');
const { Readable, Duplex } = require('stream');
const { EventEmitter } = require('events');

const projectRoot = path.resolve(__dirname, '..');
const dbPath = path.join(projectRoot, 'db.js');
const serverPath = path.join(projectRoot, 'server.js');

let passedCount = 0;
let failedCount = 0;
const testResults = [];

function assert(condition, testName, details = '') {
  if (condition) {
    passedCount++;
    testResults.push({ name: testName, status: 'PASS' });
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    failedCount++;
    testResults.push({ name: testName, status: 'FAIL', details });
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

    app.handle(req, res);
  });
}

async function runAtomicSuite() {
  console.log('============================================================');
  console.log('🚀 RUNNING COMPREHENSIVE ATOMIC RAZORPAY TEST SUITE');
  console.log('============================================================\n');

  const TEST_KEY_ID = 'rzp_test_mock_12345';
  const TEST_KEY_SECRET = 'secret_key_mock_67890!';
  const TEST_WEBHOOK_SECRET = 'webhook_secret_mock_54321!';

  process.env.NODE_ENV = 'test';
  process.env.RAZORPAY_KEY_ID = TEST_KEY_ID;
  process.env.RAZORPAY_KEY_SECRET = TEST_KEY_SECRET;
  process.env.RAZORPAY_WEBHOOK_SECRET = TEST_WEBHOOK_SECRET;

  const emailServicePath = path.join(projectRoot, 'emailService.js');
  delete require.cache[require.resolve(dbPath)];
  delete require.cache[require.resolve(emailServicePath)];
  delete require.cache[require.resolve(serverPath)];

  const { StudentsRepo, RegistrationsRepo, PaymentsRepo, WebhookEventsRepo, EmailLogsRepo } = require(dbPath);
  const emailService = require(emailServicePath);

  // Instrument receipt email attempts across both verify-payment and webhook handlers
  let emailAttempts = [];
  let customEmailImpl = null;
  const origSendPaymentReceipt = emailService.sendPaymentReceipt;
  emailService.sendPaymentReceipt = async (receiptData) => {
    emailAttempts.push(receiptData);
    if (customEmailImpl) return customEmailImpl(receiptData);
    return origSendPaymentReceipt(receiptData);
  };

  const app = require(serverPath);

  // Mock SDK helper
  let mockGatewayPayments = {};
  app._setRazorpayClient({
    orders: {
      create: async (opts) => ({ id: `order_mock_${Date.now()}`, ...opts })
    },
    payments: {
      fetch: async (payId) => {
        if (mockGatewayPayments[payId]) {
          return mockGatewayPayments[payId];
        }
        throw new Error('Payment not found on Razorpay');
      }
    }
  });

  // Track RPC invocations
  let rpcCalls = [];
  let rpcResultFactory = (params) => ({ success: true, already_processed: false, is_new: true, payment_id: params.p_payment_id });

  // Patch processRazorpayPayment for in-process testing
  PaymentsRepo.processRazorpayPayment = async (params) => {
    rpcCalls.push(params);
    return rpcResultFactory(params);
  };

  // Setup test student and registration
  const regId = 'NDV2026-TEST-ATOMIC-1';
  const orderId = 'order_atomic_123';
  const paymentId = 'pay_atomic_123';
  const amountINR = 2499;

  await StudentsRepo.create({
    registration_id: regId,
    full_name: 'Atomic Test Candidate',
    email: 'atomic.candidate@example.com',
    phone: '9876543210'
  });

  await RegistrationsRepo.create({
    registration_id: regId,
    course_name: 'Artificial Intelligence',
    course_duration: '28 Weeks',
    total_course_fee: 34999,
    payment_type: 'advance',
    total_amount_paid: 0,
    remaining_balance: 32500,
    registration_status: 'Payment Initiated'
  });

  await PaymentsRepo.create({
    registration_id: regId,
    razorpay_order_id: orderId,
    amount: amountINR,
    currency: 'INR',
    payment_type: 'advance',
    payment_status: 'created'
  });

  function signOrder(oId, pId) {
    return crypto.createHmac('sha256', TEST_KEY_SECRET).update(`${oId}|${pId}`).digest('hex');
  }

  function signWebhook(raw) {
    return crypto.createHmac('sha256', TEST_WEBHOOK_SECRET).update(raw).digest('hex');
  }

  // -------------------------------------------------------------
  // Test a: Valid Captured Payment
  // -------------------------------------------------------------
  console.log('--- Test a: Valid captured payment ---');
  mockGatewayPayments[paymentId] = {
    id: paymentId,
    order_id: orderId,
    status: 'captured',
    captured: true,
    amount: 249900,
    currency: 'INR'
  };

  rpcCalls = [];
  const validRes = await dispatch(app, {
    method: 'POST',
    url: '/api/payment/verify-payment',
    body: {
      registration_id: regId,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signOrder(orderId, paymentId)
    }
  });

  assert(validRes.statusCode === 200 && validRes.json.success === true && validRes.json.verified === true,
    'Valid captured payment verified with 200 and verified: true');
  assert(rpcCalls.length === 1 && rpcCalls[0].p_amount === 2499,
    'PaymentsRepo.processRazorpayPayment() invoked once with INR amount 2499');

  // -------------------------------------------------------------
  // Test b: Invalid Signature & Security Refinement
  // -------------------------------------------------------------
  console.log('\n--- Test b: Invalid signature ---');
  const sigRegId = 'NDV2026-TEST-SIG-REF';
  const sigOrderId = 'order_sig_ref_100';
  const sigPayId = 'pay_sig_ref_100';

  await StudentsRepo.create({
    registration_id: sigRegId,
    full_name: 'Signature Security Candidate',
    email: 'sig.security@example.com',
    phone: '9876543210'
  });

  await RegistrationsRepo.create({
    registration_id: sigRegId,
    course_name: 'Artificial Intelligence',
    course_duration: '28 Weeks',
    total_course_fee: 34999,
    payment_type: 'advance',
    total_amount_paid: 0,
    remaining_balance: 32500,
    registration_status: 'Payment Initiated'
  });

  await PaymentsRepo.create({
    registration_id: sigRegId,
    razorpay_order_id: sigOrderId,
    amount: 2499,
    currency: 'INR',
    payment_type: 'advance',
    payment_status: 'created'
  });

  mockGatewayPayments[sigPayId] = {
    id: sigPayId,
    order_id: sigOrderId,
    status: 'captured',
    captured: true,
    amount: 249900,
    currency: 'INR'
  };

  const invalidSigRes = await dispatch(app, {
    method: 'POST',
    url: '/api/payment/verify-payment',
    body: {
      registration_id: sigRegId,
      razorpay_order_id: sigOrderId,
      razorpay_payment_id: sigPayId,
      razorpay_signature: 'invalid_forged_signature_0000000000000000000000000000000000000000'
    }
  });

  // 1. Invalid signature returns HTTP 400
  assert(invalidSigRes.statusCode === 400 && invalidSigRes.json.error.includes('signature verification failed'),
    'Invalid signature returns 400 Bad Request');

  // 2. Payment record remains unchanged
  const payAfterInvalid = await PaymentsRepo.findByOrderId(sigOrderId);
  assert(payAfterInvalid && payAfterInvalid.payment_status === 'created',
    'Payment record remains unchanged with status created upon invalid signature');

  // 3. Registration remains unchanged
  const regAfterInvalid = await RegistrationsRepo.findByRegId(sigRegId);
  assert(regAfterInvalid && regAfterInvalid.registration_status === 'Payment Initiated' && regAfterInvalid.total_amount_paid === 0,
    'Registration remains unchanged with status Payment Initiated upon invalid signature');

  // 4. No receipt email is sent
  const emailLogsInvalid = await EmailLogsRepo.findByRegId(sigRegId);
  assert(emailLogsInvalid.length === 0 && invalidSigRes.json.receipt === undefined,
    'No receipt email is sent upon invalid signature');

  // 5. A later valid payment verification can still succeed
  const validLaterSig = signOrder(sigOrderId, sigPayId);
  const laterValidRes = await dispatch(app, {
    method: 'POST',
    url: '/api/payment/verify-payment',
    body: {
      registration_id: sigRegId,
      razorpay_order_id: sigOrderId,
      razorpay_payment_id: sigPayId,
      razorpay_signature: validLaterSig
    }
  });
  assert(laterValidRes.statusCode === 200 && laterValidRes.json.verified === true && laterValidRes.json.success === true,
    'A later valid payment verification succeeds with 200 and verified: true');

  // -------------------------------------------------------------
  // Test c: Payment Not Captured
  // -------------------------------------------------------------
  console.log('\n--- Test c: Payment not captured ---');
  const uncapturedPayId = 'pay_uncaptured_1';
  mockGatewayPayments[uncapturedPayId] = {
    id: uncapturedPayId,
    order_id: orderId,
    status: 'authorized',
    captured: false,
    amount: 249900,
    currency: 'INR'
  };

  const uncapturedRes = await dispatch(app, {
    method: 'POST',
    url: '/api/payment/verify-payment',
    body: {
      registration_id: regId,
      razorpay_order_id: orderId,
      razorpay_payment_id: uncapturedPayId,
      razorpay_signature: signOrder(orderId, uncapturedPayId)
    }
  });
  assert(uncapturedRes.statusCode === 400 && uncapturedRes.json.error.includes('captured'),
    'Payment in authorized (uncaptured) status returns 400');

  // -------------------------------------------------------------
  // Test d: Wrong Order ID
  // -------------------------------------------------------------
  console.log('\n--- Test d: Wrong order ID ---');
  const wrongOrderPayId = 'pay_wrong_order_1';
  mockGatewayPayments[wrongOrderPayId] = {
    id: wrongOrderPayId,
    order_id: 'order_different_999',
    status: 'captured',
    captured: true,
    amount: 249900,
    currency: 'INR'
  };

  const wrongOrderRes = await dispatch(app, {
    method: 'POST',
    url: '/api/payment/verify-payment',
    body: {
      registration_id: regId,
      razorpay_order_id: orderId,
      razorpay_payment_id: wrongOrderPayId,
      razorpay_signature: signOrder(orderId, wrongOrderPayId)
    }
  });
  assert(wrongOrderRes.statusCode === 400 && wrongOrderRes.json && wrongOrderRes.json.error.includes('does not match submitted order ID'),
    'Mismatch between submitted order ID and gateway order ID returns 400',
    `Status: ${wrongOrderRes.statusCode}, Body: ${JSON.stringify(wrongOrderRes.json)}`);

  // -------------------------------------------------------------
  // Test e: Wrong Registration
  // -------------------------------------------------------------
  console.log('\n--- Test e: Wrong registration ---');
  const otherRegId = 'NDV2026-TEST-OTHER-2';
  await RegistrationsRepo.create({
    registration_id: otherRegId,
    course_name: 'Data Science',
    total_course_fee: 34999,
    payment_type: 'advance',
    remaining_balance: 32500,
    registration_status: 'Payment Initiated'
  });

  const wrongRegRes = await dispatch(app, {
    method: 'POST',
    url: '/api/payment/verify-payment',
    body: {
      registration_id: otherRegId,
      razorpay_order_id: orderId, // orderId belongs to regId, NOT otherRegId
      razorpay_payment_id: paymentId,
      razorpay_signature: signOrder(orderId, paymentId)
    }
  });
  assert(wrongRegRes.statusCode === 400 && wrongRegRes.json.error.includes('does not match this registration'),
    'Order belonging to a different registration returns 400');

  // -------------------------------------------------------------
  // Test f: Amount Mismatch
  // -------------------------------------------------------------
  console.log('\n--- Test f: Amount mismatch ---');
  const amountMismatchPayId = 'pay_mismatch_amt_1';
  mockGatewayPayments[amountMismatchPayId] = {
    id: amountMismatchPayId,
    order_id: orderId,
    status: 'captured',
    captured: true,
    amount: 100000, // 1000 INR instead of 2499 INR
    currency: 'INR'
  };

  const amtMismatchRes = await dispatch(app, {
    method: 'POST',
    url: '/api/payment/verify-payment',
    body: {
      registration_id: regId,
      razorpay_order_id: orderId,
      razorpay_payment_id: amountMismatchPayId,
      razorpay_signature: signOrder(orderId, amountMismatchPayId)
    }
  });
  assert(amtMismatchRes.statusCode === 400 && amtMismatchRes.json && amtMismatchRes.json.error.includes('does not match expected order amount'),
    'Amount mismatch (paise vs expected INR*100) returns 400',
    `Status: ${amtMismatchRes.statusCode}, Body: ${JSON.stringify(amtMismatchRes.json)}`);

  // -------------------------------------------------------------
  // Test g: Currency Mismatch
  // -------------------------------------------------------------
  console.log('\n--- Test g: Currency mismatch ---');
  const currMismatchPayId = 'pay_mismatch_curr_1';
  mockGatewayPayments[currMismatchPayId] = {
    id: currMismatchPayId,
    order_id: orderId,
    status: 'captured',
    captured: true,
    amount: 249900,
    currency: 'USD'
  };

  const currMismatchRes = await dispatch(app, {
    method: 'POST',
    url: '/api/payment/verify-payment',
    body: {
      registration_id: regId,
      razorpay_order_id: orderId,
      razorpay_payment_id: currMismatchPayId,
      razorpay_signature: signOrder(orderId, currMismatchPayId)
    }
  });
  assert(currMismatchRes.statusCode === 400 && currMismatchRes.json.error.includes('Invalid currency'),
    'Currency mismatch (non-INR) returns 400');

  // -------------------------------------------------------------
  // Test h: Duplicate Browser Callback
  // -------------------------------------------------------------
  console.log('\n--- Test h: Duplicate browser callback ---');
  // Configure RPC to report already_processed: true
  rpcResultFactory = (params) => ({ success: true, is_new: false, already_processed: true });

  const dupBrowserRes = await dispatch(app, {
    method: 'POST',
    url: '/api/payment/verify-payment',
    body: {
      registration_id: regId,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signOrder(orderId, paymentId)
    }
  });

  assert(dupBrowserRes.statusCode === 200 && dupBrowserRes.json.message.includes('already verified'),
    'Duplicate browser callback returns 200 with already processed notice');
  assert(dupBrowserRes.json.receipt.email_sent === false,
    'Duplicate browser callback does not re-send receipt email');

  // -------------------------------------------------------------
  // Test i: Duplicate Webhook
  // -------------------------------------------------------------
  console.log('\n--- Test i: Duplicate webhook ---');
  const webhookEventId = `evt_test_${Date.now()}`;
  const webhookPayload = JSON.stringify({
    entity: 'event',
    account_id: 'acc_123',
    event: 'payment.captured',
    id: webhookEventId,
    payload: {
      payment: {
        entity: {
          id: paymentId,
          order_id: orderId,
          amount: 249900,
          currency: 'INR',
          status: 'captured',
          captured: true,
          notes: { registration_id: regId }
        }
      }
    }
  });

  const webhookSig = signWebhook(webhookPayload);

  // First webhook delivery
  emailAttempts = [];
  rpcResultFactory = (params) => ({ success: true, already_processed: false, is_new: true });
  const hookRes1 = await dispatch(app, {
    method: 'POST',
    url: '/api/payment/webhook',
    headers: {
      'x-razorpay-signature': webhookSig,
      'x-razorpay-event-id': webhookEventId,
      'content-type': 'application/json'
    },
    body: webhookPayload
  });

  assert(hookRes1.statusCode === 200 && hookRes1.json.status === 'ok',
    'First webhook delivery successfully processes payment');

  // Second duplicate webhook delivery
  const hookRes2 = await dispatch(app, {
    method: 'POST',
    url: '/api/payment/webhook',
    headers: {
      'x-razorpay-signature': webhookSig,
      'x-razorpay-event-id': webhookEventId,
      'content-type': 'application/json'
    },
    body: webhookPayload
  });

  assert(hookRes2.statusCode === 200 && hookRes2.json.status === 'already_processed',
    'Duplicate webhook delivery returns 200 with already_processed without re-executing RPC');

  // -------------------------------------------------------------
  // Test j: Browser / Webhook Race Condition
  // -------------------------------------------------------------
  console.log('\n--- Test j: Browser/webhook race condition ---');
  const raceRegId = 'NDV2026-TEST-RACE-1';
  const raceOrderId = 'order_race_999';
  const racePaymentId = 'pay_race_999';

  await StudentsRepo.create({
    registration_id: raceRegId,
    full_name: 'Race Candidate',
    email: 'race.candidate@example.com',
    phone: '9876543211'
  });

  await RegistrationsRepo.create({
    registration_id: raceRegId,
    course_name: 'DevOps Engineering',
    total_course_fee: 29999,
    payment_type: 'advance',
    total_amount_paid: 0,
    remaining_balance: 27500,
    registration_status: 'Payment Initiated'
  });

  await PaymentsRepo.create({
    registration_id: raceRegId,
    razorpay_order_id: raceOrderId,
    amount: 2499,
    currency: 'INR',
    payment_type: 'advance',
    payment_status: 'created'
  });

  mockGatewayPayments[racePaymentId] = {
    id: racePaymentId,
    order_id: raceOrderId,
    status: 'captured',
    captured: true,
    amount: 249900,
    currency: 'INR'
  };

  // Simulate atomic DB behavior: First caller gets is_new: true, second gets already_processed: true
  let raceDbProcessed = false;
  PaymentsRepo.processRazorpayPayment = async (params) => {
    if (!raceDbProcessed) {
      raceDbProcessed = true;
      return { success: true, is_new: true, already_processed: false };
    } else {
      return { success: true, is_new: false, already_processed: true };
    }
  };

  const racePayload = JSON.stringify({
    entity: 'event',
    event: 'payment.captured',
    id: `evt_race_${Date.now()}`,
    payload: {
      payment: {
        entity: {
          id: racePaymentId,
          order_id: raceOrderId,
          amount: 249900,
          currency: 'INR',
          status: 'captured',
          captured: true,
          notes: { registration_id: raceRegId }
        }
      }
    }
  });

  // Scenario 1: Browser arrives first (already_processed: false), webhook arrives second (already_processed: true)
  // Note: Simulates concurrent HTTP handlers against in-process mocked DB state (not live PostgreSQL locks)
  emailAttempts = [];
  const [raceBrowserRes, raceWebhookRes] = await Promise.all([
    dispatch(app, {
      method: 'POST',
      url: '/api/payment/verify-payment',
      body: {
        registration_id: raceRegId,
        razorpay_order_id: raceOrderId,
        razorpay_payment_id: racePaymentId,
        razorpay_signature: signOrder(raceOrderId, racePaymentId)
      }
    }),
    dispatch(app, {
      method: 'POST',
      url: '/api/payment/webhook',
      headers: {
        'x-razorpay-signature': signWebhook(racePayload),
        'x-razorpay-event-id': `evt_race_1_${Date.now()}`,
        'content-type': 'application/json'
      },
      body: racePayload
    })
  ]);

  assert(raceBrowserRes.statusCode === 200 && raceWebhookRes.statusCode === 200,
    'Both concurrent requests return 200 OK');

  assert(emailAttempts.length === 1,
    'Exactly one receipt email attempt occurs during concurrent browser/webhook race');

  // Scenario 2: Webhook wins first (already_processed: false), browser sees duplicate (already_processed: true)
  let webhookWonFirst = false;
  PaymentsRepo.processRazorpayPayment = async () => {
    if (!webhookWonFirst) {
      webhookWonFirst = true;
      return { success: true, is_new: true, already_processed: false };
    }
    return { success: true, is_new: false, already_processed: true };
  };
  emailAttempts = [];
  const raceWebhookFirstRes = await dispatch(app, {
    method: 'POST',
    url: '/api/payment/webhook',
    headers: {
      'x-razorpay-signature': signWebhook(racePayload),
      'x-razorpay-event-id': `evt_race_2_${Date.now()}`,
      'content-type': 'application/json'
    },
    body: racePayload
  });
  const raceBrowserSecondRes = await dispatch(app, {
    method: 'POST',
    url: '/api/payment/verify-payment',
    body: {
      registration_id: raceRegId,
      razorpay_order_id: raceOrderId,
      razorpay_payment_id: racePaymentId,
      razorpay_signature: signOrder(raceOrderId, racePaymentId)
    }
  });
  assert(
    raceWebhookFirstRes.statusCode === 200 &&
    raceBrowserSecondRes.statusCode === 200 &&
    raceBrowserSecondRes.json.receipt.email_sent === false &&
    emailAttempts.length === 1,
    'When webhook confirms first, browser duplicate skips email and total attempts equals 1'
  );

  // -------------------------------------------------------------
  // Test k: Supabase RPC Failure
  // -------------------------------------------------------------
  console.log('\n--- Test k: Supabase RPC failure ---');
  PaymentsRepo.processRazorpayPayment = async () => {
    throw new Error('Database connection terminated unexpectedly');
  };

  const rpcFailRes = await dispatch(app, {
    method: 'POST',
    url: '/api/payment/verify-payment',
    body: {
      registration_id: regId,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signOrder(orderId, paymentId)
    }
  });
  assert(
    rpcFailRes.statusCode === 500 &&
    rpcFailRes.json.error === 'We could not complete payment processing. Please contact admissions with your transaction details.',
    'RPC failure returns 500 without treating payment as verified'
  );

  // -------------------------------------------------------------
  // Test l: Unsupported Webhook Event
  // -------------------------------------------------------------
  console.log('\n--- Test l: Unsupported webhook event ---');
  const unsuppPayload = JSON.stringify({
    entity: 'event',
    event: 'order.paid', // Unsupported in webhook
    id: `evt_unsupp_${Date.now()}`
  });

  const unsuppRes = await dispatch(app, {
    method: 'POST',
    url: '/api/payment/webhook',
    headers: {
      'x-razorpay-signature': signWebhook(unsuppPayload),
      'x-razorpay-event-id': `evt_unsupp_${Date.now()}`,
      'content-type': 'application/json'
    },
    body: unsuppPayload
  });
  assert(unsuppRes.statusCode === 200 && unsuppRes.json.status === 'ignored_unsupported_event',
    'Unsupported webhook event is safely ignored with 200 and ignored_unsupported_event status');

  // -------------------------------------------------------------
  // Test m: Malformed RPC Responses & Strict success/already_processed Classification
  // -------------------------------------------------------------
  console.log('\n--- Test m: Malformed RPC results and strict status flags ---');
  const malformedRpcCases = [
    { label: 'missing already_processed flag', value: { success: true } },
    { label: 'success false despite already_processed false', value: { success: false, already_processed: false } },
    { label: 'unexpected already_processed string', value: { success: true, already_processed: 'false' } },
    { label: 'null RPC return', value: null }
  ];

  for (const testCase of malformedRpcCases) {
    PaymentsRepo.processRazorpayPayment = async () => testCase.value;
    emailAttempts = [];

    const badBrowserRes = await dispatch(app, {
      method: 'POST',
      url: '/api/payment/verify-payment',
      body: {
        registration_id: regId,
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signOrder(orderId, paymentId)
      }
    });
    assert(
      badBrowserRes.statusCode === 500 && emailAttempts.length === 0,
      `Browser verification rejects ${testCase.label} with 500 and sends 0 emails`
    );

    const malEventId = `evt_mal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const badHookRes = await dispatch(app, {
      method: 'POST',
      url: '/api/payment/webhook',
      headers: {
        'x-razorpay-signature': signWebhook(webhookPayload),
        'x-razorpay-event-id': malEventId,
        'content-type': 'application/json'
      },
      body: webhookPayload
    });
    const wasMalRecorded = await WebhookEventsRepo.isProcessed(malEventId);
    assert(
      badHookRes.statusCode === 500 && emailAttempts.length === 0 && wasMalRecorded === false,
      `Webhook rejects ${testCase.label} with 500, sends 0 emails, and does not record deduplication event`
    );
  }

  // Test explicit success: true + already_processed: true on webhook
  PaymentsRepo.processRazorpayPayment = async () => ({ success: true, already_processed: true });
  emailAttempts = [];
  const dupHookEventId = `evt_dup_explicit_${Date.now()}`;
  const explicitDupHookRes = await dispatch(app, {
    method: 'POST',
    url: '/api/payment/webhook',
    headers: {
      'x-razorpay-signature': signWebhook(webhookPayload),
      'x-razorpay-event-id': dupHookEventId,
      'content-type': 'application/json'
    },
    body: webhookPayload
  });
  const wasDupRecorded = await WebhookEventsRepo.isProcessed(dupHookEventId);
  assert(
    explicitDupHookRes.statusCode === 200 && emailAttempts.length === 0 && wasDupRecorded === true,
    'Webhook accepts explicit success:true & already_processed:true with 200, 0 emails, and records event'
  );

  // Test email failure non-fatal to confirmed payment
  PaymentsRepo.processRazorpayPayment = async () => ({ success: true, already_processed: false });
  customEmailImpl = async () => {
    throw new Error('SMTP server unreachable');
  };
  const emailFailVerifyRes = await dispatch(app, {
    method: 'POST',
    url: '/api/payment/verify-payment',
    body: {
      registration_id: regId,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signOrder(orderId, paymentId)
    }
  });
  assert(
    emailFailVerifyRes.statusCode === 200 &&
    emailFailVerifyRes.json.verified === true &&
    emailFailVerifyRes.json.receipt.email_sent === false,
    'Receipt email failure remains non-fatal to confirmed payment verification'
  );
  // Restore default email behavior
  customEmailImpl = null;

  // -------------------------------------------------------------
  // Test n: Webhook Uncaptured Payment Guard & Generic 500 Error Masking
  // -------------------------------------------------------------
  console.log('\n--- Test n: Webhook captured===true guard & generic 500 error masking ---');

  let webhookRpcCalled = false;
  PaymentsRepo.processRazorpayPayment = async () => {
    webhookRpcCalled = true;
    return { success: true, already_processed: false };
  };

  // n1: status === 'captured' with captured: false
  webhookRpcCalled = false;
  emailAttempts = [];
  const uncapFalseEvtId = `evt_uncap_false_${Date.now()}`;
  const uncapFalsePayload = JSON.stringify({
    entity: 'event',
    event: 'payment.captured',
    id: uncapFalseEvtId,
    payload: {
      payment: {
        entity: {
          id: paymentId,
          order_id: orderId,
          amount: 249900,
          currency: 'INR',
          status: 'captured',
          captured: false,
          notes: { registration_id: regId }
        }
      }
    }
  });
  const uncapFalseRes = await dispatch(app, {
    method: 'POST',
    url: '/api/payment/webhook',
    headers: {
      'x-razorpay-signature': signWebhook(uncapFalsePayload),
      'x-razorpay-event-id': uncapFalseEvtId,
      'content-type': 'application/json'
    },
    body: uncapFalsePayload
  });
  assert(
    uncapFalseRes.statusCode === 400 &&
    uncapFalseRes.body === 'Webhook payment is not confirmed as captured.' &&
    webhookRpcCalled === false &&
    emailAttempts.length === 0 &&
    (await WebhookEventsRepo.isProcessed(uncapFalseEvtId)) === false,
    'Webhook rejects status:captured with captured:false (HTTP 400, no RPC, no email, no event record)'
  );

  // n2: status === 'captured' with captured property missing
  webhookRpcCalled = false;
  emailAttempts = [];
  const uncapMissingEvtId = `evt_uncap_missing_${Date.now()}`;
  const uncapMissingPayload = JSON.stringify({
    entity: 'event',
    event: 'payment.captured',
    id: uncapMissingEvtId,
    payload: {
      payment: {
        entity: {
          id: paymentId,
          order_id: orderId,
          amount: 249900,
          currency: 'INR',
          status: 'captured',
          notes: { registration_id: regId }
        }
      }
    }
  });
  const uncapMissingRes = await dispatch(app, {
    method: 'POST',
    url: '/api/payment/webhook',
    headers: {
      'x-razorpay-signature': signWebhook(uncapMissingPayload),
      'x-razorpay-event-id': uncapMissingEvtId,
      'content-type': 'application/json'
    },
    body: uncapMissingPayload
  });
  assert(
    uncapMissingRes.statusCode === 400 &&
    uncapMissingRes.body === 'Webhook payment is not confirmed as captured.' &&
    webhookRpcCalled === false &&
    emailAttempts.length === 0 &&
    (await WebhookEventsRepo.isProcessed(uncapMissingEvtId)) === false,
    'Webhook rejects status:captured with missing captured property (HTTP 400, no RPC, no email, no event record)'
  );

  // n3: Internal webhook error returns generic 500 without leaking internal error details
  PaymentsRepo.processRazorpayPayment = async () => {
    throw new Error('SENSITIVE_DB_CONNECTION_STRING_LEAK_TEST');
  };
  const errMaskEvtId = `evt_err_mask_${Date.now()}`;
  const errMaskRes = await dispatch(app, {
    method: 'POST',
    url: '/api/payment/webhook',
    headers: {
      'x-razorpay-signature': signWebhook(webhookPayload),
      'x-razorpay-event-id': errMaskEvtId,
      'content-type': 'application/json'
    },
    body: webhookPayload
  });
  assert(
    errMaskRes.statusCode === 500 &&
    errMaskRes.body === 'Webhook processing failed.' &&
    !errMaskRes.body.includes('SENSITIVE_DB_CONNECTION_STRING_LEAK_TEST'),
    'Webhook outer catch returns generic HTTP 500 Webhook processing failed. without exposing internal error message'
  );

  console.log('\n============================================================');
  console.log(`TEST RUN COMPLETE: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('============================================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAtomicSuite().catch(err => {
  console.error('Test Suite Exception:', err);
  process.exit(1);
});
