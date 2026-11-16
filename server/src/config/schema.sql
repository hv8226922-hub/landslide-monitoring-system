CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  reporter_name VARCHAR(100),
  location VARCHAR(255) NOT NULL,
  latitude DECIMAL(9, 6),
  longitude DECIMAL(9, 6),
  incident_type VARCHAR(50) NOT NULL DEFAULT 'Other',
  severity VARCHAR(20) NOT NULL DEFAULT 'Moderate',
  description TEXT NOT NULL,
  photo_url TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'New',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS weather_records (
  id SERIAL PRIMARY KEY,
  district VARCHAR(120) NOT NULL,
  rainfall_24h DECIMAL(8, 2) NOT NULL,
  humidity DECIMAL(5, 2),
  temperature DECIMAL(5, 2),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS risk_predictions (
  id SERIAL PRIMARY KEY,
  district VARCHAR(120) NOT NULL,
  probability DECIMAL(5, 4) NOT NULL,
  risk_level VARCHAR(20) NOT NULL,
  rainfall_24h DECIMAL(8, 2),
  soil_moisture DECIMAL(5, 2),
  slope DECIMAL(5, 2),
  predicted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  district VARCHAR(120) NOT NULL,
  risk_level VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL
    CHECK (role IN ('admin', 'officer', 'citizen')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE reports
ADD COLUMN IF NOT EXISTS user_id INTEGER
REFERENCES users(id)
ON DELETE SET NULL;

ALTER TABLE reports
ADD COLUMN IF NOT EXISTS assigned_officer_id INTEGER
REFERENCES users(id)
ON DELETE SET NULL;


CREATE TABLE IF NOT EXISTS roads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    district VARCHAR(150) NOT NULL,
    state VARCHAR(150) NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    status VARCHAR(50) NOT NULL DEFAULT 'Open'
        CHECK (status IN ('Open', 'Blocked', 'Restricted')),
    risk_level VARCHAR(50) NOT NULL DEFAULT 'Moderate'
        CHECK (risk_level IN ('Low', 'Moderate', 'High', 'Critical')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS villages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  district VARCHAR(150) NOT NULL,
  state VARCHAR(150) NOT NULL,
  population INTEGER,
  road_status VARCHAR(50) NOT NULL DEFAULT 'Open'
    CHECK (road_status IN ('Open', 'Blocked', 'Restricted')),
  risk_level VARCHAR(50) NOT NULL DEFAULT 'Moderate'
    CHECK (risk_level IN ('Low', 'Moderate', 'High', 'Critical')),
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS infrastructure_assets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(150) NOT NULL,
  location VARCHAR(255) NOT NULL,
  district VARCHAR(150),
  state VARCHAR(150) NOT NULL,
  risk_level VARCHAR(50) NOT NULL DEFAULT 'Moderate'
    CHECK (risk_level IN ('Low', 'Moderate', 'High', 'Critical')),
  status VARCHAR(100) NOT NULL DEFAULT 'Operational'
    CHECK (status IN (
      'Operational',
      'Inspection required',
      'Under maintenance',
      'Damaged',
      'Closed'
    )),
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_settings (
  admin_id INTEGER PRIMARY KEY,
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  high_risk_alerts_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  risk_threshold INTEGER NOT NULL DEFAULT 70
    CHECK (risk_threshold BETWEEN 0 AND 100),
  dashboard_language VARCHAR(30) NOT NULL DEFAULT 'English'
    CHECK (dashboard_language IN ('English', 'Hindi', 'Assamese')),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);