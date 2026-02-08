package org.closeness.decoder.repository;

import org.closeness.decoder.model.FriendUrl;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FriendUrlRepository extends JpaRepository<FriendUrl, UUID> {
    Optional<FriendUrl> findByFriendCode(UUID friendCode);
}
