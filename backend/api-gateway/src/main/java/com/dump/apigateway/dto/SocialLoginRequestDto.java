package com.dump.apigateway.dto;

import jakarta.validation.constraints.NotBlank;

public record SocialLoginRequestDto(@NotBlank String provider, @NotBlank String idToken) {}
