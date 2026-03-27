package com.dump.apigateway.mapper;

import com.dump.apigateway.dto.EventResponseDto;
import com.dump.eventservice.grpc.EventResponse;

import java.util.List;

public final class EventMapper {

    private EventMapper() {}

    public static EventResponseDto toDto(EventResponse proto) {
        return new EventResponseDto(
                proto.getId(),
                proto.getTitle(),
                proto.getDate(),
                proto.getLocation(),
                proto.getImageUrl(),
                proto.getCreatorId(),
                proto.getMemberCount(),
                proto.getMediaCount(),
                proto.getInviteCode(),
                proto.getCreatedAt()
        );
    }

    public static List<EventResponseDto> toDtoList(List<EventResponse> protos) {
        return protos.stream().map(EventMapper::toDto).toList();
    }
}
