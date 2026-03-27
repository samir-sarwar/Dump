package com.dump.apigateway.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateEventRequestDto(
        @NotBlank @Size(max = 200) String title,
        @NotBlank String date,
        @Size(max = 200) String location,
        String imageUrl
) {}
