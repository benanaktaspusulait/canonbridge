# CanonBridge Source Placeholder

Runtime services are intentionally not implemented yet.

The current repository contains the architecture, schemas, partner fixtures, local infrastructure, and implementation references needed to start the transformer and Mapping Studio builds without inventing contracts from scratch.

Expected future services:

- `transformer/` or `src/transformer/`: Node.js JSONata transformer service.
- `business-service/`: Java/Quarkus canonical event consumer.
- `canonbridge-ui/`: React Mapping Studio UI.

Keep executable service code aligned with the schema and partner fixture contracts under `schemas/` and `partners/`.
