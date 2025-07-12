-- Add status to items
ALTER TABLE items ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'available';

-- Add delivery method, chat thread, and confirmation fields to swaps
ALTER TABLE swaps ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(20); -- 'meetup' or 'shipping'
ALTER TABLE swaps ADD COLUMN IF NOT EXISTS chat_thread TEXT;
ALTER TABLE swaps ADD COLUMN IF NOT EXISTS requester_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE swaps ADD COLUMN IF NOT EXISTS responder_confirmed BOOLEAN DEFAULT FALSE; 