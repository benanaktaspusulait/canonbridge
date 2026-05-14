# Implementation Plan: Request Transformation Wizard Phase 1

## Overview

This implementation plan breaks down the Request Transformation Wizard Phase 1 feature into discrete coding tasks. The feature introduces a mode selector to distinguish between API Gateway Mode and Integration Hub Mode, reorganizes the wizard flow, reuses the existing drag-drop field mapping component for request transformation, and provides real-time preview feedback.

The implementation follows Angular 18+ standalone component architecture with signals for state management and PrimeNG components for UI elements.

## Tasks

- [ ] 1. Create core data models and interfaces
  - [ ] 1.1 Create RequestTransformationConfig interface and related types
    - Define `RequestTransformationConfig` interface with mode, template, jsonata, and headers fields
    - Define `WizardMode` type as union of 'api-gateway' | 'integration-hub'
    - Define `TransformationMode` type as union of 'template' | 'jsonata'
    - Update `WizardState` interface to include mode, requestTransformation, and sampleJson fields
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

  - [ ]* 1.2 Write property test for RequestTransformationConfig serialization
    - **Property 6: Request transformation serialization round-trip**
    - **Validates: Requirements 4.6, 4.7, 12.2**

- [ ] 2. Implement ModeSelectorComponent
  - [ ] 2.1 Create ModeSelectorComponent with PrimeNG Card components
    - Create standalone component using Angular 18+ syntax
    - Add signal for `selectedMode` state
    - Implement two PrimeNG Card components for API Gateway and Integration Hub modes
    - Add icons (pi-cloud, pi-sitemap), titles, and descriptions for each mode
    - Add "Select" button for each card
    - Emit `modeSelected` event when user clicks Next
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 11.4_

  - [ ]* 2.2 Write unit tests for ModeSelectorComponent
    - Test component rendering and initialization
    - Test mode selection updates signal
    - Test modeSelected event emission
    - Test validation prevents navigation without selection
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 3. Implement RequestMappingStepComponent
  - [ ] 3.1 Create RequestMappingStepComponent with template and JSONata modes
    - Create standalone component using Angular 18+ syntax
    - Add signals for mode, templateJson, jsonataExpression, headersJson, and error states
    - Implement mode toggle between template and JSONata
    - Add JSON editor for template mode with validation
    - Add text area for JSONata mode
    - Add JSON editor for headers with validation
    - Handle GET/DELETE methods with skip option
    - Emit `requestMappingComplete` event with configuration
    - _Requirements: 3.1, 3.2, 3.3, 4.2, 4.3, 4.4, 4.5, 10.4, 10.5_

  - [ ] 3.2 Implement real-time preview panel for RequestMappingStepComponent
    - Add preview panel using PrimeNG Card component
    - Implement preview evaluation logic using sample data
    - Add debounced preview updates (300ms)
    - Display formatted JSON output
    - Display error messages for invalid transformations
    - Add loading indicator during evaluation
    - Update preview automatically on configuration changes
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [ ]* 3.3 Write property tests for RequestMappingStepComponent
    - **Property 5: Request transformation mode is valid**
    - **Validates: Requirements 4.2**

  - [ ]* 3.4 Write unit tests for RequestMappingStepComponent
    - Test template mode JSON validation
    - Test JSONata mode validation
    - Test headers JSON validation
    - Test skip functionality for GET/DELETE methods
    - Test preview update debouncing
    - _Requirements: 3.1, 3.2, 3.3, 4.2, 4.3, 4.4_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Update MappingWizardComponent for mode-based workflow
  - [ ] 5.1 Add mode selection step and update wizard state management
    - Add ModeSelectorComponent as Step 0 in wizard
    - Update `WizardState` signal to include mode and requestTransformation fields
    - Implement `getNextStep()` logic to skip Request Mapping for Integration Hub mode
    - Implement `getPreviousStep()` logic to handle skipped steps
    - Implement `getStepLabel()` logic to change "Target Schema" to "Request Schema" for API Gateway mode
    - Update step navigation handlers to use new logic
    - _Requirements: 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ] 5.2 Integrate RequestMappingStepComponent into wizard flow
    - Add RequestMappingStepComponent as Step 4 in wizard
    - Wire up `requestMappingComplete` event handler
    - Pass sourceType, method, initialConfig, and canonicalSampleJson as inputs
    - Store request transformation configuration in wizard state
    - Conditionally show/hide step based on selected mode
    - _Requirements: 3.1, 3.2, 3.8, 6.1, 6.2_

  - [ ]* 5.3 Write property tests for wizard navigation logic
    - **Property 1: Wizard maintains exactly 7 steps**
    - **Validates: Requirements 2.1**

  - [ ]* 5.4 Write unit tests for mode-based workflow
    - Test step skipping for Integration Hub mode
    - Test step inclusion for API Gateway mode
    - Test step label changes based on mode
    - Test navigation logic with skipped steps
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 6. Reorganize wizard step sequence
  - [ ] 6.1 Move SampleDataStepComponent to Step 3
    - Update step index from current position to Step 3
    - Update step navigation logic to reflect new position
    - Ensure sample data is available for Request Mapping and Field Mapping steps
    - _Requirements: 2.2, 2.3, 2.4, 7.1, 7.5, 7.6, 7.7, 7.8_

  - [ ] 6.2 Move TargetSchemaStepComponent to Step 5
    - Update step index from current position to Step 5
    - Update step navigation logic to reflect new position
    - Ensure target schema is loaded before Field Mapping step
    - _Requirements: 2.2, 2.5, 2.6, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

  - [ ] 6.3 Update progress indicator and step labels
    - Update PrimeNG Steps component with new step sequence
    - Display current step and total steps (7)
    - Update step labels to reflect reorganized flow
    - _Requirements: 2.9_

  - [ ]* 6.4 Write unit tests for reorganized wizard flow
    - Test step sequence matches expected order
    - Test navigation between reorganized steps
    - Test progress indicator displays correct step numbers
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [ ] 7. Enhance SampleDataStepComponent
  - [ ] 7.1 Add JSON validation and file upload support
    - Implement JSON validation using `JSON.parse()`
    - Display validation error messages inline
    - Add file upload button for JSON files
    - Read and validate uploaded JSON files
    - Store sample data in wizard state
    - Disable Next button when validation fails
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 10.1, 10.2, 10.3, 10.4_

  - [ ]* 7.2 Write property tests for sample data validation
    - **Property 10: Sample data JSON validation**
    - **Validates: Requirements 7.3, 10.4**

  - [ ]* 7.3 Write unit tests for SampleDataStepComponent
    - Test JSON validation with valid input
    - Test JSON validation with invalid input
    - Test file upload functionality
    - Test validation error display
    - Test Next button disabled state
    - _Requirements: 7.2, 7.3, 7.4, 10.1, 10.2, 10.3_

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Enhance FieldMappingStepComponent with real-time preview
  - [ ] 9.1 Add preview panel to FieldMappingStepComponent
    - Add PrimeNG Card component for preview panel
    - Implement side-by-side layout (field mapping + preview)
    - Add responsive layout for mobile (stacked)
    - Display formatted JSON output in preview
    - Add refresh button for manual preview updates
    - _Requirements: 5.1, 5.3, 5.4, 11.7_

  - [ ] 9.2 Implement automatic preview updates on mapping rule changes
    - Use Angular effects to watch mapping rules signal
    - Trigger preview generation on rule changes
    - Implement debounced updates (300ms)
    - Display loading indicator during evaluation
    - Handle transformation evaluation errors
    - Display error messages in preview panel
    - _Requirements: 5.2, 5.5, 5.6, 5.7, 5.8_

  - [ ]* 9.3 Write property tests for preview functionality
    - **Property 7: Preview updates on mapping rule changes**
    - **Validates: Requirements 5.2**
    - **Property 8: Preview displays correct transformation output**
    - **Validates: Requirements 5.3**
    - **Property 9: Preview displays errors for invalid transformations**
    - **Validates: Requirements 5.5, 10.7**

  - [ ]* 9.4 Write unit tests for preview panel
    - Test preview updates on mapping rule changes
    - Test preview displays correct output
    - Test preview displays errors
    - Test debouncing behavior
    - Test loading indicator display
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

- [ ] 10. Implement drag-drop component reuse for request transformation
  - [ ] 10.1 Verify drag-drop component supports all transformation types
    - Verify Angular CDK DragDrop module is imported
    - Verify all 25+ transformation types are available
    - Verify transformation parameter inputs are displayed correctly
    - Verify transformation validation logic works
    - _Requirements: 3.2, 3.3, 3.5, 3.6, 3.7, 11.6_

  - [ ]* 10.2 Write property tests for drag-drop functionality
    - **Property 2: Drag-drop creates mapping rules**
    - **Validates: Requirements 3.4**
    - **Property 3: Transformation parameters match transformation type**
    - **Validates: Requirements 3.6**
    - **Property 4: Required transformation parameters are validated**
    - **Validates: Requirements 3.7, 10.5**

  - [ ]* 10.3 Write unit tests for drag-drop component reuse
    - Test dragging source field to target field creates mapping rule
    - Test transformation type selection
    - Test transformation parameter display
    - Test transformation validation
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ] 11. Implement backward navigation and state preservation
  - [ ] 11.1 Add Back button to all wizard steps except first
    - Add PrimeNG Button component for Back button
    - Show Back button on steps 1-7
    - Hide Back button on step 0 (Mode Selection)
    - Wire up click handler to navigate to previous step
    - _Requirements: 9.1, 9.2, 11.8_

  - [ ] 11.2 Implement state preservation during navigation
    - Ensure wizard state is preserved when navigating backward
    - Ensure wizard state is preserved when navigating forward again
    - Skip validation when navigating backward
    - Restore component state from wizard state when navigating forward
    - _Requirements: 9.3, 9.4, 9.5, 9.6_

  - [ ]* 11.3 Write property tests for backward navigation
    - **Property 11: Back button visibility**
    - **Validates: Requirements 9.1**
    - **Property 12: Back button navigation**
    - **Validates: Requirements 9.2**
    - **Property 13: Navigation preserves wizard state**
    - **Validates: Requirements 9.3, 9.4**

  - [ ]* 11.4 Write unit tests for backward navigation
    - Test Back button visibility on each step
    - Test Back button navigation to previous step
    - Test state preservation during backward navigation
    - Test state preservation during forward navigation
    - Test validation skipped on backward navigation
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement validation and error handling
  - [ ] 13.1 Add validation logic to all wizard steps
    - Implement required field validation for each step
    - Display inline error messages near invalid fields
    - Disable Next button when validation fails
    - Enable Next button when validation passes
    - Implement JSON validation for Sample Data step
    - Implement transformation parameter validation for Request Mapping step
    - Implement required field mapping validation for Field Mapping step
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

  - [ ]* 13.2 Write property tests for validation logic
    - **Property 14: Required field validation prevents navigation**
    - **Validates: Requirements 10.1**
    - **Property 15: Validation failures display error messages**
    - **Validates: Requirements 10.2**
    - **Property 16: Next button disabled on validation failure**
    - **Validates: Requirements 10.3**
    - **Property 17: Required target fields validation**
    - **Validates: Requirements 10.6**

  - [ ]* 13.3 Write unit tests for validation and error handling
    - Test required field validation
    - Test error message display
    - Test Next button disabled state
    - Test JSON validation
    - Test transformation parameter validation
    - Test required field mapping validation
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

- [ ] 14. Implement backend API integration
  - [ ] 14.1 Update mapping service to handle request transformation
    - Add serialization logic for `source_config.requestTransformation`
    - Add deserialization logic for loading existing mappings
    - Include `source_type`, `canonical_schema_ref`, and `mapping_rules` in API requests
    - Handle API errors gracefully with user-friendly messages
    - _Requirements: 4.1, 4.6, 4.7, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

  - [ ] 14.2 Wire up API calls in wizard components
    - Call mapping service to save configuration in TestPublishStepComponent
    - Call mapping service to load existing mapping in edit mode
    - Parse `source_config` JSON to extract `requestTransformation`
    - Display success/error messages using PrimeNG Message component
    - _Requirements: 12.1, 12.2, 12.6, 12.7, 12.8, 11.9_

  - [ ]* 14.3 Write property tests for API integration
    - **Property 18: API errors display user-friendly messages**
    - **Validates: Requirements 12.8**

  - [ ]* 14.4 Write integration tests for backend API
    - Test saving mapping with request transformation
    - Test loading existing mapping with request transformation
    - Test API error handling
    - Test serialization/deserialization round-trip
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

- [ ] 15. Add PrimeNG components and styling
  - [ ] 15.1 Integrate PrimeNG components throughout wizard
    - Use PrimeNG Steps component for progress indicator
    - Use PrimeNG Card components for mode selector and preview panels
    - Use PrimeNG Button components for navigation
    - Use PrimeNG Message component for validation errors
    - Use PrimeNG SelectButton for mode toggles
    - Apply consistent styling and theming
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.7, 11.8, 11.9, 11.10_

  - [ ]* 15.2 Write unit tests for PrimeNG component integration
    - Test PrimeNG components render correctly
    - Test component interactions
    - Test styling and theming
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.7, 11.8, 11.9_

- [ ] 16. Final checkpoint and end-to-end testing
  - [ ] 16.1 Perform end-to-end wizard flow testing
    - Test complete API Gateway mode workflow
    - Test complete Integration Hub mode workflow
    - Test editing existing mappings
    - Test all validation scenarios
    - Test backward navigation and state preservation
    - Test preview functionality in all applicable steps
    - Verify all requirements are met
    - _Requirements: All_

  - [ ]* 16.2 Write integration tests for complete wizard flows
    - Test API Gateway mode end-to-end flow
    - Test Integration Hub mode end-to-end flow
    - Test edit mode flow
    - Test error scenarios
    - _Requirements: All_

- [ ] 17. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The wizard uses Angular 18+ standalone components with signals for state management
- PrimeNG components are used throughout for consistent UI
- The existing drag-drop field mapping component is reused for request transformation
- Real-time preview is implemented in both Request Mapping and Field Mapping steps

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "3.2"] },
    { "id": 3, "tasks": ["3.3", "3.4", "5.1"] },
    { "id": 4, "tasks": ["5.2", "6.1", "6.2"] },
    { "id": 5, "tasks": ["5.3", "5.4", "6.3", "7.1"] },
    { "id": 6, "tasks": ["6.4", "7.2", "7.3", "9.1"] },
    { "id": 7, "tasks": ["9.2", "10.1"] },
    { "id": 8, "tasks": ["9.3", "9.4", "10.2", "10.3", "11.1"] },
    { "id": 9, "tasks": ["11.2"] },
    { "id": 10, "tasks": ["11.3", "11.4", "13.1"] },
    { "id": 11, "tasks": ["13.2", "13.3", "14.1"] },
    { "id": 12, "tasks": ["14.2"] },
    { "id": 13, "tasks": ["14.3", "14.4", "15.1"] },
    { "id": 14, "tasks": ["15.2", "16.1"] },
    { "id": 15, "tasks": ["16.2"] }
  ]
}
```
