# River Escape - Versiyon Günlükleri (CHANGELOG)
Bu dosya, oyun motorunun ve özelliklerin versiyon versiyon nasıl geliştiğini mühürleyip saklamak için Antigravity tarafından oluşturulmuştur.

## [v1.99.14.9] "AGGRESSIVE LAGOON" - 2026-04-14
- **Spawn Overdrive**: Increased Level 7 spawn probability from 45% to 90% to eliminate "dead zones."
- **Balloon Barrage**: Doubled the scattered balloon cluster size from 3 to 6 for intense difficulty.
- **Turbo Cooldown**: Reduced spawning cooldown to 0.4s specifically for the Lagoon biome.

## [v1.99.14.8] "ELITE LAGOON POLISH" - 2026-04-14
- **Log Evasion**: Disabled all standard logs (`Kutuk.png`) in Level 7 (Lagoon) to match user aesthetic preferences.
- **Colossal Balloons**: Increased the size of scattered balloons by 50% (48x68) for higher visibility and "Elite" presence.
- **Boat Restoration**: Reverted the Level 7 player skin from "Nostalji" back to the original Level 1 "Spring" kayak.
- **Asset Integrity**: Resolved the "brown box" rendering error by correcting biome-specific log mapping.

## [v1.99.14.0] "LAGOON OF MEMORIES" - 2026-04-14
- **New Biome: Level 7 Nostalgia:** Added the "Lagoon of Memories" after Level 6, extending the cycle to 18,000 points.
- **Special AI**: Implemented Oscar-winning kites and unpredictably scattered elite balloons.

## [v1.99.13.1] "ANTI-CLUSTER HOTFIX" - 2026-04-14
- **Global Spawn Cooldown:** Enforced a mandatory 0.8s gap between any two obstacle spawns to eliminate "horizontal walls."
- **L1 Trap restriction:** Integrated `spawnGold` traps into the Level 1 density cap (Max 3 items on screen).
- **UI Version Sync:** Synchronized all visible version identifiers to v1.99.13.1 across the Menu and Game Over screens.
- **Frame-Accurate Leveling:** Moved level calculation to the top of the update loop for precision logic.

## [v1.99.13.0] "ELITE HYBRID" - 2026-04-13
- **Time-Based Progression:** Level transitions are now decoupled from the score and based on total survival time (46 min total loop).
- **Skill-Based Scoring:** Introduced an "Elite Score Algorithm" where gold collection (+100x), enemy dodges (+50), and level completions (+500) provide significant score boosts.
- **HUD Progress Overhaul:** The progress bar now accurately tracks survival time relative to the current level's duration.
- **Elite Dodge (Near-Miss):** Players now earn bonus points for narrowly dodging obstacles (brushed haptic feedback added).

## [v1.99.12.2] "ELITE CYCLE" - 2026-04-13
- **Elite Spawner Cycle:** Implemented specialized 6-level biome rotation (L7=1, L8=2, etc.) for theme consistency.
- **Biome Restrictions:** Crocodiles, Hippos, and Logs are now strictly forbidden in Level 5 (Lava) and Level 6 (Void) biomes.
- **Vertical Spacing Guard:** Introduced a 250px vertical spawn gap to prevent impossible "obstacle walls."
- **Level 4 Triangle Restoration:** Re-added `iceBerg` (Triangles) and integrated a new high-fidelity ice rock asset.
- **Dash Buff:** Increased `DASH_DURATION` to 1.2s for enhanced horizontal maneuverability and tester satisfaction.
- **Level 1 Balance:** Hard-capped early-game density (Max 3 items) and synchronized score-based special spawning.

## [v1.99.12.0] "DUAL-CONTROL" - 2026-04-13
- **Dual-Hand Multi-Touch:** Independent steering and action processing. Left hand manages movement while right hand triggers buttons without interruption.
- **Move-Lock System:** Introduced `moveTouchId` to prevent boat "jitter" when multiple fingers interact with the screen.
- **Smart Zone Splitting:** Canvas divided into Steering (Left 65%) and Action (Right 35%) zones for ergonomic mobile play.
- **Edge Buffer Refinement:** Increased `wallSafeBuffer` to 18px for safer navigation near riverbanks.

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
