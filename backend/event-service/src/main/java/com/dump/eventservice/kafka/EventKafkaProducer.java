package com.dump.eventservice.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventKafkaProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishEventCreated(UUID eventId, UUID creatorId, String title) {
        var payload = Map.of(
                "eventId", eventId.toString(),
                "creatorId", creatorId.toString(),
                "title", title
        );
        kafkaTemplate.send("event.created", eventId.toString(), payload);
        log.info("Published event.created for eventId={}", eventId);
    }
}
