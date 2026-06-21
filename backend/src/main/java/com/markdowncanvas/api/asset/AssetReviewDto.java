package com.markdowncanvas.api.asset;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.util.List;

public class AssetReviewDto {

    @Data
    public static class CreateRequest {
        @Min(1) @Max(5)
        private Integer rating; // null if this is a reply
        private String body;
        private String parentId; // null for top-level review
    }

    @Data
    public static class ReviewResponse {
        private String id;
        private String assetId;
        private String userId;
        private String userNickname;
        private String userProfilePictureUrl;
        private Integer rating;
        private String body;
        private String parentId;
        private boolean deleted;
        private String createdAt;
        private List<ReviewResponse> replies;

        public static ReviewResponse from(AssetReview r) {
            ReviewResponse res = new ReviewResponse();
            res.id        = r.getId();
            res.assetId   = r.getAssetId();
            res.parentId  = r.getParentId();
            res.deleted   = r.getDeletedAt() != null;
            res.createdAt = r.getCreatedAt().toString();
            if (r.getDeletedAt() == null) {
                res.userId    = r.getUserId();
                res.rating    = r.getRating();
                res.body      = r.getBody();
                if (r.getUser() != null) {
                    res.userNickname          = r.getUser().getNickname();
                    res.userProfilePictureUrl = r.getUser().getProfilePictureUrl();
                }
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
