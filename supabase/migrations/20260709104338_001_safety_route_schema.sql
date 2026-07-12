/*
# Women's Safety Route Database Schema

1. New Tables
- `emergency_contacts` - Stores user's emergency contacts for SOS alerts
  - id (uuid, primary key)
  - user_id (uuid, references auth.users)
  - name (text, contact name)
  - phone (text, phone number)
  - relationship (text, relationship to user)
  - is_primary (boolean, primary contact flag)
  - created_at (timestamp)
  
- `trips` - Records user trips for live sharing and history
  - id (uuid, primary key)
  - user_id (uuid, references auth.users)
  - source_address (text, starting location address)
  - source_lat (numeric)
  - source_lng (numeric)
  - destination_address (text, ending location address)
  - dest_lat (numeric)
  - dest_lng (numeric)
  - route_data (jsonb, full route information including polyline and safety score)
  - status (text: pending, in_progress, completed, emergency)
  - started_at (timestamp)
  - completed_at (timestamp, nullable)
  - safety_score (integer)
  - created_at (timestamp)

- `trip_shares` - Manages live trip sharing with contacts
  - id (uuid, primary key)
  - trip_id (uuid, references trips)
  - shared_with_contact_id (uuid, references emergency_contacts)
  - share_token (text, unique token for public access)
  - is_active (boolean)
  - created_at (timestamp)
  - expires_at (timestamp)

- `sos_alerts` - Tracks SOS emergency alerts
  - id (uuid, primary key)
  - user_id (uuid, references auth.users)
  - trip_id (uuid, nullable, references trips)
  - lat (numeric)
  - lng (numeric)
  - status (text: active, resolved, false_alarm)
  - alert_type (text: manual, auto_fall, auto_deviation)
  - notes (text, nullable)
  - created_at (timestamp)
  - resolved_at (timestamp, nullable)

- `safety_points` - Stores safety-relevant locations (police, hospitals, hazards)
  - id (uuid, primary key)
  - type (text: police, hospital, hazard, unsafe_area)
  - name (text)
  - lat (numeric)
  - lng (numeric)
  - description (text, nullable)
  - severity (integer, for hazards/unsafe areas)
  - is_active (boolean)
  - created_at (timestamp)
  - updated_at (timestamp)

- `safety_settings` - User preferences for safety features
  - id (uuid, primary key)
  - user_id (uuid, unique, references auth.users)
  - women_safety_mode (boolean, default true)
  - night_mode (boolean)
  - share_trip_automatically (boolean)
  - auto_sos_on_deviation (boolean)
  - deviation_threshold_meters (integer, default 500)
  - created_at (timestamp)
  - updated_at (timestamp)

2. Security
- Enable RLS on all tables with user_id
- Policies allow authenticated users to access only their own data
- Safety points are public (no user_id, read by all)
- Trip shares have special access for share_token holders (anon access for shared trips)

3. Indexes
- Index on user_id for all user-scoped tables
- Index on trip_id for trip_shares and sos_alerts
- Index on location type and coordinates for safety_points
*/

-- Emergency Contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  relationship text NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_contacts" ON emergency_contacts;
CREATE POLICY "select_own_contacts" ON emergency_contacts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_contacts" ON emergency_contacts;
CREATE POLICY "insert_own_contacts" ON emergency_contacts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_contacts" ON emergency_contacts;
CREATE POLICY "update_own_contacts" ON emergency_contacts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_contacts" ON emergency_contacts;
CREATE POLICY "delete_own_contacts" ON emergency_contacts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Trips
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  source_address text NOT NULL,
  source_lat numeric NOT NULL,
  source_lng numeric NOT NULL,
  destination_address text NOT NULL,
  dest_lat numeric NOT NULL,
  dest_lng numeric NOT NULL,
  route_data jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'emergency')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  safety_score integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_trips" ON trips;
CREATE POLICY "select_own_trips" ON trips FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_trips" ON trips;
CREATE POLICY "insert_own_trips" ON trips FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_trips" ON trips;
CREATE POLICY "update_own_trips" ON trips FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_trips" ON trips;
CREATE POLICY "delete_own_trips" ON trips FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Trip Shares (allows anon access for shared trips)
CREATE TABLE IF NOT EXISTS trip_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  shared_with_contact_id uuid REFERENCES emergency_contacts(id) ON DELETE SET NULL,
  share_token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours')
);

ALTER TABLE trip_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_shares" ON trip_shares;
CREATE POLICY "select_own_shares" ON trip_shares FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM trips WHERE trips.id = trip_shares.trip_id AND trips.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_shares" ON trip_shares;
CREATE POLICY "insert_own_shares" ON trip_shares FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM trips WHERE trips.id = trip_shares.trip_id AND trips.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_shares" ON trip_shares;
CREATE POLICY "update_own_shares" ON trip_shares FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM trips WHERE trips.id = trip_shares.trip_id AND trips.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM trips WHERE trips.id = trip_shares.trip_id AND trips.user_id = auth.uid())
  );

-- Anon access for shared trips via token
DROP POLICY IF EXISTS "select_shared_trip" ON trip_shares;
CREATE POLICY "select_shared_trip" ON trip_shares FOR SELECT
  TO anon, authenticated USING (is_active = true AND expires_at > now());

DROP POLICY IF EXISTS "delete_own_shares" ON trip_shares;
CREATE POLICY "delete_own_shares" ON trip_shares FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM trips WHERE trips.id = trip_shares.trip_id AND trips.user_id = auth.uid())
  );

-- SOS Alerts
CREATE TABLE IF NOT EXISTS sos_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id uuid REFERENCES trips(id) ON DELETE SET NULL,
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'false_alarm')),
  alert_type text NOT NULL DEFAULT 'manual' CHECK (alert_type IN ('manual', 'auto_fall', 'auto_deviation')),
  notes text,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE sos_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_alerts" ON sos_alerts;
CREATE POLICY "select_own_alerts" ON sos_alerts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_alerts" ON sos_alerts;
CREATE POLICY "insert_own_alerts" ON sos_alerts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_alerts" ON sos_alerts;
CREATE POLICY "update_own_alerts" ON sos_alerts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Safety Points (public, no user ownership)
CREATE TABLE IF NOT EXISTS safety_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('police', 'hospital', 'hazard', 'unsafe_area')),
  name text NOT NULL,
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  description text,
  severity integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE safety_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_safety_points" ON safety_points;
CREATE POLICY "read_safety_points" ON safety_points FOR SELECT
  TO anon, authenticated USING (is_active = true);

-- Safety Settings (user preferences)
CREATE TABLE IF NOT EXISTS safety_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  women_safety_mode boolean DEFAULT true,
  night_mode boolean DEFAULT false,
  share_trip_automatically boolean DEFAULT false,
  auto_sos_on_deviation boolean DEFAULT false,
  deviation_threshold_meters integer DEFAULT 500,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE safety_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_settings" ON safety_settings;
CREATE POLICY "select_own_settings" ON safety_settings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_settings" ON safety_settings;
CREATE POLICY "insert_own_settings" ON safety_settings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_settings" ON safety_settings;
CREATE POLICY "update_own_settings" ON safety_settings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trip_shares_trip_id ON trip_shares(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_shares_token ON trip_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_user_id ON sos_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_trip_id ON sos_alerts(trip_id);
CREATE INDEX IF NOT EXISTS idx_safety_points_type ON safety_points(type);
CREATE INDEX IF NOT EXISTS idx_safety_points_location ON safety_points(lat, lng);
CREATE INDEX IF NOT EXISTS idx_safety_settings_user_id ON safety_settings(user_id);
