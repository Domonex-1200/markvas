package com.markdowncanvas.api.asset;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssetRepository extends JpaRepository<Asset, String> {
    List<Asset> findByStatusOrderByCreatedAtDesc(AssetStatus status);
    List<Asset> findAllByOrderByCreatedAtDesc();
    Optional<Asset> findByTitle(String title);
    List<Asset> findByAuthorIdOrderByCreatedAtDesc(String authorId);
    long countByStatus(AssetStatus status);
}
