package com.markdowncanvas.api.asset;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

public class AssetDto {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    // ── 생성 요청 ─────────────────────────────────────────────────────────
    @Data
    public static class CreateRequest {
        @NotBlank  private String title;
        @NotNull   private AssetType type;
        @NotBlank  private String filePath;
        @NotNull   private JsonNode metadata;
        private PricingType pricingType = PricingType.FREE;
        private int priceCents = 0;
        private String currency = "USD";
        private java.util.List<String> tags;

        public String metadataAsString() {
            try { return MAPPER.writeValueAsString(metadata); }
            catch (Exception e) { return "{}"; }
        }
    }

    // ── 수정 요청 ─────────────────────────────────────────────────────────
    @Data
    public static class UpdateRequest {
        private String title;
        private String filePath;
        private JsonNode metadata;
        private PricingType pricingType;
        private Integer priceCents;
        private String currency;
        private java.util.List<String> tags;

        public String metadataAsString() {
            if (metadata == null) return null;
            try { return MAPPER.writeValueAsString(metadata); }
            catch (Exception e) { return "{}"; }
        }
    }

    // ── 응답 ─────────────────────────────────────────────────────────────
    @Data
    public static class AssetResponse {
        private String   id;
        private String   title;
        private String   type;
        private JsonNode metadata;
        private String   filePath;
        private String   authorId;
        private String   pricingType;
        private int      priceCents;
        private String   currency;
        private String   status;
        private String   createdAt;
        private java.util.List<String> tags;
        private double   avgRating;
        private long     reviewCount;

        public static AssetResponse from(Asset a) {
            AssetResponse r = new AssetResponse();
            r.id         = a.getId();
            r.title      = a.getTitle();
            r.type       = a.getType().name();
            r.metadata   = parseJson(a.getMetadata());
            r.filePath   = a.getFilePath();
            r.authorId   = a.getAuthorId();
            r.pricingType = a.getPricingType().name();
            r.priceCents = a.getPriceCents();
            r.currency   = a.getCurrency();
            r.status     = a.getStatus().name();
            r.createdAt  = a.getCreatedAt().toString();
            String raw = a.getTags();
            r.tags = (raw == null || raw.isBlank()) ? java.util.List.of()
                    : java.util.Arrays.stream(raw.split(",")).map(String::trim)
                        .filter(t -> !t.isEmpty()).toList();
            return r;
        }
    }

    @Data
    public static class CartItemResponse {
        private String        id;
        private AssetResponse asset;
        private String        addedAt;

        public static CartItemResponse from(CartItem c) {
            CartItemResponse r = new CartItemResponse();
            r.id      = c.getId();
            r.asset   = AssetResponse.from(c.getAsset());
            r.addedAt = c.getAddedAt().toString();
            return r;
        }
    }

    @Data
    public static class WishlistItemResponse {
        private String        id;
        private AssetResponse asset;
        private String        addedAt;

        public static WishlistItemResponse from(WishlistItem w) {
            WishlistItemResponse r = new WishlistItemResponse();
            r.id      = w.getId();
            r.asset   = AssetResponse.from(w.getAsset());
            r.addedAt = w.getAddedAt().toString();
            return r;
        }
    }

    @Data
    public static class EntitlementResponse {
        private String        id;
        private AssetResponse asset;
        private String        source;
        private String        grantedAt;

        public static EntitlementResponse from(Entitlement e) {
            EntitlementResponse r = new EntitlementResponse();
            r.id        = e.getId();
            r.asset     = AssetResponse.from(e.getAsset());
            r.source    = e.getSource().name();
            r.grantedAt = e.getGrantedAt().toString();
            return r;
        }
    }

    @Data
    public static class InstalledAssetResponse {
        private AssetResponse asset;
        private String        installedAt;

        public static InstalledAssetResponse from(UserAsset ua) {
            InstalledAssetResponse r = new InstalledAssetResponse();
            r.asset       = AssetResponse.from(ua.getAsset());
            r.installedAt = ua.getInstalledAt().toString();
            return r;
        }
    }

    @Data
    public static class LibraryItemResponse {
        private String        id;
        private AssetResponse asset;
        private String        status;      // ACTIVE | INACTIVE
        private String        installedAt;
        private String        activatedAt;

        public static LibraryItemResponse from(UserAsset ua) {
            LibraryItemResponse r = new LibraryItemResponse();
            r.id          = ua.getId();
            r.asset       = AssetResponse.from(ua.getAsset());
            r.status      = ua.getStatus().name();
            r.installedAt = ua.getInstalledAt().toString();
            r.activatedAt = ua.getActivatedAt() != null ? ua.getActivatedAt().toString() : null;
            return r;
        }
    }

    // ── 공통 유틸 ─────────────────────────────────────────────────────────
    static JsonNode parseJson(String json) {
        try { return MAPPER.readTree(json != null ? json : "{}"); }
        catch (Exception e) { return MAPPER.createObjectNode(); }
    }
}