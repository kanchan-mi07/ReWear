-- Swaps table for barter system
CREATE TABLE IF NOT EXISTS swaps (
  id SERIAL PRIMARY KEY,
  requester_id INTEGER NOT NULL REFERENCES users(id),
  responder_id INTEGER NOT NULL REFERENCES users(id),
  requester_item_id INTEGER NOT NULL REFERENCES items(id),
  responder_item_id INTEGER NOT NULL REFERENCES items(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, accepted, declined, completed, cancelled
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for quick lookup
CREATE INDEX IF NOT EXISTS idx_swaps_requester_id ON swaps(requester_id);
CREATE INDEX IF NOT EXISTS idx_swaps_responder_id ON swaps(responder_id); 