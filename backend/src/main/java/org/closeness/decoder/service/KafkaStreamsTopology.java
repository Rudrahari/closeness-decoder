package org.closeness.decoder.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.serialization.Serde;
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.Topology;
import org.apache.kafka.streams.kstream.Consumed;
import org.apache.kafka.streams.kstream.KStream;
import org.apache.kafka.streams.state.Stores;
import org.closeness.decoder.configuration.KafkaTopic;
import org.closeness.decoder.dto.ExpiryStateStore;
import org.closeness.decoder.service.processor.ClickEventProcessor;
import org.closeness.decoder.service.processor.UploadEventProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

@Component
@Slf4j
public class KafkaStreamsTopology {
    private final S3CleanupService s3CleanupService;
    private final ObjectMapper objectMapper;


    public static final String EXPIRY_STORE = "expiry-store";
    public static final String CLICK_STORE = "click-store";

    public KafkaStreamsTopology(S3CleanupService s3CleanupService, ObjectMapper objectMapper) {
        this.s3CleanupService = s3CleanupService;
        this.objectMapper = objectMapper;
    }

    public static <T> Serde<T> objectSerde(Class<T> classType) {
        ObjectMapper mapper = new ObjectMapper();
        return Serdes.serdeFrom(
                (topic, data) -> {
                    try {
                        return mapper.writeValueAsBytes(data);
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                },
                (topic, bytes) -> {
                    try {
                        return bytes == null ? null : mapper.readValue(bytes, classType);
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                }
        );
    }

    @Bean
    public Topology buildStreamsTopology(StreamsBuilder builder) {
        registerStateStores(builder);

        KStream<String, String> uploadStream = builder.stream(
                KafkaTopic.UPLOAD_EVENT.getTopicName(),
                Consumed.with(Serdes.String(), Serdes.String()));
        uploadStream.process(
                () -> new UploadEventProcessor(s3CleanupService, objectMapper),
                EXPIRY_STORE,CLICK_STORE);
        KStream<String, String> clickStream = builder.stream(
                KafkaTopic.CLICK_EVENT.getTopicName(),
                Consumed.with(Serdes.String(), Serdes.String()));
        clickStream.process(
                () -> new ClickEventProcessor(s3CleanupService, objectMapper),
                CLICK_STORE);

        return builder.build();
    }

    public void registerStateStores(StreamsBuilder builder) {
        builder.addStateStore(
                Stores.keyValueStoreBuilder(
                        Stores.persistentKeyValueStore(EXPIRY_STORE),
                        Serdes.String(),
                        objectSerde(ExpiryStateStore.class)
                )
        );
        builder.addStateStore(
                Stores.keyValueStoreBuilder(
                        Stores.persistentKeyValueStore(CLICK_STORE),
                        Serdes.String(),
                        Serdes.Long()
                )
        );
    }
}
