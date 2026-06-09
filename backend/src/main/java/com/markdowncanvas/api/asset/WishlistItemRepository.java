package com.markdowncanvas.api.asset;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, String> {
    List<WishlistItem> findByUserIdOrderByAddedAtDesc(String userId);
    Optional<WishlistItem> findByUserIdAndAssetId(String userId, String assetId);
    void deleteByUserIdAndAssetId(String userId, String assetId);
}
