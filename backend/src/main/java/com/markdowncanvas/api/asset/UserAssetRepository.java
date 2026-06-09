package com.markdowncanvas.api.asset;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserAssetRepository extends JpaRepository<UserAsset, String> {
    List<UserAsset> findByUserIdOrderByInstalledAtDesc(String userId);
    Optional<UserAsset> findByUserIdAndAssetId(String userId, String assetId);
}
