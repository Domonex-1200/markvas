package com.markdowncanvas.api.upload;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;

public class UploadDto {

    @Data
    public static class PresignRequest {
        @NotBlank private String folder;
        @NotBlank private String filename;
        @NotBlank private String contentType;
    }

    @Data
    @AllArgsConstructor
    public static class PresignResponse {
        private String uploadUrl;
        private String publicUrl;
        private String key;
    }
}
