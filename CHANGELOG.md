# River Escape - Versiyon Günlükleri (CHANGELOG)
Bu dosya, oyun motorunun ve özelliklerin versiyon versiyon nasıl geliştiğini mühürleyip saklamak için Antigravity tarafından oluşturulmuştur.

### [v1.99.32.06] - 2026-04-19
#### Elite Angular Chaos Update
- **Diagonal Physics:** Obstacles can now spawn with random horizontal velocities (speedX) and rotation speeds.
- **Bouncing Mechanics:** Dynamic obstacles now rebound elastically off river boundaries for a "pinball" chaos effect.
- **Rotational Rendering:** Implemented matrix rotation (ctx.rotate) to sync visual rotation with physical angles.
- **Tactical Depth:** Shifted gameplay from linear avoid-only to ballistics prediction.
- **Global Sync:** Unified v1.99.32.06 version across all manifests and scripts.

### [v1.99.32.05] - 2026-04-19
#### Elite Extreme Mode Update
- **Extreme Spawning:** Slashed baseline spawn intervals across all levels (Lv1: 1.15s, Cyber: 0.42s).
- **Chaos Swarm:** Reduced DZ interval to a record 0.42s for an absolute wall of obstacles.
- **Turbo Ramp-up:** Difficulty scaling speed increased by 200% to ensure an immediate challenge.
- **Elite Floor:** Lowered absolute minimum spawn buffer to 0.45s.
- **Global Sync:** Unified v1.99.32.05 version across all manifests and scripts.

### [v1.99.32.04] - 2026-04-19
#### Elite Difficulty Restoration Update
- **Spawn Tightening:** Reduced DZ obstacle intervals from 0.85s to 0.62s for intense biome conclusions.
- **Aggressive Pacing:** Updated `minSpawnInterval` logic (Lv1: 1.75s, Lv5: 1.15s) to ensure the river never feels empty.
- **Difficulty Ramp-up:** Increased obstacle spawn acceleration by 3x, forcing players to adapt faster to rising speed.
- **Global Sync:** Unified all version labels to v1.99.32.04 across all project assets and manifests.

### [v1.99.32.03] - 2026-04-19
#### Audio Precision Tune Update
- **Engine Richness:** Refined high-pass filter from 45Hz to 35Hz, restoring the foundational depth of the boat's engine.
- **Ambient Harmony:** Optimized Lava bubbling (35Hz HP) and Void hum gains for the perfect acoustic balance.
- **Boosted Gain:** Increased base engine volume by 20% to compensate for the softer triangle waveform.
- **Global Sync:** Unified all visual and technical version stamps to v1.99.32.03.

### [v1.99.32.02] - 2026-04-19
#### Level 1 Spawn Recovery Update
- **Obstacle Ignition:** Fixed a critical bug where `isTransitioningLevel` and `spawnInterval` were not reset in `startGame`, causing empty Level 1 screens.
- **Engine Reset:** Explicitly forced spawners to restart upon game initiation to ensure immediate gameplay flow.
- **Visual Sync:** Unified all version labels to v1.99.32.02 and corrected corrupted file headers.

### [v1.99.32.01] - 2026-04-19
#### Audio Polish & Clarity Update
- **Softer Engine:** Switched engine oscillators from sawtooth to triangle for a more natural rumble.
- **Mud Cleanup:** Implemented high-pass filters on all engine and ambient channels to remove "strange humming" and low-end distortion.
- **Ambient Rebalance:** Carefully tuned Lava and Void gains for a more harmonious audio experience.

### [v1.99.32.00] - 2026-04-19
#### Stage 5: The Living World & Survival Recovery
- **Living World:** Birds with animated wings and underwater shadows.
- **Juicy Transforms:** Squash & Stretch system with cartoony bounciness.
- **Dynamic Camera:** Speed-synced zoom-out effect for high velocity.
- **Fixed:** Invisible obstacles due to rendering loop save/restore mismatch.
- **Fixed:** Level 5 item collection bug (hitbox sync & passive magnet).
- **Elite Polish:** Fixed missing UI click sounds for Settings and Spin.

### [v1.99.31.00] - 2026-04-19
#### Stage 4: Audio & Biome Overhaul
- **Dynamic Audio:** Procedural engine rumble and pitch-shift speed sync.
- **Improved Ambience:** Added Void Hum (Lv6) and Lagoon Bubbles (Lv7).
- **Juicy SFX:** Near-Miss Whoosh and premium UI click sounds.
- **Biome VFX:** Specialized particles: Embers (Lava), Glitches (Void), Bubbles (Lagoon).

## [v1.99.30.06] - 2026-04-19
### Session & Mission Persistence
- **Smart Resume:** Players can now return to the main menu and resume their exact level progress, score, and lives.
- **Infinite Mission Cycles:** Missions now automatically prestigious with +25% difficulty/reward scaling upon completion.
- **Obstacle Destroyer:** New mission type targeting combat and bomb usage.
- **Hard Reset Integration:** Missions and cycles now reset correctly during a total data wipe.
- **Security Lock:** Fixed the "Illegal Ammo" bug; bombs now require a Weapon License to purchase.

## [v1.99.30.04] - 2026-04-18
### Fixed
- **Master Skip Synchronization**: Refactored the 'L' key algorithm to perfectly match the core game engine. Supports consistent level skipping across infinite loop cycles.

## [v1.99.30] "ELITE BILLING CORE" - 2026-04-18
- **Google Play Billing Integration**: Installed `cordova-plugin-purchase` (v13+) and provisioned Android layer.
- **Unified Economy Sync**: Instant revenue synchronization with Firebase cloud.
- **Project-Wide Versioning**: v1.99.30 release stable.

## [v1.99.27.10] "ELITE SHOP REBORN" - 2026-04-17
- **Gold Market Overhaul**: Redesigned UI with premium glassmorphism.
- **Level 5 Visual Upgrade**: Jagged "Magma Spires" with internal pulsing veins.
- **Level 9 Normalization**: Spawn logic and physics refinement for Toxic biomes.

## [v1.99.14.31] "GOLDEN SHINE" - 2026-04-14
- **Crystal Gold Chime**: High-fidelity two-tone coin collection sound.

---
*Older logs preserved in internal archive.*
