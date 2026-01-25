package org.closeness.decoder.service;

import org.closeness.decoder.dto.AuthResponse;

public interface AuthService {

    AuthResponse signUp(String googleCredential);

    AuthResponse signIn(String googleCredential);
}
