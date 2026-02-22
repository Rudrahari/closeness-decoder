package org.closeness.decoder.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExpiryStateStore {
    private String friendCode;
    private String storageKey;
}
