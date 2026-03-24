package com.dump.authservice.repository;

import com.dump.authservice.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findByAuthProviderAndProviderId(String authProvider, String providerId);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    List<User> findAllByIdIn(List<UUID> ids);

    @Query("SELECT u FROM User u WHERE LOWER(u.username) LIKE LOWER(CONCAT(:query, '%')) ORDER BY u.username")
    Page<User> searchByUsernamePrefix(@Param("query") String query, Pageable pageable);
}
