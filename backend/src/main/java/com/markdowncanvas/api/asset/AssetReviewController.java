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
@RequestMapping("/api/assets/{assetId}/reviews")
@RequiredArgsConstructor
public class AssetReviewController {

    private final AssetReviewService reviewService;

    @GetMapping
    public List<AssetReviewDto.ReviewResponse> list(@PathVariable String assetId) {
        return reviewService.listByAsset(assetId);
    }

    @GetMapping("/summary")
    public AssetReviewDto.RatingSummary summary(@PathVariable String assetId) {
        return reviewService.summary(assetId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    public AssetReviewDto.ReviewResponse create(@PathVariable String assetId,
                                                @AuthenticationPrincipal JwtPrincipal principal,
                                                @Valid @RequestBody AssetReviewDto.CreateRequest dto) {
        return reviewService.create(principal.userId(), assetId, dto);
    }

    @DeleteMapping("/{reviewId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("isAuthenticated()")
    public void delete(@PathVariable String assetId,
                       @PathVariable String reviewId,
                       @AuthenticationPrincipal JwtPrincipal principal) {
        reviewService.delete(principal.userId(), principal.role(), assetId, reviewId);
    }
}
