# CanonBridge API Proxy System - Testing Guide

## Overview
This document explains how to test the API Proxy system, including the mapping wizard's request mapping step.

## Test URLs

### GET Mapping Test
```
http://localhost:4200/wizard?mappingId=e87b7f54-0e6a-4606-9c43-61b0891ce2be
```

### POST Mapping Test
```
http://localhost:4200/wizard?mappingId=b3bb5c80-7966-4014-a2b4-235539f36b1b
```

## Recent Fixes (Step 3 - Request Mapping)

### Issue
When opening a mapping in edit mode, Step 3 (Request Mapping) wasn't showing the selected endpoint configuration.

### Root Cause
The `requestTransformation` was being extracted from `source_config` but the component's effect wasn't properly loading it or there was an issue with the data structure.

### Changes Made

1. **Enhanced Logging in RequestMappingStepComponent** (`request-mapping-step.component.ts`)
   - Added console logging to the `initialConfig` effect to trace when config is loaded
   - Logs show: mode, template, jsonata, and headers being loaded
   - Added automatic preview generation when template is loaded

2. **Enhanced Logging in MappingWizardComponent** (`mapping-wizard.component.ts`)
   - Added detailed logging to `extractRequestTransformation()` method
   - Traces the sourceConfig and requestTransformation extraction process

3. **Improved Effect Handling**
   - Better handling of null/undefined values in jsonata and headers
   - Automatic preview generation after config is loaded

## Testing Steps

1. **Open the GET Mapping**
   - Navigate to: `http://localhost:4200/wizard?mappingId=e87b7f54-0e6a-4606-9c43-61b0891ce2be`
   - The wizard should start at Step 2 (Configuration)
   - Click "Next" to go to Step 3 (Sample Data)
   - Click "Next" to go to Step 4 (Request Mapping)
   - **Expected**: The endpoint configuration should be loaded and visible
   - **Check Console**: Look for logs starting with "=== REQUEST MAPPING STEP: initialConfig effect triggered ==="

2. **Verify the Configuration**
   - The mode should be set (template or jsonata)
   - If using template mode, the template JSON should be visible
   - Headers should be loaded if they exist
   - Preview should be generated automatically

3. **Make Changes**
   - Modify the template or add/remove fields
   - The preview should update automatically
   - Click "Next" to save changes

4. **Test the Proxy Endpoint**
   - After saving, test the proxy endpoint using Postman
   - GET example: `{{baseUrl}}/api/proxy/{{mappingIdGet}}?format=detailed`
   - POST example: `{{baseUrl}}/api/proxy/{{mappingIdPost}}` with body

## Debugging

### Console Logs to Check

1. **When Loading Mapping**:
   ```
   === LOADED MAPPING ===
   === EXTRACTED SOURCE CONFIG ===
   === EXTRACTING REQUEST TRANSFORMATION ===
   === WIZARD STATE AFTER UPDATE ===
   ```

2. **When Entering Request Mapping Step**:
   ```
   === REQUEST MAPPING STEP: initialConfig effect triggered ===
   Loading config: { mode, template, jsonata, headers }
   ```

3. **If Config is Not Loading**:
   - Check if `requestTransformation` is null in the wizard state
   - Check if `source_config` contains `requestTransformation` object
   - Verify the structure matches: `{ mode, template, jsonata, headers }`

### Common Issues

1. **Endpoint Not Selected**
   - Check console for "No requestTransformation found, returning null"
   - Verify the mapping's `source_config` has a `requestTransformation` object

2. **Template Not Showing**
   - Check if `initialConfig` is null or undefined
   - Verify the effect is being triggered (check console logs)

3. **Preview Not Generating**
   - Check if `canonicalSampleJson` is provided
   - Verify the template has valid JSON structure

## Mapping Structure

### Expected source_config Structure
```json
{
  "url": "http://canonbridge-mock:8080/api/payments/latest",
  "method": "GET",
  "headers": {
    "X-API-Key": "demo-api-key-12345"
  },
  "requestTransformation": {
    "mode": "template",
    "template": {
      "customerId": "{{customer_id}}",
      "format": "{{partner_format}}"
    },
    "jsonata": "",
    "headers": {}
  }
}
```

## Next Steps

1. Open the mapping in the wizard using the test URL
2. Check the browser console for debug logs
3. Navigate to Step 4 (Request Mapping)
4. Verify the configuration is loaded
5. Make changes and test
6. Use Postman to verify the proxy endpoint works correctly

## Related Files

- `mapping-studio-ui/src/app/pages/mapping-wizard/mapping-wizard.component.ts`
- `mapping-studio-ui/src/app/pages/mapping-wizard/mapping-wizard.component.html`
- `mapping-studio-ui/src/app/pages/mapping-wizard/steps/step2-request-mapping/request-mapping-step.component.ts`
- `CanonBridge_API_Proxy.postman_collection.json`
- `POSTMAN_COLLECTION_GUIDE.md`
