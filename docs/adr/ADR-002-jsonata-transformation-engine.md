# ADR-002: JSONata as the Transformation DSL

**Status**: Accepted
**Date**: 2024-01
**Deciders**: Platform Architecture Team

---

## Context

The transformation engine must convert partner-specific JSON payloads into a canonical format. The transformation rules must be:

- **User-authored**: Business users and integration engineers write mappings without deep coding knowledge
- **Versionable**: Mapping rules stored as text artifacts, tracked in Git, with immutable published versions
- **Testable**: Mappings can be previewed against sample inputs before publish
- **Sandboxed**: Untrusted user-authored mappings cannot access the filesystem, network, or secrets
- **Maintainable**: Rules are readable and reviewable in PR/audit workflows

The transformation scope is strictly structural: field renaming, date conversion, enum mapping, nested flattening, array mapping, default values, conditional field inclusion. Business rules (eligibility, payment, fraud) do not belong here.

---

## Options Considered

### Option A: JSONata

**Strengths:**
- Purpose-built for JSON-to-JSON transformation
- Readable, concise syntax (similar to XPath for JSON)
- No external runtime dependencies — pure JavaScript library
- Supports: field selection, array mapping, conditional expressions, string functions, date formatting, arithmetic
- Easy to sandbox: no I/O capabilities, no module imports
- Mappings are plain text — trivially versionable and diffable
- Excellent test ergonomics: input JSON in, output JSON out
- Active maintenance (IBM origin, open source)

**Weaknesses:**
- Not Turing complete for complex business logic (by design — this is a strength here)
- Performance overhead for very complex expressions or very large payloads
- Custom function registration needed for advanced formatting
- Less known than mainstream languages — team training required

### Option B: Custom JavaScript functions

**Strengths:**
- Maximum flexibility
- Team already knows JavaScript/TypeScript
- Full access to Node.js ecosystem

**Weaknesses:**
- Mappings become executable code — require full code review, deployment cycle for changes
- Business users cannot author mappings
- Sandboxing is extremely difficult — `vm` module is not sufficient isolation
- Versioning is tied to service deployment, not mapping artifact version
- No visual preview capability without significant tooling investment

### Option C: Apache Velocity / XSLT / Handlebars (template-based)

**Strengths:**
- Well-understood in enterprise middleware
- XSLT is an industry standard for XML

**Weaknesses:**
- JSON → JSON via XML transformation adds unnecessary conversion layer
- Templates are less expressive than JSONata for conditional logic
- Not designed for the JSON-native ecosystem
- Handlebars is logic-less — insufficient for real transformations
- XSLT tooling is dated, unfamiliar to modern engineers

### Option D: Full scripting engine (Lua, Python, GraalVM)

**Strengths:**
- Maximum power

**Weaknesses:**
- Sandboxing is a major security challenge
- Performance and startup overhead
- Overkill for structural JSON transformations
- Business users cannot author mappings

---

## Decision

**Use JSONata.**

The deciding factors:

1. **Non-programmers can author mappings** — JSONata syntax is approachable for integration engineers and power users. Custom JS is not.

2. **Mappings are data, not code** — JSONata expressions are plain text artifacts. They can be stored in the database, versioned with semantic versioning, previewed against samples, and rolled back without deployment. This is the foundation of the Mapping Studio product.

3. **Sandboxing is inherent** — JSONata has no I/O capabilities. There is no filesystem, no network, no secret access. This eliminates a critical attack surface for user-authored mappings.

4. **Scope discipline** — JSONata's intentional limitations prevent mapping authors from pushing business logic into transformations. The clear boundary (structural transformation only) simplifies the architecture.

---

## Consequences

**Positive:**
- Mapping Studio UI can preview transformations without executing server-side code
- Mappings can be stored, versioned, and rolled back as database records
- Security surface of user-provided mappings is minimal
- Transformation layer has no business logic — clean separation of concerns
- Mappings are reviewable and auditable as text diffs

**Negative:**
- Complex transformations may hit JSONata expressiveness limits
- Performance can degrade for very large JSON payloads (>1MB) or deeply nested expressions
- Team needs to learn JSONata syntax and its evaluation model
- Custom functions (date formatting, regex, UUID generation) require registration at engine init

**Mitigations:**
- Execution timeout enforced per transformation (default: 500ms, configurable per tenant)
- Payload size limits enforced at ingestion (configurable, default: 5MB)
- JSONata function library documented and pre-registered at engine startup
- Transform duration histogram (`transformation_duration_ms`) enables performance monitoring per mapping

---

## Rejected Approaches

**Custom JavaScript**: Makes mappings executable code, eliminates business user authorship, makes sandboxing extremely hard, ties mapping changes to deployment cycles.

**XSLT**: JSON-native platform should not route through XML. XSLT tooling is dated and unfamiliar to modern teams.

**Full scripting engine (Lua/Python)**: Massively increases attack surface, sandboxing complexity, and operational overhead for a use case that doesn't require general-purpose scripting.

---

## Scope Boundaries (Important)

JSONata is the **transformation engine**, not the **business rule engine**.

| In scope for JSONata | Out of scope for JSONata |
|---|---|
| Field renaming | Eligibility decisions |
| Date format conversion | Payment rules |
| Enum value mapping | Fraud detection |
| Nested JSON flattening | Workflow state transitions |
| Array element mapping | Database-dependent logic |
| Default value injection | Cross-event dependency resolution |
| Conditional field inclusion | Complex domain validation |
| String formatting | Authentication / authorization |

Violations of this boundary introduce fragility, testability problems, and governance risk.
