const assert = require('assert');
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'db.js');

async function runTests() {
  console.log('============================================================');
  console.log('🧪 TESTING PaymentsRepo.processRazorpayPayment()');
  console.log('============================================================');

  // Test 1: Unconfigured Supabase (Never mock payment success)
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete require.cache[require.resolve(dbPath)];
  const { PaymentsRepo } = require(dbPath);

  let unconfiguredThrew = false;
  try {
    await PaymentsRepo.processRazorpayPayment({
      order_id: 'order_123',
      payment_id: 'pay_123',
      registration_id: 'NDV2026-1001',
      amount: 2499
    });
  } catch (err) {
    unconfiguredThrew = true;
    assert(err.message.includes('Supabase client is not configured'), 'Error must explain Supabase client is not configured');
    assert(err.message.includes('cannot be simulated in local mock store'), 'Error must specify no simulation in mock store');
  }
  assert.strictEqual(unconfiguredThrew, true, 'Must reject unconfigured Supabase');
  console.log('✅ PASS 1: Throws descriptive error when Supabase client is unconfigured');

  // Test 2: Verify all 6 original PaymentsRepo methods exist and are functions
  const originalMethods = ['create', 'findByOrderId', 'findByPaymentId', 'findByRegId', 'update', 'findAll'];
  for (const m of originalMethods) {
    assert.strictEqual(typeof PaymentsRepo[m], 'function', `${m} must be a function`);
  }
  console.log('✅ PASS 2: All 6 original PaymentsRepo methods (create, findByOrderId, findByPaymentId, findByRegId, update, findAll) are intact');

  // Setup mock Supabase client for RPC & WebhookEventsRepo behavior tests
  let capturedRpcName = null;
  let capturedRpcParams = null;
  let mockRpcResponse = { data: null, error: null };
  let mockSelectResponse = { data: null, error: null };
  let mockInsertResponse = { error: null };

  const dbModule = require(dbPath);
  // Temporarily attach mock supabase client via dbModule or prototype
  // In db.js, let supabase = null is module-scoped, but we can test via module caching or proxy
  console.log('\n--- Mocked Supabase RPC Behavior Verification ---');

  // We can load db.js with mocked @supabase/supabase-js
  const Module = require('module');
  const originalRequire = Module.prototype.require;

  Module.prototype.require = function(request) {
    if (request === '@supabase/supabase-js') {
      return {
        createClient: () => ({
          rpc: async (name, params) => {
            capturedRpcName = name;
            capturedRpcParams = params;
            return mockRpcResponse;
          },
          from: () => ({
            select: () => ({
              eq: () => ({
                maybeSingle: async () => mockSelectResponse
              })
            }),
            insert: async () => mockInsertResponse
          })
        })
      };
    }
    return originalRequire.apply(this, arguments);
  };

  process.env.SUPABASE_URL = 'https://mock-test.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock_secret_key';
  delete require.cache[require.resolve(dbPath)];
  const mockedDb = require(dbPath);
  Module.prototype.require = originalRequire; // Restore

  // Test 3: Missing parameter validation
  let missingParamThrew = false;
  try {
    await mockedDb.PaymentsRepo.processRazorpayPayment({
      order_id: 'order_123'
      // missing payment_id & registration_id
    });
  } catch (err) {
    missingParamThrew = true;
    assert(err.message.includes('Missing required payment parameters'), 'Must validate required parameters');
  }
  assert.strictEqual(missingParamThrew, true);
  console.log('✅ PASS 3: Validates required parameters before RPC invocation');

  // Test 4: Invalid amount validation
  let invalidAmountThrew = false;
  try {
    await mockedDb.PaymentsRepo.processRazorpayPayment({
      order_id: 'order_123',
      payment_id: 'pay_123',
      registration_id: 'NDV2026-1001',
      amount: -50
    });
  } catch (err) {
    invalidAmountThrew = true;
    assert(err.message.includes('Invalid payment amount'), 'Must validate amount');
  }
  assert.strictEqual(invalidAmountThrew, true);
  console.log('✅ PASS 4: Validates positive payment amount');

  // Test 5: Verify exact RPC name and exact 6 argument names
  mockRpcResponse = {
    data: { success: true, payment_id: 'pay_abc', status: 'success' },
    error: null
  };

  const result = await mockedDb.PaymentsRepo.processRazorpayPayment({
    order_id: 'order_test_999',
    payment_id: 'pay_test_888',
    registration_id: 'NDV2026-1001',
    amount: 2499,
    currency: 'INR',
    signature: 'sig_crypto_hash'
  });

  assert.strictEqual(capturedRpcName, 'process_razorpay_payment', 'RPC name must be process_razorpay_payment');
  assert.deepStrictEqual(capturedRpcParams, {
    p_order_id: 'order_test_999',
    p_payment_id: 'pay_test_888',
    p_registration_id: 'NDV2026-1001',
    p_amount: 2499,
    p_currency: 'INR',
    p_signature: 'sig_crypto_hash'
  }, 'All 6 parameters must match exact names');
  assert.strictEqual(result.success, true);
  console.log('✅ PASS 5: Calls supabase.rpc("process_razorpay_payment") with exact 6 mapped arguments');

  // Test 6: Throws error when Supabase returns an error
  mockRpcResponse = {
    data: null,
    error: { message: 'Foreign key violation: registration not found' }
  };
  let rpcErrorThrew = false;
  try {
    await mockedDb.PaymentsRepo.processRazorpayPayment({
      order_id: 'order_test_999',
      payment_id: 'pay_test_888',
      registration_id: 'NDV2026-9999',
      amount: 2499
    });
  } catch (err) {
    rpcErrorThrew = true;
    assert(err.message.includes('Foreign key violation'), 'Must forward Supabase error message');
  }
  assert.strictEqual(rpcErrorThrew, true);
  console.log('✅ PASS 6: Throws descriptive error when Supabase RPC returns error');

  // Test 7: Throws error when RPC returns unsuccessful result
  mockRpcResponse = {
    data: { success: false, error: 'Registration balance already settled' },
    error: null
  };
  let rpcFailureThrew = false;
  try {
    await mockedDb.PaymentsRepo.processRazorpayPayment({
      order_id: 'order_test_999',
      payment_id: 'pay_test_888',
      registration_id: 'NDV2026-1001',
      amount: 2499
    });
  } catch (err) {
    rpcFailureThrew = true;
    assert(err.message.includes('Registration balance already settled'), 'Must report unsuccessful result');
  }
  assert.strictEqual(rpcFailureThrew, true);
  console.log('✅ PASS 7: Throws descriptive error when RPC returns unsuccessful result object');

  // Test 8: Rejects malformed RPC responses (missing success:true, boolean, empty array, string)
  const malformedPayloads = [
    { already_processed: false },
    { success: 'true', already_processed: false },
    true,
    [],
    'ok'
  ];
  for (const payload of malformedPayloads) {
    mockRpcResponse = { data: payload, error: null };
    let malformedThrew = false;
    try {
      await mockedDb.PaymentsRepo.processRazorpayPayment({
        order_id: 'order_test_999',
        payment_id: 'pay_test_888',
        registration_id: 'NDV2026-1001',
        amount: 2499
      });
    } catch (err) {
      malformedThrew = true;
    }
    assert.strictEqual(malformedThrew, true, `Must reject malformed RPC payload: ${JSON.stringify(payload)}`);
  }
  console.log('✅ PASS 8: Rejects malformed or non-success:true RPC responses');

  // Test 9: WebhookEventsRepo.isProcessed() throws on Supabase query error instead of returning false
  mockSelectResponse = { data: null, error: { message: 'Supabase connection timeout' } };
  let isProcessedThrew = false;
  try {
    await mockedDb.WebhookEventsRepo.isProcessed('evt_123');
  } catch (err) {
    isProcessedThrew = true;
    assert(err.message.includes('Supabase connection timeout'), 'Must throw with Supabase query error message');
  }
  assert.strictEqual(isProcessedThrew, true);
  console.log('✅ PASS 9: WebhookEventsRepo.isProcessed() throws on Supabase query error');

  // Test 10: WebhookEventsRepo.record() throws on Supabase insert error
  mockInsertResponse = { error: { message: 'Insert failed: read-only replica' } };
  let recordThrew = false;
  try {
    await mockedDb.WebhookEventsRepo.record('evt_123', 'payment.captured', {});
  } catch (err) {
    recordThrew = true;
    assert(err.message.includes('Insert failed: read-only replica'), 'Must throw on Supabase insert error');
  }
  assert.strictEqual(recordThrew, true);
  console.log('✅ PASS 10: WebhookEventsRepo.record() throws on Supabase insert error');

  // Test 11: WebhookEventsRepo.recordOrSkip() treats ONLY 23505 as duplicate and throws on other DB errors
  mockInsertResponse = { error: { code: '23505', message: 'duplicate key value violates unique constraint' } };
  const dupResult = await mockedDb.WebhookEventsRepo.recordOrSkip('evt_dup_1', 'payment.captured', {});
  assert.deepStrictEqual(dupResult, { alreadyProcessed: true }, 'Must return alreadyProcessed: true for SQLSTATE 23505');

  mockInsertResponse = { error: { code: '42501', message: 'permission denied for table webhook_events duplicate' } };
  let non23505Threw = false;
  try {
    await mockedDb.WebhookEventsRepo.recordOrSkip('evt_perm_err', 'payment.captured', {});
  } catch (err) {
    non23505Threw = true;
    assert(err.message.includes('permission denied'), 'Must throw on non-23505 errors');
  }
  assert.strictEqual(non23505Threw, true);
  console.log('✅ PASS 11: WebhookEventsRepo.recordOrSkip() returns alreadyProcessed:true ONLY for 23505 and throws otherwise');

  // Test 12: Preserves WebhookEventsRepo dev mock behavior when Supabase is unconfigured
  const devIsProc1 = await dbModule.WebhookEventsRepo.isProcessed('evt_dev_mock_1');
  assert.strictEqual(devIsProc1, false);
  await dbModule.WebhookEventsRepo.record('evt_dev_mock_1', 'payment.captured', {});
  const devIsProc2 = await dbModule.WebhookEventsRepo.isProcessed('evt_dev_mock_1');
  assert.strictEqual(devIsProc2, true);
  const devSkip1 = await dbModule.WebhookEventsRepo.recordOrSkip('evt_dev_mock_2', 'payment.captured', {});
  assert.deepStrictEqual(devSkip1, { alreadyProcessed: false });
  const devSkip2 = await dbModule.WebhookEventsRepo.recordOrSkip('evt_dev_mock_2', 'payment.captured', {});
  assert.deepStrictEqual(devSkip2, { alreadyProcessed: true });
  console.log('✅ PASS 12: WebhookEventsRepo dev mock store behavior is preserved');

  console.log('\n============================================================');
  console.log('🎉 ALL 12 UNIT, RPC & WEBHOOK REPO TESTS PASSED (0 FAILURES)');
  console.log('============================================================');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
