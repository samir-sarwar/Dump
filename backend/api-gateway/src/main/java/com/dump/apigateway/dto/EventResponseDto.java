package com.dump.apigateway.dto;

public record EventResponseDto(
        String id,
        String title,
        String date,
        String location,
        String imageUrl,
        String creatorId,
        int memberCount,
        int mediaCount,
        String inviteCode,
        String createdAt
) {}
