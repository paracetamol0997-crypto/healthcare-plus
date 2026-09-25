-- PostgreSQL Schema for Health Companion AI

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    age INT,
    gender VARCHAR(50),
    height_cm NUMERIC(5, 2),
    weight_kg NUMERIC(5, 2),
    fitness_goals TEXT,
    mental_wellness_goals TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mood_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    mood_level INT NOT NULL, -- 1 (very low) to 5 (great)
    mood_tag VARCHAR(50) NOT NULL, -- 'Calm', 'Joyful', 'Anxious', etc.
    note TEXT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'steps', 'water', 'workout'
    metric_value NUMERIC(10, 2) NOT NULL, -- count of steps, ml of water, or minutes of workout
    details JSONB, -- { "workoutType": "Yoga", "intensity": "Moderate", "calories": 180 }
    log_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS journal_entries (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT NOT NULL,
    mood_associated VARCHAR(50),
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    companion_type VARCHAR(50) NOT NULL, -- 'mind', 'fit', 'unified'
    role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mood_user_date ON mood_logs(user_id, logged_at);
CREATE INDEX IF NOT EXISTS idx_activity_user_date ON activity_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_journal_user ON journal_entries(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_messages(user_id, companion_type, created_at);
