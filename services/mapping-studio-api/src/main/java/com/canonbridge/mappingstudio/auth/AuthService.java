package com.canonbridge.mappingstudio.auth;

import com.canonbridge.mappingstudio.domain.User;
import com.canonbridge.mappingstudio.repository.UserRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.mindrot.jbcrypt.BCrypt;
import org.jboss.logging.Logger;

@ApplicationScoped
public class AuthService {

    private static final Logger LOG = Logger.getLogger(AuthService.class);

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
        return jwtService.validateToken(token)
            .map(claims -> userRepository.findById(claims.userId())
                .chain(user -> {
                    if (user == null) {
                        return Uni.createFrom().failure(new AuthException("Invalid token"));
                    }

                    return Uni.createFrom().item(user);
                }))
            .orElseGet(() -> Uni.createFrom().failure(new AuthException("Invalid or expired token")));
    }

    public static class AuthException extends RuntimeException {
        public AuthException(String message) {
            super(message);
        }
    }
}
