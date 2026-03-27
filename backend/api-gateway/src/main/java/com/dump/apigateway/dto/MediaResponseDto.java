package com.dump.apigateway.dto;

public record MediaResponseDto(
        String id,
        String imageUrl,
        String thumbnailUrl,
        String eventId,
        String userId,
        String caption,
        String location,
        String type,
        double aspectRatio,
        String audioAttribution,
        int likeCount,
        int commentCount,
        boolean isHighlight,
        String createdAt,
        UserSummaryDto user
) {}
