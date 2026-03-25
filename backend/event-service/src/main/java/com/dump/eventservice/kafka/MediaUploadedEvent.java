package com.dump.eventservice.kafka;

public record MediaUploadedEvent(
        String mediaId,
        String eventId,
        String userId,
        String mediaType,
        String timestamp
) {
}
