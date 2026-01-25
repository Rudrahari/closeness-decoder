package org.closeness.decoder.controller;

import lombok.RequiredArgsConstructor;
import org.closeness.decoder.dto.AuthRequest;
import org.closeness.decoder.dto.AuthResponse;
import org.closeness.decoder.model.User;
import org.closeness.decoder.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signUp(@RequestBody AuthRequest request) {
        AuthResponse response = authService.signUp(request.getCredential());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> signIn(@RequestBody AuthRequest request) {
        AuthResponse response = authService.signIn(request.getCredential());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse.UserDto> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof User user) {
            AuthResponse.UserDto userDto = AuthResponse.UserDto.builder()
                    .id(user.getId().toString())
                    .email(user.getEmail())
                    .name(user.getUserName())
                    .avatar(user.getProfilePicture())
                    .build();
            return ResponseEntity.ok(userDto);
        }

        return ResponseEntity.status(401).build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok().build();
    }
}
