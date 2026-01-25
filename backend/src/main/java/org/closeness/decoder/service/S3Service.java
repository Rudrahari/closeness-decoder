package org.closeness.decoder.service;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

public interface S3Service {
    ResponseEntity<?> sendObject(MultipartFile file);
    ResponseEntity<?> getPreSignedUrl(String key);
    ResponseEntity<?> sendObjectAndGeneratePresignedUrl(MultipartFile file);
}
