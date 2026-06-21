package com.markdowncanvas.api.asset;

import com.markdowncanvas.api.user.UserRepository;
import com.markdowncanvas.api.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetReviewService {

    private final AssetReviewRepository reviews;
    private final AssetRepository assets;
    private final UserRepository users;

    public List<AssetReviewDto.ReviewResponse> listByAsset(String assetId) {
        List<AssetReview> topLevel = reviews.findByAssetIdAndParentIdIsNullOrderByCreatedAtDesc(assetId);
        return topLevel.stream().map(r -> {
            AssetReviewDto.ReviewResponse res = AssetReviewDto.ReviewResponse.from(r);
            List<AssetReviewDto.ReviewResponse> replies = reviews.findByParentIdOrderByCreatedAtAsc(r.getId())
                    .stream().map(AssetReviewDto.ReviewResponse::from).toList();
            res.setReplies(replies);
            return res;
        }).toList();
    }

    public AssetReviewDto.RatingSummary summary(String assetId) {
        AssetReviewDto.RatingSummary s = new AssetReviewDto.RatingSummary();
        Double avg = reviews.avgRatingByAssetId(assetId);
        s.setAvgRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        s.setReviewCount(reviews.countByAssetId(assetId));
        return s;
    }

    @Transactional
    public AssetReviewDto.ReviewResponse create(String userId, String assetId,
                                                AssetReviewDto.CreateRequest dto) {
        if (!assets.existsById(assetId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found.");
        }

        // Reply case (parentId provided, no rating required)
        if (dto.getParentId() != null && !dto.getParentId().isBlank()) {
            AssetReview parent = reviews.findById(dto.getParentId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent review not found."));
            if (!parent.getAssetId().equals(assetId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parent review does not belong to this asset.");
            }
            AssetReview reply = new AssetReview();
            reply.setAssetId(assetId);
            reply.setUserId(userId);
            reply.setParentId(dto.getParentId());
            reply.setBody(dto.getBody());
            reply.setRating(0);
            AssetReview saved = reviews.save(reply);
            users.findById(userId).ifPresent(saved::setUser);
            return AssetReviewDto.ReviewResponse.from(saved);
        }

        // Top-level review
        if (dto.getRating() == null || dto.getRating() < 1 || dto.getRating() > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating is required for a review (1-5).");
        }
        if (reviews.findByAssetIdAndUserId(assetId, userId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already reviewed.");
        }
        AssetReview r = new AssetReview();
        r.setAssetId(assetId);
        r.setUserId(userId);
        r.setRating(dto.getRating());
        r.setBody(dto.getBody());
        AssetReview saved = reviews.save(r);
        users.findById(userId).ifPresent(saved::setUser);
        return AssetReviewDto.ReviewResponse.from(saved);
    }

    @Transactional
    public void delete(String userId, UserRole role, String assetId, String reviewId) {
        AssetReview r = reviews.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found."));

        // Asset owner can also delete reviews on their asset
        boolean isOwner = role == UserRole.ADMIN;
        boolean isAuthor = r.getUserId().equals(userId);
        boolean isAssetOwner = assets.findById(assetId)
                .map(a -> a.getAuthorId().equals(userId)).orElse(false);

        if (!isAuthor && !isOwner && !isAssetOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permission denied.");
        }

        // Soft delete
        r.setDeletedAt(Instant.now());
        reviews.save(r);
    }
}
