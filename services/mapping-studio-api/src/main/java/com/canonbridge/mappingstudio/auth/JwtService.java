package com.canonbridge.mappingstudio.auth;

import com.canonbridge.mappingstudio.domain.User;
import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.time.Duration;
import java.util.Set;
import java.util.UUID;

@ApplicationScoped
public class JwtService {

    @ConfigProperty(name = "mp.jwt.verify.issuer", defaultValue = "canonbridge")
    String issuer;

    public String generateToken(User user) {
        return Jwt.issuer(issuer)
            .subject(user.getId().toString())
            .claim("email", user.getEmail())
            .claim("name", user.getName())
            .claim("role", user.getRole())
            .claim("tenantId", user.getTenantId())
            .groups(Set.of(user.getRole()))
            .expiresIn(Duration.ofHours(8))
            .sign();
    }
}
