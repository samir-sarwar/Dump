package com.dump.mediaservice.repository;

import com.dump.mediaservice.entity.MediaLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MediaLikeRepository extends JpaRepository<MediaLike, UUID> {

    Optional<MediaLike> findByMediaIdAndUserId(UUID mediaId, UUID userId);

    boolean existsByMediaIdAndUserId(UUID mediaId, UUID userId);
}
