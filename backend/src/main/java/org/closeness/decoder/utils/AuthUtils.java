package org.closeness.decoder.utils;

import org.closeness.decoder.dto.UserDto;
import org.closeness.decoder.exception.AuthException;
import org.closeness.decoder.model.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AuthUtils {

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthException("Not authenticated");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof User user) {
            return user;
        }

        throw new AuthException("Invalid authentication principal");
    }

    public UserDto getCurrentUserDto() {
        return UserDto.fromUser(getCurrentUser());
    }

    public java.util.UUID getCurrentUserId() {
        return getCurrentUser().getId();
    }

    public boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof User;
    }
}
