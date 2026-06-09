package com.markdowncanvas.api.asset;

import com.markdowncanvas.api.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "assets")
@Getter @Setter @NoArgsConstructor
public class Asset {

    @Id
    @UuidGenerator
    @Column(length = 36)
    private String id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AssetType type;

    @Column(columnDefinition = "JSON", nullable = false)
    private String metadata = "{}";

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Enumerated(EnumType.STRING)
    @Column(name = "pricing_type", nullable = false, length = 10)
    private PricingType pricingType = PricingType.FREE;

    @Column(name = "price_cents", nullable = false)
    private int priceCents = 0;

    @Column(nullable = false, length = 10)
    private String currency = "USD";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AssetStatus status = AssetStatus.DRAFT;

    @Column(name = "author_id", nullable = false, length = 36)
    private String authorId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", insertable = false, updatable = false)
    private User author;

    @OneToMany(mappedBy = "asset", cascade = CascadeType.ALL)
    private List<AssetVersion> versions;

    @OneToMany(mappedBy = "asset", cascade = CascadeType.ALL)
    private List<UserAsset> installations;

    @OneToMany(mappedBy = "asset", cascade = CascadeType.ALL)
    private List<Entitlement> entitlements;

    @OneToMany(mappedBy = "asset", cascade = CascadeType.ALL)
    private List<CartItem> cartItems;

    @OneToMany(mappedBy = "asset", cascade = CascadeType.ALL)
    private List<WishlistItem> wishlistItems;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    void onUpdate() { this.updatedAt = Instant.now(); }
}
