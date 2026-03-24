package com.dump.authservice.repository;

import com.dump.authservice.entity.Follow;
import com.dump.authservice.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FollowRepository extends JpaRepository<Follow, UUID> {

    Optional<Follow> findByFollowerIdAndFolloweeId(UUID followerId, UUID followeeId);

    boolean existsByFollowerIdAndFolloweeId(UUID followerId, UUID followeeId);

    Page<Follow> findByFollowerId(UUID followerId, Pageable pageable);

    Page<Follow> findByFolloweeId(UUID followeeId, Pageable pageable);

    int countByFolloweeId(UUID followeeId);

    int countByFollowerId(UUID followerId);

    @Query("""
            SELECT f1.follower FROM Follow f1
            JOIN Follow f2 ON f1.follower.id = f2.followee.id AND f1.followee.id = f2.follower.id
            WHERE f1.followee.id = :userId
            """)
    List<User> findMutualFollows(@Param("userId") UUID userId);

    @Query("SELECT f.followee.id, COUNT(f) FROM Follow f WHERE f.followee.id IN :userIds GROUP BY f.followee.id")
    List<Object[]> countFollowersBatch(@Param("userIds") List<UUID> userIds);
}
