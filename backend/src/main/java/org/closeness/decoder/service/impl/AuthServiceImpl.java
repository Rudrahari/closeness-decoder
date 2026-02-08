package org.closeness.decoder.service.impl;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.extern.slf4j.Slf4j;
import org.closeness.decoder.dto.AuthResponse;
import org.closeness.decoder.dto.UserDto;
import org.closeness.decoder.exception.AuthException;
import org.closeness.decoder.model.User;
import org.closeness.decoder.repository.UserRepository;
import org.closeness.decoder.security.JwtTokenProvider;
import org.closeness.decoder.service.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final GoogleIdTokenVerifier verifier;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthServiceImpl(
            UserRepository userRepository,
            @Value("${google.client-id}") String googleClientId,
            JwtTokenProvider jwtTokenProvider
    ) {
        this.userRepository = userRepository;
        this.verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance()
        )
                .setAudience(Collections.singletonList(googleClientId))
                .build();
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public AuthResponse signUp(String googleCredential) {
        GoogleIdToken.Payload payload = verifyGoogleToken(googleCredential);

        String googleId = payload.getSubject();
        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");

        // Check if user already exists
        if (userRepository.existsByGoogleId(googleId) || userRepository.existsByEmail(email)) {
            throw new AuthException("User already exists. Please sign in instead.");
        }

        // Create new user
        User user = new User();
        user.setGoogleId(googleId);
        user.setEmail(email);
        user.setUserName(name);
        user.setProfilePicture(picture);

        User savedUser = userRepository.save(user);
        log.info("New user signed up: {}", email);

        String accessToken = jwtTokenProvider.generateToken(savedUser);

        return buildAuthResponse(savedUser, accessToken);
    }

    @Override
    public AuthResponse signIn(String googleCredential) {
        GoogleIdToken.Payload payload = verifyGoogleToken(googleCredential);

        String googleId = payload.getSubject();
        String email = payload.getEmail();

        // Find existing user
        User user = userRepository.findByGoogleId(googleId)
                .or(() -> userRepository.findByEmail(email))
                .orElseThrow(() -> new AuthException("User not found. Please sign up first."));

        // Update user info if changed
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");

        boolean updated = false;
        if (name != null && !name.equals(user.getUserName())) {
            user.setUserName(name);
            updated = true;
        }
        if (picture != null && !picture.equals(user.getProfilePicture())) {
            user.setProfilePicture(picture);
            updated = true;
        }
        if (user.getGoogleId() == null) {
            user.setGoogleId(googleId);
            updated = true;
        }

        if (updated) {
            user = userRepository.save(user);
        }

        log.info("User signed in: {}", email);

        String accessToken = jwtTokenProvider.generateToken(user);
        return buildAuthResponse(user, accessToken);
    }

    private GoogleIdToken.Payload verifyGoogleToken(String credential) {
        try {
            GoogleIdToken idToken = verifier.verify(credential);
            if (idToken == null) {
                throw new AuthException("Invalid Google token");
            }
            return idToken.getPayload();
        } catch (Exception e) {
            log.error("Error verifying Google token", e);
            throw new AuthException("Failed to verify Google token: " + e.getMessage());
        }
    }

    private AuthResponse buildAuthResponse(User user, String accessToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .user(UserDto.fromUser(user))
                .build();
    }
}

