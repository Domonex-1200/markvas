package com.markdowncanvas.api.asset;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AssetReviewRepository extends JpaRepository<AssetReview, String> {
    List<AssetReview> findByAssetIdOrderByCreatedAtDesc(String assetId);
    Optional<AssetReview> findByAssetIdAndUserId(String assetId, String userId);
    void deleteByAssetIdAndUserId(String assetId, String userId);

    @Query("SELECT AVG(r.rating) FROM AssetReview r WHERE r.assetId = :assetId")
    Double avgRatingByAssetId(String assetId);

    long countByAssetId(String assetId);
}
