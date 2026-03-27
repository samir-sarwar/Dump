package com.dump.apigateway.dto;

public record AuthResponseDto(String accessToken, String refreshToken, UserProfileDto user) {}
