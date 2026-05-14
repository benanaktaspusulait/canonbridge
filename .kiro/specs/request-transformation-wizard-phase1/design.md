# Design Document: Request Transformation Wizard Phase 1

## Overview

This document describes the design for Phase 1 of the Request Transformation Wizard enhancement. The feature introduces a mode selector to distinguish between API Gateway Mode and Integration Hub Mode, reorganizes the wizard flow to improve usability, reuses the existing drag-drop field mapping component for request transformation, and provides real-time preview feedback during field mapping.

The current wizard has 7 steps with a confusing flow. This enhancement maintains the 7-step structure but reorganizes the sequence and adds mode-specific flows to better align with user mental models.

## Architecture

### Component Structure

The wizard follows Angular 18+ standalone component architecture with the following hierarchy:

```
MappingWizardComponent (Container)
├── ModeSelectorComponent (Step 0 - NEW)
├── SourceTypeSelectionComponent (Step 1)
├── ConfigurationStepComponent (Step 2)
├── SampleDataStepComponent (Step 3 - MOVED)
├── RequestMappingStepComponent (Step 4 - NEW, reuses FieldMappingStepComponent)
├── TargetSchemaStepComponent (Step 5 - MOVED)
├── FieldMappingStepComponent (Step 6 - EXISTING)
└── TestPublishStepComponent (Step 7)
```

### State Management

The wizard uses Angular signals for reactive state management. The primary state container is `WizardState`:

```typescript
interface WizardState {
  mode: 'api-gateway' | 'integration-hub' | null;
  sourceType: SourceType | null;
  externalSystemId: string | null;
  sourceConfig: Record<string, unknown>;
  requestTransformation: RequestTransformationConfig | null;
  sampleJson: string;
  targetSchemaRef: string | null;
  targetSchemaJson: string;
  mappingRules: MappingRule[];
}
```

### Data Flow

1. **Mode Selection** → Sets `wizardState.mode`
2. **Source Configuration** → Populates `wizardState.sourceConfig` and `wizardState.externalSystemId`
3. **Sample Data** → Sets `wizardState.sampleJson`
4. **Request Mapping** (API Gateway only) → Populates `wizardState.requestTransformation`
5. **Target Schema** → Sets `wizardState.targetSchemaRef` and `wizardState.targetSchemaJson`
6. **Field Mapping** → Populates `wizardState.mappingRules`
7. **Test & Publish** → Consumes all wizard state to save mapping

## Component Design

### 1. ModeSelectorComponent (NEW)

**Purpose**: Allow users to choose between API Gateway Mode and Integration Hub Mode

**Inputs**: None

**Outputs**:
- `modeSelected: EventEmitter<'api-gateway' | 'integration-hub'>`

**State**:
```typescript
selectedMode = signal<'api-gateway' | 'integration-hub' | null>(null);
```

**UI Elements**:
- Two PrimeNG Card components displaying mode options
- Each card shows:
  - Icon (pi-cloud for API Gateway, pi-sitemap for Integration Hub)
  - Title
  - Description
  - "Select" button

**Behavior**:
- User clicks a card or "Select" button
- `selectedMode` signal updates
- User clicks "Next" button
- `modeSelected` event emits with selected mode
- Parent wizard advances to next step

### 2. RequestMappingStepComponent (NEW)

**Purpose**: Configure request transformation for API Gateway mode using drag-drop field mapping

**Inputs**:
- `sourceType: string` - The selected source type
- `method: string` - HTTP method (GET, POST, PUT, PATCH, DELETE)
- `initialConfig: RequestTransformationConfig | null` - Existing configuration when editing
- `canonicalSampleJson: string` - Sample data for preview

**Outputs**:
- `requestMappingComplete: EventEmitter<{ config: RequestTransformationConfig }>`
- `backClicked: EventEmitter<void>`

**State**:
```typescript
mode = signal<'template' | 'jsonata'>('template');
templateJson = signal('{}');
jsonataExpression = signal('');
headersJson = signal('{}');
templateError = signal<string | null>(null);
jsonataError = signal<string | null>(null);
headersError = signal<string | null>(null);
previewOutput = signal<string | null>(null);
previewError = signal<string | null>(null);
```

**UI Layout**:
```
┌─────────────────────────────────────────────────────────┐
│ Request Transformation Configuration                     │
├─────────────────────────────────────────────────────────┤
│ Mode: [Template] [JSONata]                              │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────┐ ┌─────────────────────────────┐ │
│ │ Request Body        │ │ Preview                     │ │
│ │ (if POST/PUT/PATCH) │ │                             │ │
│ │                     │ │ {                           │ │
│ │ {                   │ │   "transformed": "data"     │ │
│ │   "field": "{{...}}"│ │ }                           │ │
│ │ }                   │ │                             │ │
│ │                     │ │                             │ │
│ │ [Format] [Upload]   │ │ [Refresh Preview]           │ │
│ └─────────────────────┘ └─────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Request Headers (Optional)                          │ │
│ │                                                     │ │
│ │ {                                                   │ │
│ │   "Content-Type": "application/json"                │ │
│ │ }                                                   │ │
│ │                                                     │ │
│ │ [Format]                                            │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ [Back] [Skip] [Next]                                    │
└─────────────────────────────────────────────────────────┘
```

**Behavior**:
- For GET/DELETE methods: Display message "No request body needed" and allow skip
- For POST/PUT/PATCH methods: Show request body configuration
- Template mode: JSON editor with `{{field.path}}` placeholder syntax
- JSONata mode: Text area for JSONata expression
- Headers: JSON editor for header mappings
- Preview: Real-time transformation preview using sample data
- Validation: Ensure valid JSON for template/headers, non-empty for JSONata
- Skip button: Emit empty configuration and proceed
- Next button: Emit configuration and proceed

### 3. Enhanced MappingWizardComponent

**New Responsibilities**:
- Manage mode selection state
- Conditionally show/hide Request Mapping step based on mode
- Update step labels based on mode (Request Schema vs Target Schema)
- Handle step skipping logic

**Step Flow Logic**:
```typescript
getNextStep(currentStep: number): number {
  const mode = this.wizardState().mode;
  
  // Step 3 (Sample Data) → Step 4 or 5 depending on mode
  if (currentStep === 3) {
    return mode === 'api-gateway' ? 4 : 5; // Include or skip Request Mapping
  }
  
  // Step 4 (Request Mapping) → Step 5
  if (currentStep === 4) {
    return 5;
  }
  
  // All other steps proceed sequentially
  return currentStep + 1;
}

getPreviousStep(currentStep: number): number {
  const mode = this.wizardState().mode;
  
  // Step 5 (Target Schema) → Step 4 or 3 depending on mode
  if (currentStep === 5) {
    return mode === 'api-gateway' ? 4 : 3; // Go back to Request Mapping or Sample Data
  }
  
  // All other steps go back sequentially
  return currentStep - 1;
}
```

**Step Label Logic**:
```typescript
getStepLabel(stepIndex: number): string {
  const mode = this.wizardState().mode;
  
  if (stepIndex === 5 && mode === 'api-gateway') {
    return 'Request Schema';
  }
  
  if (stepIndex === 5 && mode === 'integration-hub') {
    return 'Target Schema';
  }
  
  return this.steps[stepIndex].label;
}
```

### 4. Preview Panel Enhancement

**Purpose**: Provide real-time feedback during field mapping

**Implementation**: Reuse existing preview logic from `FieldMappingStepComponent`

**Features**:
- Automatic update on mapping rule changes (using Angular effects)
- Display formatted JSON output
- Display error messages for invalid transformations
- Loading indicator during evaluation
- Side-by-side layout with field mapping interface

**Preview Evaluation**:
```typescript
generatePreview(): void {
  try {
    const sample = JSON.parse(this.sampleJson());
    const rules = this.mappingRules();
    const result: any = {};

    rules.forEach(rule => {
      try {
        const value = this.evaluateRule(rule, sample);
        this.setNestedValue(result, rule.targetKey, value);
      } catch (error: any) {
        console.error(`Error evaluating rule for ${rule.targetKey}:`, error);
      }
    });

    this.previewResult.set(result);
    this.previewError.set(null);
  } catch (error: any) {
    this.previewError.set(error.message);
    this.previewResult.set(null);
  }
}
```

## Data Models

### RequestTransformationConfig

```typescript
interface RequestTransformationConfig {
  mode: 'template' | 'jsonata';
  template: Record<string, unknown>;
  jsonata: string;
  headers: Record<string, string>;
}
```

**Storage Location**: `source_config.requestTransformation`

**Serialization**:
```typescript
// When saving to backend
const sourceConfig = {
  ...existingConfig,
  requestTransformation: {
    mode: 'template',
    template: { field: '{{canonical.value}}' },
    jsonata: '',
    headers: { 'Content-Type': 'application/json' }
  }
};

const apiPayload = {
  source_type: 'REST_API',
  source_config: JSON.stringify(sourceConfig),
  // ... other fields
};
```

**Deserialization**:
```typescript
// When loading from backend
const mapping = await mappingService.getById(mappingId);
const sourceConfig = JSON.parse(mapping.source_config);
const requestTransformation = sourceConfig.requestTransformation;

if (requestTransformation) {
  this.mode.set(requestTransformation.mode);
  this.templateJson.set(JSON.stringify(requestTransformation.template, null, 2));
  this.jsonataExpression.set(requestTransformation.jsonata);
  this.headersJson.set(JSON.stringify(requestTransformation.headers, null, 2));
}
```

### MappingRule

```typescript
interface MappingRule {
  id: string;
  targetKey: string;
  sourcePath: string;
  transform: TransformKind;
  paramA?: string;
  paramB?: string;
  paramC?: string;
  advancedExpression?: string;
}
```

**Transform Types**: Reuse existing 25+ transformation types from `FieldMappingStepComponent`:
- Basic: direct, default_value
- String: uppercase, lowercase, trim, substring, replace, combine, template_string
- Array: join, first, last, element, count, filter_equals
- Math: sum, average, min, max
- Type: number_coerce
- Date: date_format
- Logic: conditional_value, enum_map
- Advanced: custom_jsonata

## Validation Rules

### Mode Selection
- **Required**: User must select a mode before proceeding
- **Validation**: `selectedMode !== null`

### Sample Data
- **Required**: Sample JSON must be provided
- **Validation**: 
  - Non-empty string
  - Valid JSON syntax
  - `JSON.parse(sampleJson)` succeeds

### Request Mapping (API Gateway Mode only)
- **Template Mode**:
  - Template JSON must be valid JSON (if provided)
  - Headers JSON must be valid JSON (if provided)
- **JSONata Mode**:
  - JSONata expression must be non-empty
  - Headers JSON must be valid JSON (if provided)
- **Skip**: Allowed for GET/DELETE methods

### Field Mapping
- **Required Fields**: All required target fields must be mapped
- **Validation**: 
  - For each required target field, at least one mapping rule exists
  - Transformation parameters are provided for transformations that require them

## Error Handling

### JSON Parsing Errors
```typescript
validateJson(value: string, field: 'template' | 'headers'): void {
  if (!value.trim()) {
    this.clearError(field);
    return;
  }

  try {
    JSON.parse(value);
    this.clearError(field);
  } catch (e: any) {
    this.setError(field, `Invalid JSON: ${e.message}`);
  }
}
```

### Transformation Evaluation Errors
```typescript
try {
  const value = this.evaluateRule(rule, sample);
  this.setNestedValue(result, rule.targetKey, value);
} catch (error: any) {
  console.error(`Error evaluating rule for ${rule.targetKey}:`, error);
  this.previewError.set(`Transformation error: ${error.message}`);
}
```

### API Errors
```typescript
this.mappingService.update(mappingId, data).subscribe({
  next: () => {
    this.showSuccess('Mapping saved successfully');
  },
  error: (err) => {
    console.error('Failed to save mapping:', err);
    this.showError(`Failed to save mapping: ${err.message || 'Unknown error'}`);
  }
});
```

## Backend Integration

### API Endpoints

**Save Mapping**:
```
PUT /api/mappings/{id}
Content-Type: application/json

{
  "source_type": "REST_API",
  "source_config": "{\"method\":\"POST\",\"url\":\"...\",\"requestTransformation\":{...}}",
  "canonical_schema_ref": "schema-id",
  "mapping_rules": "[{\"targetKey\":\"...\",\"sourcePath\":\"...\"}]"
}
```

**Load Mapping**:
```
GET /api/mappings/{id}

Response:
{
  "id": "mapping-id",
  "source_type": "REST_API",
  "source_config": "{\"method\":\"POST\",\"url\":\"...\",\"requestTransformation\":{...}}",
  "canonical_schema_ref": "schema-id",
  "mapping_rules": "[{\"targetKey\":\"...\",\"sourcePath\":\"...\"}]",
  "sample_payload": "{\"sample\":\"data\"}"
}
```

### Data Transformation

**Frontend → Backend**:
```typescript
const sourceConfig: Record<string, unknown> = {
  ...this.wizardState().sourceConfig,
  requestTransformation: this.wizardState().requestTransformation
};

const apiPayload = {
  source_type: this.wizardState().sourceType,
  source_config: JSON.stringify(sourceConfig),
  canonical_schema_ref: this.wizardState().targetSchemaRef,
  mapping_rules: JSON.stringify(this.wizardState().mappingRules)
};
```

**Backend → Frontend**:
```typescript
const mapping = response.data;
const sourceConfig = JSON.parse(mapping.source_config);

this.wizardState.update(state => ({
  ...state,
  sourceType: mapping.source_type,
  sourceConfig: sourceConfig,
  requestTransformation: sourceConfig.requestTransformation || null,
  targetSchemaRef: mapping.canonical_schema_ref,
  mappingRules: JSON.parse(mapping.mapping_rules || '[]')
}));
```

## UI/UX Considerations

### Progressive Disclosure
- Show only relevant steps based on selected mode
- Hide Request Mapping step for Integration Hub mode
- Disable "Next" button when validation fails
- Show validation errors inline near input fields

### Visual Feedback
- Loading indicators during API calls
- Success/error messages after save operations
- Real-time preview updates during field mapping
- Progress indicator showing current step and total steps

### Accessibility
- Keyboard navigation support for all interactive elements
- ARIA labels for screen readers
- Focus management when navigating between steps
- Error messages announced to screen readers

### Responsive Design
- Side-by-side layout for desktop (field mapping + preview)
- Stacked layout for mobile (field mapping above preview)
- Collapsible preview panel on small screens

## Performance Considerations

### Preview Update Debouncing
```typescript
private previewDebounceTimer: any;

onMappingRuleChange(): void {
  clearTimeout(this.previewDebounceTimer);
  this.previewDebounceTimer = setTimeout(() => {
    this.generatePreview();
  }, 300); // 300ms debounce
}
```

### Lazy Loading
- Load schema JSON only when Target Schema step is reached
- Load existing mapping data only in edit mode
- Defer preview evaluation until user requests it

### Memory Management
- Clear preview results when navigating away from step
- Unsubscribe from observables in component cleanup
- Use Angular's OnPush change detection strategy where possible

## Testing Strategy

### Unit Tests
- Component rendering and initialization
- State management and signal updates
- Validation logic for each step
- Navigation logic (forward/backward)
- Mode-specific workflow logic
- JSON serialization/deserialization

### Integration Tests
- API calls to backend services
- Data flow between wizard steps
- End-to-end wizard completion flow
- Edit mode loading and saving

### Property-Based Tests
- See Correctness Properties section below

## Migration Strategy

### Phase 1 (Current)
- Add Mode Selector component
- Reorganize wizard step sequence
- Add Request Mapping step
- Reuse drag-drop component for request transformation
- Add real-time preview to field mapping

### Phase 2 (Future)
- Enhanced JSONata editor with syntax highlighting
- Template builder with visual field picker
- Advanced transformation testing with multiple sample datasets
- Transformation library for common patterns

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Wizard maintains exactly 7 steps

*For any* wizard configuration or mode selection, the wizard steps array SHALL contain exactly 7 steps.

**Validates: Requirements 2.1**

### Property 2: Drag-drop creates mapping rules

*For any* valid source field and target field, when a user drags the source field to the target field, a mapping rule SHALL be created with the correct source path and target key.

**Validates: Requirements 3.4**

### Property 3: Transformation parameters match transformation type

*For any* transformation type, the displayed parameter inputs SHALL match the parameter definitions for that transformation type.

**Validates: Requirements 3.6**

### Property 4: Required transformation parameters are validated

*For any* transformation with required parameters, the validation function SHALL return false when any required parameter is empty or missing.

**Validates: Requirements 3.7, 10.5**

### Property 5: Request transformation mode is valid

*For any* Request_Transformation object, the mode field SHALL be either "template" or "jsonata".

**Validates: Requirements 4.2**

### Property 6: Request transformation serialization round-trip

*For any* Request_Transformation object, serializing to JSON and then deserializing SHALL produce an equivalent object with the same mode, template, jsonata, and headers fields.

**Validates: Requirements 4.6, 4.7, 12.2**

### Property 7: Preview updates on mapping rule changes

*For any* mapping rule modification (create, update, or delete), the preview panel SHALL update to reflect the change.

**Validates: Requirements 5.2**

### Property 8: Preview displays correct transformation output

*For any* valid sample data and set of mapping rules, the preview output SHALL match the result of applying all mapping rules to the sample data.

**Validates: Requirements 5.3**

### Property 9: Preview displays errors for invalid transformations

*For any* transformation that throws an error during evaluation, the preview panel SHALL display an error message instead of output.

**Validates: Requirements 5.5, 10.7**

### Property 10: Sample data JSON validation

*For any* string input in the sample data field, the validation function SHALL correctly identify whether the string is valid JSON by attempting to parse it.

**Validates: Requirements 7.3, 10.4**

### Property 11: Back button visibility

*For any* wizard step number greater than 0, the back button SHALL be visible and enabled.

**Validates: Requirements 9.1**

### Property 12: Back button navigation

*For any* wizard step greater than 0, clicking the back button SHALL navigate to the previous step (step number decremented by 1, accounting for skipped steps).

**Validates: Requirements 9.2**

### Property 13: Navigation preserves wizard state

*For any* wizard state with configuration data, navigating backward and then forward again SHALL preserve all configuration data without loss.

**Validates: Requirements 9.3, 9.4**

### Property 14: Required field validation prevents navigation

*For any* wizard step with required fields, attempting to navigate to the next step when required fields are empty SHALL be prevented (next button disabled or validation error shown).

**Validates: Requirements 10.1**

### Property 15: Validation failures display error messages

*For any* validation failure, an error message SHALL be displayed in the UI indicating which field or fields are invalid.

**Validates: Requirements 10.2**

### Property 16: Next button disabled on validation failure

*For any* wizard step in an invalid state, the next button SHALL be disabled.

**Validates: Requirements 10.3**

### Property 17: Required target fields validation

*For any* target schema with required fields, the field mapping step validation SHALL fail when any required field is not mapped.

**Validates: Requirements 10.6**

### Property 18: API errors display user-friendly messages

*For any* API error response (4xx or 5xx status code), an error message SHALL be displayed to the user.

**Validates: Requirements 12.8**

## Security Considerations

### Input Validation
- Sanitize all user inputs before storing or displaying
- Validate JSON structure and size limits
- Prevent XSS attacks in preview panel by escaping HTML

### Data Privacy
- Do not log sensitive data from sample payloads
- Mask sensitive fields in error messages
- Follow data retention policies for sample data

### API Security
- Use authentication tokens for all API calls
- Validate user permissions before allowing mapping edits
- Implement rate limiting for preview evaluations

## Accessibility Requirements

### WCAG 2.1 Level AA Compliance
- All interactive elements keyboard accessible
- Sufficient color contrast for text and UI elements
- Screen reader support with ARIA labels
- Focus indicators visible on all focusable elements
- Error messages associated with form fields

### Keyboard Navigation
- Tab order follows logical flow
- Enter key submits forms
- Escape key cancels dialogs
- Arrow keys navigate between options

## Internationalization

### Translatable Strings
- All UI labels and messages use i18n keys
- Date and number formatting respects user locale
- Error messages available in multiple languages

### i18n Keys
```typescript
'wizard.mode.title': 'Select Wizard Mode'
'wizard.mode.apiGateway': 'API Gateway Mode'
'wizard.mode.integrationHub': 'Integration Hub Mode'
'wizard.step.requestMapping': 'Request Mapping'
'wizard.requestMapping.template': 'Template'
'wizard.requestMapping.jsonata': 'JSONata'
'wizard.validation.required': 'This field is required'
'wizard.validation.invalidJson': 'Invalid JSON format'
```

## Monitoring and Observability

### Metrics
- Wizard completion rate by mode
- Average time per step
- Validation error frequency by step
- API call success/failure rates

### Logging
- User actions (mode selection, step navigation)
- Validation failures
- API errors
- Preview evaluation errors

### Analytics
- Most used transformation types
- Most common validation errors
- Step abandonment rates
- Mode selection distribution

## Future Enhancements

### Phase 2 Features
- Visual template builder with drag-drop field picker
- JSONata syntax highlighting and autocomplete
- Transformation testing with multiple sample datasets
- Transformation library with common patterns
- Import/export transformation configurations

### Phase 3 Features
- AI-assisted transformation suggestions
- Transformation performance optimization
- Batch transformation testing
- Transformation versioning and rollback
- Collaborative editing with real-time sync

## Appendix

### Transformation Type Reference

See `FieldMappingStepComponent` for complete list of 25+ transformation types:

**Basic**: direct, default_value  
**String**: uppercase, lowercase, trim, substring, replace, combine, template_string  
**Array**: join, first, last, element, count, filter_equals  
**Math**: sum, average, min, max  
**Type**: number_coerce  
**Date**: date_format  
**Logic**: conditional_value, enum_map  
**Advanced**: custom_jsonata

### JSONata Reference

JSONata is a lightweight query and transformation language for JSON data.

**Basic Syntax**:
- `field` - Access field
- `field.nested` - Access nested field
- `field[0]` - Access array element
- `$uppercase(field)` - Built-in function

**Common Functions**:
- `$uppercase(str)` - Convert to uppercase
- `$lowercase(str)` - Convert to lowercase
- `$substring(str, start, length)` - Extract substring
- `$join(array, separator)` - Join array elements
- `$sum(array)` - Sum array numbers
- `$count(array)` - Count array elements

**Example Expressions**:
```jsonata
$uppercase(firstName) & " " & $uppercase(lastName)
$sum(items.price)
$join(tags, ", ")
status = "active" ? "Active User" : "Inactive User"
```

### Template Syntax Reference

Template mode uses `{{field.path}}` syntax for field substitution.

**Basic Syntax**:
- `{{field}}` - Insert field value
- `{{nested.field}}` - Insert nested field value
- `{{array[0]}}` - Insert array element

**Example Template**:
```json
{
  "fullName": "{{firstName}} {{lastName}}",
  "email": "{{contact.email}}",
  "status": "{{account.status}}"
}
```

### Wizard Step Sequence

**API Gateway Mode**:
1. Mode Selection
2. Source Type
3. Configuration
4. Sample Data
5. **Request Mapping** ← Included
6. Request Schema
7. Field Mapping
8. Test & Publish

**Integration Hub Mode**:
1. Mode Selection
2. Source Type
3. Configuration
4. Sample Data
5. ~~Request Mapping~~ ← Skipped
6. Target Schema
7. Field Mapping
8. Test & Publish

