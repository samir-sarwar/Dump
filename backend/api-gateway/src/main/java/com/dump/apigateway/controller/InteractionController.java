package com.dump.apigateway.controller;

import com.dump.apigateway.dto.*;
import com.dump.apigateway.mapper.MediaMapper;
import jakarta.validation.Valid;
import com.dump.authservice.grpc.AuthServiceGrpc;
import com.dump.authservice.grpc.GetBatchUsersRequest;
import com.dump.authservice.grpc.UserListResponse;
import com.dump.mediaservice.grpc.*;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/media")
public class InteractionController {

    @GrpcClient("media-service")
    private MediaServiceGrpc.MediaServiceBlockingStub mediaStub;

    @GrpcClient("auth-service")
    private AuthServiceGrpc.AuthServiceBlockingStub authStub;

    @PostMapping("/{mediaId}/like")
    public ResponseEntity<Map<String, Object>> like(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String mediaId) {
        LikeResponse response = mediaStub.like(LikeRequest.newBuilder()
                .setMediaId(mediaId).setUserId(userId).build());
        return ResponseEntity.ok(Map.of("success", response.getSuccess(), "newCount", response.getNewCount()));
    }

    @DeleteMapping("/{mediaId}/like")
    public ResponseEntity<Map<String, Object>> unlike(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String mediaId) {
        LikeResponse response = mediaStub.unlike(LikeRequest.newBuilder()
                .setMediaId(mediaId).setUserId(userId).build());
        return ResponseEntity.ok(Map.of("success", response.getSuccess(), "newCount", response.getNewCount()));
    }

    @PostMapping("/{mediaId}/comment")
    public ResponseEntity<CommentResponseDto> comment(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String mediaId,
            @Valid @RequestBody CommentRequestDto dto) {
        CommentResponse response = mediaStub.comment(CommentRequest.newBuilder()
                .setMediaId(mediaId).setUserId(userId).setText(dto.text()).build());
        UserSummaryDto user = fetchUserSummary(userId);
        return ResponseEntity.ok(MediaMapper.toDto(response, user));
    }

    @GetMapping("/{mediaId}/comments")
    public ResponseEntity<Map<String, Object>> listComments(
            @PathVariable String mediaId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        CommentListResponse response = mediaStub.listComments(ListCommentsRequest.newBuilder()
                .setMediaId(mediaId).setPage(page).setSize(size).build());

        List<CommentResponse> comments = response.getCommentsList();

        // Batch-fetch users for all comments
        Set<String> userIds = comments.stream()
                .map(CommentResponse::getUserId)
                .collect(Collectors.toSet());

        Map<String, UserSummaryDto> userMap = Map.of();
        if (!userIds.isEmpty()) {
            try {
                UserListResponse usersResponse = authStub.getBatchUsers(
                        GetBatchUsersRequest.newBuilder().addAllUserIds(userIds).build());
                userMap = MediaMapper.buildUserMap(usersResponse.getUsersList());
            } catch (Exception ignored) {
            }
        }

        Map<String, UserSummaryDto> finalUserMap = userMap;
        List<CommentResponseDto> enrichedComments = comments.stream()
                .map(c -> MediaMapper.toDto(c, finalUserMap.get(c.getUserId())))
                .toList();

        return ResponseEntity.ok(Map.of(
                "comments", enrichedComments,
                "total", response.getTotal()
        ));
    }

    @PostMapping("/{mediaId}/bookmark")
    public ResponseEntity<Map<String, Boolean>> bookmark(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String mediaId) {
        BookmarkResponse response = mediaStub.bookmark(BookmarkRequest.newBuilder()
                .setMediaId(mediaId).setUserId(userId).build());
        return ResponseEntity.ok(Map.of("success", response.getSuccess()));
    }

    @DeleteMapping("/{mediaId}/bookmark")
    public ResponseEntity<Map<String, Boolean>> removeBookmark(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String mediaId) {
        BookmarkResponse response = mediaStub.removeBookmark(BookmarkRequest.newBuilder()
                .setMediaId(mediaId).setUserId(userId).build());
        return ResponseEntity.ok(Map.of("success", response.getSuccess()));
    }

    @GetMapping("/bookmarks")
    public ResponseEntity<Map<String, Object>> listBookmarks(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        MediaListResponse response = mediaStub.listBookmarks(ListBookmarksRequest.newBuilder()
                .setUserId(userId).setPage(page).setSize(size).build());
        List<MediaResponseDto> dtos = MediaMapper.toDtoList(response.getItemsList());

        // Enrich with user data
        Set<String> mediaUserIds = dtos.stream()
                .filter(d -> d.user() == null)
                .map(MediaResponseDto::userId)
                .filter(id -> id != null && !id.isEmpty())
                .collect(Collectors.toSet());

        if (!mediaUserIds.isEmpty()) {
            try {
                UserListResponse usersResponse = authStub.getBatchUsers(
                        GetBatchUsersRequest.newBuilder().addAllUserIds(mediaUserIds).build());
                Map<String, UserSummaryDto> userMap = MediaMapper.buildUserMap(usersResponse.getUsersList());
                dtos = MediaMapper.enrichWithUsers(dtos, userMap);
            } catch (Exception ignored) {
            }
        }

        return ResponseEntity.ok(Map.of(
                "items", dtos,
                "total", response.getTotal()
        ));
    }

    private UserSummaryDto fetchUserSummary(String userId) {
        try {
            UserListResponse response = authStub.getBatchUsers(
                    GetBatchUsersRequest.newBuilder().addAllUserIds(List.of(userId)).build());
            if (!response.getUsersList().isEmpty()) {
                var u = response.getUsersList().get(0);
                return new UserSummaryDto(u.getId(), u.getName(), u.getUsername(), u.getAvatarUrl());
            }
        } catch (Exception ignored) {
        }
        return null;
    }
}
