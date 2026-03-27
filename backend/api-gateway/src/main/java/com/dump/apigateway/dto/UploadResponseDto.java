package com.dump.apigateway.dto;

public record UploadResponseDto(String presignedUploadUrl, String mediaId) {}
