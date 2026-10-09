# VariantGuard

Cross-variant compatibility and regression planning for software-defined vehicles.

VariantGuard helps OEM and Tier-1 teams understand which vehicle variants are affected by a software change, identify incompatible configurations, select an evidence-based regression scope, and route release decisions through human review.

## MVP capabilities

- Vehicle platform, variant, feature, ECU, and software-component modelling
- Component compatibility constraints for platform, hardware, OS, middleware, and features
- Change-set impact analysis across all configured vehicle variants
- Explainable compatibility findings and risk scoring
- Risk-based regression-test selection with requirement/feature/component tags
- Coverage gaps, blocking incompatibilities, and remediation actions
- Human release review and append-style audit events
- Downloadable JSON impact report
- REST API, responsive UI, unit tests, Docker, and Azure deployment assets

## Important limitation

VariantGuard is an engineering decision-support MVP. It does not prove safety, cybersecurity, homologation, or release readiness. Compatibility rules, test mappings, and risk thresholds must be approved by competent programme engineers.

## Run

Requires Node.js 20+.

```bash
npm test
npm start
```

Open http://localhost:3000.

## API

- `GET /api/health`
- `GET|POST /api/programs`
- `GET /api/programs/:id`
- `POST /api/programs/:id/variants`
- `POST /api/programs/:id/components`
- `POST /api/programs/:id/tests`
- `POST /api/programs/:id/analyses`
- `POST /api/programs/:id/reviews`
- `GET /api/programs/:id/report`

See `docs/methodology.md` for the compatibility and test-selection model.
