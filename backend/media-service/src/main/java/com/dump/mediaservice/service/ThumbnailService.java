package com.dump.mediaservice.service;

import com.dump.mediaservice.repository.MediaRepository;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.UUID;

@Service
@Slf4j
public class ThumbnailService {

    private final S3Client s3Client;
    private final S3StorageService s3StorageService;
    private final MediaRepository mediaRepository;
    private final String bucket;

    public ThumbnailService(
            S3Client s3Client,
            S3StorageService s3StorageService,
            MediaRepository mediaRepository,
            @Value("${s3.bucket}") String bucket) {
        this.s3Client = s3Client;
        this.s3StorageService = s3StorageService;
        this.mediaRepository = mediaRepository;
        this.bucket = bucket;
    }

    @Async("thumbnailExecutor")
    public void generateThumbnailAsync(UUID mediaId, String s3Key) {
        try {
            String thumbnailKey = generateThumbnail(s3Key);
            if (thumbnailKey != null) {
                mediaRepository.findById(mediaId).ifPresent(media -> {
                    media.setThumbnailUrl(s3StorageService.getPublicUrl(thumbnailKey));
                    mediaRepository.save(media);
                    log.info("Updated thumbnailUrl for mediaId={}", mediaId);
                });
            }
        } catch (Exception e) {
            log.warn("Async thumbnail generation failed for mediaId={}: {}", mediaId, e.getMessage());
        }
    }

    String generateThumbnail(String s3Key) {
        try {
            InputStream inputStream = s3Client.getObject(GetObjectRequest.builder()
                    .bucket(bucket)
                    .key(s3Key)
                    .build());

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Thumbnails.of(inputStream)
                    .width(400)
                    .toOutputStream(baos);

            String thumbnailKey = "thumbnails/" + s3Key;

            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(thumbnailKey)
                            .contentType("image/jpeg")
                            .build(),
                    RequestBody.fromBytes(baos.toByteArray()));

            log.info("Generated thumbnail for key={} at thumbnailKey={}", s3Key, thumbnailKey);
            return thumbnailKey;
        } catch (Exception e) {
            log.warn("Failed to generate thumbnail for key={}: {}", s3Key, e.getMessage());
            return null;
        }
    }
}
