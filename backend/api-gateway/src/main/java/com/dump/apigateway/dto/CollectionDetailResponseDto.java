package com.dump.apigateway.dto;

import java.util.List;

public record CollectionDetailResponseDto(
        String id, String title, String thumbnailUrl, int itemCount,
        List<MediaResponseDto> items, int total) {}
