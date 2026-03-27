package com.dump.apigateway.controller;

import com.dump.apigateway.dto.*;
import com.dump.apigateway.mapper.AuthMapper;
import jakarta.validation.Valid;
import com.dump.authservice.grpc.*;
import com.dump.eventservice.grpc.CountUserEventsRequest;
import com.dump.eventservice.grpc.EventServiceGrpc;
import com.dump.mediaservice.grpc.CountUserClippingsRequest;
import com.dump.mediaservice.grpc.MediaServiceGrpc;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GrpcClient("auth-service")
    private AuthServiceGrpc.AuthServiceBlockingStub authStub;

    @GrpcClient("media-service")
    private MediaServiceGrpc.MediaServiceBlockingStub mediaStub;

    @GrpcClient("event-service")
    private EventServiceGrpc.EventServiceBlockingStub eventStub;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(@Valid @RequestBody RegisterRequestDto dto) {
        AuthResponse response = authStub.register(RegisterRequest.newBuilder()
                .setName(dto.name())
                .setUsername(dto.username())
                .setEmail(dto.email())
                .setPassword(dto.password())
                .build());
        return ResponseEntity.ok(AuthMapper.toDto(response));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginRequestDto dto) {
        AuthResponse response = authStub.login(LoginRequest.newBuilder()
                .setEmail(dto.email())
                .setPassword(dto.password())
                .build());
        return ResponseEntity.ok(AuthMapper.toDto(response));
    }

    @PostMapping("/social-login")
    public ResponseEntity<AuthResponseDto> socialLogin(@Valid @RequestBody SocialLoginRequestDto dto) {
        AuthProvider provider = AuthProvider.valueOf(dto.provider().toUpperCase());
        AuthResponse response = authStub.socialLogin(SocialLoginRequest.newBuilder()
                .setProvider(provider)
                .setIdToken(dto.idToken())
                .build());
        return ResponseEntity.ok(AuthMapper.toDto(response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDto> refreshToken(@Valid @RequestBody RefreshTokenRequestDto dto) {
        AuthResponse response = authStub.refreshToken(RefreshTokenRequest.newBuilder()
                .setRefreshToken(dto.refreshToken())
                .build());
        return ResponseEntity.ok(AuthMapper.toDto(response));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getMe(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(getUserWithStats(userId));
    }

    @GetMapping("/users/search")
    public ResponseEntity<Map<String, Object>> searchUsers(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UserListResponse response = authStub.searchUsers(SearchUsersRequest.newBuilder()
                .setQuery(query).setPage(page).setSize(size).build());
        return ResponseEntity.ok(Map.of(
                "users", AuthMapper.toDtoList(response.getUsersList()),
                "total", response.getTotal()
        ));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserProfileDto> getUser(@PathVariable String userId) {
        return ResponseEntity.ok(getUserWithStats(userId));
    }

    @PostMapping("/users/batch")
    public ResponseEntity<List<UserProfileDto>> getBatchUsers(@RequestBody Map<String, List<String>> body) {
        List<String> userIds = body.get("userIds");
        if (userIds == null || userIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        UserListResponse response = authStub.getBatchUsers(GetBatchUsersRequest.newBuilder()
                .addAllUserIds(userIds).build());
        return ResponseEntity.ok(AuthMapper.toDtoList(response.getUsersList()));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDto> updateProfile(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody UpdateProfileRequestDto dto) {
        UserProfile profile = authStub.updateProfile(UpdateProfileRequest.newBuilder()
                .setUserId(userId)
                .setName(dto.name() != null ? dto.name() : "")
                .setBio(dto.bio() != null ? dto.bio() : "")
                .setAvatarUrl(dto.avatarUrl() != null ? dto.avatarUrl() : "")
                .setCoverUrl(dto.coverUrl() != null ? dto.coverUrl() : "")
                .build());
        return ResponseEntity.ok(AuthMapper.toDto(profile));
    }

    @PostMapping("/follow/{targetUserId}")
    public ResponseEntity<Map<String, Boolean>> follow(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String targetUserId) {
        FollowResponse response = authStub.follow(FollowRequest.newBuilder()
                .setFollowerId(userId)
                .setFolloweeId(targetUserId)
                .build());
        return ResponseEntity.ok(Map.of("success", response.getSuccess()));
    }

    @DeleteMapping("/follow/{targetUserId}")
    public ResponseEntity<Map<String, Boolean>> unfollow(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String targetUserId) {
        FollowResponse response = authStub.unfollow(FollowRequest.newBuilder()
                .setFollowerId(userId)
                .setFolloweeId(targetUserId)
                .build());
        return ResponseEntity.ok(Map.of("success", response.getSuccess()));
    }

    @GetMapping("/followers/{userId}")
    public ResponseEntity<Map<String, Object>> getFollowers(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UserListResponse response = authStub.getFollowers(GetFollowersRequest.newBuilder()
                .setUserId(userId).setPage(page).setSize(size).build());
        return ResponseEntity.ok(Map.of(
                "users", AuthMapper.toDtoList(response.getUsersList()),
                "total", response.getTotal()
        ));
    }

    @GetMapping("/following/{userId}")
    public ResponseEntity<Map<String, Object>> getFollowing(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UserListResponse response = authStub.getFollowing(GetFollowingRequest.newBuilder()
                .setUserId(userId).setPage(page).setSize(size).build());
        return ResponseEntity.ok(Map.of(
                "users", AuthMapper.toDtoList(response.getUsersList()),
                "total", response.getTotal()
        ));
    }

    @GetMapping("/friends")
    public ResponseEntity<List<UserProfileDto>> getFriends(@RequestHeader("X-User-Id") String userId) {
        FriendListResponse response = authStub.getFriends(GetFriendsRequest.newBuilder()
                .setUserId(userId).build());
        return ResponseEntity.ok(AuthMapper.toDtoList(response.getFriendsList()));
    }

    @GetMapping("/follow/check/{targetUserId}")
    public ResponseEntity<Map<String, Boolean>> checkFollow(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String targetUserId) {
        CheckFollowResponse response = authStub.checkFollow(CheckFollowRequest.newBuilder()
                .setFollowerId(userId).setFolloweeId(targetUserId).build());
        return ResponseEntity.ok(Map.of("following", response.getFollowing()));
    }

    private UserProfileDto getUserWithStats(String userId) {
        UserProfile profile = authStub.getUser(GetUserRequest.newBuilder()
                .setUserId(userId).build());

        int clippingsCount = 0;
        try {
            var clippingsResponse = mediaStub.countUserClippings(
                    CountUserClippingsRequest.newBuilder().setUserId(userId).build());
            clippingsCount = clippingsResponse.getCount();
        } catch (Exception ignored) {
        }

        int eventsCount = 0;
        try {
            var eventsResponse = eventStub.countUserEvents(
                    CountUserEventsRequest.newBuilder().setUserId(userId).build());
            eventsCount = eventsResponse.getCount();
        } catch (Exception ignored) {
        }

        UserProfileDto dto = AuthMapper.toDto(profile);
        return new UserProfileDto(
                dto.id(), dto.name(), dto.username(), dto.email(),
                dto.bio(), dto.avatarUrl(), dto.coverUrl(),
                new UserStatsDto(clippingsCount, dto.stats().followers(), eventsCount),
                dto.createdAt()
        );
    }
}
