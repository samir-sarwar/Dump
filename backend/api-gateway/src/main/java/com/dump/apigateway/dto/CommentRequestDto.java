package com.dump.apigateway.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentRequestDto(@NotBlank @Size(max = 1000) String text) {}
