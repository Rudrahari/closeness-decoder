package org.closeness.decoder.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.closeness.decoder.model.User;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private String id;
    private String email;
    private String name;
    private String avatar;

    public static UserDto fromUser(User user) {
        return UserDto.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .name(user.getUserName())
                .avatar(user.getProfilePicture())
                .build();
    }
}
