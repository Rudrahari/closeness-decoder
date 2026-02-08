package org.closeness.decoder.controller;

import lombok.Getter;
import org.closeness.decoder.annotation.RateLimiter;
import org.closeness.decoder.dto.FriendMessageDto;
import org.closeness.decoder.service.S3Service;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api")
public class S3Controller {

    private final S3Service s3Service;

    public S3Controller(S3Service s3Service) {
        this.s3Service = s3Service;
    }

    @GetMapping(path = "/presigned-url/{key}")
    public ResponseEntity<?> generatePresignedUrl(
            @PathVariable("key") String key
    ) {
        return s3Service.getPreSignedUrl(key);
    }

    // TODO -> allow multiple files to be added in a single api call(List<MultiPartFile> files)
    @PostMapping(path = "/upload")
    public ResponseEntity<?> sendObjectToS3CompatibleStorage(
            @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return new ResponseEntity<>("file is not present", HttpStatus.BAD_REQUEST);
        } else if (!file.getContentType().equalsIgnoreCase("application/pdf")) {
            return new ResponseEntity<>("only pdf file format is supported", HttpStatus.BAD_REQUEST);
        }
        return s3Service.sendObject(file);
    }

    @PostMapping(path = "/friend-url/upload")
    public ResponseEntity<?> sendObjectToS3CompatibleStorageAndGeneratePresignedUrl(
            @RequestParam("file") MultipartFile file
    ) {
        return s3Service.sendObjectAndGeneratePresignedUrl(file);
    }

    @GetMapping(path = "/friend-url/{friendCode}")
    @RateLimiter(requests = 100, window = 60,key = "get-friend-url")
    public ResponseEntity<FriendMessageDto> getFriendUrl(
            @PathVariable("friendCode") UUID friendCode
    ) {
        return s3Service.getFriendUrl(friendCode);
    }
}
