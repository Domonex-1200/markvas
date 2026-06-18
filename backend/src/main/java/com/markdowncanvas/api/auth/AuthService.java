package com.markdowncanvas.api.auth;

import com.markdowncanvas.api.security.JwtPrincipal;
import com.markdowncanvas.api.security.JwtService;
import com.markdowncanvas.api.user.User;
import com.markdowncanvas.api.user.UserRepository;
import com.markdowncanvas.api.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

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