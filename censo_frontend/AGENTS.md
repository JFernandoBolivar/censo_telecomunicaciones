<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:opencode-skills -->
# Available Skills

This project includes two skills in `.opencode/skills/`. Load them via the `skill` tool when relevant:

1. **design-taste-frontend** — Anti-slop frontend skill for landing pages, portfolios, and redesigns. Use when building UI from scratch or redesigning. Defines Design Read, 3 Dials (DESIGN_VARIANCE, MOTION_INTENSITY, VISUAL_DENSITY), bias correction, pre-flight checks. Load with `skill({ name: "design-taste-frontend" })`.

2. **arquitecto-scream-feature-onion** — SCREAM + Feature-Based + Onion architecture for modular features. Use when creating or validating features in `modules/`. Provides folder structure, Onion validation rules (R1-R6), and templates for domain/application/infraestructure/ui layers. Load with `skill({ name: "arquitecto-scream-feature-onion" })`.
<!-- END:opencode-skills -->
