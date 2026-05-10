# ADR-004: Hosting and Deployment Strategy

**Date:** 2025-05-10
**Status:** Decided

## Context
The app needed to be distributed as a testable APK for the oral defense and 
deployed with live backend connectivity. We needed a way to build the app 
without requiring every team member to have Android Studio or the Android SDK 
installed locally.

## Options Considered
1. **Manual Gradle build** — requires Android SDK, keystore management, 
   environment setup on each machine
2. **GitHub Actions + Gradle** — CI pipeline, but requires configuring 
   Android secrets manually and writing workflow YAML
3. **EAS Build (Expo Application Services)** — cloud-based build service 
   managed by Expo, handles keystore generation and env var injection

## Decision
Chose EAS Build with cloud-managed Android Keystore and EAS Environment 
Variables for secret injection.

## Consequences
**Easier:**
- No local Android SDK required — any team member can trigger a build
- Keystore stored securely on Expo servers, no risk of losing it
- Env vars (Supabase URL, anon key) injected at build time, never committed 
  to the repo
- Build logs accessible via URL, shareable with the team

**Harder:**
- Build times are 10–20 minutes per run (no instant local builds)
- Dependent on EAS service availability
- Free tier has limited monthly build minutes