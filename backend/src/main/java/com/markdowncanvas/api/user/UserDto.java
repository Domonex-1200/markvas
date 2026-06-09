package com.markdowncanvas.api.user;

import lombok.Data;

import java.time.Instant;

public class UserDto {

    @Data
    public static class ProfileResponse {
        private String id;
        private String email;
        private String role;
        private String nickname;
        private String phone;
        private String birthday;   // ISO date string "yyyy-MM-dd"
        private String gender;
        private String profilePictureUrl;
        private String createdAt;

        public static ProfileResponse from(User u) {
            ProfileResponse r = new ProfileResponse();
            r.id                = u.getId();
            r.email             = u.getEmail();
            r.role              = u.getRole().name();
            r.nickname          = u.getNickname();
            r.phone             = u.getPhone();
            r.birthday          = u.getBirthday() != null ? u.getBirthday().toString() : null;
            r.gender            = u.getGender() != null ? u.getGender().name() : null;
            r.profilePictureUrl = u.getProfilePictureUrl();
            r.createdAt         = u.getCreatedAt().toString();
            return r;
        }
    }

    @Data
    public static class UpdateProfileRequest {
        private String nickname;
        private String phone;
        private String birthday;   // "yyyy-MM-dd" or null
        private String gender;     // "MALE" | "FEMALE" | "OTHER" or null
        private String profilePictureUrl;
    }

    @Data
    public static class DeveloperApplicationRequest {
        private String reason;
    }

    @Data
    public static class ReviewApplicationRequest {
        private boolean approve;
        private String note;
    }

    @Data
    public static class DeveloperApplicationResponse {
        private String id;
        private String userId;
        private String userEmail;
        private String userNickname;
        private String reason;
        private String status;
        private String reviewNote;
        private String reviewedBy;
        private String appliedAt;
        private String reviewedAt;

        public static DeveloperApplicationResponse from(DeveloperApplication a) {
            DeveloperApplicationResponse r = new DeveloperApplicationResponse();
            r.id            = a.getId();
            r.userId        = a.getUser().getId();
            r.userEmail     = a.getUser().getEmail();
            r.userNickname  = a.getUser().getNickname();
            r.reason        = a.getReason();
            r.status        = a.getStatus().name();
            r.reviewNote    = a.getReviewNote();
            r.reviewedBy    = a.getReviewedBy();
            r.appliedAt     = a.getAppliedAt().toString();
            r.reviewedAt    = a.getReviewedAt() != null ? a.getReviewedAt().toString() : null;
            return r;
        }
    }
}
