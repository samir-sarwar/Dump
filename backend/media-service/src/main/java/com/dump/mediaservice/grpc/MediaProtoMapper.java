package com.dump.mediaservice.grpc;

import com.dump.mediaservice.entity.Clipping;
import com.dump.mediaservice.entity.Collection;
import com.dump.mediaservice.entity.Media;

public final class MediaProtoMapper {

    private MediaProtoMapper() {}

    public static MediaResponse toProto(Media media) {
        MediaResponse.Builder builder = MediaResponse.newBuilder()
                .setId(media.getId().toString())
                .setEventId(media.getEventId().toString())
                .setUserId(media.getUserId().toString())
                .setAspectRatio(media.getAspectRatio())
                .setLikeCount(media.getLikeCount())
                .setCommentCount(media.getCommentCount())
                .setIsHighlight(media.isHighlight());

        if (media.getImageUrl() != null) {
            builder.setImageUrl(media.getImageUrl());
        }
        if (media.getThumbnailUrl() != null) {
            builder.setThumbnailUrl(media.getThumbnailUrl());
        }
        if (media.getCaption() != null) {
            builder.setCaption(media.getCaption());
        }
        if (media.getLocation() != null) {
            builder.setLocation(media.getLocation());
        }
        if (media.getType() != null) {
            builder.setType(parseMediaType(media.getType()));
        }
        if (media.getAudioAttribution() != null) {
            builder.setAudioAttribution(media.getAudioAttribution());
        }
        if (media.getCreatedAt() != null) {
            builder.setCreatedAt(media.getCreatedAt().toString());
        }

        return builder.build();
    }

    public static FeedPost toFeedPost(Media media, String eventTitle, String eventDate) {
        FeedPost.Builder builder = FeedPost.newBuilder()
                .setId(media.getId().toString())
                .setEventId(media.getEventId().toString())
                .setLikes(media.getLikeCount())
                .setComments(media.getCommentCount());

        if (media.getImageUrl() != null) {
            builder.setImageUrl(media.getImageUrl());
        }
        if (eventTitle != null) {
            builder.setTitle(eventTitle);
        }
        if (eventDate != null) {
            builder.setDate(eventDate);
        }

        return builder.build();
    }

    public static ClippingItem toClippingItem(Clipping clipping, Media media) {
        ClippingItem.Builder builder = ClippingItem.newBuilder()
                .setId(clipping.getId().toString())
                .setMediaId(clipping.getMediaId().toString());

        if (media != null && media.getImageUrl() != null) {
            builder.setImageUrl(media.getImageUrl());
        }
        if (clipping.getCreatedAt() != null) {
            builder.setDate(clipping.getCreatedAt().toString());
        }

        return builder.build();
    }

    public static CollectionResponse toCollectionResponse(Collection collection, int itemCount, String thumbnailUrl) {
        CollectionResponse.Builder builder = CollectionResponse.newBuilder()
                .setId(collection.getId().toString())
                .setItemCount(itemCount);

        if (collection.getTitle() != null) {
            builder.setTitle(collection.getTitle());
        }
        if (thumbnailUrl != null) {
            builder.setThumbnailUrl(thumbnailUrl);
        }

        return builder.build();
    }

    private static MediaType parseMediaType(String type) {
        return switch (type.toUpperCase()) {
            case "VIDEO" -> MediaType.VIDEO;
            default -> MediaType.PHOTO;
        };
    }
}
