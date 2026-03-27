package com.dump.apigateway.mapper;

import com.dump.apigateway.dto.*;
import com.dump.authservice.grpc.UserProfile;
import com.dump.eventservice.grpc.EventResponse;
import com.dump.mediaservice.grpc.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public final class MediaMapper {

    private MediaMapper() {}

    public static MediaResponseDto toDto(MediaResponse proto) {
        UserSummaryDto userSummary = null;
        if (proto.hasUser()) {
            UserSummary u = proto.getUser();
            userSummary = new UserSummaryDto(u.getId(), u.getName(), u.getUsername(), u.getAvatarUrl());
        }
        return new MediaResponseDto(
                proto.getId(),
                proto.getImageUrl(),
                proto.getThumbnailUrl(),
                proto.getEventId(),
                proto.getUserId(),
                proto.getCaption(),
                proto.getLocation(),
                proto.getType().name(),
                proto.getAspectRatio(),
                proto.getAudioAttribution(),
                proto.getLikeCount(),
                proto.getCommentCount(),
                proto.getIsHighlight(),
                proto.getCreatedAt(),
                userSummary
        );
    }

    public static List<MediaResponseDto> toDtoList(List<MediaResponse> protos) {
        return protos.stream().map(MediaMapper::toDto).toList();
    }

    public static MediaResponseDto withUser(MediaResponseDto dto, UserSummaryDto user) {
        return new MediaResponseDto(
                dto.id(), dto.imageUrl(), dto.thumbnailUrl(), dto.eventId(), dto.userId(),
                dto.caption(), dto.location(), dto.type(), dto.aspectRatio(), dto.audioAttribution(),
                dto.likeCount(), dto.commentCount(), dto.isHighlight(), dto.createdAt(), user
        );
    }

    public static List<MediaResponseDto> enrichWithUsers(List<MediaResponseDto> dtos, Map<String, UserSummaryDto> userMap) {
        return dtos.stream()
                .map(dto -> {
                    UserSummaryDto user = dto.user() != null ? dto.user() : userMap.get(dto.userId());
                    return user != null ? withUser(dto, user) : dto;
                })
                .toList();
    }

    public static Map<String, UserSummaryDto> buildUserMap(List<UserProfile> profiles) {
        return profiles.stream().collect(Collectors.toMap(
                UserProfile::getId,
                p -> new UserSummaryDto(p.getId(), p.getName(), p.getUsername(), p.getAvatarUrl()),
                (a, b) -> a
        ));
    }

    public static UploadResponseDto toUploadDto(UploadMediaResponse proto) {
        return new UploadResponseDto(proto.getPresignedUploadUrl(), proto.getMediaId());
    }

    public static CommentResponseDto toDto(CommentResponse proto) {
        return new CommentResponseDto(
                proto.getId(),
                proto.getMediaId(),
                proto.getUserId(),
                proto.getText(),
                proto.getCreatedAt(),
                null
        );
    }

    public static CommentResponseDto toDto(CommentResponse proto, UserSummaryDto user) {
        return new CommentResponseDto(
                proto.getId(),
                proto.getMediaId(),
                proto.getUserId(),
                proto.getText(),
                proto.getCreatedAt(),
                user
        );
    }

    public static FeedPostDto toDto(FeedPost proto) {
        return new FeedPostDto(
                proto.getId(),
                proto.getEventId(),
                proto.getTitle(),
                proto.getDate(),
                proto.getImageUrl(),
                proto.getLikes(),
                proto.getComments()
        );
    }

    public static FeedPostDto enrichFeedPost(FeedPostDto post, EventResponse event) {
        return new FeedPostDto(
                post.id(),
                post.eventId(),
                event.getTitle(),
                event.getDate(),
                post.imageUrl(),
                post.likes(),
                post.comments()
        );
    }

    public static List<FeedPostDto> toFeedDtoList(List<FeedPost> protos) {
        return protos.stream().map(MediaMapper::toDto).toList();
    }

    public static ClippingDto toDto(ClippingItem proto) {
        return new ClippingDto(proto.getId(), proto.getImageUrl(), proto.getDate(), proto.getMediaId());
    }

    public static List<ClippingDto> toClippingDtoList(List<ClippingItem> protos) {
        return protos.stream().map(MediaMapper::toDto).toList();
    }

    public static CollectionResponseDto toDto(com.dump.mediaservice.grpc.CollectionResponse proto) {
        return new CollectionResponseDto(proto.getId(), proto.getTitle(), proto.getThumbnailUrl(), proto.getItemCount());
    }

    public static List<CollectionResponseDto> toCollectionDtoList(List<com.dump.mediaservice.grpc.CollectionResponse> protos) {
        return protos.stream().map(MediaMapper::toDto).toList();
    }

    public static CollectionDetailResponseDto toDetailDto(com.dump.mediaservice.grpc.CollectionDetailResponse proto) {
        com.dump.mediaservice.grpc.CollectionResponse col = proto.getCollection();
        return new CollectionDetailResponseDto(
                col.getId(),
                col.getTitle(),
                col.getThumbnailUrl(),
                col.getItemCount(),
                toDtoList(proto.getItemsList()),
                proto.getTotal()
        );
    }
}
