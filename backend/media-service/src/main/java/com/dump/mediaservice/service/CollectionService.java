package com.dump.mediaservice.service;

import com.dump.mediaservice.entity.Collection;
import com.dump.mediaservice.entity.CollectionItem;
import com.dump.mediaservice.entity.Media;
import com.dump.mediaservice.repository.CollectionItemRepository;
import com.dump.mediaservice.repository.CollectionRepository;
import com.dump.mediaservice.repository.MediaRepository;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class CollectionService {

    private final CollectionRepository collectionRepository;
    private final CollectionItemRepository collectionItemRepository;
    private final MediaRepository mediaRepository;

    public Collection createCollection(UUID userId, String title) {
        Collection collection = Collection.builder()
                .userId(userId)
                .title(title)
                .build();
        return collectionRepository.save(collection);
    }

    public Collection addToCollection(UUID collectionId, UUID mediaId) {
        Collection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new StatusRuntimeException(
                        Status.NOT_FOUND.withDescription("Collection not found: " + collectionId)));

        if (collectionItemRepository.findByCollectionIdAndMediaId(collectionId, mediaId).isPresent()) {
            return collection; // Already in collection, no-op
        }

        CollectionItem item = CollectionItem.builder()
                .collectionId(collectionId)
                .mediaId(mediaId)
                .build();
        collectionItemRepository.save(item);

        return collection;
    }

    public Collection removeFromCollection(UUID collectionId, UUID mediaId) {
        Collection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new StatusRuntimeException(
                        Status.NOT_FOUND.withDescription("Collection not found: " + collectionId)));

        CollectionItem item = collectionItemRepository.findByCollectionIdAndMediaId(collectionId, mediaId)
                .orElseThrow(() -> new StatusRuntimeException(
                        Status.NOT_FOUND.withDescription("Item not found in collection")));

        collectionItemRepository.delete(item);
        return collection;
    }

    public record CollectionSummary(Collection collection, int itemCount, String thumbnailUrl) {}

    public record CollectionDetail(Collection collection, List<Media> items, int total) {}

    public CollectionDetail getCollectionItems(UUID collectionId, int page, int size) {
        Collection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new StatusRuntimeException(
                        Status.NOT_FOUND.withDescription("Collection not found: " + collectionId)));

        Page<CollectionItem> itemPage = collectionItemRepository
                .findByCollectionIdOrderByAddedAtDesc(collectionId, PageRequest.of(page, size));

        List<UUID> mediaIds = itemPage.getContent().stream()
                .map(CollectionItem::getMediaId)
                .toList();

        if (mediaIds.isEmpty()) {
            return new CollectionDetail(collection, List.of(), (int) itemPage.getTotalElements());
        }

        // findAllById doesn't guarantee order, so reorder to match collection item order
        Map<UUID, Media> mediaMap = mediaRepository.findAllById(mediaIds).stream()
                .collect(Collectors.toMap(Media::getId, m -> m));
        List<Media> mediaList = mediaIds.stream()
                .map(mediaMap::get)
                .filter(Objects::nonNull)
                .toList();

        return new CollectionDetail(collection, mediaList, (int) itemPage.getTotalElements());
    }

    public List<CollectionSummary> listCollections(UUID userId) {
        List<Collection> collections = collectionRepository.findByUserId(userId);

        return collections.stream().map(collection -> {
            int itemCount = collectionItemRepository.countByCollectionId(collection.getId());

            String thumbnailUrl = collectionItemRepository
                    .findFirstByCollectionIdOrderByAddedAtDesc(collection.getId())
                    .flatMap(item -> mediaRepository.findById(item.getMediaId()))
                    .map(Media::getThumbnailUrl)
                    .orElse(null);

            return new CollectionSummary(collection, itemCount, thumbnailUrl);
        }).toList();
    }
}
