package com.markdowncanvas.api.asset;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, String> {
    List<CartItem> findByUserIdOrderByAddedAtDesc(String userId);
    Optional<CartItem> findByUserIdAndAssetId(String userId, String assetId);
    void deleteByUserIdAndAssetId(String userId, String assetId);
}
