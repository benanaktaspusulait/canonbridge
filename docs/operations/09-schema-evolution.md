# Schema Evolution & Compatibility

**Status**: Design Phase  
**Last Updated**: May 10, 2026

> ⚠️ **Note**: This document defines the strategy for schema evolution. Implementation will occur in Phase 3-4.

---

## 🎯 Overview

Schema evolution is critical for CanonBridge because:
- Partner formats change over time
- Canonical model needs to evolve
- Multiple mapping versions must coexist
- Backward compatibility is essential

---

## 📋 SCHEMA TYPES

### 1. Input Schemas (Partner-Specific)
- **Location**: `partners/{partnerId}/{eventType}/input.{version}.schema.json`
- **Ownership**: Partner team + Integration team
- **Change Frequency**: Medium (monthly)
- **Compatibility**: Forward compatible preferred

### 2. Canonical Schemas (Internal)
- **Location**: `schemas/canonical/{eventType}.{version}.schema.json`
- **Ownership**: Platform team
- **Change Frequency**: Low (quarterly)
- **Compatibility**: Backward compatible required

---

## 🔄 EVOLUTION STRATEGY

### Semantic Versioning

**Format**: `v{major}.{minor}.{patch}`

**Rules**:
- **Patch** (v1.0.1): Bug fixes, no schema changes
- **Minor** (v1.1.0): Backward-compatible additions
- **Major** (v2.0.0): Breaking changes

**Examples**:
```
v1.0.0 → v1.1.0: Added optional field (backward compatible)
v1.0.0 → v2.0.0: Removed required field (breaking change)
```

---

## ✅ COMPATIBILITY RULES

### Backward Compatible Changes (Minor Version)

**Allowed**:
- ✅ Add optional field
- ✅ Remove required constraint (make field optional)
- ✅ Widen enum values
- ✅ Increase maxLength
- ✅ Decrease minLength
- ✅ Add new event type

**Example**:
```json
// v1.0.0
{
  "required": ["orderId", "customerId"],
  "properties": {
    "orderId": { "type": "string" },
    "customerId": { "type": "string" }
  }
}

// v1.1.0 (backward compatible)
{
  "required": ["orderId", "customerId"],
  "properties": {
    "orderId": { "type": "string" },
    "customerId": { "type": "string" },
    "orderDate": { "type": "string" }  // New optional field
  }
}
```

### Breaking Changes (Major Version)

**Requires New Version**:
- ❌ Remove field
- ❌ Rename field
- ❌ Change field type
- ❌ Add required field
- ❌ Narrow enum values
- ❌ Decrease maxLength
- ❌ Increase minLength

**Example**:
```json
// v1.0.0
{
  "required": ["orderId"],
  "properties": {
    "orderId": { "type": "string" }
  }
}

// v2.0.0 (breaking change)
{
  "required": ["orderId", "orderDate"],  // Added required field
  "properties": {
    "orderId": { "type": "string" },
    "orderDate": { "type": "string" }
  }
}
```

---

## 🔧 IMPLEMENTATION STRATEGY

### Phase 1: Version Coexistence

**Multiple versions run simultaneously**:
```
partners/acme/order-created/
├── input.v1.schema.json
├── input.v2.schema.json
├── inbound.v1.jsonata
├── inbound.v2.jsonata
└── config.json (specifies active version)
```

**Transformer Logic**:
1. Read event envelope
2. Extract `schemaVersion` field
3. Load corresponding schema and mapping
4. Transform and validate

### Phase 2: Gradual Migration

**Timeline**:
- Week 1: Deploy v2 alongside v1
- Week 2-4: Monitor both versions
- Week 5: Partner switches to v2
- Week 6-8: Deprecation period for v1
- Week 9: Remove v1

**Rollback**: Keep v1 active during migration

---

## 📊 COMPATIBILITY TESTING

### Automated Checks

**Pre-Deployment**:
```bash
# Check backward compatibility
npm run test:schema-compatibility

# Validates:
# - No breaking changes in minor versions
# - All fixtures still pass
# - Mapping generates valid output
```

**Test Matrix**:
| Old Schema | New Schema | Old Data | Expected |
|------------|------------|----------|----------|
| v1.0.0 | v1.1.0 | Valid | ✅ Pass |
| v1.0.0 | v1.1.0 | Invalid | ❌ Fail |
| v1.0.0 | v2.0.0 | Valid | ⚠️ May fail (breaking) |

---

## 🚨 BREAKING CHANGE PROCESS

### When Breaking Change is Needed

1. **Justify**: Document why breaking change is necessary
2. **Plan**: Create migration plan with timeline
3. **Communicate**: Notify all affected partners (4 weeks notice)
4. **Implement**: Deploy new version alongside old
5. **Migrate**: Help partners migrate
6. **Deprecate**: Remove old version after grace period

### Communication Template

```
Subject: [Action Required] Schema Breaking Change - Order Created v2.0.0

Dear Partner Team,

We are introducing a breaking change to the OrderCreated event schema.

What's Changing:
- Field "customer_id" renamed to "customerId" (camelCase)
- New required field "orderDate" added

Timeline:
- May 15: v2.0.0 deployed (v1.0.0 still active)
- May 15-June 15: Migration period (both versions supported)
- June 15: v1.0.0 deprecated (warning logs)
- July 1: v1.0.0 removed

Action Required:
1. Update your integration to send "customerId" instead of "customer_id"
2. Add "orderDate" field to all events
3. Test with our staging environment
4. Deploy before June 15

Migration Guide: [link]
Support: integration-support@company.com
```

---

## 📚 SCHEMA REGISTRY

### Future Enhancement (Phase 6+)

**Confluent Schema Registry Integration**:
- Centralized schema storage
- Automatic compatibility checking
- Schema versioning
- Consumer compatibility validation

**Benefits**:
- Prevents accidental breaking changes
- Enforces compatibility rules
- Provides schema history
- Enables schema evolution governance

---

## 🎯 BEST PRACTICES

### For Platform Team

1. **Default to Backward Compatible**: Always try minor version first
2. **Batch Breaking Changes**: Group multiple breaking changes into one major version
3. **Long Deprecation Period**: Give partners 4-8 weeks to migrate
4. **Clear Communication**: Document all changes with examples
5. **Automated Testing**: Test all fixtures against new schema

### For Partner Teams

1. **Use Latest Version**: Always use the latest schema version
2. **Test Before Deploy**: Test schema changes in staging
3. **Monitor Deprecation Warnings**: Watch for deprecation notices
4. **Plan for Migration**: Budget time for schema migrations
5. **Provide Feedback**: Report schema issues early

---

## 📊 MONITORING

### Metrics to Track

- **Schema Version Distribution**: How many events per version
- **Validation Failures by Version**: Which versions have issues
- **Migration Progress**: % of events on new version
- **Deprecation Warnings**: Count of deprecated version usage

### Alerts

- ⚠️ **Warning**: Deprecated schema version used (> 100 events/day)
- 🚨 **Critical**: Validation failure rate > 1% for any version
- 📊 **Info**: New schema version deployed

---

## 🔗 RELATED DOCUMENTS

- [Architecture Overview](../architecture/01-overview.md)
- [Schema Validation](../implementation/04-schema-validation.md)
- [Mapping Versioning](../implementation/03-mapping-versioning.md)
- [Deployment Checklist](../deployment/01-deployment-checklist.md)

---

**Schema evolution is critical for long-term success. Plan carefully, communicate clearly, and test thoroughly.**
