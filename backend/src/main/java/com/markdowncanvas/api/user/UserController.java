package com.markdowncanvas.api.user;

import com.markdowncanvas.api.security.JwtPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ── 내 프로필 조회 ─────────────────────────────────────────────────────
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public UserDto.ProfileResponse getMyProfile(@AuthenticationPrincipal JwtPrincipal principal) {
        return userService.getProfile(principal.userId());
    }

    // ── 내 프로필 수정 ─────────────────────────────────────────────────────
    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public UserDto.ProfileResponse updateMyProfile(@AuthenticationPrincipal JwtPrincipal principal,
                                                   @RequestBody UserDto.UpdateProfileRequest dto) {
        return userService.updateProfile(principal.userId(), dto);
    }

    // ── 개발자 신청 ────────────────────────────────────────────────────────
    @PostMapping("/me/developer-application")
    @PreAuthorize("isAuthenticated()")
    public UserDto.DeveloperApplicationResponse applyForDeveloper(@AuthenticationPrincipal JwtPrincipal principal,
                                                                  @RequestBody UserDto.DeveloperApplicationRequest dto) {
        return userService.applyForDeveloper(principal.userId(), dto.getReason());
    }

    @GetMapping("/me/developer-application")
    @PreAuthorize("isAuthenticated()")
    public UserDto.DeveloperApplicationResponse getMyApplication(@AuthenticationPrincipal JwtPrincipal principal) {
        return userService.getMyApplication(principal.userId());
    }

    // ── 관리자: 유저 목록 ──────────────────────────────────────────────────
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserDto.ProfileResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    // ── 관리자: 개발자 신청 목록 ───────────────────────────────────────────
    @GetMapping("/admin/developer-applications")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserDto.DeveloperApplicationResponse> getAllApplications(@RequestParam(required = false) String status) {
        if ("PENDING".equalsIgnoreCase(status)) {
            return userService.getPendingApplications();
        }
        return userService.getAllApplications();
    }

    // ── 관리자: 개발자 신청 심사 ───────────────────────────────────────────
    @PostMapping("/admin/developer-applications/{appId}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public UserDto.DeveloperApplicationResponse reviewApplication(@AuthenticationPrincipal JwtPrincipal principal,
                                                                  @PathVariable String appId,
                                                                  @RequestBody UserDto.ReviewApplicationRequest dto) {
        return userService.reviewApplication(principal.userId(), appId, dto.isApprove(), dto.getNote());
    }

    // ── 관리자: 비활성화 / 활성화 ─────────────────────────────────────────
    @PutMapping("/{id}/active")
    @PreAuthorize("hasRole('ADMIN')")
    public UserDto.ProfileResponse setActive(@PathVariable String id,
                                             @RequestBody java.util.Map<String, Boolean> body) {
        boolean active = Boolean.TRUE.equals(body.get("active"));
        return userService.setActive(id, active);
    }

    // ── 관리자: 역할 변경 ──────────────────────────────────────────────────
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public UserDto.ProfileResponse changeRole(@PathVariable String id,
                                              @RequestBody UserDto.ChangeRoleRequest dto) {
        return userService.changeRole(id, dto.getRole());
    }

    // ── 관리자: 통계 ───────────────────────────────────────────────────────
    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public UserDto.AdminStats getStats() {
        return userService.getStats();
    }
}
