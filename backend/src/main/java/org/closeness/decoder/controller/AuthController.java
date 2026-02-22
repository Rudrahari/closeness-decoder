package org.closeness.decoder.controller;

import lombok.RequiredArgsConstructor;
import org.closeness.decoder.dto.AuthRequest;
import org.closeness.decoder.dto.AuthResponse;
import org.closeness.decoder.dto.UserDto;
import org.closeness.decoder.service.AuthService;
import org.closeness.decoder.utils.AuthUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AuthUtils authUtils;

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
    public ResponseEntity<UserDto> getCurrentUser() {
        UserDto userDto = authUtils.getCurrentUserDto();
        return ResponseEntity.ok(userDto);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok().build();
    }
}

