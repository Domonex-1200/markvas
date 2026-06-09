package com.markdowncanvas.api.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeveloperApplicationRepository extends JpaRepository<DeveloperApplication, String> {
    List<DeveloperApplication> findAllByOrderByAppliedAtDesc();
    List<DeveloperApplication> findByStatusOrderByAppliedAtDesc(DeveloperApplication.ApplicationStatus status);
    Optional<DeveloperApplication> findByUserIdAndStatus(String userId, DeveloperApplication.ApplicationStatus status);
    boolean existsByUserIdAndStatus(String userId, DeveloperApplication.ApplicationStatus status);
}
