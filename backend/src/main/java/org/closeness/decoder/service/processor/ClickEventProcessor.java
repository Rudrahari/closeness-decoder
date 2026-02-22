package org.closeness.decoder.service.processor;

import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.streams.processor.PunctuationType;
import org.apache.kafka.streams.processor.api.Processor;
import org.apache.kafka.streams.processor.api.ProcessorContext;
import org.apache.kafka.streams.processor.api.Record;
import org.apache.kafka.streams.state.KeyValueStore;
import org.closeness.decoder.dto.FriendClickEvent;
import org.closeness.decoder.service.S3CleanupService;
import tools.jackson.databind.ObjectMapper;

import java.time.Duration;

import static org.closeness.decoder.service.KafkaStreamsTopology.CLICK_STORE;

@Slf4j
public class ClickEventProcessor
        implements Processor<String, String, Void, Void> {
    private KeyValueStore<String, Long> clickCountStore;
    private final S3CleanupService cleanupService;
    private final ObjectMapper objectMapper;
    public ClickEventProcessor(S3CleanupService cleanupService,
                        ObjectMapper objectMapper) {
        this.cleanupService = cleanupService;
        this.objectMapper = objectMapper;
    }
    @Override
    public void init(ProcessorContext<Void, Void> context) {
        this.clickCountStore = context.getStateStore(CLICK_STORE);

        context.schedule(Duration.ofSeconds(20),
                PunctuationType.WALL_CLOCK_TIME, timestamp -> {
                    try (var iterator = clickCountStore.all()) {
                        while (iterator.hasNext()) {
                            var entry = iterator.next();
                            cleanupService.flushClickCount(entry.key, entry.value);
                            clickCountStore.delete(entry.key);
                        }
                    }
                });
    }
    @Override
    public void process(Record<String, String> record) {
        try {
            FriendClickEvent event = objectMapper.readValue(
                    record.value(), FriendClickEvent.class);
            String key = event.getFriendCode();
            Long current = clickCountStore.get(key);
            clickCountStore.put(key, (current == null ? 0 : current) + 1);
            log.info("Click event flushed for: {}",key);
        } catch (Exception e) {
            log.error(e.getMessage());
        }
    }
}