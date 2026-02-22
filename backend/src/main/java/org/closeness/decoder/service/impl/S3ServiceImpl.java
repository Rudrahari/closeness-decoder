package org.closeness.decoder.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.closeness.decoder.configuration.S3Properties;
import org.closeness.decoder.dto.FriendLinkDto;
import org.closeness.decoder.dto.FriendMessageDto;
import org.closeness.decoder.model.FriendUrl;
import org.closeness.decoder.repository.FriendUrlRepository;
import org.closeness.decoder.service.RedisCacheService;
import org.closeness.decoder.service.KafkaProducer;
import org.closeness.decoder.service.S3Service;
import org.closeness.decoder.utils.AuthUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class S3ServiceImpl implements S3Service {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final S3Properties s3Properties;
    private final FriendUrlRepository friendUrlRepository;
    private final AuthUtils authUtils;
    private final RedisCacheService redisCacheService;
    private final KafkaProducer kafkaProducer;

    public S3ServiceImpl(S3Client s3Client, S3Presigner s3Presigner, S3Properties s3Properties, FriendUrlRepository friendUrlRepository, AuthUtils authUtils, RedisCacheService redisCacheService, KafkaProducer kafkaProducer) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
        this.s3Properties = s3Properties;
        this.kafkaProducer = kafkaProducer;
        this.friendUrlRepository = friendUrlRepository;
        this.authUtils = authUtils;
        this.redisCacheService = redisCacheService;
    }

    @Override
    public ResponseEntity<?> sendObject(MultipartFile file) {
        String key = createS3FileKey(file);

        try {
            uploadObject(file, key);
        } catch (Exception e) {
            log.error(e.getMessage());
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>("Saved successfully", HttpStatus.OK);
    }

    @Override
    public ResponseEntity<?> getPreSignedUrl(String key) {
        GetObjectRequest request =
                GetObjectRequest.builder().
                        bucket(s3Properties.getBucketName()).
                        key(key).
                        build();

        GetObjectPresignRequest presignRequest =
                GetObjectPresignRequest.builder().
                        signatureDuration(Duration.ofMinutes(45)).
                        getObjectRequest(request).
                        build();

        String preSignedUrl =
                s3Presigner.presignGetObject(presignRequest).url().toString();
        return new ResponseEntity<>(preSignedUrl, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<?> sendObjectAndGeneratePresignedUrl(MultipartFile file) {
        // Validate file
        if (file.isEmpty()) {
            return new ResponseEntity<>("File is not present", HttpStatus.BAD_REQUEST);
        }
        if (!"application/pdf".equalsIgnoreCase(file.getContentType())) {
            return new ResponseEntity<>("Only PDF file format is supported", HttpStatus.BAD_REQUEST);
        }

        String key = createS3FileKey(file);
        ResponseEntity<?> response;
        try {
            uploadObject(file, key);
            log.info("File uploaded to S3");
            response = getPreSignedUrl(key);
            LocalDateTime now = LocalDateTime.now();
            log.info("Presigned url generated");
            String sourceUrl = response.getBody().toString();
            UUID userId = authUtils.getCurrentUserId();
            FriendUrl friendUrl =
                    FriendUrl.builder().
                            userId(userId).
                            sourceUrl(sourceUrl).
                            sourceKey(key).
                            expiryTimeMinutes(60).
                            createdAt(now).
                            expiresAt(now.plusMinutes(60)).
                            isActive(true).
                            build();
            friendUrl = friendUrlRepository.save(friendUrl);
            UUID friendCode=friendUrl.getId();
            redisCacheService.
                    createFriendUrl(String.valueOf(friendCode),sourceUrl);
            FriendLinkDto friendLinkDto = new FriendLinkDto(friendCode);
            return new ResponseEntity<>(friendLinkDto, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<FriendMessageDto> getFriendUrl(UUID friendCode) {
        String sourceUrlFromCache
                = redisCacheService.getFriendUrlFromCache(String.valueOf(friendCode));
        if(sourceUrlFromCache!=null){
            FriendMessageDto friendMessageDto =
                    new FriendMessageDto("Success", sourceUrlFromCache);
            return new ResponseEntity<FriendMessageDto>(friendMessageDto, HttpStatus.OK);
        }
        Optional<FriendUrl> friendUrl = friendUrlRepository.findById(friendCode);
        if (friendUrl.isEmpty()) {
            FriendMessageDto friendMessageDto =
                    new FriendMessageDto("Failed", null);
            return new ResponseEntity<>(friendMessageDto, HttpStatus.ACCEPTED);
        }
        FriendMessageDto friendMessageDto =
                new FriendMessageDto("Success", friendUrl.get().getSourceUrl());
        return new ResponseEntity<FriendMessageDto>(friendMessageDto, HttpStatus.OK);
    }

    public void uploadObject(MultipartFile file, String key) throws Exception {
        PutObjectRequest request =
                PutObjectRequest.builder()
                        .bucket(s3Properties.getBucketName())
                        .key(key)
                        .contentType(file.getContentType())
                        .build();
        s3Client.putObject(request,
                RequestBody.fromInputStream(
                        file.getInputStream(), file.getSize()));
    }

    public String createS3FileKey(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        String extension = ".pdf"; // default
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return LocalDate.now() + "/" + UUID.randomUUID() + extension;
    }
}
