package com.canonbridge.billing;

import jakarta.ws.rs.core.Application;
import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.info.Info;

@OpenAPIDefinition(
    info = @Info(
        title = "CanonBridge Billing Service",
        version = "1.0.0",
        description = "Internal billing, subscription management, usage metering, and payment provider integration."
    )
)
public class BillingServiceApplication extends Application {
}
