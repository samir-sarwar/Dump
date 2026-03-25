package com.dump.authservice.grpc;

import com.dump.authservice.service.AuthenticationService;
import com.dump.authservice.service.FollowService;
import com.dump.authservice.service.JwtService;
import com.dump.authservice.service.UserService;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@GrpcService
@RequiredArgsConstructor
@Slf4j
public class AuthGrpcService extends AuthServiceGrpc.AuthServiceImplBase {

    private static UUID parseUuid(String value, String fieldName) {
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException e) {
            throw new StatusRuntimeException(
                    Status.INVALID_ARGUMENT.withDescription("Invalid UUID for " + fieldName + ": " + value));
        }
    }

    private final AuthenticationService authService;
    private final UserService userService;
    private final FollowService followService;
    private final JwtService jwtService;

    @Override
    public void register(RegisterRequest request, StreamObserver<AuthResponse> responseObserver) {
        try {
            var result = authService.register(
                    request.getName(),
                    request.getUsername(),
                    request.getEmail(),
                    request.getPassword()
            );

            int followerCount = followService.countFollowers(result.user().getId());

            var response = AuthResponse.newBuilder()
                    .setAccessToken(result.accessToken())
                    .setRefreshToken(result.refreshToken())
                    .setUser(AuthProtoMapper.toProto(result.user(), followerCount, 0))
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL
                    .withDescription("Internal server error")
                    .asRuntimeException());
        }
    }

    @Override
    public void login(LoginRequest request, StreamObserver<AuthResponse> responseObserver) {
        try {
            var result = authService.login(request.getEmail(), request.getPassword());

            int followerCount = followService.countFollowers(result.user().getId());

            var response = AuthResponse.newBuilder()
                    .setAccessToken(result.accessToken())
                    .setRefreshToken(result.refreshToken())
                    .setUser(AuthProtoMapper.toProto(result.user(), followerCount, 0))
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL
                    .withDescription("Internal server error")
                    .asRuntimeException());
        }
    }

    @Override
    public void socialLogin(SocialLoginRequest request, StreamObserver<AuthResponse> responseObserver) {
        try {
            var result = authService.socialLogin(
                    request.getProvider().name(),
                    request.getIdToken()
            );

            int followerCount = followService.countFollowers(result.user().getId());

            var response = AuthResponse.newBuilder()
                    .setAccessToken(result.accessToken())
                    .setRefreshToken(result.refreshToken())
                    .setUser(AuthProtoMapper.toProto(result.user(), followerCount, 0))
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL
                    .withDescription("Internal server error")
                    .asRuntimeException());
        }
    }

    @Override
    public void refreshToken(RefreshTokenRequest request, StreamObserver<AuthResponse> responseObserver) {
        try {
            var result = authService.refreshToken(request.getRefreshToken());

            int followerCount = followService.countFollowers(result.user().getId());

            var response = AuthResponse.newBuilder()
                    .setAccessToken(result.accessToken())
                    .setRefreshToken(result.refreshToken())
                    .setUser(AuthProtoMapper.toProto(result.user(), followerCount, 0))
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL
                    .withDescription("Internal server error")
                    .asRuntimeException());
        }
    }

    @Override
    public void validateToken(ValidateTokenRequest request, StreamObserver<ValidateTokenResponse> responseObserver) {
        try {
            boolean valid = jwtService.validateToken(request.getToken());

            var builder = ValidateTokenResponse.newBuilder().setValid(valid);

            if (valid) {
                builder.setUserId(jwtService.extractUserId(request.getToken()));
                builder.setUsername(jwtService.extractUsername(request.getToken()));
            }

            responseObserver.onNext(builder.build());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL
                    .withDescription("Internal server error")
                    .asRuntimeException());
        }
    }

    @Override
    public void getUser(GetUserRequest request, StreamObserver<UserProfile> responseObserver) {
        try {
            var user = userService.getUserById(parseUuid(request.getUserId(), "userId"));
            int followerCount = followService.countFollowers(user.getId());

            responseObserver.onNext(AuthProtoMapper.toProto(user, followerCount, 0));
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL
                    .withDescription("Internal server error")
                    .asRuntimeException());
        }
    }

    @Override
    public void getUserByUsername(GetUserByUsernameRequest request, StreamObserver<UserProfile> responseObserver) {
        try {
            var user = userService.getUserByUsername(request.getUsername());
            int followerCount = followService.countFollowers(user.getId());

            responseObserver.onNext(AuthProtoMapper.toProto(user, followerCount, 0));
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL
                    .withDescription("Internal server error")
                    .asRuntimeException());
        }
    }

    @Override
    public void getBatchUsers(GetBatchUsersRequest request, StreamObserver<UserListResponse> responseObserver) {
        try {
            List<UUID> ids = request.getUserIdsList().stream()
                    .map(id -> parseUuid(id, "userId"))
                    .toList();

            List<com.dump.authservice.entity.User> users = userService.getBatchUsers(ids);
            Map<UUID, Integer> followerCounts = followService.countFollowersBatch(
                    users.stream().map(com.dump.authservice.entity.User::getId).toList());

            var builder = UserListResponse.newBuilder()
                    .setTotal(users.size());

            for (com.dump.authservice.entity.User user : users) {
                int followerCount = followerCounts.getOrDefault(user.getId(), 0);
                builder.addUsers(AuthProtoMapper.toProto(user, followerCount, 0));
            }

            responseObserver.onNext(builder.build());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL
                    .withDescription("Internal server error")
                    .asRuntimeException());
        }
    }

    @Override
    public void updateProfile(UpdateProfileRequest request, StreamObserver<UserProfile> responseObserver) {
        try {
            var user = userService.updateProfile(
                    parseUuid(request.getUserId(), "userId"),
                    request.getName(),
                    request.getBio(),
                    request.getAvatarUrl(),
                    request.getCoverUrl()
            );
            int followerCount = followService.countFollowers(user.getId());

            responseObserver.onNext(AuthProtoMapper.toProto(user, followerCount, 0));
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL
                    .withDescription("Internal server error")
                    .asRuntimeException());
        }
    }

    @Override
    public void follow(FollowRequest request, StreamObserver<FollowResponse> responseObserver) {
        try {
            followService.follow(
                    parseUuid(request.getFollowerId(), "followerId"),
                    parseUuid(request.getFolloweeId(), "followeeId")
            );

            var response = FollowResponse.newBuilder()
                    .setSuccess(true)
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL
                    .withDescription("Internal server error")
                    .asRuntimeException());
        }
    }

    @Override
    public void unfollow(FollowRequest request, StreamObserver<FollowResponse> responseObserver) {
        try {
            followService.unfollow(
                    parseUuid(request.getFollowerId(), "followerId"),
                    parseUuid(request.getFolloweeId(), "followeeId")
            );

            var response = FollowResponse.newBuilder()
                    .setSuccess(true)
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL
                    .withDescription("Internal server error")
                    .asRuntimeException());
        }
    }

    @Override
    public void getFollowers(GetFollowersRequest request, StreamObserver<UserListResponse> responseObserver) {
        try {
            List<com.dump.authservice.entity.User> users = followService.getFollowers(
                    parseUuid(request.getUserId(), "userId"),
                    request.getPage(),
                    request.getSize()
            );

            Map<UUID, Integer> followerCounts = followService.countFollowersBatch(
                    users.stream().map(com.dump.authservice.entity.User::getId).toList());

            var builder = UserListResponse.newBuilder()
                    .setTotal(users.size());

            for (com.dump.authservice.entity.User user : users) {
                int followerCount = followerCounts.getOrDefault(user.getId(), 0);
                builder.addUsers(AuthProtoMapper.toProto(user, followerCount, 0));
            }

            responseObserver.onNext(builder.build());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL
                    .withDescription("Internal server error")
                    .asRuntimeException());
        }
    }

    @Override
    public void getFollowing(GetFollowingRequest request, StreamObserver<UserListResponse> responseObserver) {
        try {
            List<com.dump.authservice.entity.User> users = followService.getFollowing(
                    parseUuid(request.getUserId(), "userId"),
                    request.getPage(),
                    request.getSize()
            );

            Map<UUID, Integer> followerCounts = followService.countFollowersBatch(
                    users.stream().map(com.dump.authservice.entity.User::getId).toList());

            var builder = UserListResponse.newBuilder()
                    .setTotal(users.size());

            for (com.dump.authservice.entity.User user : users) {
                int followerCount = followerCounts.getOrDefault(user.getId(), 0);
                builder.addUsers(AuthProtoMapper.toProto(user, followerCount, 0));
            }

            responseObserver.onNext(builder.build());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL
                    .withDescription("Internal server error")
                    .asRuntimeException());
        }
    }

    @Override
    public void getFriends(GetFriendsRequest request, StreamObserver<FriendListResponse> responseObserver) {
        try {
            List<com.dump.authservice.entity.User> friends = followService.getFriends(parseUuid(request.getUserId(), "userId"));

            Map<UUID, Integer> followerCounts = followService.countFollowersBatch(
                    friends.stream().map(com.dump.authservice.entity.User::getId).toList());

            var builder = FriendListResponse.newBuilder();

            for (com.dump.authservice.entity.User friend : friends) {
                int followerCount = followerCounts.getOrDefault(friend.getId(), 0);
                builder.addFriends(AuthProtoMapper.toProto(friend, followerCount, 0));
            }

            responseObserver.onNext(builder.build());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL
                    .withDescription("Internal server error")
                    .asRuntimeException());
        }
    }

    @Override
    public void searchUsers(SearchUsersRequest request, StreamObserver<UserListResponse> responseObserver) {
        try {
            org.springframework.data.domain.Page<com.dump.authservice.entity.User> page = userService.searchByUsername(
                    request.getQuery(),
                    request.getPage(),
                    request.getSize() > 0 ? request.getSize() : 20
            );

            List<com.dump.authservice.entity.User> searchResults = page.getContent();
            Map<UUID, Integer> followerCounts = followService.countFollowersBatch(
                    searchResults.stream().map(com.dump.authservice.entity.User::getId).toList());

            var builder = UserListResponse.newBuilder()
                    .setTotal((int) page.getTotalElements());

            for (com.dump.authservice.entity.User user : searchResults) {
                int followerCount = followerCounts.getOrDefault(user.getId(), 0);
                builder.addUsers(AuthProtoMapper.toProto(user, followerCount, 0));
            }

            responseObserver.onNext(builder.build());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL
                    .withDescription("Internal server error")
                    .asRuntimeException());
        }
    }

    @Override
    public void checkFollow(CheckFollowRequest request, StreamObserver<CheckFollowResponse> responseObserver) {
        try {
            boolean following = followService.isFollowing(
                    parseUuid(request.getFollowerId(), "followerId"),
                    parseUuid(request.getFolloweeId(), "followeeId")
            );

            responseObserver.onNext(CheckFollowResponse.newBuilder()
                    .setFollowing(following)
                    .build());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL
                    .withDescription("Internal server error")
                    .asRuntimeException());
        }
    }
}
