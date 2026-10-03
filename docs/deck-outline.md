# CareCircle pitch deck outline

Slide-by-slide. 🔲 = unbuilt; either cut the slide or label it "roadmap".

1. **Title** — CareCircle: calm caregiving, in one dashboard. Team, Oct 2026.
2. **Problem** — caregivers juggle pills, visits, and worry; missed doses
   hide until the next crisis.
3. **Solution** — one dashboard (doses, adherence, alerts, summaries) +
   voice confirm for the older relative.
4. **Live demo** — follow `docs/demo-script.md` (3 min).
5. **Architecture** — React/Vite → Express 5 → DynamoDB; MCP server with 6
   tools; Bedrock agent (🔲 live model still mocked).
6. **AI safety** — Guardrails block medical advice in summaries/Q&A/agent
   replies. Status: 🔲 planned Oct 12; current Q&A answers come from mock
   data with a "demo only" label.
7. **DynamoDB design** — `carecircle_` table prefix, per-resource modules;
   🔲 table/key doc and seed script still missing.
8. **Testing** — `pnpm test`: 1 real health test, 16 TODO placeholders;
   manual plan of 10 in `docs/manual-test-plan.md`.
9. **Roadmap** — live API wiring (Oct 10), nightly summaries (Oct 13),
   e2e voice→dashboard→summary (Oct 16). Label clearly as next, not done.
10. **Ask** — what we need (judges/funding/users, per challenge).
