package com.markdowncanvas.api.user;

import com.markdowncanvas.api.asset.*;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor
public class User {

    @Id
    @UuidGenerator
    @Column(length = 36)
    private String id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role = UserRole.USER;

    @Column(name = "refresh_token_hash", columnDefinition = "TEXT")
    private String refreshTokenHash;

    // ── 프로필 필드 ─────────────────────────────────────────────────────────
    @Column(length = 50)
    private String nickname;

    @Column(length = 20)
    private String phone;

    private LocalDate birthday;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Gender gender;

    @Column(name = "profile_picture_url", length = 500)
    private String profilePictureUrl;

    // ── 연관관계 ──────────────────────────────────────────────────────────
    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL)
    private List<Asset> assets;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<UserAsset> installedAssets;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Entitlement> entitlements;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<CartItem> cartItems;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<WishlistItem> wishlistItems;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "deactivated_at")
    private Instant deactivatedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    void onUpdate() { this.updatedAt = Instant.now(); }
}
