package com.dump.apigateway.mapper;

import com.dump.apigateway.dto.*;
import com.dump.authservice.grpc.AuthResponse;
import com.dump.authservice.grpc.UserProfile;
import com.dump.authservice.grpc.UserStats;

import java.util.List;

public final class AuthMapper {

    private AuthMapper() {}

    public static AuthResponseDto toDto(AuthResponse proto) {
        return new AuthResponseDto(
                proto.getAccessToken(),
                proto.getRefreshToken(),
                toDto(proto.getUser())
        );
    }

    public static UserProfileDto toDto(UserProfile proto) {
        UserStats stats = proto.getStats();
        return new UserProfileDto(
                proto.getId(),
                proto.getName(),
                proto.getUsername(),
                proto.getEmail(),
                proto.getBio(),
                proto.getAvatarUrl(),
                proto.getCoverUrl(),
                new UserStatsDto(stats.getClippings(), stats.getFollowers(), 0),
                proto.getCreatedAt()
        );
    }

    public static List<UserProfileDto> toDtoList(List<UserProfile> protos) {
        return protos.stream().map(AuthMapper::toDto).toList();
    }
}
