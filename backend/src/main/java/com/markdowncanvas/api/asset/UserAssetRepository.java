package com.markdowncanvas.api.asset;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserAssetRepository extends JpaRepository<UserAsset, String> {
    List<UserAsset> findByUserIdOrderByInstalledAtDesc(String userId);
    List<UserAsset> findByUserIdAndStatusOrderByInstalledAtDesc(String userId, LibraryStatus status);
    Optional<UserAsset> findByUserIdAndAssetId(String userId, String assetId);
    void deleteByUserIdAndAssetId(String userId, String assetId);
}
