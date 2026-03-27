package com.dump.apigateway.dto;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequestDto(
        @Size(max = 100) String name,
        @Size(max = 500) String bio,
        String avatarUrl,
        String coverUrl
) {}
