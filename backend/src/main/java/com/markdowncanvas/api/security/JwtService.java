package com.markdowncanvas.api.security;

import com.markdowncanvas.api.user.User;
import com.markdowncanvas.api.user.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.access-secret}")
    private String accessSecret;

    @Value("${jwt.refresh-secret}")
    private String refreshSecret;

    @Value("${jwt.access-ttl-seconds:900}")
    private long accessTtlSeconds;

    @Value("${jwt.refresh-ttl-seconds:2592000}")
    private long refreshTtlSeconds;

    public String issueAccess(User user) {
        return build(user, accessSecret, accessTtlSeconds * 1000);
    }

    public String issueRefresh(User user) {
        return build(user, refreshSecret, refreshTtlSeconds * 1000);
    }

    public JwtPrincipal parseAccess(String token) {
        return parse(token, accessSecret);
    }

    public JwtPrincipal parseRefresh(String token) {
        return parse(token, refreshSecret);
    }

    private String build(User user, String secret, long ttlMillis) {
        Date now = new Date();
        return Jwts.builder()
                .subject(user.getId())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .issuedAt(now)
                .expiration(new Date(now.getTime() + ttlMillis))
                .signWith(key(secret))
                .compact();
    }

    private JwtPrincipal parse(String token, String secret) {
        Claims claims = Jwts.parser()
                .verifyWith(key(secret))
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return new JwtPrincipal(
                claims.getSubject(),
                claims.get("email", String.class),
                UserRole.valueOf(claims.get("role", String.class))
        );
    }

    private SecretKey key(String secret) {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}
