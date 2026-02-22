package org.closeness.decoder.repository;

import org.closeness.decoder.model.FriendUrl;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface FriendUrlRepository extends JpaRepository<FriendUrl, UUID> {
    @Modifying
    @Query("UPDATE FriendUrl f SET f.isActive = false WHERE f.id = :id")
    void updateActiveStatus(@Param("id") UUID id);

    @Modifying
    @Query(value = "UPDATE closeness_decoder_schema.friend_urls " +
            "SET click_count = click_count + :count " +
            "WHERE friend_url_id = :id", nativeQuery = true)
    void incrementClickCount(@Param("id") UUID id, @Param("count") long count);
}
