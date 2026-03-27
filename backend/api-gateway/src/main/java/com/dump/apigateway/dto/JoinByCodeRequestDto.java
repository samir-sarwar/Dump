package com.dump.apigateway.dto;

import jakarta.validation.constraints.NotBlank;

public record JoinByCodeRequestDto(@NotBlank String code) {}
