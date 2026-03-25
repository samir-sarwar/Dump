package com.dump.eventservice.grpc;

import com.dump.eventservice.entity.Event;
import com.dump.eventservice.repository.EventMemberRepository;
import com.dump.eventservice.service.EventManagementService;
import com.dump.eventservice.service.EventMembershipService;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

import java.time.LocalDate;
import java.util.UUID;

@GrpcService
@RequiredArgsConstructor
@Slf4j
public class EventGrpcService extends EventServiceGrpc.EventServiceImplBase {

    private static UUID parseUuid(String value, String fieldName) {
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException e) {
            throw new StatusRuntimeException(
                    Status.INVALID_ARGUMENT.withDescription("Invalid UUID for " + fieldName + ": " + value));
        }
    }

    private final EventManagementService eventManagementService;
    private final EventMembershipService eventMembershipService;
    private final EventMemberRepository eventMemberRepository;

    @Override
    public void createEvent(CreateEventRequest request, StreamObserver<EventResponse> responseObserver) {
        try {
            var event = eventManagementService.createEvent(
                    request.getTitle(),
                    LocalDate.parse(request.getDate()),
                    request.getLocation(),
                    request.getImageUrl(),
                    parseUuid(request.getCreatorId(), "creatorId")
            );
            int memberCount = eventMemberRepository.countByEventId(event.getId());
            responseObserver.onNext(EventProtoMapper.toProto(event, memberCount));
            responseObserver.onCompleted();
        } catch (Exception e) {
            handleError(e, responseObserver);
        }
    }

    @Override
    public void getEvent(GetEventRequest request, StreamObserver<EventResponse> responseObserver) {
        try {
            var eventId = parseUuid(request.getEventId(), "eventId");
            var event = eventManagementService.getEvent(eventId);
            int memberCount = eventMemberRepository.countByEventId(eventId);
            responseObserver.onNext(EventProtoMapper.toProto(event, memberCount));
            responseObserver.onCompleted();
        } catch (Exception e) {
            handleError(e, responseObserver);
        }
    }

    @Override
    public void updateEvent(UpdateEventRequest request, StreamObserver<EventResponse> responseObserver) {
        try {
            var event = eventManagementService.updateEvent(
                    parseUuid(request.getEventId(), "eventId"),
                    request.getTitle(),
                    request.getDate(),
                    request.getLocation(),
                    request.getImageUrl()
            );
            int memberCount = eventMemberRepository.countByEventId(event.getId());
            responseObserver.onNext(EventProtoMapper.toProto(event, memberCount));
            responseObserver.onCompleted();
        } catch (Exception e) {
            handleError(e, responseObserver);
        }
    }

    @Override
    public void deleteEvent(DeleteEventRequest request, StreamObserver<DeleteEventResponse> responseObserver) {
        try {
            eventManagementService.deleteEvent(
                    parseUuid(request.getEventId(), "eventId"),
                    parseUuid(request.getUserId(), "userId")
            );
            responseObserver.onNext(DeleteEventResponse.newBuilder().setSuccess(true).build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            handleError(e, responseObserver);
        }
    }

    @Override
    public void listUserEvents(ListUserEventsRequest request, StreamObserver<EventListResponse> responseObserver) {
        try {
            var userId = parseUuid(request.getUserId(), "userId");
            var events = eventMembershipService.listUserEvents(userId, request.getPage(), request.getSize());
            var response = buildEventListResponse(events);
            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            handleError(e, responseObserver);
        }
    }

    @Override
    public void getUpcomingEvents(GetUpcomingEventsRequest request, StreamObserver<EventListResponse> responseObserver) {
        try {
            var userId = parseUuid(request.getUserId(), "userId");
            var events = eventMembershipService.getUpcomingEvents(userId, request.getPage(), request.getSize());
            var response = buildEventListResponse(events);
            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            handleError(e, responseObserver);
        }
    }

    @Override
    public void joinEvent(JoinEventRequest request, StreamObserver<JoinEventResponse> responseObserver) {
        try {
            eventMembershipService.joinEvent(
                    parseUuid(request.getEventId(), "eventId"),
                    parseUuid(request.getUserId(), "userId")
            );
            responseObserver.onNext(JoinEventResponse.newBuilder().setSuccess(true).build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            handleError(e, responseObserver);
        }
    }

    @Override
    public void leaveEvent(LeaveEventRequest request, StreamObserver<LeaveEventResponse> responseObserver) {
        try {
            eventMembershipService.leaveEvent(
                    parseUuid(request.getEventId(), "eventId"),
                    parseUuid(request.getUserId(), "userId")
            );
            responseObserver.onNext(LeaveEventResponse.newBuilder().setSuccess(true).build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            handleError(e, responseObserver);
        }
    }

    @Override
    public void getEventMembers(GetEventMembersRequest request, StreamObserver<EventMemberListResponse> responseObserver) {
        try {
            var eventId = parseUuid(request.getEventId(), "eventId");
            var membersPage = eventMembershipService.getEventMembers(eventId, request.getPage(), request.getSize());
            var userIds = membersPage.getContent().stream()
                    .map(member -> member.getUserId().toString())
                    .toList();
            var response = EventMemberListResponse.newBuilder()
                    .addAllUserIds(userIds)
                    .setTotal((int) membersPage.getTotalElements())
                    .build();
            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            handleError(e, responseObserver);
        }
    }

    @Override
    public void generateInviteCode(GenerateInviteCodeRequest request, StreamObserver<InviteCodeResponse> responseObserver) {
        try {
            var eventId = parseUuid(request.getEventId(), "eventId");
            var event = eventManagementService.getEvent(eventId);
            var response = InviteCodeResponse.newBuilder()
                    .setCode(event.getInviteCode())
                    .setEventId(eventId.toString())
                    .build();
            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            handleError(e, responseObserver);
        }
    }

    @Override
    public void joinByInviteCode(JoinByInviteCodeRequest request, StreamObserver<JoinEventResponse> responseObserver) {
        try {
            eventMembershipService.joinByInviteCode(
                    request.getInviteCode(),
                    parseUuid(request.getUserId(), "userId")
            );
            responseObserver.onNext(JoinEventResponse.newBuilder().setSuccess(true).build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            handleError(e, responseObserver);
        }
    }

    @Override
    public void updateMediaCount(UpdateMediaCountRequest request, StreamObserver<UpdateMediaCountResponse> responseObserver) {
        try {
            eventManagementService.updateMediaCount(
                    parseUuid(request.getEventId(), "eventId"),
                    request.getDelta()
            );
            responseObserver.onNext(UpdateMediaCountResponse.newBuilder().setSuccess(true).build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            handleError(e, responseObserver);
        }
    }

    @Override
    public void countUserEvents(CountUserEventsRequest request, StreamObserver<CountResponse> responseObserver) {
        try {
            var userId = parseUuid(request.getUserId(), "userId");
            int count = eventMembershipService.countUserEvents(userId);
            responseObserver.onNext(CountResponse.newBuilder().setCount(count).build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            handleError(e, responseObserver);
        }
    }

    @Override
    public void listEventsForUsers(ListEventsForUsersRequest request, StreamObserver<EventListResponse> responseObserver) {
        try {
            var userIds = request.getUserIdsList().stream()
                    .map(id -> parseUuid(id, "userId"))
                    .toList();
            var events = eventMembershipService.listEventsForUsers(userIds, request.getPage(), request.getSize());
            var response = buildEventListResponse(events);
            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            handleError(e, responseObserver);
        }
    }

    private EventListResponse buildEventListResponse(java.util.List<Event> events) {
        var builder = EventListResponse.newBuilder()
                .setTotal(events.size());
        for (var event : events) {
            int memberCount = eventMemberRepository.countByEventId(event.getId());
            builder.addEvents(EventProtoMapper.toProto(event, memberCount));
        }
        return builder.build();
    }

    private <T> void handleError(Exception e, StreamObserver<T> responseObserver) {
        if (e instanceof io.grpc.StatusRuntimeException sre) {
            responseObserver.onError(sre);
        } else {
            log.error("Unexpected error in gRPC service", e);
            responseObserver.onError(Status.INTERNAL
                    .withDescription("Internal server error")
                    .asRuntimeException());
        }
    }
}
