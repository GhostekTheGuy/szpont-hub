ALTER TABLE habits ADD COLUMN IF NOT EXISTS frequency TEXT NOT NULL DEFAULT 'daily';
-- Values: 'daily', 'weekdays', '5_per_week', '4_per_week', '3_per_week', '2_per_week'
