package org.closeness.decoder.service;

import org.closeness.decoder.configuration.KafkaTopic;
import org.closeness.decoder.dto.FriendClickEvent;
import org.closeness.decoder.dto.FriendUploadEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public KafkaProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishUploadEvent(String friendCode, String storageKey,
                                   long createdAt,
                                   long expiresAt) {
        FriendUploadEvent friendUploadEvent
                = new FriendUploadEvent(friendCode, storageKey, createdAt, expiresAt);
        kafkaTemplate.send(
                KafkaTopic.CLICK_EVENT.getTopicName(),
                friendCode,
                friendUploadEvent
        );
    }

    public void publishClickEvent(String friendCode, long clickedAt) {
        FriendClickEvent friendClickEvent
                = new FriendClickEvent(friendCode, clickedAt);
        kafkaTemplate.send(
                KafkaTopic.CLICK_EVENT.getTopicName(),
                friendCode,
                friendClickEvent
        );
    }
}
