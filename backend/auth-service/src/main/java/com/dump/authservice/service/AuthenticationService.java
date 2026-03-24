package com.dump.authservice.service;

import com.dump.authservice.entity.RefreshToken;
import com.dump.authservice.entity.User;
import com.dump.authservice.kafka.AuthKafkaProducer;
import com.dump.authservice.repository.RefreshTokenRepository;
import com.dump.authservice.repository.UserRepository;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthKafkaProducer authKafkaProducer;

    public record AuthResult(String accessToken, String refreshToken, User user) {}

    public AuthResult register(String name, String username, String email, String password) {
        if (userRepository.existsByEmail(email)) {
            throw new StatusRuntimeException(Status.ALREADY_EXISTS.withDescription("Email already registered"));
        }
        if (userRepository.existsByUsername(username)) {
            throw new StatusRuntimeException(Status.ALREADY_EXISTS.withDescription("Username already taken"));
        }

        var user = User.builder()
                .name(name)
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .authProvider("LOCAL")
                .build();
        user = userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user);
        String refreshTokenStr = jwtService.generateRefreshToken();

        var refreshToken = RefreshToken.builder()
                .token(refreshTokenStr)
                .user(user)
                .expiryDate(Instant.now().plusMillis(jwtService.getRefreshExpirationMs()))
                .build();
        refreshTokenRepository.save(refreshToken);

        authKafkaProducer.publishUserRegistered(user.getId());

        return new AuthResult(accessToken, refreshTokenStr, user);
    }

    public AuthResult login(String email, String password) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new StatusRuntimeException(
                        Status.UNAUTHENTICATED.withDescription("Invalid email or password")));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new StatusRuntimeException(
                    Status.UNAUTHENTICATED.withDescription("Invalid email or password"));
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshTokenStr = jwtService.generateRefreshToken();

        refreshTokenRepository.deleteByUserId(user.getId());

        var refreshToken = RefreshToken.builder()
                .token(refreshTokenStr)
                .user(user)
                .expiryDate(Instant.now().plusMillis(jwtService.getRefreshExpirationMs()))
                .build();
        refreshTokenRepository.save(refreshToken);

        return new AuthResult(accessToken, refreshTokenStr, user);
    }

    public AuthResult socialLogin(String provider, String idToken) {
        // TODO: Implement social login verification with external HTTP calls (Google, Apple).
        // This requires validating the idToken with the respective provider's token endpoint
        // and then finding or creating the user based on the provider's user info.
        throw new StatusRuntimeException(
                Status.UNIMPLEMENTED.withDescription("Social login is not yet implemented"));
    }

    public AuthResult refreshToken(String token) {
        var refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new StatusRuntimeException(
                        Status.UNAUTHENTICATED.withDescription("Invalid refresh token")));

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new StatusRuntimeException(
                    Status.UNAUTHENTICATED.withDescription("Refresh token has expired"));
        }

        var user = refreshToken.getUser();
        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshTokenStr = jwtService.generateRefreshToken();

        refreshTokenRepository.delete(refreshToken);

        var newRefreshToken = RefreshToken.builder()
                .token(newRefreshTokenStr)
                .user(user)
                .expiryDate(Instant.now().plusMillis(jwtService.getRefreshExpirationMs()))
                .build();
        refreshTokenRepository.save(newRefreshToken);

        return new AuthResult(newAccessToken, newRefreshTokenStr, user);
    }
}
