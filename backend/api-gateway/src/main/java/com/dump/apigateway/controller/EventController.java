package com.dump.apigateway.controller;

import com.dump.apigateway.dto.*;
import com.dump.apigateway.mapper.EventMapper;
import jakarta.validation.Valid;
import com.dump.eventservice.grpc.*;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @GrpcClient("event-service")
    private EventServiceGrpc.EventServiceBlockingStub eventStub;

    @PostMapping
    public ResponseEntity<EventResponseDto> createEvent(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody CreateEventRequestDto dto) {
        EventResponse response = eventStub.createEvent(CreateEventRequest.newBuilder()
                .setTitle(dto.title())
                .setDate(dto.date())
                .setLocation(dto.location() != null ? dto.location() : "")
                .setImageUrl(dto.imageUrl() != null ? dto.imageUrl() : "")
                .setCreatorId(userId)
                .build());
        return ResponseEntity.ok(EventMapper.toDto(response));
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<EventResponseDto> getEvent(@PathVariable String eventId) {
        EventResponse response = eventStub.getEvent(GetEventRequest.newBuilder()
                .setEventId(eventId).build());
        return ResponseEntity.ok(EventMapper.toDto(response));
    }

    @PutMapping("/{eventId}")
    public ResponseEntity<EventResponseDto> updateEvent(
            @PathVariable String eventId,
            @Valid @RequestBody CreateEventRequestDto dto) {
        EventResponse response = eventStub.updateEvent(UpdateEventRequest.newBuilder()
                .setEventId(eventId)
                .setTitle(dto.title() != null ? dto.title() : "")
                .setDate(dto.date() != null ? dto.date() : "")
                .setLocation(dto.location() != null ? dto.location() : "")
                .setImageUrl(dto.imageUrl() != null ? dto.imageUrl() : "")
                .build());
        return ResponseEntity.ok(EventMapper.toDto(response));
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<Map<String, Boolean>> deleteEvent(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String eventId) {
        DeleteEventResponse response = eventStub.deleteEvent(DeleteEventRequest.newBuilder()
                .setEventId(eventId).setUserId(userId).build());
        return ResponseEntity.ok(Map.of("success", response.getSuccess()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> listEventsForUser(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        EventListResponse response = eventStub.listUserEvents(ListUserEventsRequest.newBuilder()
                .setUserId(userId).setPage(page).setSize(size).build());
        return ResponseEntity.ok(Map.of(
                "events", EventMapper.toDtoList(response.getEventsList()),
                "total", response.getTotal()
        ));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> listUserEvents(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        EventListResponse response = eventStub.listUserEvents(ListUserEventsRequest.newBuilder()
                .setUserId(userId).setPage(page).setSize(size).build());
        return ResponseEntity.ok(Map.of(
                "events", EventMapper.toDtoList(response.getEventsList()),
                "total", response.getTotal()
        ));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<Map<String, Object>> getUpcomingEvents(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        EventListResponse response = eventStub.getUpcomingEvents(GetUpcomingEventsRequest.newBuilder()
                .setUserId(userId).setPage(page).setSize(size).build());
        return ResponseEntity.ok(Map.of(
                "events", EventMapper.toDtoList(response.getEventsList()),
                "total", response.getTotal()
        ));
    }

    @PostMapping("/{eventId}/join")
    public ResponseEntity<Map<String, Boolean>> joinEvent(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String eventId) {
        JoinEventResponse response = eventStub.joinEvent(JoinEventRequest.newBuilder()
                .setEventId(eventId).setUserId(userId).build());
        return ResponseEntity.ok(Map.of("success", response.getSuccess()));
    }

    @DeleteMapping("/{eventId}/leave")
    public ResponseEntity<Map<String, Boolean>> leaveEvent(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String eventId) {
        LeaveEventResponse response = eventStub.leaveEvent(LeaveEventRequest.newBuilder()
                .setEventId(eventId).setUserId(userId).build());
        return ResponseEntity.ok(Map.of("success", response.getSuccess()));
    }

    @GetMapping("/{eventId}/members")
    public ResponseEntity<Map<String, Object>> getEventMembers(
            @PathVariable String eventId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        EventMemberListResponse response = eventStub.getEventMembers(GetEventMembersRequest.newBuilder()
                .setEventId(eventId).setPage(page).setSize(size).build());
        return ResponseEntity.ok(Map.of(
                "userIds", response.getUserIdsList(),
                "total", response.getTotal()
        ));
    }

    @PostMapping("/{eventId}/invite-code")
    public ResponseEntity<Map<String, String>> generateInviteCode(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String eventId) {
        InviteCodeResponse response = eventStub.generateInviteCode(GenerateInviteCodeRequest.newBuilder()
                .setEventId(eventId).setUserId(userId).build());
        return ResponseEntity.ok(Map.of("code", response.getCode(), "eventId", response.getEventId()));
    }

    @PostMapping("/join")
    public ResponseEntity<Map<String, Boolean>> joinByInviteCode(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody JoinByCodeRequestDto dto) {
        JoinEventResponse response = eventStub.joinByInviteCode(JoinByInviteCodeRequest.newBuilder()
                .setInviteCode(dto.code()).setUserId(userId).build());
        return ResponseEntity.ok(Map.of("success", response.getSuccess()));
    }
}
