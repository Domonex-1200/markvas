package com.markdowncanvas.api.release;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppReleaseRepository extends JpaRepository<AppRelease, String> {
    List<AppRelease> findAllByOrderByPublishedAtDesc();
    Optional<AppRelease> findTopByPlatformAndChannelOrderByPublishedAtDesc(ReleasePlatform platform, ReleaseChannel channel);
    boolean existsByVersionAndPlatformAndChannel(String version, ReleasePlatform platform, ReleaseChannel channel);
}
