package com.dump.apigateway.dto;

public record UserProfileDto(
        String id,
        String name,
        String username,
        String email,
        String bio,
        String avatarUrl,
        String coverUrl,
        UserStatsDto stats,
        String createdAt
) {}
