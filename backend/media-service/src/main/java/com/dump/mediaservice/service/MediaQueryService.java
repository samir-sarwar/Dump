package com.dump.mediaservice.service;

import com.dump.mediaservice.entity.Media;
import com.dump.mediaservice.repository.MediaRepository;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MediaQueryService {

    private static final String ACTIVE = "ACTIVE";

    private final MediaRepository mediaRepository;

    public Media getMedia(UUID id) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new StatusRuntimeException(
                        Status.NOT_FOUND.withDescription("Media not found: " + id)));

        if (!ACTIVE.equals(media.getStatus())) {
            throw new StatusRuntimeException(
                    Status.NOT_FOUND.withDescription("Media not found: " + id));
        }

        return media;
    }

    public Page<Media> listEventMedia(UUID eventId, String filter, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        return switch (filter != null ? filter.toUpperCase() : "ALL") {
            case "PHOTOS" -> mediaRepository.findByEventIdAndTypeAndStatus(eventId, "PHOTO", ACTIVE, pageable);
            case "VIDEOS" -> mediaRepository.findByEventIdAndTypeAndStatus(eventId, "VIDEO", ACTIVE, pageable);
            case "HIGHLIGHTS" -> mediaRepository.findByEventIdAndIsHighlightTrueAndStatus(eventId, ACTIVE, pageable);
            default -> mediaRepository.findByEventIdAndStatus(eventId, ACTIVE, pageable);
        };
    }

    public Page<Media> listUserMedia(UUID userId, String filter, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return mediaRepository.findByUserIdAndStatus(userId, ACTIVE, pageable);
    }

    public Page<Media> getMediaFeed(UUID eventId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return mediaRepository.findByEventIdAndStatus(eventId, ACTIVE, pageable);
    }

    public List<Media> getFeedForEvents(List<UUID> eventIds, int page, int size) {
        if (eventIds == null || eventIds.isEmpty()) {
            return List.of();
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Media> topMedia = mediaRepository.findTopMediaForEvents(eventIds, pageable);

        // Group by eventId and pick top 1 per event
        Map<UUID, Media> bestPerEvent = new LinkedHashMap<>();
        for (Media media : topMedia.getContent()) {
            bestPerEvent.putIfAbsent(media.getEventId(), media);
        }

        return new ArrayList<>(bestPerEvent.values());
    }
}
