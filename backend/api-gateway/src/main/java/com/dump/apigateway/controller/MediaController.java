package com.dump.apigateway.controller;

import com.dump.apigateway.dto.*;
import com.dump.apigateway.mapper.MediaMapper;
import com.dump.authservice.grpc.AuthServiceGrpc;
import com.dump.authservice.grpc.GetBatchUsersRequest;
import com.dump.authservice.grpc.UserListResponse;
import com.dump.mediaservice.grpc.*;
import jakarta.validation.Valid;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    @GrpcClient("media-service")
    private MediaServiceGrpc.MediaServiceBlockingStub mediaStub;

    @GrpcClient("auth-service")
    private AuthServiceGrpc.AuthServiceBlockingStub authStub;

    @PostMapping("/upload")
    public ResponseEntity<UploadResponseDto> initiateUpload(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody UploadRequestDto dto) {
        MediaType type = "VIDEO".equalsIgnoreCase(dto.type()) ? MediaType.VIDEO : MediaType.PHOTO;
        UploadMediaResponse response = mediaStub.initiateUpload(UploadMediaRequest.newBuilder()
                .setEventId(dto.eventId())
                .setUserId(userId)
                .setCaption(dto.caption() != null ? dto.caption() : "")
                .setLocation(dto.location() != null ? dto.location() : "")
                .setType(type)
                .setFilename(dto.filename())
                .setAspectRatio(dto.aspectRatio())
                .setAudioAttribution(dto.audioAttribution() != null ? dto.audioAttribution() : "")
                .build());
        return ResponseEntity.ok(MediaMapper.toUploadDto(response));
    }

    @PostMapping("/{mediaId}/confirm")
    public ResponseEntity<MediaResponseDto> confirmUpload(@PathVariable String mediaId) {
        ConfirmUploadResponse response = mediaStub.confirmUpload(ConfirmUploadRequest.newBuilder()
                .setMediaId(mediaId).build());
        MediaResponseDto dto = MediaMapper.toDto(response.getMedia());
        return ResponseEntity.ok(enrichSingleMedia(dto));
    }

    @GetMapping("/{mediaId}")
    public ResponseEntity<MediaResponseDto> getMedia(@PathVariable String mediaId) {
        MediaResponse response = mediaStub.getMedia(GetMediaRequest.newBuilder()
                .setMediaId(mediaId).build());
        MediaResponseDto dto = MediaMapper.toDto(response);
        return ResponseEntity.ok(enrichSingleMedia(dto));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<Map<String, Object>> listEventMedia(
            @PathVariable String eventId,
            @RequestParam(defaultValue = "ALL") String filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        MediaListResponse response = mediaStub.listEventMedia(ListEventMediaRequest.newBuilder()
                .setEventId(eventId).setFilter(filter).setPage(page).setSize(size).build());
        List<MediaResponseDto> dtos = MediaMapper.toDtoList(response.getItemsList());
        return ResponseEntity.ok(Map.of(
                "items", enrichMediaList(dtos),
                "total", response.getTotal()
        ));
    }

    @GetMapping("/event/{eventId}/feed")
    public ResponseEntity<Map<String, Object>> getMediaFeed(
            @PathVariable String eventId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        MediaListResponse response = mediaStub.getMediaFeed(GetMediaFeedRequest.newBuilder()
                .setEventId(eventId).setPage(page).setSize(size).build());
        List<MediaResponseDto> dtos = MediaMapper.toDtoList(response.getItemsList());
        return ResponseEntity.ok(Map.of(
                "items", enrichMediaList(dtos),
                "total", response.getTotal()
        ));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> listUserMedia(
            @PathVariable String userId,
            @RequestParam(defaultValue = "ALL") String filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        MediaListResponse response = mediaStub.listUserMedia(ListUserMediaRequest.newBuilder()
                .setUserId(userId).setFilter(filter).setPage(page).setSize(size).build());
        List<MediaResponseDto> dtos = MediaMapper.toDtoList(response.getItemsList());
        return ResponseEntity.ok(Map.of(
                "items", enrichMediaList(dtos),
                "total", response.getTotal()
        ));
    }

    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadProfileImage(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody Map<String, String> body) {
        UploadProfileImageResponse response = mediaStub.uploadProfileImage(
                UploadProfileImageRequest.newBuilder()
                        .setUserId(userId)
                        .setFilename(body.get("filename"))
                        .build());
        return ResponseEntity.ok(Map.of(
                "presignedUploadUrl", response.getPresignedUploadUrl(),
                "publicUrl", response.getPublicUrl()));
    }

    private List<MediaResponseDto> enrichMediaList(List<MediaResponseDto> dtos) {
        Set<String> userIds = dtos.stream()
                .filter(d -> d.user() == null)
                .map(MediaResponseDto::userId)
                .filter(id -> id != null && !id.isEmpty())
                .collect(Collectors.toSet());

        if (userIds.isEmpty()) return dtos;

        try {
            UserListResponse usersResponse = authStub.getBatchUsers(
                    GetBatchUsersRequest.newBuilder().addAllUserIds(userIds).build());
            Map<String, UserSummaryDto> userMap = MediaMapper.buildUserMap(usersResponse.getUsersList());
            return MediaMapper.enrichWithUsers(dtos, userMap);
        } catch (Exception e) {
            return dtos;
        }
    }

    private MediaResponseDto enrichSingleMedia(MediaResponseDto dto) {
        if (dto.user() != null || dto.userId() == null || dto.userId().isEmpty()) return dto;
        List<MediaResponseDto> enriched = enrichMediaList(List.of(dto));
        return enriched.get(0);
    }
}
