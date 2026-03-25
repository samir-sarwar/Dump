CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    date DATE NOT NULL,
    location VARCHAR(200),
    image_url VARCHAR(500),
    creator_id UUID NOT NULL,
    invite_code VARCHAR(8) NOT NULL UNIQUE,
    media_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_creator ON events(creator_id);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_invite_code ON events(invite_code);
