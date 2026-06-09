package com.markdowncanvas.api.release;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;

@Entity
@Table(name = "app_releases",
        uniqueConstraints = @UniqueConstraint(columnNames = {"platform", "channel", "version"}))
@Getter @Setter @NoArgsConstructor
public class AppRelease {

    @Id
    @UuidGenerator
    @Column(length = 36)
    private String id;

    @Column(nullable = false, length = 50)
    private String version;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReleasePlatform platform;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReleaseChannel channel = ReleaseChannel.stable;

    @Column(name = "download_url", nullable = false)
    private String downloadUrl;

    @Column(nullable = false, length = 128)
    private String checksum;

    @Column(columnDefinition = "TEXT")
    private String signature;

    @Column(name = "release_notes", columnDefinition = "TEXT", nullable = false)
    private String releaseNotes;

    @Column(name = "published_at", nullable = false, updatable = false)
    private Instant publishedAt = Instant.now();
}
