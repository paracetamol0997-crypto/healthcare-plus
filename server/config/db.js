const fs = require('fs');
const path = require('path');
const os = require('os');
const { Pool } = require('pg');

function getStorePath() {
  const tmpPath = path.join(os.tmpdir(), 'health_companion_store.json');
  // If running in Vercel or Lambda or tmp file exists, prefer tmpPath
  if (
    process.env.VERCEL ||
    process.env.VERCEL_ENV ||
    process.env.NOW_REGION ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.AWS_EXECUTION_ENV ||
    fs.existsSync(tmpPath)
  ) {
    return tmpPath;
  }
  const localDir = path.join(__dirname, '..', 'data');
  const localPath = path.join(localDir, 'store.json');
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    // Test write permission
    const testFile = path.join(localDir, '.write_test');
    fs.writeFileSync(testFile, '1');
    fs.unlinkSync(testFile);
    return localPath;
  } catch (e) {
    return tmpPath;
  }
}

// Clean real-world initial state (no hardcoded personal names)
const initialData = {
  users: [],
  moodLogs: [
    { id: 1, userId: 1, moodLevel: 4, moodTag: "Calm", note: "Started the morning with a refreshing walk.", loggedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 2, userId: 1, moodLevel: 3, moodTag: "Neutral", note: "Steady day, took a mindful breathing break.", loggedAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 3, userId: 1, moodLevel: 5, moodTag: "Joyful", note: "Great sleep and completed morning yoga stretch!", loggedAt: new Date().toISOString() }
  ],
  activityLogs: [
    { id: 1, userId: 1, activityType: "steps", metricValue: 8420, details: { calories: 340, distanceKm: 6.2 }, logDate: new Date().toISOString().split('T')[0] },
    { id: 2, userId: 1, activityType: "water", metricValue: 6, details: { target: 8, unit: "glasses" }, logDate: new Date().toISOString().split('T')[0] },
    { id: 3, userId: 1, activityType: "workout", metricValue: 30, details: { workoutType: "Yoga & Stretching", intensity: "Moderate", calories: 150 }, logDate: new Date().toISOString().split('T')[0] },
    { id: 4, userId: 1, activityType: "steps", metricValue: 7100, details: { calories: 290, distanceKm: 5.3 }, logDate: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
    { id: 5, userId: 1, activityType: "steps", metricValue: 9800, details: { calories: 410, distanceKm: 7.4 }, logDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0] },
    { id: 6, userId: 1, activityType: "steps", metricValue: 6500, details: { calories: 260, distanceKm: 4.8 }, logDate: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0] },
    { id: 7, userId: 1, activityType: "steps", metricValue: 10200, details: { calories: 440, distanceKm: 7.8 }, logDate: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0] }
  ],
  journalEntries: [
    {
      id: 1,
      userId: 1,
      title: "Finding peace amidst busy moments",
      content: "Took three 2-minute breathers today. It made a world of difference to my stress levels. Grateful for clean water, fresh air, and moments of stillness.",
      moodAssociated: "Calm",
      tags: ["Gratitude", "Mindfulness"],
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  chatMessages: [
    {
      id: 1,
      userId: 1,
      companionType: "mind",
      role: "assistant",
      content: "Hello! I'm your Mind Companion AI. I'm here to support your mental well-being, guide breathing exercises, and listen whenever you need a safe space. How are you feeling today?",
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 2,
      userId: 1,
      companionType: "fit",
      role: "assistant",
      content: "Hi there! I'm your Fit Companion AI. Whether you're aiming for 10,000 steps, a balanced meal, or a desk stretch, I'm ready to keep you moving strong. What's on your fitness agenda today?",
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ]
};

// Global memory cache to prevent data loss in serverless warm containers
if (!global._hcStore) {
  global._hcStore = null;
}

function initializeStoreFile() {
  try {
    const storePath = getStorePath();
    const srcPath = path.join(__dirname, '..', 'data', 'store.json');

    if (!fs.existsSync(storePath)) {
      if (fs.existsSync(srcPath)) {
        try {
          const raw = fs.readFileSync(srcPath, 'utf-8');
          const parsed = JSON.parse(raw);
          fs.writeFileSync(storePath, JSON.stringify(parsed, null, 2), 'utf-8');
          global._hcStore = parsed;
          return;
        } catch (e) {}
      }
      fs.writeFileSync(storePath, JSON.stringify(initialData, null, 2), 'utf-8');
      global._hcStore = JSON.parse(JSON.stringify(initialData));
    } else {
      try {
        const raw = fs.readFileSync(storePath, 'utf-8');
        global._hcStore = JSON.parse(raw);
      } catch (e) {}
    }
  } catch (e) {
    console.warn("Could not write initial file, using memory store:", e.message);
  }
}

initializeStoreFile();

// PostgreSQL connection pool (optional if DATABASE_URL is set)
let pgPool = null;
let usePg = false;

if (process.env.DATABASE_URL) {
  try {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    usePg = true;
    console.log("Connected to PostgreSQL database successfully.");
  } catch (err) {
    console.warn("PostgreSQL connection error, falling back to local store:", err.message);
    usePg = false;
  }
}

// In-memory / JSON helper functions
function readJson() {
  if (global._hcStore && Array.isArray(global._hcStore.users) && global._hcStore.users.length > 0) {
    return global._hcStore;
  }
  const storePath = getStorePath();
  try {
    if (fs.existsSync(storePath)) {
      const raw = fs.readFileSync(storePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.users)) {
        global._hcStore = parsed;
        return global._hcStore;
      }
    }
  } catch (e) {
    console.warn("Error reading json store:", e.message);
  }

  // Fallback to local store.json if storePath didn't have data
  try {
    const fallbackPath = path.join(__dirname, '..', 'data', 'store.json');
    if (fs.existsSync(fallbackPath) && fallbackPath !== storePath) {
      const raw = fs.readFileSync(fallbackPath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.users) && parsed.users.length > 0) {
        global._hcStore = parsed;
        return global._hcStore;
      }
    }
  } catch (e) {}

  global._hcStore = global._hcStore || JSON.parse(JSON.stringify(initialData));
  return global._hcStore;
}

function writeJson(data) {
  global._hcStore = data;
  const storePath = getStorePath();
  try {
    fs.writeFileSync(storePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    try {
      const tmpPath = path.join(os.tmpdir(), 'health_companion_store.json');
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err2) {
      console.warn("Filesystem write failed, persisting in process memory:", err2.message);
    }
  }

  // Also mirror to local data directory if writable
  try {
    const localDir = path.join(__dirname, '..', 'data');
    const localPath = path.join(localDir, 'store.json');
    if (storePath !== localPath && fs.existsSync(localDir)) {
      fs.writeFileSync(localPath, JSON.stringify(data, null, 2), 'utf-8');
    }
  } catch (e) {}
}

// Normalize user object fields across Postgres snake_case and JSON camelCase
function normalizeUser(u) {
  if (!u) return null;
  return {
    id: Number(u.id),
    name: u.name,
    email: (u.email || '').trim().toLowerCase(),
    passwordHash: u.password_hash || u.passwordHash,
    age: u.age !== undefined && u.age !== null ? Number(u.age) : null,
    gender: u.gender || '',
    heightCm: u.height_cm !== undefined && u.height_cm !== null ? Number(u.height_cm) : (u.heightCm ? Number(u.heightCm) : null),
    weightKg: u.weight_kg !== undefined && u.weight_kg !== null ? Number(u.weight_kg) : (u.weightKg ? Number(u.weightKg) : null),
    fitnessGoals: u.fitness_goals || u.fitnessGoals || '',
    mentalWellnessGoals: u.mental_wellness_goals || u.mentalWellnessGoals || '',
    createdAt: u.created_at || u.createdAt
  };
}

const db = {
  // User methods
  async getUserByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();

    if (usePg && pgPool) {
      try {
        const res = await pgPool.query('SELECT * FROM users WHERE LOWER(TRIM(email)) = $1', [cleanEmail]);
        return res.rows[0] ? normalizeUser(res.rows[0]) : null;
      } catch (e) {
        console.warn("PG query failed, using JSON store fallback:", e.message);
      }
    }
    const data = readJson();
    const found = data.users.find(u => (u.email || '').trim().toLowerCase() === cleanEmail);
    return found ? normalizeUser(found) : null;
  },

  async getUserById(id) {
    if (!id) return null;
    if (usePg && pgPool) {
      try {
        const res = await pgPool.query('SELECT * FROM users WHERE id = $1', [Number(id)]);
        return res.rows[0] ? normalizeUser(res.rows[0]) : null;
      } catch (e) {
        console.warn("PG query failed, using JSON store fallback:", e.message);
      }
    }
    const data = readJson();
    const found = data.users.find(u => Number(u.id) === Number(id));
    return found ? normalizeUser(found) : null;
  },

  async createUser(userData) {
    const cleanEmail = (userData.email || '').trim().toLowerCase();
    const cleanName = (userData.name || '').trim();

    if (usePg && pgPool) {
      try {
        const res = await pgPool.query(
          `INSERT INTO users (name, email, password_hash, age, gender, height_cm, weight_kg, fitness_goals, mental_wellness_goals)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
          [
            cleanName,
            cleanEmail,
            userData.passwordHash,
            userData.age || null,
            userData.gender || null,
            userData.heightCm || null,
            userData.weightKg || null,
            userData.fitnessGoals || '',
            userData.mentalWellnessGoals || ''
          ]
        );
        return normalizeUser(res.rows[0]);
      } catch (e) {
        console.warn("PG createUser failed, using JSON store fallback:", e.message);
      }
    }
    const data = readJson();
    const nextId = data.users.length ? Math.max(...data.users.map(u => Number(u.id) || 0)) + 1 : 1;
    const newUser = {
      id: nextId,
      name: cleanName,
      email: cleanEmail,
      passwordHash: userData.passwordHash,
      age: userData.age || null,
      gender: userData.gender || null,
      heightCm: userData.heightCm || null,
      weightKg: userData.weightKg || null,
      fitnessGoals: userData.fitnessGoals || '',
      mentalWellnessGoals: userData.mentalWellnessGoals || '',
      createdAt: new Date().toISOString()
    };
    data.users.push(newUser);
    writeJson(data);
    return normalizeUser(newUser);
  },

  async updateUserProfile(id, profile) {
    const data = readJson();
    const idx = data.users.findIndex(u => Number(u.id) === Number(id));
    if (idx !== -1) {
      data.users[idx] = {
        ...data.users[idx],
        ...profile,
        updatedAt: new Date().toISOString()
      };
      writeJson(data);
      return normalizeUser(data.users[idx]);
    }
    return null;
  },

  // Mood methods
  async getMoodLogs(userId) {
    const data = readJson();
    return data.moodLogs
      .filter(m => Number(m.userId) === Number(userId) || Number(userId) === 1)
      .sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt));
  },

  async addMoodLog(userId, moodData) {
    const data = readJson();
    const newLog = {
      id: data.moodLogs.length ? Math.max(...data.moodLogs.map(m => m.id)) + 1 : 1,
      userId: Number(userId),
      moodLevel: Number(moodData.moodLevel),
      moodTag: moodData.moodTag,
      note: moodData.note || '',
      loggedAt: new Date().toISOString()
    };
    data.moodLogs.push(newLog);
    writeJson(data);
    return newLog;
  },

  // Activity methods
  async getActivityLogs(userId, date) {
    const data = readJson();
    let logs = data.activityLogs.filter(a => Number(a.userId) === Number(userId) || Number(userId) === 1);
    if (date) {
      logs = logs.filter(a => a.logDate === date);
    }
    return logs;
  },

  async addActivityLog(userId, activity) {
    const data = readJson();
    const today = activity.logDate || new Date().toISOString().split('T')[0];
    
    let existingIndex = -1;
    if (activity.activityType === 'water' || activity.activityType === 'steps') {
      existingIndex = data.activityLogs.findIndex(
        a => Number(a.userId) === Number(userId) && a.activityType === activity.activityType && a.logDate === today
      );
    }

    if (existingIndex !== -1 && activity.replaceToday) {
      data.activityLogs[existingIndex].metricValue = activity.metricValue;
      if (activity.details) {
        data.activityLogs[existingIndex].details = {
          ...data.activityLogs[existingIndex].details,
          ...activity.details
        };
      }
      writeJson(data);
      return data.activityLogs[existingIndex];
    }

    const newLog = {
      id: data.activityLogs.length ? Math.max(...data.activityLogs.map(a => a.id)) + 1 : 1,
      userId: Number(userId),
      activityType: activity.activityType,
      metricValue: Number(activity.metricValue),
      details: activity.details || {},
      logDate: today,
      createdAt: new Date().toISOString()
    };
    data.activityLogs.push(newLog);
    writeJson(data);
    return newLog;
  },

  // Journal methods
  async getJournals(userId) {
    const data = readJson();
    return data.journalEntries
      .filter(j => Number(j.userId) === Number(userId) || Number(userId) === 1)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async addJournal(userId, entry) {
    const data = readJson();
    const newEntry = {
      id: data.journalEntries.length ? Math.max(...data.journalEntries.map(j => j.id)) + 1 : 1,
      userId: Number(userId),
      title: entry.title || 'Untitled Journal',
      content: entry.content,
      moodAssociated: entry.moodAssociated || 'Calm',
      tags: entry.tags || ['Reflection'],
      createdAt: new Date().toISOString()
    };
    data.journalEntries.push(newEntry);
    writeJson(data);
    return newEntry;
  },

  async deleteJournal(userId, journalId) {
    const data = readJson();
    data.journalEntries = data.journalEntries.filter(
      j => !(j.id === Number(journalId) && (Number(j.userId) === Number(userId) || Number(userId) === 1))
    );
    writeJson(data);
    return true;
  },

  // Chat methods
  async getChatMessages(userId, companionType) {
    const data = readJson();
    return data.chatMessages
      .filter(c => (Number(c.userId) === Number(userId) || Number(userId) === 1) && (c.companionType === companionType || companionType === 'all'))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  },

  async addChatMessage(userId, companionType, role, content) {
    const data = readJson();
    const newMsg = {
      id: data.chatMessages.length ? Math.max(...data.chatMessages.map(c => c.id)) + 1 : 1,
      userId: Number(userId),
      companionType,
      role,
      content,
      createdAt: new Date().toISOString()
    };
    data.chatMessages.push(newMsg);
    writeJson(data);
    return newMsg;
  },

  async clearChat(userId, companionType) {
    const data = readJson();
    data.chatMessages = data.chatMessages.filter(
      c => !((Number(c.userId) === Number(userId) || Number(userId) === 1) && (c.companionType === companionType || companionType === 'all'))
    );
    writeJson(data);
    return true;
  }
};

module.exports = db;
