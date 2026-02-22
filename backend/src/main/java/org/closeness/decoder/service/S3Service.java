package org.closeness.decoder.service;

import org.closeness.decoder.dto.FriendMessageDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface S3Service {
    ResponseEntity<?> sendObject(MultipartFile file);
    ResponseEntity<?> getPreSignedUrl(String key);
    ResponseEntity<?> sendObjectAndGeneratePresignedUrl(MultipartFile file);
    ResponseEntity<FriendMessageDto> getFriendUrl(UUID friendCode);
    void deleteObject(String key);
}
