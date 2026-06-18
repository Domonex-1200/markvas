package com.markdowncanvas.api.upload;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final UploadService uploadService;

    @PostMapping("/presign")
    @PreAuthorize("isAuthenticated()")
    public UploadDto.PresignResponse presign(@Valid @RequestBody UploadDto.PresignRequest dto) {
        return uploadService.presign(dto.getFolder(), dto.getFilename(), dto.getContentType());
    }
}
