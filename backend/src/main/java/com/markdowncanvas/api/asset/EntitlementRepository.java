package com.markdowncanvas.api.asset;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EntitlementRepository extends JpaRepository<Entitlement, String> {
    List<Entitlement> findByUserIdOrderByGrantedAtDesc(String userId);
    Optional<Entitlement> findByUserIdAndAssetId(String userId, String assetId);
}
