# River Escape - Versiyon Günlükleri (CHANGELOG)
Bu dosya, oyun motorunun ve özelliklerin versiyon versiyon nasıl geliştiğini mühürleyip saklamak için Antigravity tarafından oluşturulmuştur.

### [v1.99.33.61] - 2026-04-19
#### Modern Boat & Prestige Perk Update
- **Boat Collection Modernized**: Replaced placeholder assets with premium 'Elite' boat skins (Magma Overlord, Pixel Phantom, Nebula Zenith).
- **Gameplay Perks Integrated**: 
    - **Magma Overlord (Armor Regen)**: Restores 1 armor every 20s.
    - **Pixel Phantom (Ghosting)**: 10% chance to phase through obstacle collisions.
    - **Nebula Zenith (Elite Magnet)**: Permanent 220px gold attraction radius.
- **Auto-Activation**: Boats are now automatically selected and equipped immediately upon purchase.
- **Version Bump**: Project version updated to v1.99.33.61.

### [v1.99.33.50] - 2026-04-19
#### Minimalist Purge & Audio Restoration
-   **Feature Removal**: Completely stripped the Combo and Ascension systems. The game is now focused purely on distance and skill survival without distracting multipliers or "god modes".
-   **Audio Cleanup**: Removed procedural "howling" wind, engine rumbles, and environmental drones (`audio.js`). Restored the classic, clean 8-bit sound profile.
-   **Bug Fixes**: Fixed a `SyntaxError` (Illegal continue) in the collision detection engine.
-   **Version Bump**: Incremented project version to v1.99.33.50.

### [v1.99.33.00] - 2026-04-19
#### Infinite Stages & Visual Evolution
- **Infinite Stage System**: The 9-biome structure has been expanded into a 27-stage cycle. Each biome now consists of 3 distinct difficulty stages (e.g., Lvl 1, 2, 3 = Spring).
- **Prestige Loops**: Implemented "Visual Evolution". After Level 27, biomes undergo hue-rotation and saturation shifts to keep the visuals evolving indefinitely.
- **Elite Scaling**: Difficulty (speed and obstacle density) now scales with every full 27-stage loop.
- **Infinite Leveling**: HUD now displays absolute level numbers (1, 2, 3... 100+) for competitive depth.
- **Bug Fixes**: Fixed biome indexing in HUD icons, start-screen previews, and armor cycle highlighting.

### [v1.99.32.13] - 2026-04-19
#### Wheel Reward Restore
- **Reversion**: Restored "Lucky Spin" wheel rewards to their original values (50G-200G) per user request while maintaining other economic nerfs.

### [v1.99.32.12] - 2026-04-19
#### Elite Economy Rebalance
- **Gold Reduction:** Reduced "generous" gold rewards by 60% across all systems to align with Elite standards.
- **Spin Wheel:** Gold rewards adjusted from 50-200G to 20-80G.
- **River Spawns:** Blue coins reduced from 5G to 2G; Purple coins reduced from 10G to 4G.
- **Mission Overhaul:** Slashed base mission rewards by 60% (e.g., 500G -> 200G) and forced a recalculation for the current session.

### [v1.99.32.11] - 2026-04-19
#### Game Over UI Cleanup
- **UI Refinement**: Removed the version badge from the Game Over screen to reduce visual clutter as requested.

### [v1.99.32.10] - 2026-04-19
#### Elite Polish & Rendering Stability
- **Rendering Loop Fix:** Resolved 250+ console errors related to `NaN` coordinate calculations in the `magmaSerpent` rendering logic.
- **Physics Robustness:** Added `baseRelX` initialization for `magmaSerpent` and `cyberDrone` obstacles to ensure consistent oscillation physics.
- **Localization Refine:** Changed "Ascension" notification to **"YÜCELİŞ: DURDURULAMAZ! ⚡"** (Turkish) for a more professional "Elite" feel.
- **UI Spacing:** Improved Game Over screen layout to prevent "Main Menu" button overlap with the version badge.
- **Safety Guards:** Implemented `NaN` prevention guards in the global obstacle drawing loop.

### [v1.99.32.09] - 2026-04-19
#### Elite Trap Sync Fix
- **ReferenceError Resolution:** Fixed a critical crash `ReferenceError: speedX is not defined` in `spawnGold` function.
- **Trap Angular Chaos:** Synchronized gold chest trap obstacles with the new "Elite Angular Chaos" physics system by properly defining local scope variables.
- **Global Manifest Sync:** Unified v1.99.32.09 across project manifests, UI labels, and file headers.

### [v1.99.32.08] - 2026-04-19
#### Elite Scope Protection Update
- **Syntax Error Resolution:** Renamed the global `version` variable in `game_unbeatable_v3.js` to `currentVersion` to resolve a name collision with `assets.js`.
- **Global Manifest Sync:** Unified v1.99.32.08 across project manifests, audio headers, and site UI.
- **Loading Stability:** Restored game initialization by preventing identifier re-declaration errors.

### [v1.99.32.07] - 2026-04-19
#### Elite Balance Update
- **Boat Stability Fix:** Resolved a critical rendering context leak that caused the player boat to rotate with obstacles.
- **Matrix Restoration:** Properly implemented `ctx.restore()` in the obstacle rendering loop to ensure global state isolation.
- **Angular Chaos Persistence:** Maintained the requested diagonal physics and rotation for logs while isolating the player.
- **Global Manifest Sync:** Unified v1.99.32.07 across project manifests and headers.

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
