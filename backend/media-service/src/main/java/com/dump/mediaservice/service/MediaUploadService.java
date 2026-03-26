package com.dump.mediaservice.service;

import com.dump.mediaservice.entity.Media;
import com.dump.mediaservice.kafka.MediaKafkaProducer;
import com.dump.mediaservice.repository.MediaRepository;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class MediaUploadService {

    private final MediaRepository mediaRepository;
    private final S3StorageService s3StorageService;
    private final ThumbnailService thumbnailService;
    private final MediaKafkaProducer mediaKafkaProducer;

    public record UploadInitiation(String presignedUrl, UUID mediaId) {}

    public UploadInitiation initiateUpload(UUID eventId, UUID userId, String caption,
                                            String location, String type, String filename,
                                            double aspectRatio, String audioAttribution) {
        String s3Key = eventId + "/" + UUID.randomUUID() + "/" + filename;

        Media media = Media.builder()
                .eventId(eventId)
                .userId(userId)
                .caption(caption)
                .location(location)
                .type(type)
                .filename(filename)
                .aspectRatio(aspectRatio)
                .audioAttribution(audioAttribution)
                .s3Key(s3Key)
                .status("PENDING")
                .build();

        media = mediaRepository.save(media);

        String contentType = resolveContentType(type, filename);
        String presignedUrl = s3StorageService.generatePresignedUploadUrl(s3Key, contentType);

        log.info("Initiated upload for mediaId={}, s3Key={}", media.getId(), s3Key);
        return new UploadInitiation(presignedUrl, media.getId());
    }

    public Media confirmUpload(UUID mediaId) {
        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new StatusRuntimeException(
                        Status.NOT_FOUND.withDescription("Media not found: " + mediaId)));

        if (!"PENDING".equals(media.getStatus())) {
            throw new StatusRuntimeException(
                    Status.FAILED_PRECONDITION.withDescription("Media is not in PENDING status"));
        }

        if (!s3StorageService.headObject(media.getS3Key())) {
            throw new StatusRuntimeException(
                    Status.FAILED_PRECONDITION.withDescription("Object not yet uploaded to S3"));
        }

        media.setStatus("ACTIVE");
        media.setImageUrl(s3StorageService.getPublicUrl(media.getS3Key()));

        media = mediaRepository.save(media);

        thumbnailService.generateThumbnailAsync(media.getId(), media.getS3Key());

        mediaKafkaProducer.publishMediaUploaded(
                media.getId(), media.getEventId(), media.getUserId(), media.getType());

        log.info("Confirmed upload for mediaId={}", mediaId);
        return media;
    }

    public record ProfileImageUpload(String presignedUrl, String publicUrl) {}

    public ProfileImageUpload generateProfileImageUpload(UUID userId, String filename) {
        String key = "profiles/" + userId + "/" + UUID.randomUUID() + "/" + filename;
        String contentType = resolveContentType("PHOTO", filename);
        String presignedUrl = s3StorageService.generatePresignedUploadUrl(key, contentType);
        String publicUrl = s3StorageService.getPublicUrl(key);
        log.info("Generated profile image upload for userId={}, key={}", userId, key);
        return new ProfileImageUpload(presignedUrl, publicUrl);
    }

    private String resolveContentType(String type, String filename) {
        String lower = filename.toLowerCase();
        if ("VIDEO".equalsIgnoreCase(type)) {
            if (lower.endsWith(".mov")) return "video/quicktime";
            if (lower.endsWith(".avi")) return "video/x-msvideo";
            if (lower.endsWith(".webm")) return "video/webm";
            if (lower.endsWith(".mkv")) return "video/x-matroska";
            return "video/mp4";
        }
        if (lower.endsWith(".heic")) return "image/heic";
        if (lower.endsWith(".heif")) return "image/heif";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".gif")) return "image/gif";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".tiff") || lower.endsWith(".tif")) return "image/tiff";
        if (lower.endsWith(".bmp")) return "image/bmp";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        return "image/jpeg";
    }
}
