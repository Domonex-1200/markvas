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

        User systemUser = users.findByEmail(SYSTEM_EMAIL).orElseGet(() -> {
            User system = new User();
            system.setEmail(SYSTEM_EMAIL);
            system.setPassword("system-managed");
            system.setRole(UserRole.ADMIN);
            return users.save(system);
        });

        String themeMetadata = """
                {"version":"1.0.0","description":"문서 편집에 최적화된 차분하고 깔끔한 에디터 테마입니다.",\
                "tokens":{"editorCss":\
                ".prose-canvas{font-family:Georgia,serif;color:#1c2430;background:#f8f7f3;line-height:1.8;}\
                .prose-canvas h1,.prose-canvas h2,.prose-canvas h3{color:#2b7a78;font-weight:700;margin-top:1.5rem;}\
                .prose-canvas h1{font-size:1.8rem;border-bottom:2px solid #2b7a78;padding-bottom:0.4rem;}\
                .prose-canvas h2{font-size:1.4rem;}\
                .prose-canvas a{color:#2b7a78;text-decoration:underline;}\
                .prose-canvas blockquote{border-left:4px solid #2b7a78;padding-left:1rem;color:#555;font-style:italic;margin:1rem 0;background:#f0f5f5;border-radius:0 4px 4px 0;}\
                .prose-canvas code{background:#e8e7e3;padding:2px 6px;border-radius:3px;font-size:0.88em;font-family:monospace;}\
                .prose-canvas pre{background:#e8e7e3;padding:1rem;border-radius:6px;overflow-x:auto;}\
                .prose-canvas hr{border:none;border-top:2px solid #2b7a78;opacity:0.25;margin:2rem 0;}\
                .prose-canvas strong{color:#1c2430;}\
                .prose-canvas table{border-collapse:collapse;width:100%;}\
                .prose-canvas th{background:#2b7a78;color:#fff;padding:0.5rem 1rem;text-align:left;}\
                .prose-canvas td{border:1px solid #d0cec9;padding:0.5rem 1rem;}"}}
                """.replace("\n", "");

        String templateMetadata = """
                {"version":"1.0.0","description":"결정 배경, 선택지, 결과를 추적하는 의사결정 기록 템플릿입니다.",\
                "template":{"id":"decision-log","title":"Decision Log Template",\
                "content":"# 의사결정 기록\\n\\n**날짜**: \\n**작성자**: \\n**상태**: 검토 중\\n\\n---\\n\\n## 배경\\n\\n> 이 결정이 필요하게 된 맥락과 이유를 작성하세요.\\n\\n## 선택지\\n\\n### 선택지 1\\n- **장점**: \\n- **단점**: \\n\\n### 선택지 2\\n- **장점**: \\n- **단점**: \\n\\n## 결정\\n\\n> 최종 선택과 그 이유를 작성하세요.\\n\\n## 결과\\n\\n> 이 결정의 결과를 나중에 기록하세요."}}
                """.replace("\n", "");

        String pluginCode = "(function(){var d=input.document;if(!d)return{output:'열린 노트가 없습니다.'};var c=d.content||'';var i,ch=0,ln=1;for(i=0;i<c.length;i++){var x=c.charCodeAt(i);if(x===10)ln++;if(x!==32&&x!==9&&x!==10&&x!==13)ch++;}var m=Math.ceil(ch/500)||1;var msg='글자 '+ch+'자 · '+ln+'줄 · 읽기 약 '+m+'분';return{output:msg,action:{type:'notice',message:msg}};}())";
        String pluginMetadata = "{\"version\":\"1.0.0\",\"description\":\"현재 노트의 글자 수, 줄 수, 예상 읽기 시간을 알려줍니다.\","
                + "\"plugin\":{\"id\":\"word-count-reporter\",\"title\":\"Word Count Reporter\",\"version\":\"1.0.0\","
                + "\"entryFile\":\"plugin.js\",\"permissions\":[\"note:read\"],"
                + "\"commands\":[{\"id\":\"report\",\"title\":\"글자 수 확인\",\"description\":\"현재 노트의 글자, 줄 수와 읽기 시간을 알려줍니다.\"}],"
                + "\"code\":\"" + pluginCode.replace("\\", "\\\\").replace("\"", "\\\"") + "\"}}";

        seedAsset(systemUser.getId(), "Editorial Focus Theme", AssetType.THEME,
                "/assets/demo-editorial-theme/theme.css", themeMetadata);

        seedAsset(systemUser.getId(), "Decision Log Template", AssetType.TEMPLATE,
                "/assets/demo-decision-log/template.md", templateMetadata);

        seedAsset(systemUser.getId(), "Word Count Reporter", AssetType.PLUGIN,
                "/assets/demo-word-count/plugin.js", pluginMetadata);
    }

    private void seedAsset(String authorId, String title, AssetType type, String filePath, String metadataJson) {
        assets.findByTitle(title).ifPresentOrElse(
            existing -> {
                existing.setMetadata(metadataJson);
                assets.save(existing);
            },
            () -> {
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
        );
    }

    public List<AssetDto.AssetResponse> list() {
        return assets.findByStatusOrderByCreatedAtDesc(AssetStatus.PUBLISHED)
                .stream().map(AssetDto.AssetResponse::from).toList();
    }

    public List<AssetDto.AssetResponse> search(String q, String type, String tag) {
        AssetType assetType = (type != null && !type.isBlank()) ? AssetType.valueOf(type.toUpperCase()) : null;
        String qParam = (q != null && !q.isBlank()) ? q : null;
        String tagParam = (tag != null && !tag.isBlank()) ? tag : null;
        return assets.search(qParam, assetType, tagParam)
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
        if (dto.getTags() != null) asset.setTags(String.join(",", dto.getTags()));
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
        if (dto.getTags() != null) asset.setTags(String.join(",", dto.getTags()));
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

    @Transactional
    public void uninstall(String userId, String assetId) {
        userAssets.deleteByUserIdAndAssetId(userId, assetId);
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