package com.markdowncanvas.api.security;

import com.markdowncanvas.api.user.UserRole;

public record JwtPrincipal(String userId, String email, UserRole role) {}
