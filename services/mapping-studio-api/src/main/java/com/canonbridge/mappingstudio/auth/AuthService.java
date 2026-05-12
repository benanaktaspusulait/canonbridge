package com.canonbridge.mappingstudio.auth;

import com.canonbridge.mappingstudio.domain.User;
import com.canonbridge.mappingstudio.repository.UserRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.mindrot.jbcrypt.BCrypt;

@ApplicationScoped
public class AuthService {

    @Inject
    UserRepository userRepository;

    @Inject
    JwtService jwtService;

    public Uni<AuthResponse> login(String email, String password) {
        return userRepository.findByEmail(email)
            .chain(user -> {
                if (user == null) {
                    return Uni.createFrom().failure(new AuthException("Invalid credentials"));
                }

                if (!BCrypt.checkpw(password, user.getPasswordHash())) {
                    return Uni.createFrom().failure(new AuthException("Invalid credentials"));
                }

                // Update last login
                return userRepository.updateLastLogin(user.getId())
                    .replaceWith(user);
            })
            .map(user -> {
                String token = jwtService.generateToken(user);
                return new AuthResponse(token, user);
            });
    }

    public Uni<User> validateToken(String token) {
        try {
            JwtService.TokenClaims claims = jwtService.validateToken(token);
            return userRepository.findById(claims.userId());
        } catch (Exception e) {
            return Uni.createFrom().failure(new AuthException("Invalid token"));
        }
    }

    public static class AuthException extends RuntimeException {
        public AuthException(String message) {
            super(message);
        }
    }
}
