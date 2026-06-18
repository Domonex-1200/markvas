package com.markdowncanvas.api.user;

import com.markdowncanvas.api.asset.AssetRepository;
import com.markdowncanvas.api.asset.AssetStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository users;
    private final DeveloperApplicationRepository devApps;
    private final AssetRepository assets;

    // ── 프로필 조회 ───────────────────────────────────────────────────────
    public UserDto.ProfileResponse getProfile(String userId) {
        return UserDto.ProfileResponse.from(getUser(userId));
    }

    // ── 프로필 수정 ───────────────────────────────────────────────────────
    @Transactional
    public UserDto.ProfileResponse updateProfile(String userId, UserDto.UpdateProfileRequest dto) {
        User user = getUser(userId);
        if (dto.getNickname() != null)          user.setNickname(dto.getNickname().isBlank() ? null : dto.getNickname());
        if (dto.getPhone() != null)             user.setPhone(dto.getPhone().isBlank() ? null : dto.getPhone());
        if (dto.getProfilePictureUrl() != null) user.setProfilePictureUrl(dto.getProfilePictureUrl().isBlank() ? null : dto.getProfilePictureUrl());
        if (dto.getBirthday() != null) {
            user.setBirthday(dto.getBirthday().isBlank() ? null : LocalDate.parse(dto.getBirthday()));
        }
        if (dto.getGender() != null) {
            if (dto.getGender().isBlank()) {
                user.setGender(null);
            } else {
                try {
                    user.setGender(Gender.valueOf(dto.getGender()));
                } catch (IllegalArgumentException e) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid gender value.");
                }
            }
        }
        return UserDto.ProfileResponse.from(users.save(user));
    }

    // ── 개발자 신청 ───────────────────────────────────────────────────────
    @Transactional
    public UserDto.DeveloperApplicationResponse applyForDeveloper(String userId, String reason) {
        User user = getUser(userId);
        if (user.getRole() == UserRole.DEVELOPER || user.getRole() == UserRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already a developer or admin.");
        }
        if (devApps.existsByUserIdAndStatus(userId, DeveloperApplication.ApplicationStatus.PENDING)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A pending application already exists.");
        }
        if (reason == null || reason.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reason is required.");
        }
        DeveloperApplication app = new DeveloperApplication();
        app.setUser(user);
        app.setReason(reason);
        return UserDto.DeveloperApplicationResponse.from(devApps.save(app));
    }

    public UserDto.DeveloperApplicationResponse getMyApplication(String userId) {
        return devApps.findByUserIdAndStatus(userId, DeveloperApplication.ApplicationStatus.PENDING)
                .map(UserDto.DeveloperApplicationResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No pending application."));
    }

    // ── 관리자: 개발자 신청 목록 ─────────────────────────────────────────
    public List<UserDto.DeveloperApplicationResponse> getAllApplications() {
        return devApps.findAllByOrderByAppliedAtDesc()
                .stream().map(UserDto.DeveloperApplicationResponse::from).toList();
    }

    public List<UserDto.DeveloperApplicationResponse> getPendingApplications() {
        return devApps.findByStatusOrderByAppliedAtDesc(DeveloperApplication.ApplicationStatus.PENDING)
                .stream().map(UserDto.DeveloperApplicationResponse::from).toList();
    }

    // ── 관리자: 개발자 신청 심사 ─────────────────────────────────────────
    @Transactional
    public UserDto.DeveloperApplicationResponse reviewApplication(String adminId, String appId, boolean approve, String note) {
        DeveloperApplication app = devApps.findById(appId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found."));
        if (app.getStatus() != DeveloperApplication.ApplicationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Application already reviewed.");
        }
        app.setStatus(approve ? DeveloperApplication.ApplicationStatus.APPROVED : DeveloperApplication.ApplicationStatus.REJECTED);
        app.setReviewNote(note);
        app.setReviewedBy(adminId);
        app.setReviewedAt(Instant.now());

        if (approve) {
            User user = app.getUser();
            user.setRole(UserRole.DEVELOPER);
            users.save(user);
        }
        return UserDto.DeveloperApplicationResponse.from(devApps.save(app));
    }

    // ── 관리자: 유저 목록 ─────────────────────────────────────────────────
    public List<UserDto.ProfileResponse> getAllUsers() {
        return users.findAll().stream()
                .map(UserDto.ProfileResponse::from).toList();
    }

    // ── 관리자: 비활성화 / 활성화 ────────────────────────────────────────
    @Transactional
    public UserDto.ProfileResponse setActive(String targetUserId, boolean active) {
        User user = getUser(targetUserId);
        if (user.getRole() == UserRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot deactivate an admin account.");
        }
        user.setActive(active);
        user.setDeactivatedAt(active ? null : Instant.now());
        if (!active) user.setRefreshTokenHash(null); // 기존 세션 무효화
        return UserDto.ProfileResponse.from(users.save(user));
    }

    // ── 관리자: 역할 변경 ─────────────────────────────────────────────────
    @Transactional
    public UserDto.ProfileResponse changeRole(String targetUserId, String newRole) {
        User user = getUser(targetUserId);
        try {
            user.setRole(UserRole.valueOf(newRole));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role: " + newRole);
        }
        return UserDto.ProfileResponse.from(users.save(user));
    }

    // ── 관리자: 통계 ──────────────────────────────────────────────────────
    public UserDto.AdminStats getStats() {
        UserDto.AdminStats stats = new UserDto.AdminStats();
        stats.setTotalUsers(users.count());
        stats.setDevelopers(users.countByRole(UserRole.DEVELOPER));
        stats.setAdmins(users.countByRole(UserRole.ADMIN));
        stats.setTotalAssets(assets.count());
        stats.setPublishedAssets(assets.countByStatus(AssetStatus.PUBLISHED));
        stats.setInReviewAssets(assets.countByStatus(AssetStatus.IN_REVIEW));
        stats.setPendingApplications(devApps.countByStatus(DeveloperApplication.ApplicationStatus.PENDING));
        return stats;
    }

    private User getUser(String userId) {
        return users.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
    }
}
