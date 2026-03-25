package com.dump.authservice.grpc;

import com.dump.authservice.entity.User;

import java.util.Objects;

public final class AuthProtoMapper {

    private AuthProtoMapper() {
        // Utility class
    }

    public static UserProfile toProto(User user, int followerCount, int clippingsCount) {
        return UserProfile.newBuilder()
                .setId(user.getId().toString())
                .setName(Objects.toString(user.getName(), ""))
                .setUsername(Objects.toString(user.getUsername(), ""))
                .setEmail(Objects.toString(user.getEmail(), ""))
                .setBio(Objects.toString(user.getBio(), ""))
                .setAvatarUrl(Objects.toString(user.getAvatarUrl(), ""))
                .setCoverUrl(Objects.toString(user.getCoverUrl(), ""))
                .setStats(UserStats.newBuilder()
                        .setFollowers(followerCount)
                        .setClippings(clippingsCount)
                        .build())
                .setCreatedAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : "")
                .build();
    }
}
