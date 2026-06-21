package com.markdowncanvas.api.asset;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

public class AssetReviewDto {

    @Data
    public static class CreateRequest {
        @NotNull @Min(1) @Max(5)
        private Integer rating;
        private String body;
    }

    @Data
    public static class ReviewResponse {
        private String id;
        private String assetId;
        private String userId;
        private String userNickname;
        private String userProfilePictureUrl;
        private int rating;
        private String body;
        private String createdAt;

        public static ReviewResponse from(AssetReview r) {
            ReviewResponse res = new ReviewResponse();
            res.id        = r.getId();
            res.assetId   = r.getAssetId();
            res.userId    = r.getUserId();
            res.rating    = r.getRating();
            res.body      = r.getBody();
            res.createdAt = r.getCreatedAt().toString();
            if (r.getUser() != null) {
                res.userNickname           = r.getUser().getNickname();
                res.userProfilePictureUrl  = r.getUser().getProfilePictureUrl();
            }
            return res;
        }
    }

    @Data
    public static class RatingSummary {
        private double avgRating;
        private long reviewCount;
    }
}
