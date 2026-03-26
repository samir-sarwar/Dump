package com.dump.mediaservice.repository;

import com.dump.mediaservice.entity.Clipping;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClippingRepository extends JpaRepository<Clipping, UUID> {

    Optional<Clipping> findByMediaIdAndUserId(UUID mediaId, UUID userId);

    Page<Clipping> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    int countByUserId(UUID userId);
}
