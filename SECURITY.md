# Security policy

## Supported versions

Security fixes are applied to the latest commit on the default branch. This portfolio project does not maintain older release branches.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Use GitHub private vulnerability reporting when it is enabled for the repository, or contact the repository owner privately through the contact method listed in the portfolio.

Include the affected component, reproduction steps, impact, and any suggested mitigation. Do not include real secrets or personal data. Reports will be acknowledged as soon as practical and coordinated disclosure will be preferred.

## Deployment boundary

The Compose stack is a hardened reference deployment, not an internet edge. Production deployments must terminate TLS at a trusted ingress, store API keys in the platform secret manager, restrict the telemetry service to approved origins or authentication, and retain automated dependency and image scanning.
