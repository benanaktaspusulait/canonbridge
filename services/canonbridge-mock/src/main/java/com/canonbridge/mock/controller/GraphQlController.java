package com.canonbridge.mock.controller;

import com.canonbridge.mock.service.GraphQlService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/graphql")
@RequiredArgsConstructor
@Slf4j
public class GraphQlController {

    private final GraphQlService graphQlService;

    @PostMapping
    public ResponseEntity<?> execute(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(required = false) String scenario,
            @RequestBody(required = false) Map<String, Object> request) {

        log.info("POST /graphql - scenario: {}", scenario);

        if (!isValidBearerToken(authorization)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("errors", new Object[] { Map.of("message", "Invalid or missing bearer token") }));
        }

        if ("rate-limit".equals(scenario)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("errors", new Object[] { Map.of("message", "Rate limit exceeded") }));
        }

        if ("server-error".equals(scenario)) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("errors", new Object[] { Map.of("message", "GraphQL resolver failed") }));
        }

        return ResponseEntity.ok(graphQlService.execute(request));
    }

    private boolean isValidBearerToken(String authorization) {
        return authorization != null && authorization.startsWith("Bearer ") && authorization.length() > 7;
    }
}
