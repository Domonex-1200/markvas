package com.markdowncanvas.api.release;

import com.markdowncanvas.api.security.JwtPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/app/releases")
@RequiredArgsConstructor
public class ReleaseController {

    private final ReleaseService releaseService;

    @GetMapping
    public List<ReleaseDto.ReleaseResponse> list() {
        return releaseService.list();
    }

    @GetMapping("/latest")
    public ReleaseDto.ReleaseResponse latest(@RequestParam String platform,
                                              @RequestParam(required = false) String channel) {
        return releaseService.latest(platform, channel);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ReleaseDto.ReleaseResponse create(@AuthenticationPrincipal JwtPrincipal principal,
                                              @Valid @RequestBody ReleaseDto.CreateRequest dto) {
        return releaseService.create(principal.role(), dto);
    }
}
