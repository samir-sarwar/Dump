package com.dump.eventservice.repository;

import com.dump.eventservice.entity.EventMember;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventMemberRepository extends JpaRepository<EventMember, UUID> {

    Page<EventMember> findByUserId(UUID userId, Pageable pageable);

    Page<EventMember> findByEventId(UUID eventId, Pageable pageable);

    boolean existsByEventIdAndUserId(UUID eventId, UUID userId);

    Optional<EventMember> findByEventIdAndUserId(UUID eventId, UUID userId);

    int countByEventId(UUID eventId);

    long countByUserId(UUID userId);

    @Query("SELECT em FROM EventMember em WHERE em.userId IN :userIds")
    Page<EventMember> findByUserIdIn(@Param("userIds") List<UUID> userIds, Pageable pageable);

    @Query("SELECT em FROM EventMember em JOIN em.event e WHERE em.userId = :userId AND e.date >= :fromDate ORDER BY e.date ASC")
    Page<EventMember> findUpcomingByUserId(@Param("userId") UUID userId, @Param("fromDate") LocalDate fromDate, Pageable pageable);
}
