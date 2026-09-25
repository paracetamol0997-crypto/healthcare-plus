const db = require('../config/db');

const AFFIRMATIONS = [
  { text: "My mind is calm, my body is strong, and I take things one breath at a time.", category: "Peace" },
  { text: "Every healthy choice I make today is a celebration of what my body can do.", category: "Vitality" },
  { text: "I give myself permission to slow down and rest when I need to recharge.", category: "Self-Care" },
  { text: "Small, consistent daily habits create extraordinary mental and physical health.", category: "Growth" },
  { text: "I honor my body with nutritious food, clean water, and joyful movement.", category: "Nutrition" },
  { text: "My breath is my anchor. Inhaling peace, exhaling unnecessary tension.", category: "Mindfulness" },
  { text: "I am patient with my journey. Progress is quiet, gentle, and continuous.", category: "Resilience" }
];

const HEALTH_TIPS = [
  { title: "Hydrate Before Caffeine", text: "Drinking 500ml of water right after waking activates internal organs and replenishes fluid lost during sleep.", icon: "droplets" },
  { title: "The 20-20-20 Eye Reset", text: "Every 20 minutes of screen time, look at an object 20 feet away for 20 seconds to relax your optic nerves.", icon: "eye" },
  { title: "Post-Meal Walk", text: "A gentle 10-minute walk after lunch or dinner blunts blood glucose spikes by up to 30%.", icon: "activity" },
  { title: "Box Breathing for Focus", text: "When feeling tense, 4 rounds of 4-second box breathing triggers your parasympathetic calming response.", icon: "wind" },
  { title: "Pre-Sleep Cool Down", text: "A bedroom temperature of 18-20°C (65-68°F) helps your body enter deep REM sleep faster.", icon: "moon" }
];

const wellnessController = {
  // Mood Tracker
  async getMoods(req, res) {
    try {
      const userId = req.user ? req.user.id : 1;
      const moods = await db.getMoodLogs(userId);
      res.json({ moods });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching moods', error: error.message });
    }
  },

  async addMood(req, res) {
    try {
      const userId = req.user ? req.user.id : 1;
      const { moodLevel, moodTag, note } = req.body;

      if (!moodLevel || !moodTag) {
        return res.status(400).json({ message: 'moodLevel and moodTag are required' });
      }

      const log = await db.addMoodLog(userId, { moodLevel, moodTag, note });
      res.status(201).json({ message: 'Mood recorded successfully', log });
    } catch (error) {
      res.status(500).json({ message: 'Error logging mood', error: error.message });
    }
  },

  // Activities (Steps, Water, Workout)
  async getActivitySummary(req, res) {
    try {
      const userId = req.user ? req.user.id : 1;
      const today = new Date().toISOString().split('T')[0];
      const allLogs = await db.getActivityLogs(userId);

      // Today's specific metrics
      const todayLogs = allLogs.filter(a => a.logDate === today);
      
      const todayStepsLog = todayLogs.find(a => a.activityType === 'steps');
      const todayWaterLog = todayLogs.find(a => a.activityType === 'water');
      const todayWorkouts = todayLogs.filter(a => a.activityType === 'workout');

      const todaySteps = todayStepsLog ? todayStepsLog.metricValue : 0;
      const todayWater = todayWaterLog ? todayWaterLog.metricValue : 0;
      const todayWorkoutMinutes = todayWorkouts.reduce((sum, w) => sum + Number(w.metricValue), 0);

      // Past 7 days history for Recharts
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

        const daySteps = allLogs.filter(a => a.logDate === dateStr && a.activityType === 'steps')
          .reduce((sum, a) => sum + Number(a.metricValue), 0);

        const dayWater = allLogs.filter(a => a.logDate === dateStr && a.activityType === 'water')
          .reduce((sum, a) => Math.max(sum, Number(a.metricValue)), 0);

        const dayWorkouts = allLogs.filter(a => a.logDate === dateStr && a.activityType === 'workout')
          .reduce((sum, a) => sum + Number(a.metricValue), 0);

        last7Days.push({
          date: dateStr,
          day: dayName,
          steps: daySteps || (i > 0 ? Math.floor(5000 + Math.random() * 4000) : todaySteps),
          water: dayWater || (i > 0 ? Math.floor(5 + Math.random() * 3) : todayWater),
          workoutMinutes: dayWorkouts || (i > 0 ? (i % 2 === 0 ? 30 : 20) : todayWorkoutMinutes)
        });
      }

      res.json({
        today: {
          steps: todaySteps || 7250,
          stepsGoal: 10000,
          water: todayWater || 6,
          waterGoal: 8,
          workoutMinutes: todayWorkoutMinutes || 35,
          workoutGoal: 45,
          caloriesBurned: Math.round((todaySteps || 7250) * 0.04 + (todayWorkoutMinutes || 35) * 5.5)
        },
        weeklyTrends: last7Days,
        recentWorkouts: allLogs.filter(a => a.activityType === 'workout').slice(-5)
      });
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving activity summary', error: error.message });
    }
  },

  async logActivity(req, res) {
    try {
      const userId = req.user ? req.user.id : 1;
      const { activityType, metricValue, details, replaceToday } = req.body;

      if (!activityType || metricValue === undefined) {
        return res.status(400).json({ message: 'activityType and metricValue are required' });
      }

      const log = await db.addActivityLog(userId, {
        activityType,
        metricValue,
        details,
        replaceToday: replaceToday ?? (activityType === 'water' || activityType === 'steps')
      });

      res.status(201).json({ message: 'Activity logged successfully', log });
    } catch (error) {
      res.status(500).json({ message: 'Error logging activity', error: error.message });
    }
  },

  // Journal
  async getJournals(req, res) {
    try {
      const userId = req.user ? req.user.id : 1;
      const entries = await db.getJournals(userId);
      res.json({ entries });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching journal entries', error: error.message });
    }
  },

  async addJournal(req, res) {
    try {
      const userId = req.user ? req.user.id : 1;
      const { title, content, moodAssociated, tags } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Journal content cannot be empty' });
      }

      const entry = await db.addJournal(userId, {
        title,
        content,
        moodAssociated,
        tags
      });

      res.status(201).json({ message: 'Journal saved successfully', entry });
    } catch (error) {
      res.status(500).json({ message: 'Error saving journal entry', error: error.message });
    }
  },

  async deleteJournal(req, res) {
    try {
      const userId = req.user ? req.user.id : 1;
      const { id } = req.params;
      await db.deleteJournal(userId, id);
      res.json({ message: 'Journal entry deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting journal entry', error: error.message });
    }
  },

  // Daily Affirmations & Health Tips
  getAffirmations(req, res) {
    const todayIndex = new Date().getDate() % AFFIRMATIONS.length;
    res.json({
      todayAffirmation: AFFIRMATIONS[todayIndex],
      allAffirmations: AFFIRMATIONS,
      healthTips: HEALTH_TIPS
    });
  }
};

module.exports = wellnessController;
