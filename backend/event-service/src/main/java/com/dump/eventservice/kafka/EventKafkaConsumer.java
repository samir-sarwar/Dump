package com.dump.eventservice.kafka;

import com.dump.eventservice.service.EventManagementService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventKafkaConsumer {

    private final EventManagementService eventManagementService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "media.uploaded", groupId = "event-service-group")
    public void consume(String message) {
        try {
            var event = objectMapper.readValue(message, MediaUploadedEvent.class);
            var eventId = UUID.fromString(event.eventId());
            eventManagementService.updateMediaCount(eventId, 1);
            log.info("Processed media.uploaded for eventId={}", eventId);
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            log.error("Non-retryable deserialization error for media.uploaded message: {}", message, e);
            throw new RuntimeException("Failed to deserialize media.uploaded message", e);
        } catch (Exception e) {
            log.error("Failed to process media.uploaded message: {}", message, e);
            throw new RuntimeException("Failed to process media.uploaded message", e);
        }
    }
}
