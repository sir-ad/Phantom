---
sidebar_position: 4
title: Simulation
---

# Product Simulation

Simulate user behavior, market response, and feature impact before writing a single line of code.

## Usage

```bash
phantom simulate "User onboarding flow for a fintech app targeting Gen Z"
```

## How It Works

Phantom creates a deterministic simulation of user behavior based on:

1. **Persona Generation**: Creates realistic user profiles matching your described audience.
2. **Journey Mapping**: Simulates step-by-step user interactions with the product.
3. **Friction Detection**: Identifies where users are likely to drop off or get confused.
4. **Outcome Prediction**: Estimates conversion rates, completion rates, and satisfaction scores.

## Example Output

```
=== PRODUCT SIMULATION ===

Scenario: "User onboarding flow for a fintech app targeting Gen Z"

─── PERSONA: Maya, 22, College Student ───

Step 1: App Download (App Store)
  ✓ Conversion: 85% — Strong ASO and social proof
  
Step 2: Email/Phone Signup
  ⚠ Friction: 60% completion — Gen Z prefers social login
  💡 Recommendation: Add Apple/Google sign-in

Step 3: KYC Verification
  ✗ Drop-off: 45% abandon — Photo ID upload is a barrier
  💡 Recommendation: Defer KYC to first transaction > $100

Step 4: Link Bank Account
  ⚠ Friction: 55% completion — Trust barrier
  💡 Recommendation: Add security badges, explain encryption

Step 5: First Transaction
  ✓ Conversion: 78% of remaining users complete
  
─── SUMMARY ───
Overall Funnel Completion: 18.9%
Critical Bottleneck: KYC Verification (Step 3)
Top Recommendation: Defer KYC to reduce onboarding friction
```

## Use Cases

| Scenario | What You Learn |
|----------|---------------|
| Onboarding flows | Where users drop off and why |
| Pricing page design | Which pricing tiers get the most clicks |
| Feature adoption | How users discover and engage with features |
| Checkout flows | Cart abandonment drivers |
| Migration paths | Friction in moving users to a new platform |

## Options

| Flag | Description |
|------|-------------|
| `--json` | Output as structured JSON |
| `--personas <n>` | Number of personas to simulate (default: 3) |
| `--depth <level>` | Simulation depth: `shallow`, `medium`, `deep` |
