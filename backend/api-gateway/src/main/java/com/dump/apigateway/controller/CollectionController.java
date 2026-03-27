package com.dump.apigateway.controller;

import com.dump.apigateway.dto.*;
import com.dump.apigateway.mapper.MediaMapper;
import com.dump.authservice.grpc.AuthServiceGrpc;
import com.dump.authservice.grpc.GetBatchUsersRequest;
import com.dump.authservice.grpc.UserListResponse;
import jakarta.validation.Valid;
import com.dump.mediaservice.grpc.*;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/collections")
public class CollectionController {

    @GrpcClient("media-service")
    private MediaServiceGrpc.MediaServiceBlockingStub mediaStub;

    @GrpcClient("auth-service")
    private AuthServiceGrpc.AuthServiceBlockingStub authStub;

    @PostMapping
    public ResponseEntity<CollectionResponseDto> createCollection(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody CollectionRequestDto dto) {
        com.dump.mediaservice.grpc.CollectionResponse response = mediaStub.createCollection(
                CreateCollectionRequest.newBuilder()
                        .setUserId(userId).setTitle(dto.title()).build());
        return ResponseEntity.ok(MediaMapper.toDto(response));
    }

    @PostMapping("/{collectionId}/items")
    public ResponseEntity<CollectionResponseDto> addToCollection(
            @PathVariable String collectionId,
            @Valid @RequestBody CollectionItemRequestDto dto) {
        com.dump.mediaservice.grpc.CollectionResponse response = mediaStub.addToCollection(
                AddToCollectionRequest.newBuilder()
                        .setCollectionId(collectionId).setMediaId(dto.mediaId()).build());
        return ResponseEntity.ok(MediaMapper.toDto(response));
    }

    @DeleteMapping("/{collectionId}/items/{mediaId}")
    public ResponseEntity<CollectionResponseDto> removeFromCollection(
            @PathVariable String collectionId,
            @PathVariable String mediaId) {
        com.dump.mediaservice.grpc.CollectionResponse response = mediaStub.removeFromCollection(
                RemoveFromCollectionRequest.newBuilder()
                        .setCollectionId(collectionId).setMediaId(mediaId).build());
        return ResponseEntity.ok(MediaMapper.toDto(response));
    }

    @GetMapping
    public ResponseEntity<List<CollectionResponseDto>> listCollections(
            @RequestHeader("X-User-Id") String userId) {
        CollectionListResponse response = mediaStub.listCollections(
                ListCollectionsRequest.newBuilder().setUserId(userId).build());
        return ResponseEntity.ok(MediaMapper.toCollectionDtoList(response.getCollectionsList()));
    }

    @GetMapping("/{collectionId}")
    public ResponseEntity<CollectionDetailResponseDto> getCollectionItems(
            @PathVariable String collectionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        CollectionDetailResponse response = mediaStub.getCollectionItems(
                GetCollectionItemsRequest.newBuilder()
                        .setCollectionId(collectionId)
                        .setPage(page)
                        .setSize(size)
                        .build());

        CollectionDetailResponseDto dto = MediaMapper.toDetailDto(response);

        // Enrich media items with user data
        Set<String> userIds = dto.items().stream()
                .filter(m -> m.user() == null)
                .map(MediaResponseDto::userId)
                .collect(Collectors.toSet());

        if (!userIds.isEmpty()) {
            try {
                UserListResponse usersResponse = authStub.getBatchUsers(
                        GetBatchUsersRequest.newBuilder().addAllUserIds(userIds).build());
                Map<String, UserSummaryDto> userMap = MediaMapper.buildUserMap(usersResponse.getUsersList());
                List<MediaResponseDto> enriched = MediaMapper.enrichWithUsers(dto.items(), userMap);
                dto = new CollectionDetailResponseDto(
                        dto.id(), dto.title(), dto.thumbnailUrl(), dto.itemCount(),
                        enriched, dto.total());
            } catch (Exception e) {
                // Fall back to unenriched items
            }
        }

        return ResponseEntity.ok(dto);
    }
}
