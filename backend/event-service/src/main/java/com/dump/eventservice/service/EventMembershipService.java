package com.dump.eventservice.service;

import com.dump.eventservice.entity.Event;
import com.dump.eventservice.entity.EventMember;
import com.dump.eventservice.repository.EventMemberRepository;
import com.dump.eventservice.repository.EventRepository;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class EventMembershipService {

    private final EventRepository eventRepository;
    private final EventMemberRepository eventMemberRepository;

    public EventMember joinByInviteCode(String inviteCode, UUID userId) {
        var event = eventRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new StatusRuntimeException(
                        Status.NOT_FOUND.withDescription("Event not found for invite code: " + inviteCode)));

        if (eventMemberRepository.existsByEventIdAndUserId(event.getId(), userId)) {
            throw new StatusRuntimeException(
                    Status.ALREADY_EXISTS.withDescription("User is already a member of this event"));
        }

        var member = EventMember.builder()
                .event(event)
                .userId(userId)
                .role("MEMBER")
                .build();

        return eventMemberRepository.save(member);
    }

    public EventMember joinEvent(UUID eventId, UUID userId) {
        var event = eventRepository.findById(eventId)
                .orElseThrow(() -> new StatusRuntimeException(
                        Status.NOT_FOUND.withDescription("Event not found: " + eventId)));

        if (eventMemberRepository.existsByEventIdAndUserId(eventId, userId)) {
            throw new StatusRuntimeException(
                    Status.ALREADY_EXISTS.withDescription("User is already a member of this event"));
        }

        var member = EventMember.builder()
                .event(event)
                .userId(userId)
                .role("MEMBER")
                .build();

        return eventMemberRepository.save(member);
    }

    public void leaveEvent(UUID eventId, UUID userId) {
        var member = eventMemberRepository.findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new StatusRuntimeException(
                        Status.NOT_FOUND.withDescription("Membership not found")));

        if ("CREATOR".equals(member.getRole())) {
            throw new StatusRuntimeException(
                    Status.PERMISSION_DENIED.withDescription("Creator cannot leave event"));
        }

        eventMemberRepository.delete(member);
    }

    @Transactional(readOnly = true)
    public Page<EventMember> getEventMembers(UUID eventId, int page, int size) {
        return eventMemberRepository.findByEventId(eventId, PageRequest.of(page, size));
    }

    @Transactional(readOnly = true)
    public List<Event> listUserEvents(UUID userId, int page, int size) {
        return eventMemberRepository.findByUserId(userId, PageRequest.of(page, size))
                .map(EventMember::getEvent)
                .getContent();
    }

    @Transactional(readOnly = true)
    public List<Event> getUpcomingEvents(UUID userId, int page, int size) {
        return eventMemberRepository.findUpcomingByUserId(userId, LocalDate.now(), PageRequest.of(page, size))
                .map(EventMember::getEvent)
                .getContent();
    }

    @Transactional(readOnly = true)
    public int countUserEvents(UUID userId) {
        return (int) eventMemberRepository.countByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<Event> listEventsForUsers(List<UUID> userIds, int page, int size) {
        return eventMemberRepository.findByUserIdIn(userIds, PageRequest.of(page, size))
                .map(EventMember::getEvent)
                .getContent();
    }
}
