package org.closeness.decoder.configuration;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum KafkaTopic {

    CLICK_EVENT("friend-file-upload-events"),
    UPLOAD_EVENT("friend-file-upload-events");

    private final String topicName;
}
