package com.dump.apigateway.controller;

import com.dump.apigateway.dto.ClippingDto;
import com.dump.apigateway.mapper.MediaMapper;
import com.dump.mediaservice.grpc.*;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/clippings")
public class ClippingController {

    @GrpcClient("media-service")
    private MediaServiceGrpc.MediaServiceBlockingStub mediaStub;

    @PostMapping("/{mediaId}")
    public ResponseEntity<Map<String, Boolean>> clip(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String mediaId) {
        ClipResponse response = mediaStub.clip(ClipRequest.newBuilder()
                .setMediaId(mediaId).setUserId(userId).build());
        return ResponseEntity.ok(Map.of("success", response.getSuccess()));
    }

    @DeleteMapping("/{mediaId}")
    public ResponseEntity<Map<String, Boolean>> removeClip(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String mediaId) {
        ClipResponse response = mediaStub.removeClip(ClipRequest.newBuilder()
                .setMediaId(mediaId).setUserId(userId).build());
        return ResponseEntity.ok(Map.of("success", response.getSuccess()));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> listClippings(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        ClippingListResponse response = mediaStub.listClippings(ListClippingsRequest.newBuilder()
                .setUserId(userId).setPage(page).setSize(size).build());
        return ResponseEntity.ok(Map.of(
                "clippings", MediaMapper.toClippingDtoList(response.getClippingsList()),
                "total", response.getTotal()
        ));
    }
}
