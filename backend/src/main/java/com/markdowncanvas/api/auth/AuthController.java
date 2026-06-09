package com.markdowncanvas.api.auth;

import com.markdowncanvas.api.security.JwtPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthDto.AuthResponse register(@Valid @RequestBody AuthDto.RegisterRequest dto) {
        return authService.register(dto);
    }

    @PostMapping("/login")
    public AuthDto.AuthResponse login(@Valid @RequestBody AuthDto.LoginRequest dto) {
        return authService.login(dto);
    }

    @PostMapping("/refresh")
    public AuthDto.TokenResponse refresh(@Valid @RequestBody AuthDto.RefreshRequest dto) {
        return authService.refresh(dto.getRefreshToken());
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public AuthDto.UserResponse me(@AuthenticationPrincipal JwtPrincipal principal) {
        return authService.me(principal.userId());
    }
}
