package com.markdowncanvas.api.release;

import com.markdowncanvas.api.user.UserRole;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReleaseService {

    private final AppReleaseRepository releases;

    @PostConstruct
    @Transactional
    public void seed() {
        if (releases.existsByVersionAndPlatformAndChannel("0.1.0", ReleasePlatform.windows, ReleaseChannel.stable)) return;
        AppRelease r = new AppRelease();
        r.setVersion("0.1.0");
        r.setPlatform(ReleasePlatform.windows);
        r.setChannel(ReleaseChannel.stable);
        r.setDownloadUrl("https://github.com/your-org/markvas/releases/download/v0.1.0/MarkVas-Setup-0.1.0.exe");
        r.setChecksum("sha256-dev-windows-placeholder");
        r.setReleaseNotes("Windows desktop preview build with local Markdown editing, PDF export, templates, plugins, and store sync.");
        releases.save(r);
    }

    public List<ReleaseDto.ReleaseResponse> list() {
        return releases.findAllByOrderByPublishedAtDesc()
                .stream().map(ReleaseDto.ReleaseResponse::from).toList();
    }

    public ReleaseDto.ReleaseResponse latest(String platform, String channel) {
        ReleasePlatform p = ReleasePlatform.valueOf(platform);
        ReleaseChannel c = channel != null ? ReleaseChannel.valueOf(channel) : ReleaseChannel.stable;
        return releases.findTopByPlatformAndChannelOrderByPublishedAtDesc(p, c)
                .map(ReleaseDto.ReleaseResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Release not found."));
    }

    @Transactional
    public ReleaseDto.ReleaseResponse create(UserRole role, ReleaseDto.CreateRequest dto) {
        if (role != UserRole.ADMIN) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin role required.");
        AppRelease r = new AppRelease();
        r.setVersion(dto.getVersion());
        r.setPlatform(dto.getPlatform());
        r.setChannel(dto.getChannel() != null ? dto.getChannel() : ReleaseChannel.stable);
        r.setDownloadUrl(dto.getDownloadUrl());
        r.setChecksum(dto.getChecksum());
        r.setSignature(dto.getSignature());
        r.setReleaseNotes(dto.getReleaseNotes());
        return ReleaseDto.ReleaseResponse.from(releases.save(r));
    }
}
