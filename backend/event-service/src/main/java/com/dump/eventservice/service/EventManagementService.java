package com.dump.eventservice.service;

import com.dump.eventservice.entity.Event;
import com.dump.eventservice.entity.EventMember;
import com.dump.eventservice.kafka.EventKafkaProducer;
import com.dump.eventservice.repository.EventMemberRepository;
import com.dump.eventservice.repository.EventRepository;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class EventManagementService {

    private final EventRepository eventRepository;
    private final EventMemberRepository eventMemberRepository;
    private final EventKafkaProducer eventKafkaProducer;
    private final InviteCodeGenerator inviteCodeGenerator;

    public Event createEvent(String title, LocalDate date, String location, String imageUrl, UUID creatorId) {
        var inviteCode = inviteCodeGenerator.generate();

        var event = Event.builder()
                .title(title)
                .date(date)
                .location(location)
                .imageUrl(imageUrl)
                .creatorId(creatorId)
                .inviteCode(inviteCode)
                .mediaCount(0)
                .build();

        event = eventRepository.save(event);

        var member = EventMember.builder()
                .event(event)
                .userId(creatorId)
                .role("CREATOR")
                .build();

        eventMemberRepository.save(member);

        eventKafkaProducer.publishEventCreated(event.getId(), creatorId, title);

        return event;
    }

    @Transactional(readOnly = true)
    public Event getEvent(UUID id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new StatusRuntimeException(
                        Status.NOT_FOUND.withDescription("Event not found: " + id)));
    }

    public Event updateEvent(UUID eventId, String title, String date, String location, String imageUrl) {
        var event = getEvent(eventId);

        if (title != null && !title.isEmpty()) {
            event.setTitle(title);
        }
        if (date != null && !date.isEmpty()) {
            event.setDate(LocalDate.parse(date));
        }
        if (location != null && !location.isEmpty()) {
            event.setLocation(location);
        }
        if (imageUrl != null && !imageUrl.isEmpty()) {
            event.setImageUrl(imageUrl);
        }

        return eventRepository.save(event);
    }

    public void deleteEvent(UUID eventId, UUID userId) {
        var event = getEvent(eventId);

        if (!event.getCreatorId().equals(userId)) {
            throw new StatusRuntimeException(
                    Status.PERMISSION_DENIED.withDescription("Only the creator can delete this event"));
        }

        eventRepository.delete(event);
    }

    public void updateMediaCount(UUID eventId, int delta) {
        var event = getEvent(eventId);
        event.setMediaCount(event.getMediaCount() + delta);
        eventRepository.save(event);
    }
}
