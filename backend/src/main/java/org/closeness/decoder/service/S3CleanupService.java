package org.closeness.decoder.service;

import org.closeness.decoder.repository.FriendUrlRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class S3CleanupService {
    private final FriendUrlRepository friendUrlRepository;
    private final S3Service s3Service;

    public S3CleanupService(FriendUrlRepository friendUrlRepository, S3Service s3Service) {
        this.friendUrlRepository = friendUrlRepository;
        this.s3Service = s3Service;
    }

    @Transactional
    public void handleExpiry(String friendCode,String storageKey){
        friendUrlRepository.updateActiveStatus(UUID.fromString(friendCode));
        s3Service.deleteObject(storageKey);
    }

    @Transactional
    public void flushClickCount(String friendCode, Long clicks) {
        friendUrlRepository.incrementClickCount(UUID.fromString(friendCode),clicks);
    }
}
