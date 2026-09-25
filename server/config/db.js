const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const dataDir = path.join(__dirname, '..', 'data');
const jsonFilePath = path.join(dataDir, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial mock database state
const initialData = {
  users: [
    {
      id: 1,
      name: "Pavan",
      email: "pavan@healthcompanion.ai",
      passwordHash: "$2a$10$wJjH.7bC8Ym3D3sWk5gQPe6v7rLhFwGkKkUeYw5OqZ5Xq0tFp4vKG", // "wellness123"
      age: 28,
      gender: "Male",
      heightCm: 175,
      weightKg: 72,
      fitnessGoals: "Maintain daily 10,000 steps, build core strength, and improve posture.",
      mentalWellnessGoals: "Manage work stress, practice daily 5-minute breathing, and achieve 7.5 hours of sleep.",
      createdAt: new Date().toISOString()
    }
  ],
  moodLogs: [
    { id: 1, userId: 1, moodLevel: 4, moodTag: "Calm", note: "Started the day with a gentle walk in the park.", loggedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 2, userId: 1, moodLevel: 3, moodTag: "Neutral", note: "Busy afternoon with meetings, felt a bit rushed.", loggedAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 3, userId: 1, moodLevel: 5, moodTag: "Joyful", note: "Had a great sleep and completed my morning stretch!", loggedAt: new Date().toISOString() }
  ],
  activityLogs: [
    { id: 1, userId: 1, activityType: "steps", metricValue: 8420, details: { calories: 340, distanceKm: 6.2 }, logDate: new Date().toISOString().split('T')[0] },
    { id: 2, userId: 1, activityType: "water", metricValue: 6, details: { target: 8, unit: "glasses" }, logDate: new Date().toISOString().split('T')[0] },
    { id: 3, userId: 1, activityType: "workout", metricValue: 30, details: { workoutType: "Yoga & Stretching", intensity: "Moderate", calories: 150 }, logDate: new Date().toISOString().split('T')[0] },
    // Past days for charts
    { id: 4, userId: 1, activityType: "steps", metricValue: 7100, details: { calories: 290, distanceKm: 5.3 }, logDate: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
    { id: 5, userId: 1, activityType: "steps", metricValue: 9800, details: { calories: 410, distanceKm: 7.4 }, logDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0] },
    { id: 6, userId: 1, activityType: "steps", metricValue: 6500, details: { calories: 260, distanceKm: 4.8 }, logDate: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0] },
    { id: 7, userId: 1, activityType: "steps", metricValue: 10200, details: { calories: 440, distanceKm: 7.8 }, logDate: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0] }
  ],
  journalEntries: [
    {
      id: 1,
      userId: 1,
      title: "Finding peace amidst deadlines",
      content: "Today was packed with responsibilities, but I took three 2-minute breathers. It made a world of difference to my stress levels. Grateful for my health and warm herbal tea.",
      moodAssociated: "Calm",
      tags: ["Gratitude", "Mindfulness", "Work-Life"],
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  chatMessages: [
    {
      id: 1,
      userId: 1,
      companionType: "mind",
      role: "assistant",
      content: "Hello Pavan! I'm your Mind Companion AI. I'm here to support your mental well-being, guide breathing exercises, and listen whenever you need a safe space. How are you feeling today?",
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 2,
      userId: 1,
      companionType: "fit",
      role: "assistant",
      content: "Hi Pavan! I'm your Fit Companion AI. Whether you're aiming for 10,000 steps, a balanced post-workout meal, or a 15-minute desk stretch, I'm ready to keep you moving strong. What's on your fitness agenda today?",
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ]
};

// Check if json file exists; if not, initialize with mock data
if (!fs.existsSync(jsonFilePath)) {
  fs.writeFileSync(jsonFilePath, JSON.stringify(initialData, null, 2), 'utf-8');
}

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
    console.warn("PostgreSQL connection error, falling back to local JSON store:", err.message);
    usePg = false;
  }
}

// In-memory / JSON helper functions
function readJson() {
  try {
    const raw = fs.readFileSync(jsonFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return initialData;
  }
}

function writeJson(data) {
  try {
    fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error("Failed to write to JSON store:", e);
  }
}

const db = {
  // User methods
  async getUserByEmail(email) {
    if (usePg && pgPool) {
      try {
        const res = await pgPool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
        return res.rows[0] || null;
      } catch (e) {
        console.warn("PG query failed, using JSON store fallback");
      }
    }
    const data = readJson();
    return data.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async getUserById(id) {
    if (usePg && pgPool) {
      try {
        const res = await pgPool.query('SELECT * FROM users WHERE id = $1', [id]);
        return res.rows[0] || null;
      } catch (e) {
        console.warn("PG query failed, using JSON store fallback");
      }
    }
    const data = readJson();
    return data.users.find(u => u.id === Number(id)) || null;
  },

  async createUser(userData) {
    if (usePg && pgPool) {
      try {
        const res = await pgPool.query(
          `INSERT INTO users (name, email, password_hash, age, gender, height_cm, weight_kg, fitness_goals, mental_wellness_goals)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
          [
            userData.name,
            userData.email,
            userData.passwordHash,
            userData.age || null,
            userData.gender || null,
            userData.heightCm || null,
            userData.weightKg || null,
            userData.fitnessGoals || '',
            userData.mentalWellnessGoals || ''
          ]
        );
        return res.rows[0];
      } catch (e) {
        console.warn("PG createUser failed, using JSON store fallback");
      }
    }
    const data = readJson();
    const newUser = {
      id: data.users.length ? Math.max(...data.users.map(u => u.id)) + 1 : 1,
      name: userData.name,
      email: userData.email,
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
    return newUser;
  },

  async updateUserProfile(id, profile) {
    const data = readJson();
    const idx = data.users.findIndex(u => u.id === Number(id));
    if (idx !== -1) {
      data.users[idx] = {
        ...data.users[idx],
        ...profile,
        updatedAt: new Date().toISOString()
      };
      writeJson(data);
      return data.users[idx];
    }
    return null;
  },

  // Mood methods
  async getMoodLogs(userId) {
    const data = readJson();
    return data.moodLogs
      .filter(m => m.userId === Number(userId))
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
    let logs = data.activityLogs.filter(a => a.userId === Number(userId));
    if (date) {
      logs = logs.filter(a => a.logDate === date);
    }
    return logs;
  },

  async addActivityLog(userId, activity) {
    const data = readJson();
    const today = activity.logDate || new Date().toISOString().split('T')[0];
    
    // For steps or water, if an entry for today already exists, we can update or add
    let existingIndex = -1;
    if (activity.activityType === 'water' || activity.activityType === 'steps') {
      existingIndex = data.activityLogs.findIndex(
        a => a.userId === Number(userId) && a.activityType === activity.activityType && a.logDate === today
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
      .filter(j => j.userId === Number(userId))
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
      j => !(j.id === Number(journalId) && j.userId === Number(userId))
    );
    writeJson(data);
    return true;
  },

  // Chat methods
  async getChatMessages(userId, companionType) {
    const data = readJson();
    return data.chatMessages
      .filter(c => c.userId === Number(userId) && (c.companionType === companionType || companionType === 'all'))
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
      c => !(c.userId === Number(userId) && (c.companionType === companionType || companionType === 'all'))
    );
    writeJson(data);
    return true;
  }
};

module.exports = db;
