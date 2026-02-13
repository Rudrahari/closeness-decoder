package org.closeness.decoder.repository;

import org.closeness.decoder.model.FriendUrl;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FriendUrlRepository extends JpaRepository<FriendUrl, UUID> {

}
