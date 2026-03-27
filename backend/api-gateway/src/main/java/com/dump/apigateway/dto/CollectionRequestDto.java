package com.dump.apigateway.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CollectionRequestDto(@NotBlank @Size(max = 100) String title) {}
