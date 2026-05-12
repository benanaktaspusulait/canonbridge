# Requirements Document

## Introduction

The demo.sh sales demonstration script is a critical tool for showcasing CanonBridge's integration capabilities to potential customers and stakeholders. This script orchestrates a comprehensive demonstration of the canonbridge-mock environment, illustrating how CanonBridge handles diverse partner systems, protocols, authentication methods, and error scenarios. The script must provide a professional, reliable, and engaging demonstration experience that clearly communicates CanonBridge's value proposition within a 5-10 minute timeframe.

## Glossary

- **Demo_Script**: The executable bash script (demo.sh) that orchestrates the sales demonstration
- **Mock_Environment**: The canonbridge-mock Docker Compose environment including WireMock, Kafka, SOAP services, and webhook receiver
- **Partner_System**: A simulated external system (PayFlex, FastCargo, ShopMax) that CanonBridge integrates with
- **Scenario**: A specific demonstration sequence showing a particular integration capability or error condition
- **Presenter**: The person running the demo script during a sales presentation
- **Audience**: Potential customers, stakeholders, or evaluators watching the demonstration
- **Service_Health**: The operational readiness state of mock services required for the demonstration
- **Demo_Output**: The formatted terminal output displayed during script execution
- **Credential**: Authentication information (API keys, OAuth tokens, Basic Auth) used to access Partner_Systems
- **Response_Payload**: The JSON or XML data returned by Partner_System endpoints
- **Error_Scenario**: A controlled demonstration of failure handling capabilities

## Requirements

### Requirement 1: Environment Validation

**User Story:** As a Presenter, I want the Demo_Script to validate the Mock_Environment before starting, so that I can be confident the demonstration will succeed.

#### Acceptance Criteria

1. WHEN the Demo_Script starts, THE Demo_Script SHALL check that all required Docker containers are running
2. WHEN a required container is not running, THE Demo_Script SHALL display an error message identifying the missing container
3. WHEN a required container is not running, THE Demo_Script SHALL exit with a non-zero status code
4. WHEN the Demo_Script validates Service_Health, THE Demo_Script SHALL verify the WireMock service responds to health check requests
5. WHEN the Demo_Script validates Service_Health, THE Demo_Script SHALL verify the webhook receiver service responds to health check requests
6. WHEN the Demo_Script validates Service_Health, THE Demo_Script SHALL verify the Kafka broker is accessible
7. WHEN a Service_Health check fails, THE Demo_Script SHALL display instructions for starting the Mock_Environment
8. WHEN all Service_Health checks pass, THE Demo_Script SHALL display a success confirmation message

### Requirement 2: Demonstration Flow Control

**User Story:** As a Presenter, I want the Demo_Script to execute scenarios in a logical sequence with clear transitions, so that the Audience can follow the demonstration narrative.

#### Acceptance Criteria

1. THE Demo_Script SHALL execute demonstration scenarios in a predefined sequential order
2. WHEN the Demo_Script begins a new scenario, THE Demo_Script SHALL display a section header identifying the scenario name
3. WHEN the Demo_Script begins a new scenario, THE Demo_Script SHALL display a brief description of what capability is being demonstrated
4. WHEN the Demo_Script completes a scenario, THE Demo_Script SHALL pause for 2-3 seconds before proceeding to the next scenario
5. WHEN the Demo_Script displays Demo_Output, THE Demo_Script SHALL use clear visual separators between scenarios
6. WHEN the Demo_Script displays Demo_Output, THE Demo_Script SHALL use consistent formatting for headers, requests, and responses
7. THE Demo_Script SHALL complete all scenarios within 10 minutes under normal network conditions
8. WHEN the Demo_Script completes all scenarios, THE Demo_Script SHALL display a summary of demonstrated capabilities

### Requirement 3: ShopMax Kafka Integration Demonstration

**User Story:** As a Presenter, I want to demonstrate ShopMax's Kafka-based order event integration, so that the Audience understands CanonBridge's event-driven ingestion capabilities.

#### Acceptance Criteria

1. THE Demo_Script SHALL include a scenario demonstrating ShopMax Kafka order event integration
2. WHEN demonstrating ShopMax Kafka integration, THE Demo_Script SHALL explain that events are automatically generated every 30 seconds
3. WHEN demonstrating ShopMax Kafka integration, THE Demo_Script SHALL display the Kafka topic name (partner.shopmax.raw)
4. WHEN demonstrating ShopMax Kafka integration, THE Demo_Script SHALL provide instructions for consuming events from the topic
5. WHEN demonstrating ShopMax Kafka integration, THE Demo_Script SHALL explain the event-driven architecture benefit
6. THE Demo_Script SHALL complete the ShopMax Kafka scenario within 30 seconds

### Requirement 4: PayFlex REST API Demonstration

**User Story:** As a Presenter, I want to demonstrate PayFlex's REST API integration with API key authentication, so that the Audience sees CanonBridge's REST connector capabilities.

#### Acceptance Criteria

1. THE Demo_Script SHALL include a scenario demonstrating PayFlex REST API successful payment query
2. WHEN demonstrating PayFlex REST API, THE Demo_Script SHALL display the API endpoint being called
3. WHEN demonstrating PayFlex REST API, THE Demo_Script SHALL display the authentication method (API Key)
4. WHEN demonstrating PayFlex REST API, THE Demo_Script SHALL execute a GET request to the /api/payments/latest endpoint
5. WHEN demonstrating PayFlex REST API, THE Demo_Script SHALL include the X-API-Key header with value "demo-api-key-12345"
6. WHEN the PayFlex API responds, THE Demo_Script SHALL display the Response_Payload formatted as JSON
7. WHEN the PayFlex API responds successfully, THE Demo_Script SHALL display a success confirmation message
8. WHEN the PayFlex API request fails, THE Demo_Script SHALL display the error response and continue execution
9. THE Demo_Script SHALL complete the PayFlex REST scenario within 30 seconds

### Requirement 5: FastCargo SOAP API Demonstration

**User Story:** As a Presenter, I want to demonstrate FastCargo's SOAP API integration with Basic Authentication, so that the Audience understands CanonBridge can integrate with legacy SOAP systems.

#### Acceptance Criteria

1. THE Demo_Script SHALL include a scenario demonstrating FastCargo SOAP API tracking query
2. WHEN demonstrating FastCargo SOAP API, THE Demo_Script SHALL display the SOAP endpoint being called
3. WHEN demonstrating FastCargo SOAP API, THE Demo_Script SHALL display the authentication method (Basic Auth)
4. WHEN demonstrating FastCargo SOAP API, THE Demo_Script SHALL construct a valid SOAP envelope with tracking request
5. WHEN demonstrating FastCargo SOAP API, THE Demo_Script SHALL execute a POST request to the /ws/track endpoint
6. WHEN demonstrating FastCargo SOAP API, THE Demo_Script SHALL include Basic Auth credentials (fastcargo-demo:fastcargo-secret)
7. WHEN the FastCargo SOAP service responds, THE Demo_Script SHALL display the Response_Payload formatted as XML
8. WHEN the FastCargo SOAP service responds successfully, THE Demo_Script SHALL display a success confirmation message
9. WHEN the FastCargo SOAP request fails, THE Demo_Script SHALL display the error response and continue execution
10. THE Demo_Script SHALL complete the FastCargo SOAP scenario within 30 seconds

### Requirement 6: Error Handling Demonstration

**User Story:** As a Presenter, I want to demonstrate how CanonBridge handles validation errors and partner failures, so that the Audience understands the platform's resilience capabilities.

#### Acceptance Criteria

1. THE Demo_Script SHALL include a scenario demonstrating PayFlex validation error handling
2. WHEN demonstrating error handling, THE Demo_Script SHALL explain the Error_Scenario being triggered
3. WHEN demonstrating error handling, THE Demo_Script SHALL execute a request that triggers a missing-amount validation error
4. WHEN demonstrating error handling, THE Demo_Script SHALL display the error Response_Payload formatted as JSON
5. WHEN demonstrating error handling, THE Demo_Script SHALL explain that such errors can be routed to DLQ or trigger retry logic
6. WHEN demonstrating error handling, THE Demo_Script SHALL display a confirmation that the error scenario was intentional
7. THE Demo_Script SHALL complete the error handling scenario within 30 seconds

### Requirement 7: Webhook Integration Demonstration

**User Story:** As a Presenter, I want to demonstrate PayFlex's webhook-based payment confirmation, so that the Audience understands CanonBridge's inbound webhook capabilities.

#### Acceptance Criteria

1. THE Demo_Script SHALL include a scenario demonstrating PayFlex payment webhook
2. WHEN demonstrating webhook integration, THE Demo_Script SHALL construct a payment confirmation webhook payload
3. WHEN demonstrating webhook integration, THE Demo_Script SHALL include a unique event ID in the webhook payload
4. WHEN demonstrating webhook integration, THE Demo_Script SHALL include a timestamp in ISO 8601 format in the webhook payload
5. WHEN demonstrating webhook integration, THE Demo_Script SHALL execute a POST request to the /webhook/payment endpoint
6. WHEN the webhook is received, THE Demo_Script SHALL display the Response_Payload formatted as JSON
7. WHEN demonstrating webhook integration, THE Demo_Script SHALL query the webhook receiver to list recently received webhooks
8. WHEN listing received webhooks, THE Demo_Script SHALL display the webhook history formatted as JSON
9. WHEN the webhook is successfully received, THE Demo_Script SHALL display a success confirmation message
10. THE Demo_Script SHALL complete the webhook scenario within 30 seconds

### Requirement 8: OAuth2 Authentication Demonstration

**User Story:** As a Presenter, I want to demonstrate ShopMax's OAuth2 client credentials flow, so that the Audience understands CanonBridge supports modern authentication standards.

#### Acceptance Criteria

1. THE Demo_Script SHALL include a scenario demonstrating ShopMax OAuth2 client credentials flow
2. WHEN demonstrating OAuth2 flow, THE Demo_Script SHALL execute a POST request to the /oauth/token endpoint
3. WHEN demonstrating OAuth2 flow, THE Demo_Script SHALL include grant_type=client_credentials in the request
4. WHEN demonstrating OAuth2 flow, THE Demo_Script SHALL include client_id=shopmax-demo-client in the request
5. WHEN demonstrating OAuth2 flow, THE Demo_Script SHALL include client_secret=shopmax-demo-secret in the request
6. WHEN the token endpoint responds, THE Demo_Script SHALL display the token Response_Payload formatted as JSON
7. WHEN the token endpoint responds, THE Demo_Script SHALL extract the access_token from the response
8. WHEN demonstrating OAuth2 flow, THE Demo_Script SHALL execute a GET request to /api/orders/recent using the access token
9. WHEN executing the authenticated request, THE Demo_Script SHALL include the Authorization header with Bearer token
10. WHEN the orders endpoint responds, THE Demo_Script SHALL display the Response_Payload formatted as JSON
11. WHEN the OAuth2 flow completes successfully, THE Demo_Script SHALL display a success confirmation message
12. THE Demo_Script SHALL complete the OAuth2 scenario within 45 seconds

### Requirement 9: Output Formatting and Readability

**User Story:** As a Presenter, I want the Demo_Script output to be visually clear and professional, so that the Audience can easily follow the demonstration.

#### Acceptance Criteria

1. THE Demo_Script SHALL use consistent section headers with visual separators
2. WHEN displaying JSON Response_Payload, THE Demo_Script SHALL format the output using jq or equivalent JSON formatter
3. WHEN displaying XML Response_Payload, THE Demo_Script SHALL format the output using xmllint or equivalent XML formatter
4. WHEN displaying section headers, THE Demo_Script SHALL use a consistent character pattern for visual separation
5. WHEN displaying scenario descriptions, THE Demo_Script SHALL use clear, concise language
6. WHEN displaying success messages, THE Demo_Script SHALL use a consistent success indicator (e.g., ✅)
7. WHEN displaying error messages, THE Demo_Script SHALL use a consistent error indicator (e.g., ❌)
8. THE Demo_Script SHALL ensure all Demo_Output is readable in standard terminal widths (80-120 characters)

### Requirement 10: Configuration and Customization

**User Story:** As a Presenter, I want to customize demo parameters without modifying the script code, so that I can adapt the demonstration to different environments.

#### Acceptance Criteria

1. THE Demo_Script SHALL define all service URLs as variables at the beginning of the script
2. THE Demo_Script SHALL define all Credential values as variables at the beginning of the script
3. THE Demo_Script SHALL use the BASE_URL variable for all HTTP requests
4. THE Demo_Script SHALL use the PAYFLEX_API_KEY variable for PayFlex authentication
5. THE Demo_Script SHALL use the SHOPMAX_CLIENT_ID and SHOPMAX_CLIENT_SECRET variables for OAuth2 authentication
6. THE Demo_Script SHALL use the FASTCARGO_USERNAME and FASTCARGO_PASSWORD variables for SOAP authentication
7. WHERE environment variables are set, THE Demo_Script SHALL override default variable values with environment variable values

### Requirement 11: Error Recovery and Resilience

**User Story:** As a Presenter, I want the Demo_Script to continue execution even if individual scenarios fail, so that one failure doesn't derail the entire demonstration.

#### Acceptance Criteria

1. WHEN a scenario HTTP request fails, THE Demo_Script SHALL display the error message
2. WHEN a scenario HTTP request fails, THE Demo_Script SHALL continue to the next scenario
3. WHEN a scenario HTTP request fails, THE Demo_Script SHALL not exit with a non-zero status code
4. WHEN the Demo_Script completes, THE Demo_Script SHALL display a summary indicating which scenarios succeeded
5. WHEN the Demo_Script completes, THE Demo_Script SHALL display a summary indicating which scenarios failed
6. THE Demo_Script SHALL use curl with appropriate timeout settings to prevent indefinite hangs
7. WHEN curl commands are executed, THE Demo_Script SHALL suppress progress bars and unnecessary output

### Requirement 12: Demonstration Summary and Next Steps

**User Story:** As a Presenter, I want the Demo_Script to conclude with a clear summary and suggested next steps, so that the Audience understands what was demonstrated and how to explore further.

#### Acceptance Criteria

1. WHEN the Demo_Script completes all scenarios, THE Demo_Script SHALL display a summary section
2. WHEN displaying the summary, THE Demo_Script SHALL list all demonstrated capabilities with success indicators
3. WHEN displaying the summary, THE Demo_Script SHALL include a section titled "Additional endpoints to explore"
4. WHEN displaying additional endpoints, THE Demo_Script SHALL list at least 5 alternative endpoints with brief descriptions
5. WHEN displaying additional endpoints, THE Demo_Script SHALL include examples of alternative formats (flat, compact)
6. WHEN displaying additional endpoints, THE Demo_Script SHALL include examples of additional Error_Scenarios (rate-limit, server-error, unavailable)
7. WHEN displaying additional endpoints, THE Demo_Script SHALL include the WSDL endpoint for SOAP service exploration
8. THE Demo_Script SHALL display the summary within 15 seconds

### Requirement 13: Script Portability and Dependencies

**User Story:** As a Presenter, I want the Demo_Script to work on common Unix-like systems with minimal dependencies, so that I can run demonstrations on various machines.

#### Acceptance Criteria

1. THE Demo_Script SHALL use bash as the interpreter
2. THE Demo_Script SHALL include a shebang line (#!/bin/bash) at the beginning
3. THE Demo_Script SHALL use the "set -e" option to exit on errors during initialization
4. THE Demo_Script SHALL require only standard Unix utilities (curl, jq, xmllint, date)
5. WHEN a required utility is not available, THE Demo_Script SHALL display an error message identifying the missing utility
6. THE Demo_Script SHALL be executable on macOS, Linux, and WSL environments
7. THE Demo_Script SHALL not require root or sudo privileges to execute

### Requirement 14: Timing and Pacing

**User Story:** As a Presenter, I want the Demo_Script to maintain appropriate pacing between scenarios, so that the Audience has time to absorb each demonstration point.

#### Acceptance Criteria

1. WHEN the Demo_Script completes a scenario, THE Demo_Script SHALL pause for 2-3 seconds before starting the next scenario
2. WHEN the Demo_Script displays a section header, THE Demo_Script SHALL pause for 1 second before executing requests
3. THE Demo_Script SHALL use the sleep command to implement pauses
4. THE Demo_Script SHALL complete the entire demonstration within 10 minutes under normal conditions
5. THE Demo_Script SHALL complete the entire demonstration within 15 minutes under slow network conditions

### Requirement 15: Demonstration Repeatability

**User Story:** As a Presenter, I want to run the Demo_Script multiple times with consistent results, so that I can practice and deliver reliable demonstrations.

#### Acceptance Criteria

1. THE Demo_Script SHALL produce consistent Demo_Output when executed multiple times
2. WHEN the Demo_Script generates dynamic data (timestamps, event IDs), THE Demo_Script SHALL use deterministic generation methods
3. WHEN the Demo_Script generates timestamps, THE Demo_Script SHALL use the date command with consistent formatting
4. WHEN the Demo_Script generates unique identifiers, THE Demo_Script SHALL use the date command with epoch seconds or similar deterministic method
5. THE Demo_Script SHALL not depend on external state that changes between executions
6. THE Demo_Script SHALL not modify the Mock_Environment state in ways that affect subsequent executions
