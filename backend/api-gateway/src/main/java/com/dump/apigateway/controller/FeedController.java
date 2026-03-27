package com.dump.apigateway.controller;

import com.dump.apigateway.dto.FeedPostDto;
import com.dump.apigateway.dto.UserProfileDto;
import com.dump.apigateway.mapper.AuthMapper;
import com.dump.apigateway.mapper.MediaMapper;
import com.dump.authservice.grpc.*;
import com.dump.eventservice.grpc.*;
import com.dump.mediaservice.grpc.*;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.extern.slf4j.Slf4j;

import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/feed")
public class FeedController {

    @GrpcClient("auth-service")
    private AuthServiceGrpc.AuthServiceBlockingStub authStub;

    @GrpcClient("event-service")
    private EventServiceGrpc.EventServiceBlockingStub eventStub;

    @GrpcClient("media-service")
    private MediaServiceGrpc.MediaServiceBlockingStub mediaStub;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getFeed(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        // 1. Collect event IDs from friends AND own events
        Set<String> eventIds = new LinkedHashSet<>();
        Map<String, EventResponse> eventMap = new HashMap<>();

        // Get events from users we follow
        try {
            UserListResponse following = authStub.getFollowing(GetFollowingRequest.newBuilder()
                    .setUserId(userId).setPage(0).setSize(100).build());

            List<String> followingIds = following.getUsersList().stream()
                    .map(UserProfile::getId)
                    .toList();

            if (!followingIds.isEmpty()) {
                EventListResponse followingEvents = eventStub.listEventsForUsers(ListEventsForUsersRequest.newBuilder()
                        .addAllUserIds(followingIds).setPage(0).setSize(50).build());
                for (EventResponse e : followingEvents.getEventsList()) {
                    eventIds.add(e.getId());
                    eventMap.put(e.getId(), e);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch events from followed users", e);
        }

        // Get own events
        try {
            EventListResponse ownEvents = eventStub.listUserEvents(ListUserEventsRequest.newBuilder()
                    .setUserId(userId).setPage(0).setSize(50).build());
            for (EventResponse e : ownEvents.getEventsList()) {
                eventIds.add(e.getId());
                eventMap.put(e.getId(), e);
            }
        } catch (Exception e) {
            log.warn("Failed to fetch user's own events", e);
        }

        if (eventIds.isEmpty()) {
            return ResponseEntity.ok(Map.of("posts", List.of(), "total", 0));
        }

        // 2. Get feed posts (top media per event)
        FeedResponse feedResponse;
        try {
            feedResponse = mediaStub.getFeedForEvents(GetFeedForEventsRequest.newBuilder()
                    .addAllEventIds(eventIds).setPage(page).setSize(size).build());
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("posts", List.of(), "total", 0));
        }

        // 3. Enrich with event title/date
        List<FeedPostDto> posts = MediaMapper.toFeedDtoList(feedResponse.getPostsList());
        List<FeedPostDto> enrichedPosts = posts.stream().map(post -> {
            EventResponse event = eventMap.get(post.eventId());
            if (event != null) {
                return MediaMapper.enrichFeedPost(post, event);
            }
            return post;
        }).toList();

        return ResponseEntity.ok(Map.of("posts", enrichedPosts, "total", feedResponse.getTotal()));
    }

    @GetMapping("/friends")
    public ResponseEntity<List<UserProfileDto>> getFriends(@RequestHeader("X-User-Id") String userId) {
        UserListResponse response = authStub.getFollowing(GetFollowingRequest.newBuilder()
                .setUserId(userId).setPage(0).setSize(100).build());
        return ResponseEntity.ok(AuthMapper.toDtoList(response.getUsersList()));
    }
}
