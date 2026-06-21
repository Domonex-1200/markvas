package com.markdowncanvas.api.asset;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AssetReviewRepository extends JpaRepository<AssetReview, String> {
    // top-level reviews (no parent) ordered by date
    List<AssetReview> findByAssetIdAndParentIdIsNullOrderByCreatedAtDesc(String assetId);
    // replies for a given parent
    List<AssetReview> findByParentIdOrderByCreatedAtAsc(String parentId);
    Optional<AssetReview> findByAssetIdAndUserId(String assetId, String userId);
    void deleteByAssetIdAndUserId(String assetId, String userId);

    @Query("SELECT AVG(r.rating) FROM AssetReview r WHERE r.assetId = :assetId AND r.deletedAt IS NULL AND r.parentId IS NULL")
    Double avgRatingByAssetId(String assetId);

    @Query("SELECT COUNT(r) FROM AssetReview r WHERE r.assetId = :assetId AND r.deletedAt IS NULL AND r.parentId IS NULL")
    long countByAssetId(String assetId);

    @Query("SELECT AVG(r.rating) FROM AssetReview r WHERE r.assetId = :assetId AND r.deletedAt IS NULL AND r.parentId IS NULL")
    Double avgRating(String assetId);
}
