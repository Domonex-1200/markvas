package com.markdowncanvas.api.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.markdowncanvas.api.security.JwtPrincipal;
import com.markdowncanvas.api.security.JwtService;
import com.markdowncanvas.api.user.User;
import com.markdowncanvas.api.user.UserRepository;
import com.markdowncanvas.api.user.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordResetRepository passwordResets;
    private final EmailService emailService;

    @Value("${app.google.client-id:}")
    private String googleClientId;

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest dto) {
        if (users.existsByEmail(dto.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered.");
        }
        User user = new User();
        user.setEmail(dto.getEmail().toLowerCase());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(UserRole.USER);
        if (dto.getNickname() != null && !dto.getNickname().isBlank()) {
            user.setNickname(dto.getNickname().trim());
        }
        users.save(user);
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthDto.AuthResponse login(AuthDto.LoginRequest dto) {
        User user = users.findByEmail(dto.getEmail().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials."));
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials.");
        }
        if (!user.isActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is deactivated.");
        }
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthDto.TokenResponse refresh(String refreshToken) {
        JwtPrincipal principal;
        try {
            principal = jwtService.parseRefresh(refreshToken);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token.");
        }
        User user = users.findById(principal.userId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));
        if (user.getRefreshTokenHash() == null ||
                !passwordEncoder.matches(refreshToken, user.getRefreshTokenHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token.");
        }
        if (!user.isActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is deactivated.");
        }
        return issueTokens(user);
    }

    public AuthDto.UserResponse me(String userId) {
        User user = users.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        return toUserResponse(user);
    }

    @Transactional
    public void forgotPassword(String email) {
        users.findByEmail(email.toLowerCase()).ifPresent(user -> {
            String rawToken = UUID.randomUUID().toString();
            PasswordResetToken prt = new PasswordResetToken();
            prt.setUserId(user.getId());
            prt.setTokenHash(passwordEncoder.encode(rawToken));
            prt.setExpiresAt(Instant.now().plusSeconds(3600));
            passwordResets.save(prt);
            emailService.sendPasswordResetEmail(user.getEmail(), prt.getId() + ":" + rawToken);
        });
    }

    @Transactional
    public void resetPassword(String tokenParam, String newPassword) {
        String[] parts = tokenParam.split(":", 2);
        if (parts.length != 2) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid token.");
        String tokenId = parts[0];
        String rawToken = parts[1];

        PasswordResetToken prt = passwordResets.findById(tokenId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired token."));
        if (prt.isUsed() || prt.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token has expired.");
        }
        if (!passwordEncoder.matches(rawToken, prt.getTokenHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid token.");
        }
        User user = users.findById(prt.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setRefreshTokenHash(null);
        users.save(user);
        prt.setUsed(true);
        passwordResets.save(prt);
    }

    @Transactional
    public AuthDto.AuthResponse googleLogin(String idToken) {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "Google login not configured.");
        }
        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create("https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken))
                    .GET().build();
            HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() != 200) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google token.");
            }
            JsonNode json = new ObjectMapper().readTree(resp.body());
            String aud = json.path("aud").asText();
            if (!googleClientId.equals(aud)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token audience mismatch.");
            }
            String email = json.path("email").asText().toLowerCase();
            String name  = json.path("name").asText();
            String picture = json.path("picture").asText();

            User user = users.findByEmail(email).orElseGet(() -> {
                User u = new User();
                u.setEmail(email);
                u.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                u.setRole(UserRole.USER);
                u.setNickname(name.isBlank() ? null : name);
                u.setProfilePictureUrl(picture.isBlank() ? null : picture);
                return users.save(u);
            });
            if (!user.isActive()) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is deactivated.");
            return buildAuthResponse(user);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("Google login error", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Google login failed.");
        }
    }

    private AuthDto.AuthResponse buildAuthResponse(User user) {
        AuthDto.AuthResponse resp = new AuthDto.AuthResponse();
        resp.setUser(toUserResponse(user));
        resp.setTokens(issueTokens(user));
        return resp;
    }

    private AuthDto.TokenResponse issueTokens(User user) {
        String access = jwtService.issueAccess(user);
        String refresh = jwtService.issueRefresh(user);
        user.setRefreshTokenHash(passwordEncoder.encode(refresh));
        users.save(user);
        return new AuthDto.TokenResponse(access, refresh);
    }

    private AuthDto.UserResponse toUserResponse(User user) {
        AuthDto.UserResponse r = new AuthDto.UserResponse();
        r.setId(user.getId());
        r.setEmail(user.getEmail());
        r.setRole(user.getRole().name());
        r.setNickname(user.getNickname());
        r.setProfilePictureUrl(user.getProfilePictureUrl());
        return r;
    }
}