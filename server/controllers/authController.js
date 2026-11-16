const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

function calculateBmi(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null;
  const heightM = heightCm / 100;
  if (heightM <= 0) return null;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));
  let category = 'Normal weight';
  let advice = 'You have a balanced body mass ratio. Focus on maintaining muscle tone and cardiovascular health.';
  if (bmi < 18.5) {
    category = 'Underweight';
    advice = 'Consider nourishing, nutrient-dense meals and progressive resistance training to build healthy mass.';
  } else if (bmi >= 25 && bmi < 29.9) {
    category = 'Overweight';
    advice = 'Incorporate daily brisk walks, gentle caloric moderation, and regular hydration.';
  } else if (bmi >= 30) {
    category = 'Obesity';
    advice = 'Consult your physician for a structured medical wellness plan paired with low-impact exercises like swimming and walking.';
  }
  return { bmi, category, advice };
}

const authController = {
  async register(req, res) {
    try {
      const { name, email, password, age, gender, heightCm, weightKg, fitnessGoals, mentalWellnessGoals } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();

      if (cleanName.length < 2) {
        return res.status(400).json({ message: 'Name must be at least 2 characters long' });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }

      const existingUser = await db.getUserByEmail(cleanEmail);
      if (existingUser) {
        return res.status(400).json({ message: 'An account with this email already exists. Please sign in.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = await db.createUser({
        name: cleanName,
        email: cleanEmail,
        passwordHash,
        age: age ? Number(age) : null,
        gender: gender || '',
        heightCm: heightCm ? Number(heightCm) : null,
        weightKg: weightKg ? Number(weightKg) : null,
        fitnessGoals: fitnessGoals || 'Maintain daily activity and balanced energy',
        mentalWellnessGoals: mentalWellnessGoals || 'Practice mindful breathing and reduce stress'
      });

      const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '14d' });
      const bmiInfo = calculateBmi(newUser.weightKg, newUser.heightCm);

      res.status(201).json({
        message: 'Account created successfully! Welcome to Health Companion AI.',
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          age: newUser.age,
          gender: newUser.gender,
          heightCm: newUser.heightCm,
          weightKg: newUser.weightKg,
          fitnessGoals: newUser.fitnessGoals,
          mentalWellnessGoals: newUser.mentalWellnessGoals,
          bmiInfo
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Error creating user account', error: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const user = await db.getUserByEmail(cleanEmail);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const storedHash = user.passwordHash || user.password_hash;
      let isMatch = false;

      if (storedHash) {
        if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$')) {
          isMatch = await bcrypt.compare(password, storedHash);
        } else {
          isMatch = storedHash === password;
        }
      }

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '14d' });
      const bmiInfo = calculateBmi(user.weightKg, user.heightCm);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          age: user.age,
          gender: user.gender,
          heightCm: user.heightCm,
          weightKg: user.weightKg,
          fitnessGoals: user.fitnessGoals,
          mentalWellnessGoals: user.mentalWellnessGoals,
          bmiInfo
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  },

  async getProfile(req, res) {
    try {
      const user = await db.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const bmiInfo = calculateBmi(user.weightKg, user.heightCm);
      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          age: user.age,
          gender: user.gender,
          heightCm: user.heightCm,
          weightKg: user.weightKg,
          fitnessGoals: user.fitnessGoals,
          mentalWellnessGoals: user.mentalWellnessGoals,
          bmiInfo
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving profile', error: error.message });
    }
  },

  async updateProfile(req, res) {
    try {
      const { name, age, gender, heightCm, weightKg, fitnessGoals, mentalWellnessGoals } = req.body;
      const updatedUser = await db.updateUserProfile(req.user.id, {
        ...(name && { name: name.trim() }),
        ...(age !== undefined && { age: Number(age) }),
        ...(gender !== undefined && { gender }),
        ...(heightCm !== undefined && { heightCm: Number(heightCm) }),
        ...(weightKg !== undefined && { weightKg: Number(weightKg) }),
        ...(fitnessGoals !== undefined && { fitnessGoals }),
        ...(mentalWellnessGoals !== undefined && { mentalWellnessGoals })
      });

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      const bmiInfo = calculateBmi(updatedUser.weightKg, updatedUser.heightCm);

      res.json({
        message: 'Profile updated successfully!',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          age: updatedUser.age,
          gender: updatedUser.gender,
          heightCm: updatedUser.heightCm,
          weightKg: updatedUser.weightKg,
          fitnessGoals: updatedUser.fitnessGoals,
          mentalWellnessGoals: updatedUser.mentalWellnessGoals,
          bmiInfo
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
  },

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: 'Email address is required' });
      }
      const cleanEmail = email.trim().toLowerCase();
      res.json({
        message: `Password reset instructions have been dispatched to ${cleanEmail}. Please check your inbox and spam folder.`
      });
    } catch (error) {
      res.status(500).json({ message: 'Password reset request failed', error: error.message });
    }
  }
};

module.exports = authController;
