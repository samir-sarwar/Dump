package com.dump.authservice.kafka;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthKafkaProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishUserRegistered(UUID userId) {
        var payload = Map.of(
                "userId", userId.toString(),
                "timestamp", Instant.now().toString()
        );
        kafkaTemplate.send("user.registered", userId.toString(), payload);
    }

    public void publishUserFollowed(UUID followerId, UUID followeeId) {
        var payload = Map.of(
                "followerId", followerId.toString(),
                "followeeId", followeeId.toString(),
                "timestamp", Instant.now().toString()
        );
        kafkaTemplate.send("user.followed", followerId.toString(), payload);
    }

    public void publishUserUnfollowed(UUID followerId, UUID followeeId) {
        var payload = Map.of(
                "followerId", followerId.toString(),
                "followeeId", followeeId.toString(),
                "timestamp", Instant.now().toString()
        );
        kafkaTemplate.send("user.unfollowed", followerId.toString(), payload);
    }
}
