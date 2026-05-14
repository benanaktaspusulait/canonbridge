# Requirements Document

## Introduction

This document specifies the requirements for Phase 1 of the Request Transformation Wizard enhancement. The feature introduces a mode selector to distinguish between API Gateway Mode and Integration Hub Mode, reorganizes the wizard flow to improve usability, reuses the existing drag-drop field mapping component for request transformation, and provides real-time preview feedback during field mapping.

The current wizard has 7 steps with a confusing flow. This enhancement maintains the 7-step structure but reorganizes the sequence and adds mode-specific flows to better align with user mental models. The request transformation configuration is stored in `source_config.requestTransformation` and supports both template and JSONata transformation modes.

## Glossary

- **Wizard**: The multi-step interface component that guides users through mapping configuration
- **Mode_Selector**: The UI component that allows users to choose between API Gateway Mode and Integration Hub Mode
- **API_Gateway_Mode**: A wizard flow optimized for users configuring API Gateway request transformations
- **Integration_Hub_Mode**: A wizard flow optimized for users configuring Integration Hub data mappings
- **Drag_Drop_Component**: The existing Angular CDK drag-drop field mapping component from Step 4
- **Request_Transformation**: The configuration object stored in `source_config.requestTransformation` containing template or JSONata transformation rules
- **Preview_Panel**: The inline UI component that displays real-time transformation results as users configure mappings
- **Source_Config**: The JSON object in the backend that stores source configuration including `requestTransformation`
- **Template_Mode**: A transformation mode using template syntax with `{{field}}` placeholders
- **JSONata_Mode**: A transformation mode using JSONata expression language
- **Field_Mapping**: The visual drag-drop interface for mapping source fields to target fields
- **Sample_Data**: The JSON payload used to demonstrate and test transformations
- **Target_Schema**: The JSON schema defining the structure of the output data
- **Mapping_Rule**: A single field-to-field mapping configuration with optional transformation logic

## Requirements

### Requirement 1: Mode Selection

**User Story:** As a user, I want to select between API Gateway Mode and Integration Hub Mode at the start of the wizard, so that I can follow a workflow optimized for my use case

#### Acceptance Criteria

1. WHEN THE Wizard loads, THE Mode_Selector SHALL display two options: "API Gateway Mode" and "Integration Hub Mode"
2. THE Mode_Selector SHALL appear as the first step before any other configuration
3. WHEN a user selects API_Gateway_Mode, THE Wizard SHALL proceed to the API Gateway workflow
4. WHEN a user selects Integration_Hub_Mode, THE Wizard SHALL proceed to the Integration Hub workflow
5. THE Mode_Selector SHALL display a description for each mode explaining its purpose
6. THE Mode_Selector SHALL allow users to change the selected mode before proceeding to the next step

### Requirement 2: Wizard Flow Reorganization

**User Story:** As a user, I want the wizard steps to follow a logical sequence, so that I can configure mappings without confusion

#### Acceptance Criteria

1. THE Wizard SHALL maintain exactly 7 steps in total
2. THE Wizard SHALL organize steps in the following sequence: Mode → Source → Sample Data → Request Mapping → Target Schema → Field Mapping → Test
3. WHEN a user completes the Mode step, THE Wizard SHALL navigate to the Source step
4. WHEN a user completes the Source step, THE Wizard SHALL navigate to the Sample Data step
5. WHEN a user completes the Sample Data step, THE Wizard SHALL navigate to the Request Mapping step
6. WHEN a user completes the Request Mapping step, THE Wizard SHALL navigate to the Target Schema step
7. WHEN a user completes the Target Schema step, THE Wizard SHALL navigate to the Field Mapping step
8. WHEN a user completes the Field Mapping step, THE Wizard SHALL navigate to the Test step
9. THE Wizard SHALL display a progress indicator showing the current step and total steps
10. THE Wizard SHALL allow users to navigate backward to previous steps

### Requirement 3: Drag-Drop Component Reuse

**User Story:** As a developer, I want to reuse the existing drag-drop field mapping component for request transformation, so that I can maintain consistency and reduce development effort

#### Acceptance Criteria

1. THE Request_Mapping step SHALL reuse the Drag_Drop_Component from Step 4
2. THE Drag_Drop_Component SHALL support dragging source fields to target request fields
3. THE Drag_Drop_Component SHALL support all existing transformation types including direct copy, string transformations, array transformations, math transformations, type conversions, date transformations, conditional logic, and custom JSONata
4. WHEN a user drags a source field to a target field, THE Drag_Drop_Component SHALL create a Mapping_Rule
5. THE Drag_Drop_Component SHALL allow users to select transformation types for each Mapping_Rule
6. THE Drag_Drop_Component SHALL display transformation parameters based on the selected transformation type
7. THE Drag_Drop_Component SHALL validate that required transformation parameters are provided
8. THE Drag_Drop_Component SHALL persist Mapping_Rule configurations in the Request_Transformation object

### Requirement 4: Request Transformation Storage

**User Story:** As a system, I want to store request transformation configuration in the correct backend structure, so that the transformation engine can process it correctly

#### Acceptance Criteria

1. THE Wizard SHALL store request transformation configuration in `source_config.requestTransformation`
2. THE Request_Transformation object SHALL contain a `mode` field with value "template" or "jsonata"
3. WHEN Template_Mode is selected, THE Request_Transformation object SHALL contain a `template` field with the template JSON structure
4. WHEN JSONata_Mode is selected, THE Request_Transformation object SHALL contain a `jsonata` field with the JSONata expression string
5. THE Request_Transformation object SHALL contain a `headers` field with request header mappings
6. THE Wizard SHALL serialize the Request_Transformation object as JSON before storing in Source_Config
7. WHEN loading an existing mapping, THE Wizard SHALL parse the Request_Transformation object from Source_Config

### Requirement 5: Real-Time Preview

**User Story:** As a user, I want to see a live preview of my transformation results as I configure field mappings, so that I can verify my configuration is correct without waiting until the test step

#### Acceptance Criteria

1. THE Field_Mapping step SHALL display a Preview_Panel alongside the field mapping interface
2. WHEN a user creates or modifies a Mapping_Rule, THE Preview_Panel SHALL update automatically
3. THE Preview_Panel SHALL display the transformed output based on the Sample_Data and current Mapping_Rule configurations
4. THE Preview_Panel SHALL display the output in formatted JSON
5. IF a transformation error occurs, THEN THE Preview_Panel SHALL display the error message
6. THE Preview_Panel SHALL update within 500 milliseconds of a Mapping_Rule change
7. THE Preview_Panel SHALL use the same transformation evaluation logic as the Drag_Drop_Component
8. THE Preview_Panel SHALL display a loading indicator while evaluating transformations

### Requirement 6: Mode-Specific Workflow Differences

**User Story:** As a user, I want the wizard to adapt its workflow based on my selected mode, so that I only see steps relevant to my use case

#### Acceptance Criteria

1. WHEN API_Gateway_Mode is selected, THE Wizard SHALL include the Request Mapping step
2. WHEN Integration_Hub_Mode is selected, THE Wizard SHALL skip the Request Mapping step
3. WHEN API_Gateway_Mode is selected, THE Wizard SHALL label the Target Schema step as "Request Schema"
4. WHEN Integration_Hub_Mode is selected, THE Wizard SHALL label the Target Schema step as "Target Schema"
5. THE Wizard SHALL maintain the same step numbering regardless of mode
6. WHEN a step is skipped, THE Wizard SHALL automatically proceed to the next applicable step

### Requirement 7: Sample Data Integration

**User Story:** As a user, I want to provide sample data early in the wizard, so that I can use it for preview and validation throughout the configuration process

#### Acceptance Criteria

1. THE Sample Data step SHALL appear as Step 3 in the wizard flow
2. THE Sample Data step SHALL accept JSON input via text area
3. THE Sample Data step SHALL validate that the input is valid JSON
4. THE Sample Data step SHALL allow users to upload a JSON file
5. THE Sample Data step SHALL store the sample data in the wizard state
6. THE Request_Mapping step SHALL use the Sample_Data for preview
7. THE Field_Mapping step SHALL use the Sample_Data for preview
8. THE Test step SHALL use the Sample_Data for testing transformations

### Requirement 8: Target Schema Configuration

**User Story:** As a user, I want to optionally select or define a target schema, so that I can map fields to a structured output format

#### Acceptance Criteria

1. THE Target Schema step SHALL appear as Step 5 in the wizard flow
2. THE Target Schema step SHALL allow users to select an existing schema from a dropdown
3. THE Target Schema step SHALL allow users to skip schema selection
4. WHEN a user selects a schema, THE Wizard SHALL load the schema JSON
5. THE Wizard SHALL store the selected schema reference in `targetSchemaRef`
6. THE Wizard SHALL store the schema JSON in `targetSchemaJson`
7. WHEN no schema is selected, THE Field_Mapping step SHALL allow free-form field mapping
8. WHEN a schema is selected, THE Field_Mapping step SHALL display schema fields as drop targets

### Requirement 9: Backward Navigation

**User Story:** As a user, I want to navigate back to previous steps to modify my configuration, so that I can correct mistakes without restarting the wizard

#### Acceptance Criteria

1. THE Wizard SHALL display a "Back" button on all steps except the first step
2. WHEN a user clicks the Back button, THE Wizard SHALL navigate to the previous step
3. THE Wizard SHALL preserve all configuration data when navigating backward
4. THE Wizard SHALL preserve all configuration data when navigating forward again
5. THE Wizard SHALL not validate the current step when navigating backward
6. THE Wizard SHALL allow users to navigate backward from any step to any previous step

### Requirement 10: Validation and Error Handling

**User Story:** As a user, I want clear validation feedback at each step, so that I can correct errors before proceeding

#### Acceptance Criteria

1. THE Wizard SHALL validate required fields before allowing navigation to the next step
2. WHEN validation fails, THE Wizard SHALL display an error message indicating which fields are invalid
3. THE Wizard SHALL disable the "Next" button when validation fails
4. THE Sample Data step SHALL validate that the input is valid JSON
5. THE Request_Mapping step SHALL validate that required transformation parameters are provided
6. THE Field_Mapping step SHALL validate that all required target fields are mapped
7. IF a transformation evaluation error occurs, THEN THE Wizard SHALL display the error message in the Preview_Panel
8. THE Wizard SHALL display validation errors inline near the relevant input fields

### Requirement 11: Angular and PrimeNG Integration

**User Story:** As a developer, I want the wizard to use Angular 18+ features and PrimeNG components, so that it integrates seamlessly with the existing codebase

#### Acceptance Criteria

1. THE Wizard SHALL use Angular 18+ standalone components
2. THE Wizard SHALL use Angular signals for state management
3. THE Wizard SHALL use PrimeNG components for UI elements
4. THE Mode_Selector SHALL use PrimeNG Card or SelectButton components
5. THE Wizard SHALL use PrimeNG Steps component for progress indication
6. THE Drag_Drop_Component SHALL use Angular CDK DragDrop module
7. THE Preview_Panel SHALL use PrimeNG Card component
8. THE Wizard SHALL use PrimeNG Button components for navigation
9. THE Wizard SHALL use PrimeNG Message component for validation errors
10. THE Wizard SHALL follow the existing component structure and naming conventions

### Requirement 12: Backend API Integration

**User Story:** As a system, I want the wizard to correctly integrate with the Java Quarkus backend API, so that configuration data is persisted and retrieved correctly

#### Acceptance Criteria

1. THE Wizard SHALL call the mapping service API to save configuration data
2. THE Wizard SHALL serialize Source_Config as JSON before sending to the backend
3. THE Wizard SHALL include `source_type` field in API requests
4. THE Wizard SHALL include `canonical_schema_ref` field when a target schema is selected
5. THE Wizard SHALL include `mapping_rules` field with serialized Mapping_Rule array
6. WHEN loading an existing mapping, THE Wizard SHALL parse Source_Config from the API response
7. WHEN loading an existing mapping, THE Wizard SHALL extract Request_Transformation from Source_Config
8. THE Wizard SHALL handle API errors gracefully and display error messages to the user
