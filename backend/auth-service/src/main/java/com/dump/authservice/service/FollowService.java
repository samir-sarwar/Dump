package com.dump.authservice.service;

import com.dump.authservice.entity.Follow;
import com.dump.authservice.entity.User;
import com.dump.authservice.kafka.AuthKafkaProducer;
import com.dump.authservice.repository.FollowRepository;
import com.dump.authservice.repository.UserRepository;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final AuthKafkaProducer authKafkaProducer;

    public void follow(UUID followerId, UUID followeeId) {
        var follower = userRepository.findById(followerId)
                .orElseThrow(() -> new StatusRuntimeException(
                        Status.NOT_FOUND.withDescription("Follower user not found")));
        var followee = userRepository.findById(followeeId)
                .orElseThrow(() -> new StatusRuntimeException(
                        Status.NOT_FOUND.withDescription("Followee user not found")));

        if (followRepository.existsByFollowerIdAndFolloweeId(followerId, followeeId)) {
            throw new StatusRuntimeException(
                    Status.ALREADY_EXISTS.withDescription("Already following this user"));
        }

        var follow = Follow.builder()
                .follower(follower)
                .followee(followee)
                .build();
        followRepository.save(follow);

        authKafkaProducer.publishUserFollowed(followerId, followeeId);
    }

    public void unfollow(UUID followerId, UUID followeeId) {
        var follow = followRepository.findByFollowerIdAndFolloweeId(followerId, followeeId)
                .orElseThrow(() -> new StatusRuntimeException(
                        Status.NOT_FOUND.withDescription("Follow relationship not found")));
        followRepository.delete(follow);
        authKafkaProducer.publishUserUnfollowed(followerId, followeeId);
    }

    public List<User> getFollowers(UUID userId, int page, int size) {
        var pageable = PageRequest.of(page, size);
        return followRepository.findByFolloweeId(userId, pageable)
                .map(Follow::getFollower)
                .getContent();
    }

    public List<User> getFollowing(UUID userId, int page, int size) {
        var pageable = PageRequest.of(page, size);
        return followRepository.findByFollowerId(userId, pageable)
                .map(Follow::getFollowee)
                .getContent();
    }

    public List<User> getFriends(UUID userId) {
        return followRepository.findMutualFollows(userId);
    }

    public int countFollowers(UUID userId) {
        return followRepository.countByFolloweeId(userId);
    }

    public Map<UUID, Integer> countFollowersBatch(List<UUID> userIds) {
        if (userIds.isEmpty()) return Collections.emptyMap();
        return followRepository.countFollowersBatch(userIds).stream()
                .collect(Collectors.toMap(
                        row -> (UUID) row[0],
                        row -> ((Long) row[1]).intValue()
                ));
    }

    public boolean isFollowing(UUID followerId, UUID followeeId) {
        return followRepository.existsByFollowerIdAndFolloweeId(followerId, followeeId);
    }
}
