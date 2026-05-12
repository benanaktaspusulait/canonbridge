package com.canonbridge.mappingstudio.auth;

import com.canonbridge.mappingstudio.domain.User;
import io.smallrye.jwt.build.Jwt;
import io.smallrye.jwt.auth.principal.JWTParser;
import io.smallrye.jwt.auth.principal.ParseException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.time.Duration;
import java.util.Set;
import java.util.UUID;

@ApplicationScoped
public class JwtService {

    @ConfigProperty(name = "mp.jwt.verify.issuer", defaultValue = "canonbridge")
    String issuer;

    @Inject
    JWTParser jwtParser;

    public String generateToken(User user) {
        return Jwt.issuer(issuer)
            .subject(user.getId().toString())
            .claim("email", user.email())
            .claim("name", user.getName())
            .claim("role", user.getRole())
            .claim("tenantId", user.getTenantId())
            .groups(Set.of(user.getRole()))
            .expiresIn(Duration.ofHours(8))
            .sign();
    }

    public TokenClaims validateToken(String token) throws ParseException {
        JsonWebToken jwt = jwtParser.parse(token);
        
        return new TokenClaims(
            UUID.fromString(jwt.getSubject()),
            jwt.getClaim("email"),
            jwt.getClaim("name"),
            jwt.getClaim("role"),
            jwt.getClaim("tenantId")
        );
    }

    public record TokenClaims(
        UUID userId,
        String email,
        String name,
        String role,
        String tenantId
    ) {}
}
