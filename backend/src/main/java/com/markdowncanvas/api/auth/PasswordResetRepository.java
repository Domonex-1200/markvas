package com.markdowncanvas.api.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface PasswordResetRepository extends JpaRepository<PasswordResetToken, String> {
    List<PasswordResetToken> findByUserIdAndUsedFalseAndExpiresAtAfter(String userId, Instant now);
    void deleteByUsedTrueOrExpiresAtBefore(boolean used, Instant now);
}
