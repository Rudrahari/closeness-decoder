package org.closeness.decoder.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users", schema = "closeness_decoder_schema")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    @JsonProperty("id")
    private UUID id;

    @Column(name = "email", unique = true, nullable = false)
    @JsonProperty("email")
    private String email;

    @Column(name = "user_name")
    @JsonProperty("user_name")
    private String userName;

    @Column(name = "google_id", unique = true)
    @JsonProperty("google_id")
    private String googleId;

    @Column(name = "profile_picture")
    @JsonProperty("profile_picture")
    private String profilePicture;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}