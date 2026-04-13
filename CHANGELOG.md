# River Escape - Versiyon Günlükleri (CHANGELOG)
Bu dosya, oyun motorunun ve özelliklerin versiyon versiyon nasıl geliştiğini mühürleyip saklamak için Antigravity tarafından oluşturulmuştur.

## [v1.99.11.0] "ELITE ADRENALINE" - 2026-04-13
- **Level 4 Balancing:** Widened the Winter River (margin 0.39 -> 0.35) after tester feedback for better maneuverability.
- **Lava Geyser (Level 5):** Implemented high-fidelity procedural magma pillars with a 3-stage eruption cycle.
- **Periodic Elite Challenge:** Established a 6-biome cycle where Lava obstacles recur specifically in their thematic slots.
- **Difficulty Tuning:** Increased Level 5 spawn frequency (0.70) and sharpened geyser hitboxes for intense gameplay.
- **Elite Polish:** Removed duplicate spawning logic and fixed critical syntax glitches for v1.99.11.0 stability.

## [v1.99.10.0] "LAVA REIGN" - 2026-04-13
- **Lava Level Straightened & Widened:** Removed river curvature and increased width (margin 0.35) for perfect control based on user feedback.
- **Movement Engine:** Fixed major "Double SpeedX" and "Double Player Movement" bugs.
- **Visual Polish:** Upgraded Level 5 Lava Shimmer with procedural sizzle gradients and heat-haze effects.
- **Elite Particles:** Tailored particle colors to match Lava River (orange/red) and Winter (blue/white) environments.
- **Documentation Sync:** Synchronized `rules.md` thresholds (7000 pts for L5) with actual game engine logic.
- **Production Seal:** Official v1.99.10.0 release for Google Play preparation.

## [v1.99.6.0] "MASTER UNIFIER" - 2026-04-11
- **Layer Sync:** Consolidated Z-Index architecture (Shop: 30K, Spin: 25K, Pause: 10K).
- **Smart Transitions:** Automated Shop-to-Pause hiding/restoring logic during gameplay.
- **Input Mastery:** Optimized `touch-action: none` to eliminate accidental browser gestures during high-stakes maneuvers.

## [v1.99.5.80] - 2026-04-11
- **Asset Integrity:** Fixed transparency seal for "Kayik.png" across all environments.
- **Economy Sync:** Cloud-based gold persistence triggered instantly upon collection.

## [v1.99.4.1.8] - 2026-04-10
- **AdMob Unification:** Integrated `@capacitor-community/admob` for rewarded ad flows.
- **Security:** Hardened safe-area insets for modern mobile displays.

## [v2.04] - 2026-04-09
- **Level 1 Bouncing:** Log obstacles now bounce off edges in the Spring level for early-game dynamism.

## [v2.00] - 2026-04-08
- **Individual Assets:** Replaced tile grids with high-definition individual assets for consistent pixel-perfect rendering.

## [v1.97.2.3] - 2026-04-05
- **Void Level Fallback:** Implemented Lava asset fallback for the Void level to ensure no missing textures.

## [v1.97.1.9] - 2026-04-03
- **Input Precision:** Reduced vibration/shake intensity (0.8 -> 0.4) for better mobile accessibility.
- **Soft Push:** Introduced edge-avoidance mechanics to prevent hard collisions.

## [v1.96.8.6] - 2026-03-31
- **Drift Engine:** Introduced sinusoidal river curving for Level 5.
- **Environment Effects:** Snowfall added to Level 4 (Winter).
