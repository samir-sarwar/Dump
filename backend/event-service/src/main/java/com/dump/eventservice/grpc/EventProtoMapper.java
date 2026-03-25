package com.dump.eventservice.grpc;

import com.dump.eventservice.entity.Event;

public final class EventProtoMapper {

    private EventProtoMapper() {
        // utility class
    }

    public static EventResponse toProto(Event event, int memberCount) {
        var builder = EventResponse.newBuilder()
                .setId(event.getId().toString())
                .setMemberCount(memberCount)
                .setMediaCount(event.getMediaCount());

        if (event.getTitle() != null) {
            builder.setTitle(event.getTitle());
        }
        if (event.getDate() != null) {
            builder.setDate(event.getDate().toString());
        }
        if (event.getLocation() != null) {
            builder.setLocation(event.getLocation());
        }
        if (event.getImageUrl() != null) {
            builder.setImageUrl(event.getImageUrl());
        }
        if (event.getCreatorId() != null) {
            builder.setCreatorId(event.getCreatorId().toString());
        }
        if (event.getInviteCode() != null) {
            builder.setInviteCode(event.getInviteCode());
        }
        if (event.getCreatedAt() != null) {
            builder.setCreatedAt(event.getCreatedAt().toString());
        }

        return builder.build();
    }
}
