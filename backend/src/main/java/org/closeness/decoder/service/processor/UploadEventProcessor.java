package org.closeness.decoder.service.processor;

import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.streams.processor.PunctuationType;
import org.apache.kafka.streams.processor.api.Processor;
import org.apache.kafka.streams.processor.api.ProcessorContext;
import org.apache.kafka.streams.processor.api.Record;
import org.apache.kafka.streams.state.KeyValueStore;
import org.closeness.decoder.dto.ExpiryStateStore;
import org.closeness.decoder.dto.FriendUploadEvent;
import org.closeness.decoder.service.S3CleanupService;
import tools.jackson.databind.ObjectMapper;

import java.time.Duration;

import static org.closeness.decoder.service.KafkaStreamsTopology.CLICK_STORE;
import static org.closeness.decoder.service.KafkaStreamsTopology.EXPIRY_STORE;

@Slf4j
public class UploadEventProcessor
        implements Processor<String, String, Void, Void> {

    private KeyValueStore<String, ExpiryStateStore> expiryStore;
    private KeyValueStore<String, Long> clickStore;
    private final S3CleanupService cleanupService;
    private final ObjectMapper objectMapper;

    public UploadEventProcessor(S3CleanupService cleanupService,
                                ObjectMapper objectMapper) {
        this.cleanupService = cleanupService;
        this.objectMapper = objectMapper;
    }

    @Override
    public void init(ProcessorContext<Void, Void> context) {
        this.expiryStore = context.getStateStore(EXPIRY_STORE);
        this.clickStore = context.getStateStore(CLICK_STORE);

        context.schedule(Duration.ofSeconds(30),
                PunctuationType.WALL_CLOCK_TIME, timestamp -> {
                    String now = String.format("%016d", System.currentTimeMillis());
                    try (var iterator = expiryStore.range("0", now + "_~")) {
                        while (iterator.hasNext()) {
                            var entry = iterator.next();
                            ExpiryStateStore val = entry.value;
                            Long clicks = clickStore.get(val.getFriendCode());
                            if (clicks != null && clicks > 0) {
                                cleanupService.flushClickCount(val.getFriendCode(), clicks);
                                clickStore.delete(val.getFriendCode());
                            }
                            cleanupService.handleExpiry(val.getFriendCode(), val.getStorageKey());
                            expiryStore.delete(entry.key);
                        }
                    }
                });
    }

    @Override
    public void process(Record<String, String> record) {
        try {
            FriendUploadEvent event = objectMapper.readValue(
                    record.value(), FriendUploadEvent.class);
            String compositeKey = String.format("%016d_%s",
                    event.getExpiredAt(), event.getFriendCode());
            ExpiryStateStore value = new ExpiryStateStore(
                    event.getFriendCode(), event.getS3FileKey());
            expiryStore.put(compositeKey, value);
            log.info("State Store Key-Value pair added: {}-{}",compositeKey,expiryStore.get(compositeKey));
        } catch (Exception e) {
            log.error(e.getMessage());
        }
    }

}