CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    user_id UUID NOT NULL,
    image_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    caption VARCHAR(1000),
    location VARCHAR(200),
    type VARCHAR(10) NOT NULL DEFAULT 'PHOTO',
    aspect_ratio DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    audio_attribution VARCHAR(200),
    filename VARCHAR(255),
    s3_key VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    like_count INT NOT NULL DEFAULT 0,
    comment_count INT NOT NULL DEFAULT 0,
    is_highlight BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_event ON media(event_id);
CREATE INDEX idx_media_user ON media(user_id);
CREATE INDEX idx_media_event_type ON media(event_id, type);
CREATE INDEX idx_media_status ON media(status);
