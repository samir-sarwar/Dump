package com.dump.mediaservice.grpc;

import com.dump.mediaservice.entity.Clipping;
import com.dump.mediaservice.entity.Collection;
import com.dump.mediaservice.entity.Comment;
import com.dump.mediaservice.entity.Media;
import com.dump.mediaservice.service.ClippingService;
import com.dump.mediaservice.service.CollectionService;
import com.dump.mediaservice.service.CollectionService.CollectionDetail;
import com.dump.mediaservice.service.CollectionService.CollectionSummary;
import com.dump.mediaservice.service.InteractionService;
import com.dump.mediaservice.service.MediaQueryService;
import com.dump.mediaservice.service.MediaUploadService;
import com.dump.mediaservice.service.MediaUploadService.UploadInitiation;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.UUID;

@GrpcService
@RequiredArgsConstructor
@Slf4j
public class MediaGrpcService extends MediaServiceGrpc.MediaServiceImplBase {

    private static UUID parseUuid(String value, String fieldName) {
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException e) {
            throw new StatusRuntimeException(
                    Status.INVALID_ARGUMENT.withDescription("Invalid UUID for " + fieldName + ": " + value));
        }
    }

    private final MediaUploadService mediaUploadService;
    private final MediaQueryService mediaQueryService;
    private final InteractionService interactionService;
    private final ClippingService clippingService;
    private final CollectionService collectionService;

    // ── Upload flow ──

    @Override
    public void initiateUpload(UploadMediaRequest request, StreamObserver<UploadMediaResponse> responseObserver) {
        try {
            UploadInitiation result = mediaUploadService.initiateUpload(
                    parseUuid(request.getEventId(), "eventId"),
                    parseUuid(request.getUserId(), "userId"),
                    request.getCaption(),
                    request.getLocation(),
                    request.getType().name(),
                    request.getFilename(),
                    request.getAspectRatio(),
                    request.getAudioAttribution());

            responseObserver.onNext(UploadMediaResponse.newBuilder()
                    .setPresignedUploadUrl(result.presignedUrl())
                    .setMediaId(result.mediaId().toString())
                    .build());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Error in initiateUpload", e);
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL.withDescription("Internal server error").asRuntimeException());
        }
    }

    @Override
    public void confirmUpload(ConfirmUploadRequest request, StreamObserver<ConfirmUploadResponse> responseObserver) {
        try {
            Media media = mediaUploadService.confirmUpload(parseUuid(request.getMediaId(), "mediaId"));

            responseObserver.onNext(ConfirmUploadResponse.newBuilder()
                    .setSuccess(true)
                    .setMedia(MediaProtoMapper.toProto(media))
                    .build());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Error in confirmUpload", e);
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL.withDescription("Internal server error").asRuntimeException());
        }
    }

    @Override
    public void uploadProfileImage(UploadProfileImageRequest request, StreamObserver<UploadProfileImageResponse> responseObserver) {
        try {
            MediaUploadService.ProfileImageUpload result = mediaUploadService.generateProfileImageUpload(
                    parseUuid(request.getUserId(), "userId"),
                    request.getFilename());

            responseObserver.onNext(UploadProfileImageResponse.newBuilder()
                    .setPresignedUploadUrl(result.presignedUrl())
                    .setPublicUrl(result.publicUrl())
                    .build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("Error in uploadProfileImage", e);
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL.withDescription("Internal server error").asRuntimeException());
        }
    }

    // ── Media retrieval ──

    @Override
    public void getMedia(GetMediaRequest request, StreamObserver<MediaResponse> responseObserver) {
        try {
            Media media = mediaQueryService.getMedia(parseUuid(request.getMediaId(), "mediaId"));

            responseObserver.onNext(MediaProtoMapper.toProto(media));
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Error in getMedia", e);
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL.withDescription("Internal server error").asRuntimeException());
        }
    }

    @Override
    public void listEventMedia(ListEventMediaRequest request, StreamObserver<MediaListResponse> responseObserver) {
        try {
            Page<Media> page = mediaQueryService.listEventMedia(
                    parseUuid(request.getEventId(), "eventId"),
                    request.getFilter(),
                    request.getPage(),
                    request.getSize());

            MediaListResponse.Builder builder = MediaListResponse.newBuilder()
                    .setTotal((int) page.getTotalElements());
            page.getContent().forEach(m -> builder.addItems(MediaProtoMapper.toProto(m)));

            responseObserver.onNext(builder.build());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Error in listEventMedia", e);
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL.withDescription("Internal server error").asRuntimeException());
        }
    }

    @Override
    public void listUserMedia(ListUserMediaRequest request, StreamObserver<MediaListResponse> responseObserver) {
        try {
            Page<Media> page = mediaQueryService.listUserMedia(
                    parseUuid(request.getUserId(), "userId"),
                    request.getFilter(),
                    request.getPage(),
                    request.getSize());

            MediaListResponse.Builder builder = MediaListResponse.newBuilder()
                    .setTotal((int) page.getTotalElements());
            page.getContent().forEach(m -> builder.addItems(MediaProtoMapper.toProto(m)));

            responseObserver.onNext(builder.build());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Error in listUserMedia", e);
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL.withDescription("Internal server error").asRuntimeException());
        }
    }

    @Override
    public void getMediaFeed(GetMediaFeedRequest request, StreamObserver<MediaListResponse> responseObserver) {
        try {
            Page<Media> page = mediaQueryService.getMediaFeed(
                    parseUuid(request.getEventId(), "eventId"),
                    request.getPage(),
                    request.getSize());

            MediaListResponse.Builder builder = MediaListResponse.newBuilder()
                    .setTotal((int) page.getTotalElements());
            page.getContent().forEach(m -> builder.addItems(MediaProtoMapper.toProto(m)));

            responseObserver.onNext(builder.build());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Error in getMediaFeed", e);
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL.withDescription("Internal server error").asRuntimeException());
        }
    }

    @Override
    public void getFeedForEvents(GetFeedForEventsRequest request, StreamObserver<FeedResponse> responseObserver) {
        try {
            List<UUID> eventIds = request.getEventIdsList().stream()
                    .map(UUID::fromString)
                    .toList();

            List<Media> feedMedia = mediaQueryService.getFeedForEvents(
                    eventIds, request.getPage(), request.getSize());

            FeedResponse.Builder builder = FeedResponse.newBuilder()
                    .setTotal(feedMedia.size());
            feedMedia.forEach(m -> builder.addPosts(
                    MediaProtoMapper.toFeedPost(m, null, null)));

            responseObserver.onNext(builder.build());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Error in getFeedForEvents", e);
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL.withDescription("Internal server error").asRuntimeException());
        }
    }

    // ── Interactions ──

    @Override
    public void like(LikeRequest request, StreamObserver<LikeResponse> responseObserver) {
        try {
            int newCount = interactionService.like(
                    parseUuid(request.getMediaId(), "mediaId"),
                    parseUuid(request.getUserId(), "userId"));

            responseObserver.onNext(LikeResponse.newBuilder()
                    .setSuccess(true)
                    .setNewCount(newCount)
                    .build());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Error in like", e);
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL.withDescription("Internal server error").asRuntimeException());
        }
    }

    @Override
    public void unlike(LikeRequest request, StreamObserver<LikeResponse> responseObserver) {
        try {
            int newCount = interactionService.unlike(
                    parseUuid(request.getMediaId(), "mediaId"),
                    parseUuid(request.getUserId(), "userId"));

            responseObserver.onNext(LikeResponse.newBuilder()
                    .setSuccess(true)
                    .setNewCount(newCount)
                    .build());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Error in unlike", e);
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL.withDescription("Internal server error").asRuntimeException());
        }
    }

    @Override
    public void comment(CommentRequest request, StreamObserver<CommentResponse> responseObserver) {
        try {
            Comment comment = interactionService.comment(
                    parseUuid(request.getMediaId(), "mediaId"),
                    parseUuid(request.getUserId(), "userId"),
                    request.getText());

            responseObserver.onNext(CommentResponse.newBuilder()
                    .setId(comment.getId().toString())
                    .setMediaId(comment.getMediaId().toString())
                    .setUserId(comment.getUserId().toString())
                    .setText(comment.getText())
                    .setCreatedAt(comment.getCreatedAt() != null ? comment.getCreatedAt().toString() : "")
                    .build());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Error in comment", e);
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL.withDescription("Internal server error").asRuntimeException());
        }
    }

    @Override
    public void listComments(ListCommentsRequest request, StreamObserver<CommentListResponse> responseObserver) {
        try {
            Page<Comment> page = interactionService.listComments(
                    parseUuid(request.getMediaId(), "mediaId"),
                    request.getPage(),
                    request.getSize());

            CommentListResponse.Builder builder = CommentListResponse.newBuilder()
                    .setTotal((int) page.getTotalElements());
            page.getContent().forEach(c -> builder.addComments(CommentResponse.newBuilder()
                    .setId(c.getId().toString())
                    .setMediaId(c.getMediaId().toString())
                    .setUserId(c.getUserId().toString())
                    .setText(c.getText())
                    .setCreatedAt(c.getCreatedAt() != null ? c.getCreatedAt().toString() : "")
                    .build()));

            responseObserver.onNext(builder.build());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Error in listComments", e);
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL.withDescription("Internal server error").asRuntimeException());
        }
    }

    @Override
    public void bookmark(BookmarkRequest request, StreamObserver<BookmarkResponse> responseObserver) {
        try {
            interactionService.bookmark(
                    parseUuid(request.getMediaId(), "mediaId"),
                    parseUuid(request.getUserId(), "userId"));

            responseObserver.onNext(BookmarkResponse.newBuilder()
                    .setSuccess(true)
                    .build());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Error in bookmark", e);
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL.withDescription("Internal server error").asRuntimeException());
        }
    }

    @Override
    public void removeBookmark(BookmarkRequest request, StreamObserver<BookmarkResponse> responseObserver) {
        try {
            interactionService.removeBookmark(
                    parseUuid(request.getMediaId(), "mediaId"),
                    parseUuid(request.getUserId(), "userId"));

            responseObserver.onNext(BookmarkResponse.newBuilder()
                    .setSuccess(true)
                    .build());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Error in removeBookmark", e);
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL.withDescription("Internal server error").asRuntimeException());
        }
    }

    @Override
    public void listBookmarks(ListBookmarksRequest request, StreamObserver<MediaListResponse> responseObserver) {
        try {
            List<Media> mediaList = interactionService.listBookmarks(
                    parseUuid(request.getUserId(), "userId"),
                    request.getPage(),
                    request.getSize());

            MediaListResponse.Builder builder = MediaListResponse.newBuilder()
                    .setTotal(mediaList.size());
            mediaList.forEach(m -> builder.addItems(MediaProtoMapper.toProto(m)));

            responseObserver.onNext(builder.build());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Error in listBookmarks", e);
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL.withDescription("Internal server error").asRuntimeException());
        }
    }

    // ── Clippings ──

    @Override
    public void clip(ClipRequest request, StreamObserver<ClipResponse> responseObserver) {
        try {
            clippingService.clip(
                    parseUuid(request.getMediaId(), "mediaId"),
                    parseUuid(request.getUserId(), "userId"));

            responseObserver.onNext(ClipResponse.newBuilder()
                    .setSuccess(true)
                    .build());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Error in clip", e);
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL.withDescription("Internal server error").asRuntimeException());
        }
    }

    @Override
    public void removeClip(ClipRequest request, StreamObserver<ClipResponse> responseObserver) {
        try {
            clippingService.removeClip(
                    parseUuid(request.getMediaId(), "mediaId"),
                    parseUuid(request.getUserId(), "userId"));

            responseObserver.onNext(ClipResponse.newBuilder()
                    .setSuccess(true)
                    .build());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Error in removeClip", e);
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL.withDescription("Internal server error").asRuntimeException());
        }
    }

    @Override
    public void listClippings(ListClippingsRequest request, StreamObserver<ClippingListResponse> responseObserver) {
        try {
            Page<Clipping> page = clippingService.listClippings(
                    parseUuid(request.getUserId(), "userId"),
                    request.getPage(),
                    request.getSize());

            ClippingListResponse.Builder builder = ClippingListResponse.newBuilder()
                    .setTotal((int) page.getTotalElements());
            page.getContent().forEach(clipping -> {
                Media media = null;
                try {
                    media = mediaQueryService.getMedia(clipping.getMediaId());
                } catch (Exception ignored) {
                    // Media may have been deleted
                }
                builder.addClippings(MediaProtoMapper.toClippingItem(clipping, media));
            });

            responseObserver.onNext(builder.build());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Error in listClippings", e);
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL.withDescription("Internal server error").asRuntimeException());
        }
    }

    @Override
    public void countUserClippings(CountUserClippingsRequest request, StreamObserver<CountResponse> responseObserver) {
        try {
            int count = clippingService.countUserClippings(parseUuid(request.getUserId(), "userId"));

            responseObserver.onNext(CountResponse.newBuilder()
                    .setCount(count)
                    .build());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Error in countUserClippings", e);
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL.withDescription("Internal server error").asRuntimeException());
        }
    }

    // ── Collections ──

    @Override
    public void createCollection(CreateCollectionRequest request, StreamObserver<CollectionResponse> responseObserver) {
        try {
            Collection collection = collectionService.createCollection(
                    parseUuid(request.getUserId(), "userId"),
                    request.getTitle());

            responseObserver.onNext(MediaProtoMapper.toCollectionResponse(collection, 0, null));
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Error in createCollection", e);
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL.withDescription("Internal server error").asRuntimeException());
        }
    }

    @Override
    public void addToCollection(AddToCollectionRequest request, StreamObserver<CollectionResponse> responseObserver) {
        try {
            Collection collection = collectionService.addToCollection(
                    parseUuid(request.getCollectionId(), "collectionId"),
                    parseUuid(request.getMediaId(), "mediaId"));

            responseObserver.onNext(MediaProtoMapper.toCollectionResponse(
                    collection, 0, null));
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Error in addToCollection", e);
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL.withDescription("Internal server error").asRuntimeException());
        }
    }

    @Override
    public void removeFromCollection(RemoveFromCollectionRequest request, StreamObserver<CollectionResponse> responseObserver) {
        try {
            Collection collection = collectionService.removeFromCollection(
                    parseUuid(request.getCollectionId(), "collectionId"),
                    parseUuid(request.getMediaId(), "mediaId"));

            responseObserver.onNext(MediaProtoMapper.toCollectionResponse(
                    collection, 0, null));
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Error in removeFromCollection", e);
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL.withDescription("Internal server error").asRuntimeException());
        }
    }

    @Override
    public void listCollections(ListCollectionsRequest request, StreamObserver<CollectionListResponse> responseObserver) {
        try {
            List<CollectionSummary> summaries = collectionService.listCollections(
                    parseUuid(request.getUserId(), "userId"));

            CollectionListResponse.Builder builder = CollectionListResponse.newBuilder();
            summaries.forEach(s -> builder.addCollections(
                    MediaProtoMapper.toCollectionResponse(
                            s.collection(), s.itemCount(), s.thumbnailUrl())));

            responseObserver.onNext(builder.build());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Error in listCollections", e);
            log.error("Unexpected error", e);
            responseObserver.onError(Status.INTERNAL.withDescription("Internal server error").asRuntimeException());
        }
    }

    @Override
    public void getCollectionItems(GetCollectionItemsRequest request, StreamObserver<CollectionDetailResponse> responseObserver) {
        try {
            CollectionDetail detail = collectionService.getCollectionItems(
                    parseUuid(request.getCollectionId(), "collectionId"),
                    request.getPage(),
                    request.getSize() > 0 ? request.getSize() : 20);

            CollectionResponse collectionProto = MediaProtoMapper.toCollectionResponse(
                    detail.collection(), detail.total(), null);

            CollectionDetailResponse.Builder builder = CollectionDetailResponse.newBuilder()
                    .setCollection(collectionProto)
                    .setTotal(detail.total());
            detail.items().forEach(m -> builder.addItems(MediaProtoMapper.toProto(m)));

            responseObserver.onNext(builder.build());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            log.error("Error in getCollectionItems", e);
            responseObserver.onError(Status.INTERNAL.withDescription("Internal server error").asRuntimeException());
        }
    }
}
