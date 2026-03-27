package com.dump.apigateway.dto;

import jakarta.validation.constraints.NotBlank;

public record CollectionItemRequestDto(@NotBlank String mediaId) {}
