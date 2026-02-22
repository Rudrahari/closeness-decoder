package org.closeness.decoder.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "friend_urls", schema = "closeness_decoder_schema")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendUrl {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "friend_url_id", updatable = false, nullable = false)
    @JsonProperty("id")
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name="source_url",nullable = false)
    private String sourceUrl;

    @Column(name="source_key",nullable = false)
    private String sourceKey;

    @Column(name = "expiry_time_minutes")
    private Integer expiryTimeMinutes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "is_active")
    private Boolean isActive;
}