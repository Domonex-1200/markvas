package com.markdowncanvas.api.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@markvas.com}")
    private String from;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${app.frontend-url:https://d36v39m4b0nmuu.cloudfront.net}")
    private String frontendUrl;

    public void sendPasswordResetEmail(String toEmail, String rawToken) {
        String resetLink = frontendUrl + "/reset-password?token=" + rawToken;

        if (mailUsername == null || mailUsername.isBlank()) {
            log.info("[DEV] Password reset link for {}: {}", toEmail, resetLink);
            return;
        }

        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(from);
            msg.setTo(toEmail);
            msg.setSubject("[MarkVas] 비밀번호 재설정 안내");
            msg.setText("""
                    MarkVas 비밀번호 재설정 요청을 받았습니다.

                    아래 링크를 클릭하여 비밀번호를 재설정하세요.
                    링크는 1시간 동안 유효합니다.

                    %s

                    비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시하세요.
                    """.formatted(resetLink));
            mailSender.send(msg);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
            log.info("[FALLBACK] Password reset link for {}: {}", toEmail, resetLink);
        }
    }
}
