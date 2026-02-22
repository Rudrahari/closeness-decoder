package org.closeness.decoder.service;

import lombok.extern.slf4j.Slf4j;
import org.closeness.decoder.configuration.KafkaTopic;
import org.closeness.decoder.dto.FriendClickEvent;
import org.closeness.decoder.dto.FriendUploadEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
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
                KafkaTopic.UPLOAD_EVENT.getTopicName(),
                friendCode,
                friendUploadEvent
        ).whenComplete((result, ex) -> {
            String topic = KafkaTopic.UPLOAD_EVENT.getTopicName();
            if (ex != null) {
                log.error("Failed to send to {}: {}", topic, ex.getMessage());
            } else {
                log.info("Sent to {} partition {} offset {}",
                        topic,
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
            }
        });
    }

    public void publishClickEvent(String friendCode, long clickedAt) {
        FriendClickEvent friendClickEvent
                = new FriendClickEvent(friendCode, clickedAt);
        kafkaTemplate.send(
                KafkaTopic.CLICK_EVENT.getTopicName(),
                friendCode,
                friendClickEvent
        ).whenComplete((result, ex) -> {
            String topic = KafkaTopic.CLICK_EVENT.getTopicName();
            if (ex != null) {
                log.error("Failed to send to {}: {}", topic, ex.getMessage());
            } else {
                log.info("Sent to {} partition {} offset {}",
                        topic,
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
            }
        });
    }
}
