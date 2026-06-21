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

        // ── THEME 1: Editorial Focus (밝고 차분한 문서 테마) ──────────────────
        seedAsset(systemUser.getId(), "Editorial Focus Theme", AssetType.THEME,
                "/assets/demo-editorial-theme/theme.css",
                "{\"version\":\"1.0.0\",\"description\":\"문서 편집에 최적화된 차분하고 깔끔한 에디터 테마입니다. 긴 글쓰기에 최적화된 세리프 폰트와 여백을 사용합니다.\",\"summary\":\"긴 글쓰기에 최적화된 세리프 스타일\",\"changelog\":\"v1.0.0 - 최초 릴리즈\",\"tags\":[\"테마\",\"밝음\",\"문서\"],\"tokens\":{\"editorCss\":\".prose-canvas{font-family:Georgia,serif;color:#1c2430;background:#f8f7f3;line-height:1.9;}.prose-canvas h1,.prose-canvas h2,.prose-canvas h3{color:#2b7a78;font-weight:700;margin-top:1.5rem;}.prose-canvas h1{font-size:1.8rem;border-bottom:2px solid #2b7a78;padding-bottom:0.4rem;}.prose-canvas h2{font-size:1.4rem;}.prose-canvas a{color:#2b7a78;text-decoration:underline;}.prose-canvas blockquote{border-left:4px solid #2b7a78;padding-left:1rem;color:#555;font-style:italic;margin:1rem 0;background:#f0f5f5;border-radius:0 4px 4px 0;}.prose-canvas code{background:#e8e7e3;padding:2px 6px;border-radius:3px;font-size:0.88em;font-family:monospace;}.prose-canvas pre{background:#e8e7e3;padding:1rem;border-radius:6px;overflow-x:auto;}.prose-canvas hr{border:none;border-top:2px solid #2b7a78;opacity:0.25;margin:2rem 0;}.prose-canvas strong{color:#1c2430;}.prose-canvas table{border-collapse:collapse;width:100%;}.prose-canvas th{background:#2b7a78;color:#fff;padding:0.5rem 1rem;text-align:left;}.prose-canvas td{border:1px solid #d0cec9;padding:0.5rem 1rem;}\"}}",
                "테마,문서,밝음");

        // ── THEME 2: Dark Void (다크 모드 개발자 테마) ───────────────────────
        seedAsset(systemUser.getId(), "Dark Void Theme", AssetType.THEME,
                "/assets/demo-dark-void/theme.css",
                "{\"version\":\"1.0.0\",\"description\":\"눈이 편안한 다크 테마입니다. 코드 블록과 헤더에 강조색을 사용해 가독성을 높였습니다.\",\"summary\":\"눈이 편안한 개발자용 다크 테마\",\"changelog\":\"v1.0.0 - 최초 릴리즈\",\"tokens\":{\"editorCss\":\".prose-canvas{font-family:'Segoe UI',system-ui,sans-serif;color:#cdd6f4;background:#1e1e2e;line-height:1.8;}.prose-canvas h1,.prose-canvas h2,.prose-canvas h3{color:#cba6f7;font-weight:700;margin-top:1.5rem;}.prose-canvas h1{font-size:1.8rem;border-bottom:1px solid #313244;padding-bottom:0.4rem;}.prose-canvas h2{font-size:1.4rem;}.prose-canvas a{color:#89b4fa;text-decoration:underline;}.prose-canvas blockquote{border-left:4px solid #cba6f7;padding-left:1rem;color:#a6adc8;font-style:italic;margin:1rem 0;background:#181825;border-radius:0 4px 4px 0;}.prose-canvas code{background:#313244;padding:2px 6px;border-radius:3px;font-size:0.88em;font-family:monospace;color:#a6e3a1;}.prose-canvas pre{background:#181825;padding:1rem;border-radius:6px;overflow-x:auto;border:1px solid #313244;}.prose-canvas hr{border:none;border-top:1px solid #313244;margin:2rem 0;}.prose-canvas strong{color:#f38ba8;}.prose-canvas table{border-collapse:collapse;width:100%;}.prose-canvas th{background:#313244;color:#cdd6f4;padding:0.5rem 1rem;text-align:left;}.prose-canvas td{border:1px solid #313244;padding:0.5rem 1rem;}\"}}",
                "테마,다크,개발자");

        // ── THEME 3: Notion Style (노션 스타일 미니멀) ───────────────────────
        seedAsset(systemUser.getId(), "Notion Style Theme", AssetType.THEME,
                "/assets/demo-notion-style/theme.css",
                "{\"version\":\"1.0.0\",\"description\":\"노션과 비슷한 미니멀하고 깔끔한 흰색 테마입니다. 집중력을 높이는 여백과 타이포그래피를 사용합니다.\",\"summary\":\"노션 스타일의 미니멀 화이트 테마\",\"changelog\":\"v1.0.0 - 최초 릴리즈\",\"tokens\":{\"editorCss\":\".prose-canvas{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#37352f;background:#ffffff;line-height:1.9;max-width:720px;margin:0 auto;}.prose-canvas h1{font-size:2rem;font-weight:800;color:#37352f;margin-bottom:0.3rem;}.prose-canvas h2{font-size:1.4rem;font-weight:700;color:#37352f;}.prose-canvas h3{font-size:1.1rem;font-weight:700;color:#37352f;}.prose-canvas a{color:#0f7b6c;text-decoration:underline;}.prose-canvas blockquote{border-left:3px solid #e9e9e7;padding-left:1rem;color:#9b9a97;margin:1rem 0;font-style:normal;}.prose-canvas code{background:#f1f1ef;padding:2px 6px;border-radius:3px;font-size:0.85em;font-family:'SFMono-Regular',Consolas,monospace;color:#eb5757;}.prose-canvas pre{background:#f7f6f3;padding:1rem;border-radius:6px;overflow-x:auto;}.prose-canvas hr{border:none;border-top:1px solid #e9e9e7;margin:2rem 0;}.prose-canvas strong{color:#37352f;}.prose-canvas table{border-collapse:collapse;width:100%;}.prose-canvas th{background:#f7f6f3;color:#37352f;padding:0.5rem 1rem;text-align:left;border:1px solid #e9e9e7;}.prose-canvas td{border:1px solid #e9e9e7;padding:0.5rem 1rem;}\"}}",
                "테마,미니멀,화이트");

        // ── TEMPLATE 1: Decision Log ──────────────────────────────────────────
        seedAsset(systemUser.getId(), "Decision Log Template", AssetType.TEMPLATE,
                "/assets/demo-decision-log/template.md",
                "{\"version\":\"1.0.0\",\"description\":\"결정 배경, 선택지, 결과를 추적하는 의사결정 기록 템플릿입니다. 팀 혹은 개인 의사결정 내역을 체계적으로 남길 수 있습니다.\",\"summary\":\"의사결정 과정을 체계적으로 기록\",\"changelog\":\"v1.0.0 - 최초 릴리즈\",\"template\":{\"id\":\"decision-log\",\"title\":\"의사결정 기록\",\"content\":\"# 의사결정 기록\\n\\n**날짜**: \\n**작성자**: \\n**상태**: 검토 중\\n\\n---\\n\\n## 배경\\n\\n> 이 결정이 필요하게 된 맥락과 이유를 작성하세요.\\n\\n## 선택지\\n\\n### 선택지 1\\n- **장점**: \\n- **단점**: \\n\\n### 선택지 2\\n- **장점**: \\n- **단점**: \\n\\n## 결정\\n\\n> 최종 선택과 그 이유를 작성하세요.\\n\\n## 결과\\n\\n> 이 결정의 결과를 나중에 기록하세요.\"}}",
                "템플릿,기획,팀");

        // ── TEMPLATE 2: Weekly Review ─────────────────────────────────────────
        seedAsset(systemUser.getId(), "Weekly Review Template", AssetType.TEMPLATE,
                "/assets/demo-weekly-review/template.md",
                "{\"version\":\"1.0.0\",\"description\":\"한 주를 돌아보고 다음 주를 계획하는 주간 회고 템플릿입니다. GTD 방식에서 영감을 받아 만들었습니다.\",\"summary\":\"주간 회고와 계획을 한 번에\",\"changelog\":\"v1.0.0 - 최초 릴리즈\",\"template\":{\"id\":\"weekly-review\",\"title\":\"주간 회고\",\"content\":\"# 주간 회고 - {{날짜}}\\n\\n---\\n\\n## 이번 주 잘한 일 ✅\\n\\n- \\n- \\n- \\n\\n## 이번 주 아쉬운 일 ⚡\\n\\n- \\n- \\n\\n## 다음 주 목표 🎯\\n\\n- [ ] \\n- [ ] \\n- [ ] \\n\\n## 메모 / 아이디어 💡\\n\\n> 자유롭게 적어두세요.\"}}",
                "템플릿,회고,생산성");

        // ── TEMPLATE 3: Meeting Notes ─────────────────────────────────────────
        seedAsset(systemUser.getId(), "Meeting Notes Template", AssetType.TEMPLATE,
                "/assets/demo-meeting-notes/template.md",
                "{\"version\":\"1.0.0\",\"description\":\"회의 참석자, 안건, 결정 사항, 액션 아이템을 체계적으로 정리하는 회의록 템플릿입니다.\",\"summary\":\"깔끔한 회의록을 빠르게 작성\",\"changelog\":\"v1.0.0 - 최초 릴리즈\",\"template\":{\"id\":\"meeting-notes\",\"title\":\"회의록\",\"content\":\"# 회의록\\n\\n**일시**: \\n**장소**: \\n**참석자**: \\n\\n---\\n\\n## 안건\\n\\n1. \\n2. \\n\\n## 논의 내용\\n\\n### 안건 1\\n\\n### 안건 2\\n\\n## 결정 사항\\n\\n- \\n\\n## 액션 아이템\\n\\n| 담당자 | 내용 | 기한 |\\n|--------|------|------|\\n| | | |\\n\\n## 다음 회의\\n\\n**일시**: \\n**안건**: \"}}",
                "템플릿,회의,팀");

        // ── PLUGIN 1: Word Count Reporter ─────────────────────────────────────
        String wcCode = "(function(){var d=input.document;if(!d)return{output:'열린 노트가 없습니다.'};var c=d.content||'';var i,ch=0,ln=1;for(i=0;i<c.length;i++){var x=c.charCodeAt(i);if(x===10)ln++;if(x!==32&&x!==9&&x!==10&&x!==13)ch++;}var m=Math.ceil(ch/500)||1;var msg='글자 '+ch+'자 · '+ln+'줄 · 읽기 약 '+m+'분';return{output:msg,action:{type:'notice',message:msg}};}())";
        seedAsset(systemUser.getId(), "Word Count Reporter", AssetType.PLUGIN,
                "/assets/demo-word-count/plugin.js",
                "{\"version\":\"1.0.0\",\"description\":\"현재 노트의 글자 수, 줄 수, 예상 읽기 시간을 알려줍니다. 명령어 팔레트에서 '글자 수 확인'을 실행하세요.\",\"summary\":\"글자 수, 줄 수, 읽기 시간을 한눈에\",\"changelog\":\"v1.0.0 - 최초 릴리즈\",\"plugin\":{\"id\":\"word-count-reporter\",\"title\":\"Word Count Reporter\",\"version\":\"1.0.0\",\"entryFile\":\"plugin.js\",\"permissions\":[\"note:read\"],\"commands\":[{\"id\":\"report\",\"title\":\"글자 수 확인\",\"description\":\"현재 노트의 글자, 줄 수와 읽기 시간을 알려줍니다.\"}],\"code\":\"" + wcCode.replace("\\", "\\\\").replace("\"", "\\\"") + "\"}}",
                "플러그인,생산성,글쓰기");

        // ── PLUGIN 2: TOC Generator ───────────────────────────────────────────
        String tocCode = "(function(){var d=input.document;if(!d)return{output:'열린 노트가 없습니다.'};var lines=(d.content||'').split('\\n');var toc=[];lines.forEach(function(l){var m=l.match(/^(#{1,3})\\s+(.+)/);if(m){var lvl=m[1].length;var title=m[2].trim();var indent='  '.repeat(lvl-1);var anchor=title.toLowerCase().replace(/[^\\w가-힣\\s]/g,'').replace(/\\s+/g,'-');toc.push(indent+'- ['+title+'](#'+anchor+')');}});if(toc.length===0)return{output:'헤딩이 없어 목차를 만들 수 없습니다.'};var result='## 목차\\n\\n'+toc.join('\\n');return{output:result,action:{type:'insert',content:result+'\\n\\n'}};}())";
        seedAsset(systemUser.getId(), "TOC Generator", AssetType.PLUGIN,
                "/assets/demo-toc-generator/plugin.js",
                "{\"version\":\"1.0.0\",\"description\":\"현재 노트의 헤딩(H1~H3)을 분석해 자동으로 목차를 생성합니다. 긴 문서 작성 시 유용합니다.\",\"summary\":\"헤딩 구조로 목차를 자동 생성\",\"changelog\":\"v1.0.0 - 최초 릴리즈\",\"plugin\":{\"id\":\"toc-generator\",\"title\":\"TOC Generator\",\"version\":\"1.0.0\",\"entryFile\":\"plugin.js\",\"permissions\":[\"note:read\",\"note:write\"],\"commands\":[{\"id\":\"generate\",\"title\":\"목차 생성\",\"description\":\"현재 노트에서 헤딩을 추출해 목차를 자동으로 생성합니다.\"}],\"code\":\"" + tocCode.replace("\\", "\\\\").replace("\"", "\\\"") + "\"}}",
                "플러그인,문서,생산성");
    }

    private void seedAsset(String authorId, String title, AssetType type, String filePath, String metadataJson, String tags) {
        assets.findByTitle(title).ifPresentOrElse(
            existing -> {
                existing.setMetadata(metadataJson);
                existing.setTags(tags);
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
                asset.setTags(tags);
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

    @Transactional
    public void purchase(String userId, String assetId) {
        Asset asset = getAsset(assetId);
        ensureEntitlement(userId, asset, EntitlementSource.PURCHASE);
        if (userAssets.findByUserIdAndAssetId(userId, assetId).isEmpty()) {
            User user = users.getReferenceById(userId);
            UserAsset ua = new UserAsset();
            ua.setUser(user);
            ua.setAsset(asset);
            userAssets.save(ua);
        }
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