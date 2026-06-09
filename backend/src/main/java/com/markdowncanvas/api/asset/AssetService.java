package com.markdowncanvas.api.asset;

import com.markdowncanvas.api.user.User;
import com.markdowncanvas.api.user.UserRepository;
import com.markdowncanvas.api.user.UserRole;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetService {

    private static final String SYSTEM_EMAIL = "system@markdown-canvas.local";

    private final AssetRepository assets;
    private final AssetVersionRepository assetVersions;
    private final CartItemRepository cartItems;
    private final WishlistItemRepository wishlistItems;
    private final EntitlementRepository entitlements;
    private final UserAssetRepository userAssets;
    private final UserRepository users;

    @Value("${app.seed-data:true}")
    private boolean seedData;

    @PostConstruct
    @Transactional
    public void seed() {
        if (!seedData) return;

        // @UuidGenerator 가 setId() 를 무시하므로 findByEmail 로 중복 체크
        User systemUser = users.findByEmail(SYSTEM_EMAIL).orElseGet(() -> {
            User system = new User();
            system.setEmail(SYSTEM_EMAIL);
            system.setPassword("system-managed");
            system.setRole(UserRole.ADMIN);
            return users.save(system);
        });

        seedAsset(systemUser.getId(), "Editorial Focus Theme", AssetType.THEME,
                "/assets/demo-editorial-theme/theme.css",
                "{\"version\":\"1.0.0\",\"description\":\"문서 미리보기와 PDF 출력에 사용할 수 있는 차분한 편집 테마입니다.\",\"tokens\":{\"colors\":{\"paper\":\"#f8f7f3\",\"accent\":\"#2b7a78\",\"ink\":\"#1c2430\"}}}");

        seedAsset(systemUser.getId(), "Decision Log Template", AssetType.TEMPLATE,
                "/assets/demo-decision-log/template.md",
                "{\"version\":\"1.0.0\",\"description\":\"결정 배경, 선택지, 결과를 추적하는 의사결정 기록 템플릿입니다.\"}");

        seedAsset(systemUser.getId(), "Word Count Reporter", AssetType.PLUGIN,
                "/assets/demo-word-count/plugin.js",
                "{\"version\":\"1.0.0\",\"description\":\"현재 노트의 단어 수와 글자 수를 커맨드 팔레트에서 확인하는 샘플 플러그인입니다.\"}");
    }

    private void seedAsset(String authorId, String title, AssetType type, String filePath, String metadataJson) {
        if (assets.findByTitle(title).isPresent()) return;
        Asset asset = new Asset();
        asset.setTitle(title);
        asset.setType(type);
        asset.setFilePath(filePath);
        asset.setMetadata(metadataJson);
        asset.setAuthorId(authorId);
        asset.setStatus(AssetStatus.PUBLISHED);
        Asset saved = assets.save(asset);

        AssetVersion ver = new AssetVersion();
        ver.setAsset(saved);
        ver.setVersion("1.0.0");
        ver.setFilePath(filePath);
        assetVersions.save(ver);
    }

    public List<AssetDto.AssetResponse> list() {
        return assets.findByStatusOrderByCreatedAtDesc(AssetStatus.PUBLISHED)
                .stream().map(AssetDto.AssetResponse::from).toList();
    }

    public List<AssetDto.AssetResponse> listForReview(UserRole role) {
        if (role != UserRole.ADMIN) throw forbidden();
        return assets.findAllByOrderByCreatedAtDesc()
                .stream().map(AssetDto.AssetResponse::from).toList();
    }

    public AssetDto.AssetResponse findOne(String id) {
        return AssetDto.AssetResponse.from(getAsset(id));
    }

    @Transactional
    public AssetDto.AssetResponse create(String authorId, UserRole role, AssetDto.CreateRequest dto) {
        if (role != UserRole.DEVELOPER && role != UserRole.ADMIN) throw forbidden();
        Asset asset = new Asset();
        asset.setTitle(dto.getTitle());
        asset.setType(dto.getType());
        asset.setFilePath(dto.getFilePath());
        asset.setMetadata(dto.metadataAsString());
        asset.setAuthorId(authorId);
        asset.setPricingType(dto.getPricingType());
        asset.setPriceCents(dto.getPriceCents());
        asset.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : "USD");
        asset.setStatus(AssetStatus.DRAFT);
        Asset saved = assets.save(asset);

        AssetVersion ver = new AssetVersion();
        ver.setAsset(saved);
        ver.setVersion("1.0.0");
        ver.setFilePath(dto.getFilePath());
        assetVersions.save(ver);

        return AssetDto.AssetResponse.from(saved);
    }

    @Transactional
    public AssetDto.AssetResponse update(String userId, UserRole role, String assetId, AssetDto.UpdateRequest dto) {
        Asset asset = getAsset(assetId);
        // 본인 또는 관리자만 수정 가능
        if (!asset.getAuthorId().equals(userId) && role != UserRole.ADMIN) throw forbidden();
        if (dto.getTitle() != null && !dto.getTitle().isBlank()) asset.setTitle(dto.getTitle());
        if (dto.getFilePath() != null && !dto.getFilePath().isBlank()) asset.setFilePath(dto.getFilePath());
        if (dto.getMetadata() != null) asset.setMetadata(dto.metadataAsString());
        if (dto.getPricingType() != null) asset.setPricingType(dto.getPricingType());
        if (dto.getPriceCents() != null) asset.setPriceCents(dto.getPriceCents());
        if (dto.getCurrency() != null) asset.setCurrency(dto.getCurrency());
        return AssetDto.AssetResponse.from(assets.save(asset));
    }

    @Transactional
    public void delete(String userId, UserRole role, String assetId) {
        Asset asset = getAsset(assetId);
        if (!asset.getAuthorId().equals(userId) && role != UserRole.ADMIN) throw forbidden();
        assets.delete(asset);
    }

    @Transactional
    public AssetDto.AssetResponse submitForReview(String userId, UserRole role, String assetId) {
        Asset asset = getAsset(assetId);
        if (!asset.getAuthorId().equals(userId) && role != UserRole.ADMIN) throw forbidden();
        asset.setStatus(AssetStatus.IN_REVIEW);
        return AssetDto.AssetResponse.from(assets.save(asset));
    }

    @Transactional
    public AssetDto.AssetResponse approve(UserRole role, String assetId) {
        if (role != UserRole.ADMIN) throw forbidden();
        Asset asset = getAsset(assetId);
        asset.setStatus(AssetStatus.PUBLISHED);
        return AssetDto.AssetResponse.from(assets.save(asset));
    }

    @Transactional
    public AssetDto.AssetResponse reject(UserRole role, String assetId) {
        if (role != UserRole.ADMIN) throw forbidden();
        Asset asset = getAsset(assetId);
        asset.setStatus(AssetStatus.REJECTED);
        return AssetDto.AssetResponse.from(assets.save(asset));
    }

    @Transactional
    public void install(String userId, String assetId) {
        Asset asset = getAsset(assetId);
        ensureEntitlement(userId, asset,
                asset.getPricingType() == PricingType.FREE ? EntitlementSource.FREE : EntitlementSource.PURCHASE);
        if (userAssets.findByUserIdAndAssetId(userId, assetId).isEmpty()) {
            User user = users.getReferenceById(userId);
            UserAsset ua = new UserAsset();
            ua.setUser(user);
            ua.setAsset(asset);
            userAssets.save(ua);
        }
    }

    public List<AssetDto.InstalledAssetResponse> installedByUser(String userId) {
        return userAssets.findByUserIdOrderByInstalledAtDesc(userId)
                .stream().map(AssetDto.InstalledAssetResponse::from).toList();
    }

    public List<AssetDto.EntitlementResponse> entitlementsByUser(String userId) {
        return entitlements.findByUserIdOrderByGrantedAtDesc(userId)
                .stream().map(AssetDto.EntitlementResponse::from).toList();
    }

    @Transactional
    public void addToWishlist(String userId, String assetId) {
        if (wishlistItems.findByUserIdAndAssetId(userId, assetId).isPresent()) return;
        WishlistItem item = new WishlistItem();
        item.setUser(users.getReferenceById(userId));
        item.setAsset(getAsset(assetId));
        wishlistItems.save(item);
    }

    @Transactional
    public void removeFromWishlist(String userId, String assetId) {
        wishlistItems.deleteByUserIdAndAssetId(userId, assetId);
    }

    public List<AssetDto.WishlistItemResponse> wishlistByUser(String userId) {
        return wishlistItems.findByUserIdOrderByAddedAtDesc(userId)
                .stream().map(AssetDto.WishlistItemResponse::from).toList();
    }

    @Transactional
    public void addToCart(String userId, String assetId) {
        if (cartItems.findByUserIdAndAssetId(userId, assetId).isPresent()) return;
        CartItem item = new CartItem();
        item.setUser(users.getReferenceById(userId));
        item.setAsset(getAsset(assetId));
        cartItems.save(item);
    }

    @Transactional
    public void removeFromCart(String userId, String assetId) {
        cartItems.deleteByUserIdAndAssetId(userId, assetId);
    }

    public List<AssetDto.CartItemResponse> cartByUser(String userId) {
        return cartItems.findByUserIdOrderByAddedAtDesc(userId)
                .stream().map(AssetDto.CartItemResponse::from).toList();
    }

    @Transactional
    public List<AssetDto.EntitlementResponse> checkoutFreeCart(String userId) {
        List<CartItem> items = cartItems.findByUserIdOrderByAddedAtDesc(userId);
        return items.stream()
                .filter(i -> i.getAsset().getPricingType() == PricingType.FREE)
                .map(i -> {
                    Entitlement e = ensureEntitlement(userId, i.getAsset(), EntitlementSource.FREE);
                    cartItems.delete(i);
                    return AssetDto.EntitlementResponse.from(e);
                }).toList();
    }

    public List<AssetDto.AssetResponse> myAssets(String userId) {
        return assets.findByAuthorIdOrderByCreatedAtDesc(userId)
                .stream().map(AssetDto.AssetResponse::from).toList();
    }

    private Entitlement ensureEntitlement(String userId, Asset asset, EntitlementSource source) {
        return entitlements.findByUserIdAndAssetId(userId, asset.getId()).orElseGet(() -> {
            Entitlement e = new Entitlement();
            e.setUser(users.getReferenceById(userId));
            e.setAsset(asset);
            e.setSource(source);
            return entitlements.save(e);
        });
    }

    private Asset getAsset(String id) {
        return assets.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found."));
    }

    private ResponseStatusException forbidden() {
        return new ResponseStatusException(HttpStatus.FORBIDDEN, "Permission denied.");
    }
}