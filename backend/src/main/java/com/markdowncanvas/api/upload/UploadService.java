package com.markdowncanvas.api.upload;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UploadService {

    @Value("${app.s3.bucket}")
    private String bucket;

    @Value("${app.s3.region}")
    private String region;

    @Value("${app.s3.cdn-base}")
    private String cdnBase;

    public UploadDto.PresignResponse presign(String folder, String filename, String contentType) {
        String ext = filename.contains(".") ? filename.substring(filename.lastIndexOf('.')) : "";
        String key = folder + "/" + UUID.randomUUID() + ext;

        try (S3Presigner presigner = S3Presigner.builder()
                .region(Region.of(region))
                .build()) {

            PutObjectRequest putReq = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(contentType)
                    .build();

            PresignedPutObjectRequest presigned = presigner.presignPutObject(r -> r
                    .signatureDuration(Duration.ofMinutes(10))
                    .putObjectRequest(putReq));

            String publicUrl = cdnBase + "/" + key;
            return new UploadDto.PresignResponse(presigned.url().toString(), publicUrl, key);
        }
    }
}
