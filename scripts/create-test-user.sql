-- Create a test user with password: test123
-- This password hash was generated using bcrypt with salt rounds 10
INSERT INTO users (email, password_hash, name, points, is_admin) VALUES
  ('test@example.com', '$2b$10$s7DioE/PiLseBuAvdNT4cOTM2rvRiyud0lQTQdHAZNGohRmAhslm.', 'Test User', 100, FALSE)
ON CONFLICT (email) DO NOTHING;

-- Create another test user with password: admin123
INSERT INTO users (email, password_hash, name, points, is_admin) VALUES
  ('admin@rewear.com', '$2b$10$s7DioE/PiLseBuAvdNT4cOTM2rvRiyud0lQTQdHAZNGohRmAhslm.', 'Admin User', 1000, TRUE)
ON CONFLICT (email) DO NOTHING; 