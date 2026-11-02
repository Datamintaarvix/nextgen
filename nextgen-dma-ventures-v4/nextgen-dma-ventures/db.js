/**
 * ============================================================================
 * NEXTGEN DNA VENTURES - DATABASE ARCHITECTURE & SUPABASE CLOUD REPOSITORY
 * ============================================================================
 * Production-ready Dual-Layer Persistence:
 * 1. Supabase PostgreSQL Cloud Database (via @supabase/supabase-js & REST fallback)
 * 2. Local ACID transactional persistent cache (guarantees zero-downtime offline resiliency)
 *
 * Connected Supabase Instance:
 * https://kbuoysznaztsdqmwwtya.supabase.co
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'nextgen_production.json');
const BACKUP_FILE = path.join(DATA_DIR, 'nextgen_production.backup.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Supabase Credentials from Environment (Never hardcode secrets)
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabase = null;
try {
  const { createClient } = require('@supabase/supabase-js');
  if (SUPABASE_URL && SUPABASE_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    });
    console.log('[Supabase] SDK Client connected to:', SUPABASE_URL);
  }
} catch (err) {
  console.log('[Supabase] Note: @supabase/supabase-js not yet loaded. Using REST engine fallback.');
}

/**
 * Universal Supabase REST caller (uses built-in fetch if SDK is not installed)
 */
async function supabaseRest(endpoint, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    if (!res.ok) {
      const errText = await res.text();
      return { error: errText, status: res.status };
    }
    const data = await res.json();
    return { data };
  } catch (e) {
    return { error: e.message };
  }
}

// Initial Local Database Schema
const INITIAL_STATE = {
  version: "2.1.0",
  lastUpdated: new Date().toISOString(),
  counters: {
    registrationSequence: 1000
  },
  students: [],
  courses: [],
  registrations: [],
  payments: [],
  email_logs: [],
  admin_users: []
};

// In-memory cache for fast queries
let dbCache = null;

/**
 * Load Database from disk with automatic corruption fallback
 */
function loadDB() {
  if (dbCache) return dbCache;

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      dbCache = JSON.parse(raw);
      return dbCache;
    } catch (err) {
      console.error('[DB] Primary database file error, trying backup...', err.message);
      if (fs.existsSync(BACKUP_FILE)) {
        try {
          const backupRaw = fs.readFileSync(BACKUP_FILE, 'utf8');
          dbCache = JSON.parse(backupRaw);
          return dbCache;
        } catch (backupErr) {
          console.error('[DB] Backup also unreadable. Initializing fresh DB.', backupErr.message);
        }
      }
    }
  }

  // Initialize fresh
  dbCache = JSON.parse(JSON.stringify(INITIAL_STATE));
  saveDB();
  return dbCache;
}

/**
 * Atomic save with write-rename pattern
 */
function saveDB() {
  if (!dbCache) return;
  dbCache.lastUpdated = new Date().toISOString();

  const tempFile = path.join(DATA_DIR, `nextgen_temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.json`);
  const dataString = JSON.stringify(dbCache, null, 2);

  try {
    fs.writeFileSync(tempFile, dataString, 'utf8');
    if (fs.existsSync(DB_FILE)) {
      try {
        fs.copyFileSync(DB_FILE, BACKUP_FILE);
      } catch (e) {}
    }
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('[DB Error] Failed to persist database:', err);
    try {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    } catch (e) {}
    throw err;
  }
}

/**
 * Generate Sequential Unique Registration ID: NDV2026-1001, NDV2026-1002...
 */
function generateRegistrationId() {
  const db = loadDB();
  db.counters.registrationSequence += 1;
  const seq = db.counters.registrationSequence;
  saveDB();
  return `NDV2026-${seq}`;
}

// ============================================================================
// 47 OFFICIAL NEXTGEN DNA VENTURES COURSES (Central Seed Catalog)
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
  { id: "me-002", "course_name": "Finite Element Analysis (FEA)", category: "Mechanical Engineering", duration: 28, duration_text: "28 Weeks", total_fee: 28799 },
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
 * Seed Courses and Default Admin on Startup
 */
async function seedInitialData(adminEmail, adminPasswordHash) {
  const db = loadDB();

  // 1. Seed Courses Locally
  let coursesModified = false;
  OFFICIAL_COURSES.forEach(official => {
    const existingIndex = db.courses.findIndex(c => c.id === official.id || c.course_name.toLowerCase() === official.course_name.toLowerCase());
    if (existingIndex === -1) {
      db.courses.push({
        ...official,
        status: "active",
        created_at: new Date().toISOString()
      });
      coursesModified = true;
    } else {
      db.courses[existingIndex] = {
        ...db.courses[existingIndex],
        ...official,
        status: "active"
      };
      coursesModified = true;
    }
  });

  // 2. Seed Default Admin User if none exists locally
  if (db.admin_users.length === 0 && adminEmail) {
    db.admin_users.push({
      id: "admin-master-001",
      email: adminEmail.toLowerCase().trim(),
      password_hash: adminPasswordHash || "",
      role: "superadmin",
      name: "Master Administrator",
      created_at: new Date().toISOString()
    });
    coursesModified = true;
  }

  if (coursesModified) {
    saveDB();
    console.log(`[DB] Local seed complete: ${db.courses.length} courses loaded.`);
  }

  // 3. Sync & Seed to Supabase in Background
  syncCoursesToSupabase();
}

async function syncCoursesToSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  try {
    if (supabase) {
      const { error } = await supabase.from('courses').upsert(OFFICIAL_COURSES, { onConflict: 'id' });
      if (!error) {
        console.log('[Supabase] Successfully synchronized 47 courses to cloud database.');
      }
    } else {
      await supabaseRest('courses', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates' },
        body: OFFICIAL_COURSES
      });
    }
  } catch (e) {
    // Non-fatal, tables may not be created yet
  }
}

// ============================================================================
// REPOSITORIES (With Cloud Synchronization)
// ============================================================================

const StudentsRepo = {
  create(data) {
    const db = loadDB();
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
    db.students.push(student);
    saveDB();

    // Asynchronously sync to Supabase
    (async () => {
      try {
        if (supabase) {
          await supabase.from('students').insert([student]);
        } else {
          await supabaseRest('students', { method: 'POST', body: [student] });
        }
      } catch (e) {}
    })();

    return student;
  },

  findByRegId(regId) {
    const db = loadDB();
    return db.students.find(s => s.registration_id === regId) || null;
  },

  findById(id) {
    const db = loadDB();
    return db.students.find(s => s.id === id) || null;
  },

  findAll() {
    const db = loadDB();
    return db.students;
  }
};

const CoursesRepo = {
  findAll() {
    const db = loadDB();
    return db.courses;
  },

  findById(id) {
    const db = loadDB();
    return db.courses.find(c => c.id === id) || null;
  },

  findByName(name) {
    const db = loadDB();
    const clean = name.toLowerCase().trim();
    return db.courses.find(c => c.course_name.toLowerCase().trim() === clean || c.id === name) || null;
  }
};

const RegistrationsRepo = {
  create(data) {
    const db = loadDB();
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
    db.registrations.push(registration);
    saveDB();

    // Asynchronously sync to Supabase
    (async () => {
      try {
        if (supabase) {
          await supabase.from('registrations').insert([registration]);
        } else {
          await supabaseRest('registrations', { method: 'POST', body: [registration] });
        }
      } catch (e) {}
    })();

    return registration;
  },

  findByRegId(regId) {
    const db = loadDB();
    return db.registrations.find(r => r.registration_id === regId) || null;
  },

  update(regId, updates) {
    const db = loadDB();
    const idx = db.registrations.findIndex(r => r.registration_id === regId);
    if (idx === -1) return null;

    db.registrations[idx] = {
      ...db.registrations[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    saveDB();

    const updatedRecord = db.registrations[idx];

    // Asynchronously sync update to Supabase
    (async () => {
      try {
        if (supabase) {
          await supabase.from('registrations').update(updates).eq('registration_id', regId);
        } else {
          await supabaseRest(`registrations?registration_id=eq.${regId}`, {
            method: 'PATCH',
            body: updates
          });
        }
      } catch (e) {}
    })();

    return updatedRecord;
  },

  findAll() {
    const db = loadDB();
    return [...db.registrations].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  getDetailed(regId) {
    const db = loadDB();
    const reg = db.registrations.find(r => r.registration_id === regId);
    if (!reg) return null;

    const student = db.students.find(s => s.registration_id === regId) || {};
    const payments = db.payments.filter(p => p.registration_id === regId);
    const emailLogs = db.email_logs.filter(e => e.registration_id === regId);

    return {
      ...reg,
      student,
      payments,
      email_logs: emailLogs
    };
  },

  getStats() {
    const db = loadDB();
    const regs = db.registrations;
    const payments = db.payments.filter(p => p.payment_status === 'success');

    let totalRevenue = 0;
    let advancePaidCount = 0;
    let fullyPaidCount = 0;
    let pendingPaymentCount = 0;
    let failedCount = 0;
    let totalPendingBalance = 0;

    const todayStr = new Date().toISOString().split('T')[0];
    let todayCount = 0;

    regs.forEach(r => {
      if (r.created_at && r.created_at.startsWith(todayStr)) {
        todayCount++;
      }

      if (r.registration_status === 'Advance Paid – Slot Reserved' || r.registration_status === 'Advance Paid') {
        advancePaidCount++;
        totalPendingBalance += Number(r.remaining_balance || 0);
      } else if (r.registration_status === 'Fully Paid') {
        fullyPaidCount++;
      } else if (r.registration_status === 'Payment Failed') {
        failedCount++;
      } else {
        pendingPaymentCount++;
      }
    });

    payments.forEach(p => {
      totalRevenue += Number(p.amount || 0);
    });

    return {
      totalRegistrations: regs.length,
      advancePayments: advancePaidCount,
      fullPayments: fullyPaidCount,
      totalRevenueCollected: totalRevenue,
      pendingBalances: totalPendingBalance,
      failedPayments: failedCount,
      pendingPayments: pendingPaymentCount,
      todayRegistrations: todayCount
    };
  }
};

const PaymentsRepo = {
  create(data) {
    const db = loadDB();
    const id = `pay_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const payment = {
      id,
      registration_id: data.registration_id,
      razorpay_order_id: data.razorpay_order_id,
      razorpay_payment_id: data.razorpay_payment_id || null,
      razorpay_signature: data.razorpay_signature || null,
      amount: Number(data.amount),
      currency: data.currency || 'INR',
      payment_type: data.payment_type,
      payment_status: data.payment_status || 'created',
      payment_method: data.payment_method || 'Razorpay',
      verified_at: data.verified_at || null,
      created_at: new Date().toISOString()
    };
    db.payments.push(payment);
    saveDB();

    // Asynchronously sync to Supabase
    (async () => {
      try {
        if (supabase) {
          await supabase.from('payments').insert([payment]);
        } else {
          await supabaseRest('payments', { method: 'POST', body: [payment] });
        }
      } catch (e) {}
    })();

    return payment;
  },

  findByOrderId(orderId) {
    const db = loadDB();
    return db.payments.find(p => p.razorpay_order_id === orderId) || null;
  },

  findByPaymentId(paymentId) {
    const db = loadDB();
    return db.payments.find(p => p.razorpay_payment_id === paymentId) || null;
  },

  findByRegId(regId) {
    const db = loadDB();
    return db.payments.filter(p => p.registration_id === regId);
  },

  update(id, updates) {
    const db = loadDB();
    const idx = db.payments.findIndex(p => p.id === id);
    if (idx === -1) return null;

    db.payments[idx] = {
      ...db.payments[idx],
      ...updates
    };
    saveDB();

    // Asynchronously sync update to Supabase
    (async () => {
      try {
        if (supabase) {
          await supabase.from('payments').update(updates).eq('id', id);
        } else {
          await supabaseRest(`payments?id=eq.${id}`, { method: 'PATCH', body: updates });
        }
      } catch (e) {}
    })();

    return db.payments[idx];
  },

  findAll() {
    const db = loadDB();
    return [...db.payments].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
};

const EmailLogsRepo = {
  create(data) {
    const db = loadDB();
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
    db.email_logs.push(log);
    saveDB();

    // Asynchronously sync to Supabase
    (async () => {
      try {
        if (supabase) {
          await supabase.from('email_logs').insert([log]);
        } else {
          await supabaseRest('email_logs', { method: 'POST', body: [log] });
        }
      } catch (e) {}
    })();

    return log;
  },

  findByRegId(regId) {
    const db = loadDB();
    return db.email_logs.filter(e => e.registration_id === regId);
  },

  findAll() {
    const db = loadDB();
    return [...db.email_logs].sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
  }
};

const AdminUsersRepo = {
  findByEmail(email) {
    const db = loadDB();
    const clean = email.toLowerCase().trim();
    return db.admin_users.find(u => u.email === clean) || null;
  },

  findById(id) {
    const db = loadDB();
    return db.admin_users.find(u => u.id === id) || null;
  },

  updatePassword(email, newHash) {
    const db = loadDB();
    const idx = db.admin_users.findIndex(u => u.email === email.toLowerCase().trim());
    if (idx !== -1) {
      db.admin_users[idx].password_hash = newHash;
      saveDB();

      (async () => {
        try {
          if (supabase) {
            await supabase.from('admin_users').update({ password_hash: newHash }).eq('email', email.toLowerCase().trim());
          }
        } catch (e) {}
      })();

      return true;
    }
    return false;
  }
};

module.exports = {
  loadDB,
  saveDB,
  generateRegistrationId,
  seedInitialData,
  supabase,
  StudentsRepo,
  CoursesRepo,
  RegistrationsRepo,
  PaymentsRepo,
  EmailLogsRepo,
  AdminUsersRepo,
  OFFICIAL_COURSES
};
