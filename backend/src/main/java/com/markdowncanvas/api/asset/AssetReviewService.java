package com.markdowncanvas.api.asset;

import com.markdowncanvas.api.user.UserRepository;
import com.markdowncanvas.api.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetReviewService {

    private final AssetReviewRepository reviews;
    private final AssetRepository assets;
    private final UserRepository users;

    public List<AssetReviewDto.ReviewResponse> listByAsset(String assetId) {
        return reviews.findByAssetIdOrderByCreatedAtDesc(assetId)
                .stream().map(AssetReviewDto.ReviewResponse::from).toList();
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
        if (!r.getUserId().equals(userId) && role != UserRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permission denied.");
        }
        reviews.delete(r);
    }
}
