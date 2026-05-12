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
                    System.out.println("DEBUG: User not found for email: " + email);
                    return Uni.createFrom().failure(new AuthException("Invalid credentials"));
                }

                System.out.println("DEBUG: User found: " + user.getEmail());
                System.out.println("DEBUG: Password hash from DB: " + user.getPasswordHash());
                System.out.println("DEBUG: Input password: " + password);
                
                boolean passwordMatches = BCrypt.checkpw(password, user.getPasswordHash());
                System.out.println("DEBUG: Password matches: " + passwordMatches);
                
                if (!passwordMatches) {
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
        // For now, just return null - we'll implement proper validation later
        // This is a simplified version for MVP
        return Uni.createFrom().failure(new AuthException("Token validation not implemented yet"));
    }

    public static class AuthException extends RuntimeException {
        public AuthException(String message) {
            super(message);
        }
    }
}
