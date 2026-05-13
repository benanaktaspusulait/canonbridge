package com.canonbridge.mock.controller;

import com.canonbridge.mock.config.MockConfiguration;
import com.canonbridge.mock.service.FastCargoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@RestController
@RequestMapping("/ws")
@RequiredArgsConstructor
@Slf4j
public class FastCargoSoapController {

    private final MockConfiguration mockConfig;
    private final FastCargoService fastCargoService;

    @PostMapping(value = "/track", consumes = MediaType.TEXT_XML_VALUE, produces = MediaType.TEXT_XML_VALUE)
    public ResponseEntity<String> trackShipment(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(required = false) String scenario,
            @RequestBody String soapRequest) {

        log.info("POST /ws/track - SOAP request received, scenario: {}", scenario);

        if ("invalid-basic-auth".equals(scenario)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .header("WWW-Authenticate", "Basic realm=\"FastCargo SOAP API\"")
                    .body(createSoapFault("InvalidCredentials", "The provided Basic Auth credentials are invalid"));
        }

        if ("service-unavailable".equals(scenario)) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(createSoapFault("ServiceUnavailable", "FastCargo tracking service is temporarily unavailable"));
        }

        // Basic Auth check
        if (!isValidBasicAuth(authorization)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .header("WWW-Authenticate", "Basic realm=\"FastCargo SOAP API\"")
                    .body(createSoapFault("Unauthorized", "Invalid or missing credentials"));
        }

        // Extract tracking number from SOAP request
        String trackingNumber = extractTrackingNumber(soapRequest);
        
        if (trackingNumber == null || trackingNumber.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createSoapFault("InvalidRequest", "Tracking number is required"));
        }

        // Check if tracking number exists
        if (trackingNumber.equals("UNKNOWN-123")) {
            return ResponseEntity.ok(createSoapFault("TrackingNotFound", "Tracking Number Not Found"));
        }

        // Return successful response
        return ResponseEntity.ok(fastCargoService.getTrackingResponse(trackingNumber));
    }

    @PostMapping(value = "/create", consumes = MediaType.TEXT_XML_VALUE, produces = MediaType.TEXT_XML_VALUE)
    public ResponseEntity<String> createShipment(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(required = false) String scenario,
            @RequestBody String soapRequest) {

        log.info("POST /ws/create - SOAP request received, scenario: {}", scenario);

        if ("service-unavailable".equals(scenario)) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(createSoapFault("ServiceUnavailable", "FastCargo shipment creation service is temporarily unavailable"));
        }

        if (!isValidBasicAuth(authorization)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .header("WWW-Authenticate", "Basic realm=\"FastCargo SOAP API\"")
                    .body(createSoapFault("Unauthorized", "Invalid or missing credentials"));
        }

        String reference = extractFirstText(soapRequest, "reference");
        if (reference == null || reference.isBlank()) {
            reference = "REF-" + System.currentTimeMillis();
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(fastCargoService.getCreateShipmentResponse(reference));
    }

    @GetMapping(value = "/fastcargo.wsdl", produces = MediaType.TEXT_XML_VALUE)
    public ResponseEntity<String> getWsdl() {
        log.info("GET /ws/fastcargo.wsdl");
        return ResponseEntity.ok(fastCargoService.getWsdl());
    }

    private boolean isValidBasicAuth(String authorization) {
        if (authorization == null || !authorization.startsWith("Basic ")) {
            return false;
        }

        try {
            String base64Credentials = authorization.substring(6);
            String credentials = new String(Base64.getDecoder().decode(base64Credentials), StandardCharsets.UTF_8);
            String[] parts = credentials.split(":", 2);
            
            if (parts.length != 2) {
                return false;
            }

            return mockConfig.getFastcargo().getUsername().equals(parts[0]) &&
                   mockConfig.getFastcargo().getPassword().equals(parts[1]);
        } catch (Exception e) {
            log.error("Error validating Basic Auth", e);
            return false;
        }
    }

    private String extractTrackingNumber(String soapRequest) {
        return extractFirstText(soapRequest, "trackingNumber");
    }

    private String extractFirstText(String soapRequest, String elementName) {
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(
                "<(?:[a-zA-Z0-9_]+:)?" + elementName + "[^>]*>([^<]+)</(?:[a-zA-Z0-9_]+:)?" + elementName + ">");
        java.util.regex.Matcher matcher = pattern.matcher(soapRequest);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return null;
    }

    private String createSoapFault(String faultCode, String faultString) {
        return """
                <?xml version="1.0" encoding="UTF-8"?>
                <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                    <soap:Body>
                        <soap:Fault>
                            <faultcode>soap:Server</faultcode>
                            <faultstring>%s</faultstring>
                            <detail>
                                <error xmlns="http://fastcargo.com/tracking">
                                    <code>%s</code>
                                    <message>%s</message>
                                </error>
                            </detail>
                        </soap:Fault>
                    </soap:Body>
                </soap:Envelope>
                """.formatted(faultString, faultCode, faultString);
    }
}
