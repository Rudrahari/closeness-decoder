package org.closeness.decoder.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FriendClickEvent {
    private String friendCode;
    private long clickedAt;
}
