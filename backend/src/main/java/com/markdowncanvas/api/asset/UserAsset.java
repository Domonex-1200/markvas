package com.markdowncanvas.api.asset;

import com.markdowncanvas.api.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;

@Entity
@Table(name = "user_assets", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "asset_id"}))
@Getter @Setter @NoArgsConstructor
public class UserAsset {

    @Id
    @UuidGenerator
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private LibraryStatus status = LibraryStatus.INACTIVE;

    @Column(name = "installed_at", nullable = false, updatable = false)
    private Instant installedAt = Instant.now();

    @Column(name = "activated_at")
    private Instant activatedAt;
}
