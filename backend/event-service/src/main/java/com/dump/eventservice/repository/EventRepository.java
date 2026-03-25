package com.dump.eventservice.repository;

import com.dump.eventservice.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {

    Optional<Event> findByInviteCode(String inviteCode);

    Page<Event> findByCreatorIdOrderByDateDesc(UUID creatorId, Pageable pageable);

    int countByCreatorId(UUID creatorId);
}
