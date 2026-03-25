CREATE TABLE event_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_members_event ON event_members(event_id);
CREATE INDEX idx_event_members_user ON event_members(user_id);
