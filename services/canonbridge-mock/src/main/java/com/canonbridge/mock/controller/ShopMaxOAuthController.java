package com.canonbridge.mock.controller;

import com.canonbridge.mock.auth.MockTokenService;
import com.canonbridge.mock.config.MockConfiguration;
import com.canonbridge.mock.model.shopmax.TokenResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/oauth")
@RequiredArgsConstructor
@Slf4j
public class ShopMaxOAuthController {

    private final MockConfiguration mockConfig;
    private final MockTokenService tokenService;

    @PostMapping("/token")
    public ResponseEntity<?> getToken(
            @RequestParam(name = "grant_type") String grantType,
            @RequestParam(name = "client_id") String clientId,
            @RequestParam(name = "client_secret") String clientSecret,
            @RequestParam(name = "scope", required = false) String scope,
            @RequestParam(name = "scenario", required = false) String scenario) {

        log.info("POST /oauth/token - grant_type: {}, client_id: {}, scope: {}, scenario: {}", grantType, clientId, scope, scenario);

        // Validate grant type
        if (!"client_credentials".equals(grantType)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", "unsupported_grant_type",
                            "error_description", "Only client_credentials grant type is supported"
                    ));
        }

        // Validate credentials
        if (!mockConfig.getShopmax().getClientId().equals(clientId) ||
            !mockConfig.getShopmax().getClientSecret().equals(clientSecret)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "error", "invalid_client",
                            "error_description", "Invalid client credentials"
                    ));
        }

        if ("expired-token".equals(scenario)) {
            var issued = tokenService.issueExpiredToken(clientId, scope);
            return ResponseEntity.ok(new TokenResponse(
                    "Bearer",
                    issued.accessToken(),
                    issued.expiresIn(),
                    issued.scope()
            ));
        }

        var issued = tokenService.issueToken(clientId, scope);
        var token = new TokenResponse(
                "Bearer",
                issued.accessToken(),
                issued.expiresIn(),
                issued.scope()
        );

        return ResponseEntity.ok(token);
    }
}
