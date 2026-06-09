package com.markdowncanvas.api.release;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

public class ReleaseDto {

    @Data
    public static class CreateRequest {
        @NotBlank private String version;
        @NotNull  private ReleasePlatform platform;
        private ReleaseChannel channel = ReleaseChannel.stable;
        @NotBlank private String downloadUrl;
        @NotBlank private String checksum;
        private String signature;
        @NotBlank private String releaseNotes;
    }

    @Data
    public static class ReleaseResponse {
        private String id;
        private String version;
        private String platform;
        private String channel;
        private String downloadUrl;
        private String checksum;
        private String signature;
        private String releaseNotes;
        private String publishedAt;

        public static ReleaseResponse from(AppRelease r) {
            ReleaseResponse resp = new ReleaseResponse();
            resp.id = r.getId();
            resp.version = r.getVersion();
            resp.platform = r.getPlatform().name();
            resp.channel = r.getChannel().name();
            resp.downloadUrl = r.getDownloadUrl();
            resp.checksum = r.getChecksum();
            resp.signature = r.getSignature();
            resp.releaseNotes = r.getReleaseNotes();
            resp.publishedAt = r.getPublishedAt().toString();
            return resp;
        }
    }
}
