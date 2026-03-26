package com.dump.mediaservice.repository;

import com.dump.mediaservice.entity.Media;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MediaRepository extends JpaRepository<Media, UUID> {

    Page<Media> findByEventIdAndStatus(UUID eventId, String status, Pageable pageable);

    Page<Media> findByEventIdAndTypeAndStatus(UUID eventId, String type, String status, Pageable pageable);

    Page<Media> findByEventIdAndIsHighlightTrueAndStatus(UUID eventId, String status, Pageable pageable);

    Page<Media> findByUserIdAndStatus(UUID userId, String status, Pageable pageable);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Media m SET m.likeCount = m.likeCount + :delta WHERE m.id = :mediaId")
    void updateLikeCount(@Param("mediaId") UUID mediaId, @Param("delta") int delta);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Media m SET m.commentCount = m.commentCount + :delta WHERE m.id = :mediaId")
    void updateCommentCount(@Param("mediaId") UUID mediaId, @Param("delta") int delta);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Media m SET m.isHighlight = true WHERE m.id = :mediaId")
    void markAsHighlight(@Param("mediaId") UUID mediaId);

    @Query("SELECT m FROM Media m WHERE m.eventId IN :eventIds AND m.status = 'ACTIVE' ORDER BY m.likeCount DESC")
    Page<Media> findTopMediaForEvents(@Param("eventIds") List<UUID> eventIds, Pageable pageable);
}
