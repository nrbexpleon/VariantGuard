# Methodology

VariantGuard uses explicit programme data and deterministic rules. It does not use an opaque model to approve releases.

## Data model

`Programme → Variants → Components → Constraints → Change set → Selected tests → Human review`

A variant records its platform, hardware, operating system, middleware, features, installed components, and safety level. A component records supported configurations and engineering tags. Tests are mapped through component IDs, tags, features, and platforms.

## Impact analysis

1. Find variants containing the changed component. Optionally include compatible candidate variants.
2. Evaluate component constraints against each variant.
3. Select tests whose component/tag/feature and platform mappings intersect the change.
4. Require regression tests for every variant, safety tests for ASIL-B and above, and cybersecurity tests for cybersecurity-relevant changes.
5. Calculate an explainable risk score from change type, safety level, incompatibilities, missing test kinds, and cybersecurity relevance.
6. Hold the change when incompatibilities or coverage gaps exist.

## Production backlog

1. Entra/OIDC authentication, RBAC, tenant isolation, and segregation of duties.
2. PostgreSQL/Azure SQL and append-only signed audit events.
3. Importers for product configuration, feature models, ALM, PLM, AUTOSAR, test management, and CI/CD.
4. Boolean feature constraints and SAT-based configuration validation.
5. Requirement/change dependency graphs and historical defect risk.
6. Configurable programme-approved risk and test-selection policies.
7. Signed PDF evidence packs and release authority workflows.
8. API integration with AutoQualify, CyberEvidence 21434, and automotive software marketplaces.
