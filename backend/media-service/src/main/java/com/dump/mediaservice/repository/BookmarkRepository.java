package com.dump.mediaservice.repository;

import com.dump.mediaservice.entity.Bookmark;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, UUID> {

    Optional<Bookmark> findByMediaIdAndUserId(UUID mediaId, UUID userId);

    Page<Bookmark> findByUserId(UUID userId, Pageable pageable);
}
