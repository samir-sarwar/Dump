package com.dump.mediaservice.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MediaKafkaProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishMediaUploaded(UUID mediaId, UUID eventId, UUID userId, String mediaType) {
        var event = Map.of(
                "mediaId", mediaId.toString(),
                "eventId", eventId.toString(),
                "userId", userId.toString(),
                "mediaType", mediaType
        );

        kafkaTemplate.send("media.uploaded", mediaId.toString(), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish media.uploaded event for mediaId={}", mediaId, ex);
                    } else {
                        log.info("Published media.uploaded event for mediaId={}", mediaId);
                    }
                });
    }
}
