package com.markdowncanvas.api.asset;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;

@Entity
@Table(name = "asset_versions")
@Getter @Setter @NoArgsConstructor
public class AssetVersion {

    @Id
    @UuidGenerator
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @Column(nullable = false, length = 50)
    private String version;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(length = 128)
    private String checksum;

    @Column(columnDefinition = "TEXT")
    private String signature;

    @Column(name = "release_notes", columnDefinition = "JSON")
    private String releaseNotes = "{}";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
