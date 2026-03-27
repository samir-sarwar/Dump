package com.dump.apigateway.dto;

public record CommentResponseDto(String id, String mediaId, String userId, String text, String createdAt, UserSummaryDto user) {}
