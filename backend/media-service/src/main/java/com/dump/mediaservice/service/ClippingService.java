package com.dump.mediaservice.service;

import com.dump.mediaservice.entity.Clipping;
import com.dump.mediaservice.repository.ClippingRepository;
import com.dump.mediaservice.repository.MediaRepository;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class ClippingService {

    private final ClippingRepository clippingRepository;
    private final MediaRepository mediaRepository;

    public void clip(UUID mediaId, UUID userId) {
        if (clippingRepository.findByMediaIdAndUserId(mediaId, userId).isPresent()) {
            return; // Already clipped, no-op
        }

        Clipping clipping = Clipping.builder()
                .mediaId(mediaId)
                .userId(userId)
                .build();
        clippingRepository.save(clipping);
    }

    public void removeClip(UUID mediaId, UUID userId) {
        Clipping clipping = clippingRepository.findByMediaIdAndUserId(mediaId, userId)
                .orElseThrow(() -> new StatusRuntimeException(
                        Status.NOT_FOUND.withDescription("Clipping not found")));
        clippingRepository.delete(clipping);
    }

    public Page<Clipping> listClippings(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return clippingRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public int countUserClippings(UUID userId) {
        return clippingRepository.countByUserId(userId);
    }
}
