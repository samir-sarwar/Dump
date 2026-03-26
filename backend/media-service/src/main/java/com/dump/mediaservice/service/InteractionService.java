package com.dump.mediaservice.service;

import com.dump.mediaservice.entity.Bookmark;
import com.dump.mediaservice.entity.Comment;
import com.dump.mediaservice.entity.Media;
import com.dump.mediaservice.entity.MediaLike;
import com.dump.mediaservice.repository.BookmarkRepository;
import com.dump.mediaservice.repository.CommentRepository;
import com.dump.mediaservice.repository.MediaLikeRepository;
import com.dump.mediaservice.repository.MediaRepository;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class InteractionService {

    private static final int HIGHLIGHT_THRESHOLD = 10;

    private final MediaLikeRepository mediaLikeRepository;
    private final CommentRepository commentRepository;
    private final BookmarkRepository bookmarkRepository;
    private final MediaRepository mediaRepository;

    public int like(UUID mediaId, UUID userId) {
        if (mediaLikeRepository.existsByMediaIdAndUserId(mediaId, userId)) {
            throw new StatusRuntimeException(
                    Status.ALREADY_EXISTS.withDescription("User already liked this media"));
        }

        MediaLike like = MediaLike.builder()
                .mediaId(mediaId)
                .userId(userId)
                .build();
        mediaLikeRepository.save(like);
        mediaRepository.updateLikeCount(mediaId, 1);

        Media media = mediaRepository.findById(mediaId).orElse(null);
        if (media != null && media.getLikeCount() >= HIGHLIGHT_THRESHOLD && !media.isHighlight()) {
            mediaRepository.markAsHighlight(mediaId);
            log.info("Media {} marked as highlight (likeCount >= {})", mediaId, HIGHLIGHT_THRESHOLD);
        }

        return media != null ? media.getLikeCount() : 1;
    }

    public int unlike(UUID mediaId, UUID userId) {
        MediaLike like = mediaLikeRepository.findByMediaIdAndUserId(mediaId, userId)
                .orElseThrow(() -> new StatusRuntimeException(
                        Status.NOT_FOUND.withDescription("Like not found")));

        mediaLikeRepository.delete(like);
        mediaRepository.updateLikeCount(mediaId, -1);

        Media media = mediaRepository.findById(mediaId).orElse(null);
        return media != null ? Math.max(0, media.getLikeCount()) : 0;
    }

    public Comment comment(UUID mediaId, UUID userId, String text) {
        Comment comment = Comment.builder()
                .mediaId(mediaId)
                .userId(userId)
                .text(text)
                .build();
        comment = commentRepository.save(comment);
        mediaRepository.updateCommentCount(mediaId, 1);
        return comment;
    }

    public Page<Comment> listComments(UUID mediaId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return commentRepository.findByMediaIdOrderByCreatedAtDesc(mediaId, pageable);
    }

    public void bookmark(UUID mediaId, UUID userId) {
        if (bookmarkRepository.findByMediaIdAndUserId(mediaId, userId).isPresent()) {
            return; // Already bookmarked, no-op
        }

        Bookmark bookmark = Bookmark.builder()
                .mediaId(mediaId)
                .userId(userId)
                .build();
        bookmarkRepository.save(bookmark);
    }

    public void removeBookmark(UUID mediaId, UUID userId) {
        Bookmark bookmark = bookmarkRepository.findByMediaIdAndUserId(mediaId, userId)
                .orElseThrow(() -> new StatusRuntimeException(
                        Status.NOT_FOUND.withDescription("Bookmark not found")));
        bookmarkRepository.delete(bookmark);
    }

    public List<Media> listBookmarks(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Bookmark> bookmarks = bookmarkRepository.findByUserId(userId, pageable);

        List<UUID> mediaIds = bookmarks.getContent().stream()
                .map(Bookmark::getMediaId)
                .toList();
        if (mediaIds.isEmpty()) return List.of();

        return mediaRepository.findAllById(mediaIds).stream()
                .filter(m -> "ACTIVE".equals(m.getStatus()))
                .toList();
    }
}
