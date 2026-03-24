package com.dump.authservice.service;

import com.dump.authservice.entity.User;
import com.dump.authservice.repository.FollowRepository;
import com.dump.authservice.repository.UserRepository;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;

    public User getUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new StatusRuntimeException(
                        Status.NOT_FOUND.withDescription("User not found with id: " + id)));
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new StatusRuntimeException(
                        Status.NOT_FOUND.withDescription("User not found with username: " + username)));
    }

    public List<User> getBatchUsers(List<UUID> ids) {
        return userRepository.findAllByIdIn(ids);
    }

    public User updateProfile(UUID userId, String name, String bio, String avatarUrl, String coverUrl) {
        var user = getUserById(userId);

        if (name != null && !name.isEmpty()) {
            user.setName(name);
        }
        if (bio != null) {
            user.setBio(bio);
        }
        if (avatarUrl != null && !avatarUrl.isEmpty()) {
            user.setAvatarUrl(avatarUrl);
        }
        if (coverUrl != null && !coverUrl.isEmpty()) {
            user.setCoverUrl(coverUrl);
        }

        return userRepository.save(user);
    }

    public int getFollowerCount(UUID userId) {
        return followRepository.countByFolloweeId(userId);
    }

    public Page<User> searchByUsername(String query, int page, int size) {
        if (query == null || query.isBlank()) {
            return Page.empty();
        }
        String sanitized = query.startsWith("@") ? query.substring(1) : query;
        if (sanitized.isBlank()) {
            return Page.empty();
        }
        return userRepository.searchByUsernamePrefix(sanitized, PageRequest.of(page, size));
    }
}
