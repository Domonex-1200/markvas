package com.markdowncanvas.api.asset;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AssetRepository extends JpaRepository<Asset, String> {
    List<Asset> findByStatusOrderByCreatedAtDesc(AssetStatus status);
    List<Asset> findAllByOrderByCreatedAtDesc();
    Optional<Asset> findByTitle(String title);
    List<Asset> findByAuthorIdOrderByCreatedAtDesc(String authorId);
    long countByStatus(AssetStatus status);

    @Query("""
        SELECT a FROM Asset a
        WHERE a.status = 'PUBLISHED'
          AND (:type IS NULL OR a.type = :type)
          AND (:q IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', :q, '%')))
          AND (:tag IS NULL OR a.tags LIKE CONCAT('%', :tag, '%'))
        ORDER BY a.createdAt DESC
    """)
    List<Asset> search(String q, AssetType type, String tag);
}
