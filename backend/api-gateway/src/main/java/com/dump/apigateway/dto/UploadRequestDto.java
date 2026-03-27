package com.dump.apigateway.dto;

import jakarta.validation.constraints.NotBlank;

public record UploadRequestDto(
        @NotBlank String eventId,
        String caption,
        String location,
        @NotBlank String type,
        @NotBlank String filename,
        double aspectRatio,
        String audioAttribution
) {}
