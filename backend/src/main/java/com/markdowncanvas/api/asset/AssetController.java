package com.markdowncanvas.api.asset;

import com.markdowncanvas.api.security.JwtPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @GetMapping
    public List<AssetDto.AssetResponse> list() {
        return assetService.list();
    }

    @GetMapping("/admin/review")
    @PreAuthorize("hasRole('ADMIN')")
    public List<AssetDto.AssetResponse> listForReview(@AuthenticationPrincipal JwtPrincipal principal) {
        return assetService.listForReview(principal.role());
    }

    @GetMapping("/me/assets")
    @PreAuthorize("hasAnyRole('DEVELOPER','ADMIN')")
    public List<AssetDto.AssetResponse> myAssets(@AuthenticationPrincipal JwtPrincipal principal) {
        return assetService.myAssets(principal.userId());
    }

    @GetMapping("/me/installed")
    @PreAuthorize("isAuthenticated()")
    public List<AssetDto.InstalledAssetResponse> installed(@AuthenticationPrincipal JwtPrincipal principal) {
        return assetService.installedByUser(principal.userId());
    }

    @GetMapping("/me/entitlements")
    @PreAuthorize("isAuthenticated()")
    public List<AssetDto.EntitlementResponse> entitlements(@AuthenticationPrincipal JwtPrincipal principal) {
        return assetService.entitlementsByUser(principal.userId());
    }

    @GetMapping("/me/wishlist")
    @PreAuthorize("isAuthenticated()")
    public List<AssetDto.WishlistItemResponse> wishlist(@AuthenticationPrincipal JwtPrincipal principal) {
        return assetService.wishlistByUser(principal.userId());
    }

    @GetMapping("/me/cart")
    @PreAuthorize("isAuthenticated()")
    public List<AssetDto.CartItemResponse> cart(@AuthenticationPrincipal JwtPrincipal principal) {
        return assetService.cartByUser(principal.userId());
    }

    @PostMapping("/me/cart/checkout-free")
    @PreAuthorize("isAuthenticated()")
    public List<AssetDto.EntitlementResponse> checkoutFreeCart(@AuthenticationPrincipal JwtPrincipal principal) {
        return assetService.checkoutFreeCart(principal.userId());
    }

    @GetMapping("/{id}")
    public AssetDto.AssetResponse findOne(@PathVariable String id) {
        return assetService.findOne(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('DEVELOPER','ADMIN')")
    public AssetDto.AssetResponse create(@AuthenticationPrincipal JwtPrincipal principal,
                                         @Valid @RequestBody AssetDto.CreateRequest dto) {
        return assetService.create(principal.userId(), principal.role(), dto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DEVELOPER','ADMIN')")
    public AssetDto.AssetResponse update(@AuthenticationPrincipal JwtPrincipal principal,
                                         @PathVariable String id,
                                         @RequestBody AssetDto.UpdateRequest dto) {
        return assetService.update(principal.userId(), principal.role(), id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('DEVELOPER','ADMIN')")
    public void delete(@AuthenticationPrincipal JwtPrincipal principal, @PathVariable String id) {
        assetService.delete(principal.userId(), principal.role(), id);
    }

    @PostMapping("/{id}/submit-review")
    @PreAuthorize("hasAnyRole('DEVELOPER','ADMIN')")
    public AssetDto.AssetResponse submitForReview(@AuthenticationPrincipal JwtPrincipal principal,
                                                   @PathVariable String id) {
        return assetService.submitForReview(principal.userId(), principal.role(), id);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public AssetDto.AssetResponse approve(@AuthenticationPrincipal JwtPrincipal principal,
                                           @PathVariable String id) {
        return assetService.approve(principal.role(), id);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public AssetDto.AssetResponse reject(@AuthenticationPrincipal JwtPrincipal principal,
                                          @PathVariable String id) {
        return assetService.reject(principal.role(), id);
    }

    @PostMapping("/{id}/install")
    @PreAuthorize("isAuthenticated()")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void install(@AuthenticationPrincipal JwtPrincipal principal, @PathVariable String id) {
        assetService.install(principal.userId(), id);
    }

    @PostMapping("/{id}/wishlist")
    @PreAuthorize("isAuthenticated()")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void addWishlist(@AuthenticationPrincipal JwtPrincipal principal, @PathVariable String id) {
        assetService.addToWishlist(principal.userId(), id);
    }

    @DeleteMapping("/{id}/wishlist")
    @PreAuthorize("isAuthenticated()")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeWishlist(@AuthenticationPrincipal JwtPrincipal principal, @PathVariable String id) {
        assetService.removeFromWishlist(principal.userId(), id);
    }

    @PostMapping("/{id}/cart")
    @PreAuthorize("isAuthenticated()")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void addCart(@AuthenticationPrincipal JwtPrincipal principal, @PathVariable String id) {
        assetService.addToCart(principal.userId(), id);
    }

    @DeleteMapping("/{id}/cart")
    @PreAuthorize("isAuthenticated()")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeCart(@AuthenticationPrincipal JwtPrincipal principal, @PathVariable String id) {
        assetService.removeFromCart(principal.userId(), id);
    }
}