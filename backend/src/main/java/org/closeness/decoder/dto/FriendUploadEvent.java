package org.closeness.decoder.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FriendUploadEvent {
    private String friendCode;
    private String s3FileKey;
    private long createdAt;
    private long expiredAt;
}
