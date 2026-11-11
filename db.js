/**
 * ============================================================================
 * NEXTGEN DMA VENTURES - AUTHORITATIVE SUPABASE CLOUD REPOSITORY LAYER
 * ============================================================================
 * Production Cloud Persistence:
 * - Direct queries to Supabase PostgreSQL (Never writes to /tmp in production)
 * - Atomic PostgreSQL sequence for Registration IDs (Never uses record counts)
 * - Persistent serverless rate limiting via `login_attempts`
 * - Persistent webhook idempotency via `webhook_events`
 * - Production-ready transaction & concurrency protection
 */

const crypto = require('crypto');

// Environment & Production Detection
const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL) || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

// Supabase Credentials from Environment
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const SUPABASE_KEY =
  SUPABASE_SERVICE_ROLE_KEY ||
  (!isProduction ? process.env.SUPABASE_ANON_KEY || '' : '');

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    console.log('[Supabase] Initialized SDK client for:', SUPABASE_URL);
  } catch (err) {
    console.error('[Supabase] Failed to initialize Supabase client:', err.message);
  }
} else if (isProduction) {
  console.error('[Supabase] CRITICAL: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured in production!');
}

/**
 * Asserts Supabase is active in production.
 */
function assertSupabaseActive(operationName) {
  if (!supabase) {
    if (isProduction) {
      throw new Error(`Database service unavailable: Supabase client is not configured for production (${operationName}). Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.`);
    }
    return false;
  }
  return true;
}

// Development In-Memory Store (USED ONLY IN LOCAL DEV WHEN SUPABASE KEYS ARE OMITTED)
const devMockStore = {
  counters: { registrationSequence: 1000 },
  students: [],
  courses: [],
  registrations: [],
  payments: [],
  email_logs: [],
  admin_users: [],
  login_attempts: new Map(),
  webhook_events: new Set()
};

// ============================================================================
// 47 AUTHORITATIVE NEXTGEN DMA VENTURES COURSES (Authoritative Catalog)
// ============================================================================
const OFFICIAL_COURSES = [
  // 1. Artificial Intelligence & Data Technologies
  { id: "ai-001", course_name: "Artificial Intelligence", category: "Artificial Intelligence & Data Technologies", duration: 28, duration_text: "28 Weeks", total_fee: 34999 },
  { id: "ai-002", course_name: "Data Science & Analytics", category: "Artificial Intelligence & Data Technologies", duration: 28, duration_text: "28 Weeks", total_fee: 34999 },
  { id: "ai-003", course_name: "Python for Artificial Intelligence", category: "Artificial Intelligence & Data Technologies", duration: 26, duration_text: "26 Weeks", total_fee: 32999 },
  { id: "ai-004", course_name: "Deep Learning Foundations", category: "Artificial Intelligence & Data Technologies", duration: 24, duration_text: "24 Weeks", total_fee: 24999 },
  { id: "ai-005", course_name: "Machine Learning & AI", category: "Artificial Intelligence & Data Technologies", duration: 20, duration_text: "20 Weeks", total_fee: 22999 },

  // 2. Software Development
  { id: "sd-001", course_name: "Full Stack Web Development", category: "Software Development", duration: 28, duration_text: "28 Weeks", total_fee: 29999 },
  { id: "sd-002", course_name: "Backend Web Development", category: "Software Development", duration: 28, duration_text: "28 Weeks", total_fee: 29999 },
  { id: "sd-003", course_name: "Java Full Stack Development", category: "Software Development", duration: 28, duration_text: "28 Weeks", total_fee: 32999 },
  { id: "sd-004", course_name: "Frontend Web Development", category: "Software Development", duration: 26, duration_text: "26 Weeks", total_fee: 29999 },
  { id: "sd-005", course_name: "Mobile App Development", category: "Software Development", duration: 24, duration_text: "24 Weeks", total_fee: 24999 },
  { id: "sd-006", course_name: "Software Testing & Automation", category: "Software Development", duration: 26, duration_text: "26 Weeks", total_fee: 29999 },

  // 3. Security & Infrastructure
  { id: "si-001", course_name: "Cybersecurity & Ethical Hacking", category: "Security & Infrastructure", duration: 26, duration_text: "26 Weeks", total_fee: 29999 },
  { id: "si-002", course_name: "Cloud Computing & DevOps", category: "Security & Infrastructure", duration: 26, duration_text: "26 Weeks", total_fee: 29999 },
  { id: "si-003", course_name: "DevOps Engineering", category: "Security & Infrastructure", duration: 26, duration_text: "26 Weeks", total_fee: 29999 },

  // 4. Design & Quality
  { id: "dq-001", course_name: "UI/UX Design", category: "Design & Quality", duration: 20, duration_text: "20 Weeks", total_fee: 19999 },
  { id: "dq-002", course_name: "Software Quality Assurance", category: "Design & Quality", duration: 20, duration_text: "20 Weeks", total_fee: 18999 },
  { id: "dq-003", course_name: "Product Design", category: "Design & Quality", duration: 24, duration_text: "24 Weeks", total_fee: 23999 },

  // 5. Mechanical Engineering
  { id: "me-001", course_name: "Mechanical CAD Modeling", category: "Mechanical Engineering", duration: 28, duration_text: "28 Weeks", total_fee: 26499 },
  { id: "me-002", course_name: "Finite Element Analysis (FEA)", category: "Mechanical Engineering", duration: 28, duration_text: "28 Weeks", total_fee: 28799 },
  { id: "me-003", course_name: "Computational Fluid Dynamics (CFD)", category: "Mechanical Engineering", duration: 24, duration_text: "24 Weeks", total_fee: 24999 },
  { id: "me-004", course_name: "Thermal Systems Design", category: "Mechanical Engineering", duration: 24, duration_text: "24 Weeks", total_fee: 24999 },
  { id: "me-005", course_name: "Product Lifecycle Management (PLM)", category: "Mechanical Engineering", duration: 30, duration_text: "30 Weeks", total_fee: 29999 },
  { id: "me-006", course_name: "CNC Programming & Machining", category: "Mechanical Engineering", duration: 22, duration_text: "22 Weeks", total_fee: 22499 },
  { id: "me-007", course_name: "Robotics & Automation in Manufacturing", category: "Mechanical Engineering", duration: 24, duration_text: "24 Weeks", total_fee: 22999 },
  { id: "me-008", course_name: "Industrial Piping Design", category: "Mechanical Engineering", duration: 30, duration_text: "30 Weeks", total_fee: 29999 },
  { id: "me-009", course_name: "Mechanical System Simulation", category: "Mechanical Engineering", duration: 28, duration_text: "28 Weeks", total_fee: 28499 },
  { id: "me-010", course_name: "Quality Control & Metrology", category: "Mechanical Engineering", duration: 22, duration_text: "22 Weeks", total_fee: 19999 },

  // 6. Automobile Engineering
  { id: "ae-001", course_name: "Electric Vehicle (EV) Technology", category: "Automobile Engineering", duration: 28, duration_text: "28 Weeks", total_fee: 27999 },
  { id: "ae-002", course_name: "Automotive Design Using CATIA", category: "Automobile Engineering", duration: 28, duration_text: "28 Weeks", total_fee: 27999 },
  { id: "ae-003-30w", course_name: "Automotive CAD Using SolidWorks (30 Weeks)", category: "Automobile Engineering", duration: 30, duration_text: "30 Weeks", total_fee: 32999 },
  { id: "ae-004-28w", course_name: "Automotive CAD Using SolidWorks (28 Weeks)", category: "Automobile Engineering", duration: 28, duration_text: "28 Weeks", total_fee: 27999 },
  { id: "ae-005", course_name: "Vehicle Dynamics & Chassis Design", category: "Automobile Engineering", duration: 28, duration_text: "28 Weeks", total_fee: 27999 },
  { id: "ae-006", course_name: "Automotive Powertrain Engineering", category: "Automobile Engineering", duration: 24, duration_text: "24 Weeks", total_fee: 22999 },
  { id: "ae-007", course_name: "Battery Management Systems (BMS)", category: "Automobile Engineering", duration: 30, duration_text: "30 Weeks", total_fee: 29999 },
  { id: "ae-008", course_name: "ADAS & Autonomous Vehicle Tech", category: "Automobile Engineering", duration: 24, duration_text: "24 Weeks", total_fee: 22999 },
  { id: "ae-009", course_name: "Hybrid Vehicle Engineering", category: "Automobile Engineering", duration: 30, duration_text: "30 Weeks", total_fee: 29999 },
  { id: "ae-010", course_name: "Automotive Crashworthiness & Safety Analysis", category: "Automobile Engineering", duration: 32, duration_text: "32 Weeks", total_fee: 32999 },

  // 7. Advanced Technology
  { id: "at-001", course_name: "Artificial Intelligence in Automotive Systems", category: "Advanced Technology", duration: 36, duration_text: "36 Weeks", total_fee: 37999 },
  { id: "at-002", course_name: "Autonomous Driving Simulation", category: "Advanced Technology", duration: 36, duration_text: "36 Weeks", total_fee: 37999 },
  { id: "at-003", course_name: "Digital Twin Technology for Manufacturing", category: "Advanced Technology", duration: 32, duration_text: "32 Weeks", total_fee: 34999 },
  { id: "at-004", course_name: "IoT & Telematics in Automotive", category: "Advanced Technology", duration: 30, duration_text: "30 Weeks", total_fee: 31999 },
  { id: "at-005", course_name: "3D Printing & Additive Manufacturing", category: "Advanced Technology", duration: 28, duration_text: "28 Weeks", total_fee: 31999 },
  { id: "at-006", course_name: "AR/VR in Industrial Engineering", category: "Advanced Technology", duration: 28, duration_text: "28 Weeks", total_fee: 27999 },
  { id: "at-007", course_name: "Embedded Automotive Systems", category: "Advanced Technology", duration: 32, duration_text: "32 Weeks", total_fee: 31999 },
  { id: "at-008", course_name: "Smart Factory & Industrial IoT", category: "Advanced Technology", duration: 32, duration_text: "32 Weeks", total_fee: 34999 }
];

/**
 * Concurrency-Safe Sequential Registration ID Generation:
 * Exclusively invokes PostgreSQL stored function `get_next_registration_id()`.
 * Never uses record counts.
 */
async function generateRegistrationId() {
  if (assertSupabaseActive('generateRegistrationId')) {
    try {
      const { data, error } = await supabase.rpc('get_next_registration_id');
      if (!error && data) {
        return data;
      }
      if (error) {
        throw new Error(error.message);
      }
    } catch (rpcErr) {
      if (isProduction) {
        throw new Error('Database sequence error: Failed to generate atomic registration ID: ' + rpcErr.message);
      }
    }
  }

  // Development Fallback
  devMockStore.counters.registrationSequence += 1;
  return `NDV2026-${devMockStore.counters.registrationSequence}`;
}

/**
 * Seed Courses and Initial Administrator Safely
 */
async function seedInitialData(adminEmail, adminPasswordHash) {
  if (supabase) {
    try {
      // 1. Seed authoritative courses
      await supabase.from('courses').upsert(OFFICIAL_COURSES, { onConflict: 'id' });

      // 2. Safe initial administrator bootstrap (One-time only: never overwrites existing)
      if (adminEmail && adminPasswordHash) {
        const cleanEmail = adminEmail.toLowerCase().trim();
        const { data: existing } = await supabase.from('admin_users').select('id').eq('email', cleanEmail).maybeSingle();
        if (!existing) {
          const { count } = await supabase.from('admin_users').select('*', { count: 'exact', head: true });
          if (count === 0) {
            await supabase.from('admin_users').insert([
              {
                id: 'admin-master-001',
                email: cleanEmail,
                password_hash: adminPasswordHash,
                role: 'superadmin',
                name: 'Master Administrator'
              }
            ]);
            console.log('[Supabase Seed] Bootstrapped initial administrative account for:', cleanEmail);
          }
        }
      }
    } catch (err) {
      console.warn('[Supabase Seed Notice]', err.message);
    }
  } else {
    OFFICIAL_COURSES.forEach(c => {
      if (!devMockStore.courses.find(x => x.id === c.id)) {
        devMockStore.courses.push({ ...c, status: 'active' });
      }
    });
    if (adminEmail && adminPasswordHash && devMockStore.admin_users.length === 0) {
      devMockStore.admin_users.push({
        id: 'admin-master-001',
        email: adminEmail.toLowerCase().trim(),
        password_hash: adminPasswordHash,
        role: 'superadmin',
        name: 'Master Administrator'
      });
    }
  }
}

// ============================================================================
// PERSISTENT SERVERLESS RATE LIMITING REPOSITORY (Supabase Cloud)
// ============================================================================
const RateLimiterRepo = {
  async checkLimit(ip) {
    const now = new Date();
    if (assertSupabaseActive('RateLimiterRepo.checkLimit')) {
      const { data, error } = await supabase.from('login_attempts').select('*').eq('ip', ip).maybeSingle();
      if (error) {
        console.warn('[RateLimiter Supabase Error]', error.message);
        return { allowed: true };
      }

      if (!data) return { allowed: true };

      // 1. Check if currently locked
      if (data.locked_until && new Date(data.locked_until) > now) {
        const remainingMinutes = Math.ceil((new Date(data.locked_until) - now) / (60 * 1000));
        return { allowed: false, remainingMinutes };
      }

      // 2. Check if window has expired (15 mins)
      const firstAttempt = new Date(data.first_attempt);
      if (now - firstAttempt > 15 * 60 * 1000) {
        // Reset expired window
        await supabase.from('login_attempts').delete().eq('ip', ip);
        return { allowed: true };
      }

      // 3. Check attempt count threshold
      if (data.attempt_count >= 8) {
        const lockUntil = new Date(now.getTime() + 15 * 60 * 1000).toISOString();
        await supabase.from('login_attempts').update({ locked_until: lockUntil }).eq('ip', ip);
        return { allowed: false, remainingMinutes: 15 };
      }

      return { allowed: true, count: data.attempt_count };
    }

    // Dev fallback
    const mem = devMockStore.login_attempts.get(ip) || { count: 0, first: Date.now() };
    if (mem.locked && mem.locked > Date.now()) {
      return { allowed: false, remainingMinutes: Math.ceil((mem.locked - Date.now()) / 60000) };
    }
    return { allowed: true };
  },

  async recordFailedAttempt(ip) {
    const now = new Date();
    if (assertSupabaseActive('RateLimiterRepo.recordFailedAttempt')) {
      const { data } = await supabase.from('login_attempts').select('*').eq('ip', ip).maybeSingle();
      if (!data) {
        await supabase.from('login_attempts').insert([
          {
            ip,
            attempt_count: 1,
            first_attempt: now.toISOString(),
            last_attempt: now.toISOString()
          }
        ]);
      } else {
        const newCount = (data.attempt_count || 0) + 1;
        const updates = {
          attempt_count: newCount,
          last_attempt: now.toISOString()
        };
        if (newCount >= 8) {
          updates.locked_until = new Date(now.getTime() + 15 * 60 * 1000).toISOString();
        }
        await supabase.from('login_attempts').update(updates).eq('ip', ip);
      }
      return;
    }

    const mem = devMockStore.login_attempts.get(ip) || { count: 0, first: Date.now() };
    mem.count++;
    if (mem.count >= 8) mem.locked = Date.now() + 15 * 60 * 1000;
    devMockStore.login_attempts.set(ip, mem);
  },

  async reset(ip) {
    if (assertSupabaseActive('RateLimiterRepo.reset')) {
      await supabase.from('login_attempts').delete().eq('ip', ip);
      return;
    }
    devMockStore.login_attempts.delete(ip);
  }
};

// ============================================================================
// PERSISTENT WEBHOOK IDEMPOTENCY REPOSITORY (Supabase Cloud)
// ============================================================================
const WebhookEventsRepo = {
  async isProcessed(eventId) {
    if (assertSupabaseActive('WebhookEventsRepo.isProcessed')) {
      const { data, error } = await supabase.from('webhook_events').select('event_id').eq('event_id', eventId).maybeSingle();
      if (error) {
        throw new Error(`Database error checking webhook event status: ${error.message}`);
      }
      return Boolean(data);
    }
    return devMockStore.webhook_events.has(eventId);
  },

  async record(eventId, eventType, payload) {
    if (assertSupabaseActive('WebhookEventsRepo.record')) {
      const { error } = await supabase.from('webhook_events').insert([
        {
          event_id: eventId,
          event_type: eventType,
          payload: typeof payload === 'object' ? payload : { raw: payload }
        }
      ]);
      if (error) {
        throw new Error(`Database error recording webhook event: ${error.message}`);
      }
      return;
    }
    devMockStore.webhook_events.add(eventId);
  },

  /**
   * Atomic Insert-First Idempotency Check:
   * Leverages PostgreSQL PRIMARY KEY constraint on `event_id`.
   * Rejects simultaneous duplicate webhook deliveries at the database transaction layer.
   */
  async recordOrSkip(eventId, eventType, payload) {
    if (assertSupabaseActive('WebhookEventsRepo.recordOrSkip')) {
      const { error } = await supabase.from('webhook_events').insert([
        {
          event_id: eventId,
          event_type: eventType,
          payload: typeof payload === 'object' ? payload : { raw: payload }
        }
      ]);

      if (error) {
        // Code 23505 is PostgreSQL unique_violation
        if (error.code === '23505') {
          return { alreadyProcessed: true };
        }
        throw new Error(`Database error recording webhook event: ${error.message}`);
      }
      return { alreadyProcessed: false };
    }

    if (devMockStore.webhook_events.has(eventId)) {
      return { alreadyProcessed: true };
    }
    devMockStore.webhook_events.add(eventId);
    return { alreadyProcessed: false };
  }
};

// ============================================================================
// REPOSITORIES — TRUE CLOUD PERSISTENCE VIA SUPABASE
// ============================================================================

const StudentsRepo = {
  async create(data) {
    const id = `stu_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const student = {
      id,
      registration_id: data.registration_id,
      full_name: data.full_name.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone.trim(),
      whatsapp: (data.whatsapp || data.phone).trim(),
      college: (data.college || '').trim(),
      department: (data.department || '').trim(),
      year_of_study: (data.year_of_study || '').trim(),
      state: (data.state || '').trim(),
      created_at: new Date().toISOString()
    };

    if (assertSupabaseActive('StudentsRepo.create')) {
      const { data: inserted, error } = await supabase.from('students').insert([student]).select().single();
      if (error) {
        throw new Error(`Database error saving student record: ${error.message}`);
      }
      return inserted;
    }

    devMockStore.students.push(student);
    return student;
  },

  async findByRegId(regId) {
    if (assertSupabaseActive('StudentsRepo.findByRegId')) {
      const { data, error } = await supabase.from('students').select('*').eq('registration_id', regId).maybeSingle();
      if (error) throw new Error(`Database error finding student: ${error.message}`);
      return data || null;
    }
    return devMockStore.students.find(s => s.registration_id === regId) || null;
  },

  async findByEmail(email) {
    const clean = email.toLowerCase().trim();
    if (assertSupabaseActive('StudentsRepo.findByEmail')) {
      const { data, error } = await supabase.from('students').select('*').eq('email', clean).order('created_at', { ascending: false });
      if (error) throw new Error(`Database error finding student by email: ${error.message}`);
      return data || [];
    }
    return devMockStore.students.filter(s => s.email === clean);
  },

  async findAll() {
    if (assertSupabaseActive('StudentsRepo.findAll')) {
      const { data, error } = await supabase.from('students').select('*');
      if (error) throw new Error(`Database error fetching all students: ${error.message}`);
      return data || [];
    }
    return devMockStore.students;
  }
};

const CoursesRepo = {
  async findAll() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('courses').select('*').eq('status', 'active');
        if (!error && data && data.length > 0) return data;
      } catch (e) { }
    }
    return OFFICIAL_COURSES;
  },

  async findById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('courses').select('*').eq('id', id).maybeSingle();
        if (!error && data) return data;
      } catch (e) { }
    }
    return OFFICIAL_COURSES.find(c => c.id === id) || null;
  },

  async findByName(name) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('courses').select('*').ilike('course_name', name.trim()).maybeSingle();
        if (!error && data) return data;
      } catch (e) { }
    }
    const clean = name.toLowerCase().trim();
    return OFFICIAL_COURSES.find(c => c.course_name.toLowerCase().trim() === clean || c.id === name) || null;
  }
};

const RegistrationsRepo = {
  async create(data) {
    const id = `reg_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const registration = {
      id,
      registration_id: data.registration_id,
      student_id: data.student_id,
      course_id: data.course_id,
      course_name: data.course_name,
      course_category: data.course_category,
      course_duration: data.course_duration,
      total_course_fee: Number(data.total_course_fee),
      payment_type: data.payment_type, // 'advance' | 'full'
      total_amount_paid: Number(data.total_amount_paid || 0),
      remaining_balance: Number(data.remaining_balance),
      registration_status: data.registration_status || 'Payment Initiated',
      notes: data.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (assertSupabaseActive('RegistrationsRepo.create')) {
      const { data: inserted, error } = await supabase.from('registrations').insert([registration]).select().single();
      if (error) {
        throw new Error(`Database error creating registration record: ${error.message}`);
      }
      return inserted;
    }

    devMockStore.registrations.push(registration);
    return registration;
  },

  async findByRegId(regId) {
    if (assertSupabaseActive('RegistrationsRepo.findByRegId')) {
      const { data, error } = await supabase.from('registrations').select('*').eq('registration_id', regId).maybeSingle();
      if (error) throw new Error(`Database error finding registration: ${error.message}`);
      return data || null;
    }
    return devMockStore.registrations.find(r => r.registration_id === regId) || null;
  },

  async update(regId, updates) {
    const payload = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (assertSupabaseActive('RegistrationsRepo.update')) {
      const { data, error } = await supabase.from('registrations').update(payload).eq('registration_id', regId).select().maybeSingle();
      if (error) throw new Error(`Database error updating registration: ${error.message}`);
      return data;
    }

    const idx = devMockStore.registrations.findIndex(r => r.registration_id === regId);
    if (idx !== -1) {
      devMockStore.registrations[idx] = { ...devMockStore.registrations[idx], ...payload };
      return devMockStore.registrations[idx];
    }
    return null;
  },

  async findAll() {
    if (assertSupabaseActive('RegistrationsRepo.findAll')) {
      const { data, error } = await supabase.from('registrations').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(`Database error listing registrations: ${error.message}`);
      return data || [];
    }
    return [...devMockStore.registrations].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getDetailed(regId) {
    const reg = await this.findByRegId(regId);
    if (!reg) return null;

    const student = await StudentsRepo.findByRegId(regId);
    const payments = await PaymentsRepo.findByRegId(regId);
    const emailLogs = await EmailLogsRepo.findByRegId(regId);

    return {
      ...reg,
      student: student || {},
      payments: payments || [],
      email_logs: emailLogs || []
    };
  },

  async getStats() {
    const regs = await this.findAll();
    const payments = await PaymentsRepo.findAll();
    const successPayments = payments.filter(p => p.payment_status === 'success');

    let totalRevenue = 0;
    let advancePaidCount = 0;
    let fullyPaidCount = 0;
    let balancePendingCount = 0;
    let failedCount = 0;
    let totalPendingBalance = 0;

    const todayStr = new Date().toISOString().split('T')[0];
    let todayCount = 0;

    regs.forEach(r => {
      if (r.created_at && r.created_at.startsWith(todayStr)) {
        todayCount++;
      }

      if (r.registration_status === 'Advance Paid') {
        advancePaidCount++;
        totalPendingBalance += Number(r.remaining_balance || 0);
      } else if (r.registration_status === 'Balance Pending') {
        balancePendingCount++;
        totalPendingBalance += Number(r.remaining_balance || 0);
      } else if (r.registration_status === 'Fully Paid') {
        fullyPaidCount++;
      } else if (r.registration_status === 'Payment Failed') {
        failedCount++;
      }
    });

    successPayments.forEach(p => {
      totalRevenue += Number(p.amount || 0);
    });

    return {
      totalRegistrations: regs.length,
      advancePayments: advancePaidCount,
      balancePendingPayments: balancePendingCount,
      fullPayments: fullyPaidCount,
      totalRevenueCollected: totalRevenue,
      pendingBalances: totalPendingBalance,
      failedPayments: failedCount,
      todayRegistrations: todayCount
    };
  }
};

const PaymentsRepo = {
  async processRazorpayPayment(arg1, arg2, arg3, arg4, arg5, arg6) {
    if (!supabase) {
      throw new Error('Database service unavailable: Supabase client is not configured. Atomic Razorpay payment processing requires an active database connection and cannot be simulated in local mock store.');
    }

    let p_order_id;
    let p_payment_id;
    let p_registration_id;
    let p_amount;
    let p_currency;
    let p_signature;

    if (typeof arg1 === 'object' && arg1 !== null) {
      p_order_id = arg1.p_order_id || arg1.order_id || arg1.razorpay_order_id || arg1.orderId;
      p_payment_id = arg1.p_payment_id || arg1.payment_id || arg1.razorpay_payment_id || arg1.paymentId;
      p_registration_id = arg1.p_registration_id || arg1.registration_id || arg1.regId || arg1.registrationId;
      p_amount = Number(arg1.p_amount !== undefined ? arg1.p_amount : arg1.amount);
      p_currency = arg1.p_currency || arg1.currency || 'INR';
      p_signature = arg1.p_signature || arg1.signature || arg1.razorpay_signature || null;
    } else {
      p_order_id = arg1;
      p_payment_id = arg2;
      p_registration_id = arg3;
      p_amount = Number(arg4);
      p_currency = arg5 || 'INR';
      p_signature = arg6 || null;
    }

    if (!p_order_id || !p_payment_id || !p_registration_id) {
      throw new Error('Missing required payment parameters: order_id, payment_id, and registration_id are mandatory.');
    }

    if (isNaN(p_amount) || p_amount <= 0) {
      throw new Error('Invalid payment amount: amount must be a positive number.');
    }

    const { data, error } = await supabase.rpc('process_razorpay_payment', {
      p_order_id,
      p_payment_id,
      p_registration_id,
      p_amount,
      p_currency,
      p_signature
    });

    if (error) {
      throw new Error(`Database error processing Razorpay payment: ${error.message}`);
    }

    if (!data) {
      throw new Error('Database error processing Razorpay payment: No data returned from payment processing function.');
    }

    if (typeof data === 'boolean' && !data) {
      throw new Error('Payment processing failed: Database function returned false.');
    }

    const resultObj = Array.isArray(data) ? data[0] : data;
    if (!resultObj || typeof resultObj !== 'object' || Array.isArray(resultObj)) {
      throw new Error('Payment processing failed: Malformed or unexpected response returned from payment processing function.');
    }

    if (resultObj.error) {
      throw new Error(`Payment processing failed: ${resultObj.error}`);
    }

    if (resultObj.success !== true) {
      throw new Error(`Payment processing failed: ${resultObj.message || 'Database function did not return explicit success: true.'}`);
    }

    if (resultObj.payment_status === 'failed' || resultObj.status === 'failed') {
      throw new Error('Payment processing failed: Payment record status is failed.');
    }

    return resultObj;
  },

  async create(data) {
    const id = `pay_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const payment = {
      id,
      registration_id: data.registration_id,
      razorpay_order_id: data.razorpay_order_id,
      razorpay_payment_id: data.razorpay_payment_id || null,
      razorpay_signature: data.razorpay_signature || null,
      amount: Number(data.amount),
      currency: data.currency || 'INR',
      payment_type: data.payment_type, // 'advance' | 'full' | 'balance' | 'subsequent'
      payment_status: data.payment_status || 'created',
      payment_method: data.payment_method || 'Razorpay',
      verified_at: data.verified_at || null,
      created_at: new Date().toISOString()
    };

    if (assertSupabaseActive('PaymentsRepo.create')) {
      const { data: inserted, error } = await supabase.from('payments').insert([payment]).select().single();
      if (error) {
        throw new Error(`Database error recording payment: ${error.message}`);
      }
      return inserted;
    }

    devMockStore.payments.push(payment);
    return payment;
  },

  async findByOrderId(orderId) {
    if (assertSupabaseActive('PaymentsRepo.findByOrderId')) {
      const { data, error } = await supabase.from('payments').select('*').eq('razorpay_order_id', orderId).maybeSingle();
      if (error) throw new Error(`Database error finding order ID: ${error.message}`);
      return data || null;
    }
    return devMockStore.payments.find(p => p.razorpay_order_id === orderId) || null;
  },

  async findByPaymentId(paymentId) {
    if (assertSupabaseActive('PaymentsRepo.findByPaymentId')) {
      const { data, error } = await supabase.from('payments').select('*').eq('razorpay_payment_id', paymentId).maybeSingle();
      if (error) throw new Error(`Database error finding payment ID: ${error.message}`);
      return data || null;
    }
    return devMockStore.payments.find(p => p.razorpay_payment_id === paymentId) || null;
  },

  async findByRegId(regId) {
    if (assertSupabaseActive('PaymentsRepo.findByRegId')) {
      const { data, error } = await supabase.from('payments').select('*').eq('registration_id', regId).order('created_at', { ascending: false });
      if (error) throw new Error(`Database error finding payments for registration: ${error.message}`);
      return data || [];
    }
    return devMockStore.payments.filter(p => p.registration_id === regId);
  },

  async update(id, updates) {
    if (assertSupabaseActive('PaymentsRepo.update')) {
      const { data, error } = await supabase.from('payments').update(updates).eq('id', id).select().maybeSingle();
      if (error) throw new Error(`Database error updating payment: ${error.message}`);
      return data;
    }

    const idx = devMockStore.payments.findIndex(p => p.id === id);
    if (idx !== -1) {
      devMockStore.payments[idx] = { ...devMockStore.payments[idx], ...updates };
      return devMockStore.payments[idx];
    }
    return null;
  },

  async findAll() {
    if (assertSupabaseActive('PaymentsRepo.findAll')) {
      const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(`Database error fetching payments: ${error.message}`);
      return data || [];
    }
    return [...devMockStore.payments].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
};

const EmailLogsRepo = {
  async create(data) {
    const id = `email_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const log = {
      id,
      registration_id: data.registration_id,
      email: data.email,
      email_type: data.email_type || 'payment_receipt',
      subject: data.subject,
      delivery_status: data.delivery_status,
      error_message: data.error_message || null,
      sent_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase.from('email_logs').insert([log]);
      } catch (err) {
        console.warn('[EmailLogsRepo.create warning]', err.message);
      }
    } else {
      devMockStore.email_logs.push(log);
    }
    return log;
  },

  async findByRegId(regId) {
    if (assertSupabaseActive('EmailLogsRepo.findByRegId')) {
      const { data, error } = await supabase.from('email_logs').select('*').eq('registration_id', regId).order('sent_at', { ascending: false });
      if (error) throw new Error(`Database error fetching email logs: ${error.message}`);
      return data || [];
    }
    return devMockStore.email_logs.filter(e => e.registration_id === regId);
  },

  async findAll() {
    if (assertSupabaseActive('EmailLogsRepo.findAll')) {
      const { data, error } = await supabase.from('email_logs').select('*').order('sent_at', { ascending: false });
      if (error) throw new Error(`Database error fetching all email logs: ${error.message}`);
      return data || [];
    }
    return [...devMockStore.email_logs].sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
  }
};

const AdminUsersRepo = {
  async findByEmail(email) {
    const clean = email.toLowerCase().trim();
    if (assertSupabaseActive('AdminUsersRepo.findByEmail')) {
      const { data, error } = await supabase.from('admin_users').select('*').eq('email', clean).maybeSingle();
      if (error) throw new Error(`Database error checking admin credentials: ${error.message}`);
      return data || null;
    }
    return devMockStore.admin_users.find(u => u.email === clean) || null;
  },

  async findById(id) {
    if (assertSupabaseActive('AdminUsersRepo.findById')) {
      const { data, error } = await supabase.from('admin_users').select('*').eq('id', id).maybeSingle();
      if (error) throw new Error(`Database error checking admin ID: ${error.message}`);
      return data || null;
    }
    return devMockStore.admin_users.find(u => u.id === id) || null;
  },

  async updatePassword(email, newHash) {
    const clean = email.toLowerCase().trim();
    if (assertSupabaseActive('AdminUsersRepo.updatePassword')) {
      const { error } = await supabase.from('admin_users').update({ password_hash: newHash }).eq('email', clean);
      if (error) throw new Error(`Database error updating password: ${error.message}`);
      return true;
    }

    const idx = devMockStore.admin_users.findIndex(u => u.email === clean);
    if (idx !== -1) {
      devMockStore.admin_users[idx].password_hash = newHash;
      return true;
    }
    return false;
  }
};

module.exports = {
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
  AdminUsersRepo,
  OFFICIAL_COURSES
};

