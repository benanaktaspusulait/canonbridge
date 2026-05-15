package com.canonbridge.mock.controller;

import com.canonbridge.mock.auth.MockTokenService;
import com.canonbridge.mock.service.GrpcMockService;
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
@RequestMapping("/grpc/customer.ProfileService")
@RequiredArgsConstructor
@Slf4j
public class GrpcMockController {

    private final GrpcMockService grpcMockService;
    private final MockTokenService tokenService;

    @PostMapping("/GetCustomer")
    public ResponseEntity<?> getCustomer(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(required = false) String scenario,
            @RequestBody(required = false) Map<String, Object> request) {

        log.info("POST /grpc/customer.ProfileService/GetCustomer - scenario: {}", scenario);

        ResponseEntity<?> authError = validateBearer(authorization);
        if (authError != null) {
            return authError;
        }

        if ("not-found".equals(scenario)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("code", "NOT_FOUND", "message", "Customer was not found"));
        }

        if ("deadline-exceeded".equals(scenario)) {
            return ResponseEntity.status(HttpStatus.GATEWAY_TIMEOUT)
                    .body(Map.of("code", "DEADLINE_EXCEEDED", "message", "gRPC deadline exceeded"));
        }

        return ResponseEntity.ok(grpcMockService.getCustomer(request));
    }

    @PostMapping("/ListCustomerEvents")
    public ResponseEntity<?> listCustomerEvents(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(required = false) String scenario,
            @RequestBody(required = false) Map<String, Object> request) {

        log.info("POST /grpc/customer.ProfileService/ListCustomerEvents - scenario: {}", scenario);

        ResponseEntity<?> authError = validateBearer(authorization);
        if (authError != null) {
            return authError;
        }

        if ("unavailable".equals(scenario)) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("code", "UNAVAILABLE", "message", "Profile service unavailable"));
        }

        return ResponseEntity.ok(grpcMockService.listCustomerEvents(request));
    }

    private ResponseEntity<?> validateBearer(String authorization) {
        MockTokenService.BearerValidation validation = tokenService.validateBearer(authorization, "grpc:profile");
        if (validation.valid()) {
            return null;
        }
        HttpStatus status = validation.status();
        return ResponseEntity.status(status)
                .body(Map.of(
                        "code", status == HttpStatus.FORBIDDEN ? "PERMISSION_DENIED" : "UNAUTHENTICATED",
                        "message", validation.description()
                ));
    }
}
