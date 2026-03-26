package com.dump.mediaservice.repository;

import com.dump.mediaservice.entity.CollectionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CollectionItemRepository extends JpaRepository<CollectionItem, UUID> {

    int countByCollectionId(UUID collectionId);

    Optional<CollectionItem> findByCollectionIdAndMediaId(UUID collectionId, UUID mediaId);

    Optional<CollectionItem> findFirstByCollectionIdOrderByAddedAtDesc(UUID collectionId);

    Page<CollectionItem> findByCollectionIdOrderByAddedAtDesc(UUID collectionId, Pageable pageable);
}
