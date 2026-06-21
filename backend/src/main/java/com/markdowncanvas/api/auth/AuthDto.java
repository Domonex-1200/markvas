package com.markdowncanvas.api.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class AuthDto {

    @Data
    public static class RegisterRequest {
        @Email @NotBlank private String email;
        @NotBlank private String password;
        private String nickname;      // 선택 항목
    }

    @Data
    public static class LoginRequest {
        @Email @NotBlank private String email;
        @NotBlank private String password;
    }

    @Data
    public static class RefreshRequest {
        @NotBlank private String refreshToken;
    }

    @Data
    public static class TokenResponse {
        private String accessToken;
        private String refreshToken;

        public TokenResponse(String accessToken, String refreshToken) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
        }
    }

    @Data
    public static class UserResponse {
        private String id;
        private String email;
        private String role;
        private String nickname;
        private String profilePictureUrl;
    }

    @Data
    public static class AuthResponse {
        private UserResponse user;
        private TokenResponse tokens;
    }

    @Data
    public static class ForgotPasswordRequest {
        @Email @NotBlank private String email;
    }

    @Data
    public static class ResetPasswordRequest {
        @NotBlank private String token;
        @NotBlank private String newPassword;
    }

    @Data
    public static class GoogleLoginRequest {
        @NotBlank private String idToken;
    }
}