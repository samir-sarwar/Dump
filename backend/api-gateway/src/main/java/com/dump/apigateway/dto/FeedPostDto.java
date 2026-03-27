package com.dump.apigateway.dto;

public record FeedPostDto(String id, String eventId, String title, String date, String imageUrl, int likes, int comments) {}
