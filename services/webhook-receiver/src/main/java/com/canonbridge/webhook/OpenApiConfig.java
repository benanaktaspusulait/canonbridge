package com.canonbridge.webhook;

import jakarta.ws.rs.core.Application;
import org.eclipse.microprofile.openapi.annotations.Components;
import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.info.Info;
import org.eclipse.microprofile.openapi.annotations.security.SecurityScheme;
import org.eclipse.microprofile.openapi.annotations.security.SecuritySchemeIn;
import org.eclipse.microprofile.openapi.annotations.security.SecuritySchemeType;

@OpenAPIDefinition(
    info = @Info(title = "Webhook Receiver API", version = "1.0.0",
        description = "Receives webhook payloads from external partners and publishes to Kafka"),
    components = @Components(
        securitySchemes = @SecurityScheme(
            securitySchemeName = "WebhookKey",
            type = SecuritySchemeType.APIKEY,
            apiKeyName = "X-Webhook-Key",
            in = SecuritySchemeIn.HEADER
        )
    )
)
public class OpenApiConfig extends Application {
}
