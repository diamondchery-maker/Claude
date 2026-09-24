# Rust Avenue

A side-scrolling street brawler in the spirit of Streets of Rage 4. It's a single self-contained `index.html` (canvas + Web Audio, no build step). Open the file in a browser to play.

## Shen, keeper of the four elements

The hero is an elemental monk: a spear-staff with a blue blade, a fire gauntlet on one arm, a water-blue sleeve on the other, and a green tabard with beads at the sash. He fights with the staff and bends fire, water, earth and wind.

| Move | Input | What it does |
| --- | --- | --- |
| Staff combo | J, J, J, J | Thrust, sweep, twirl (multi-hit), overhead smash that knocks down |
| Spirit Spear | Hold J, release | Charged energy lance that pierces the whole row |
| Spear Lunge | Double-tap → to run, then J | Charging thrust |
| Air Spin | Jump, then J | Spinning staff strike in the air |
| Tidal Vortex | L | Water whirlpool that hits on both sides |
| Flame Fist | → + L | Fireball that burns through every enemy in its path |
| Verdant Rise | ↑ or ↓ + L | A line of stone and vine spikes that launch enemies |
| Gale Dive | Jump, then L | Wind dive kick with a shockwave on landing |
| Wind Toss | Grab, then back + J | Throws the enemy in a whirlwind |
| Elemental Awakening | U when the element meter is full | Super mode (below) |
| Cataclysm | U again while awakened | Screen-wide elemental blast that ends the super |

Specials cost a little health, which you win back by landing hits. The four-color element meter under the health bar fills as you deal and take hits; green chi orbs from barrels fill it faster.

**Elemental Awakening** lasts 12 seconds. Shen's hair turns white-blue, and fire, water, earth and wind orbs circle him and damage anything they touch. He moves faster, hits 50% harder, reaches farther, takes half damage without flinching, and his specials are free and bigger.

## Controls

Arrows / WASD move, J attack, K or Space jump, L special, U super, P pause, M music. Touch devices get an on-screen joystick and buttons.

## Sprite asset

`assets/shen-sprites.png` is Shen's sprite sheet: 46 frames in 160×130 cells covering idle, walk, run, every attack and special, hit reactions, victory, and the awakened super frames. `assets/shen-sprites.json` lists each frame's name and position, plus the foot origin. The game draws the same frames live: each fighter is rendered at half resolution with a 1px outline and scaled up with nearest-neighbour filtering, so everyone reads as pixel art. To regenerate the sheet, call `window.__game.renderSheet()` in the browser console.

## Enemies and stage

Thugs, knife fighters, armored brutes, and Baron, the boss, with a jab combo, a charging tackle and a ground-slam shockwave. Five locked-screen waves along one street end at the harbor. Breakable barrels and trash cans drop apples, roast chicken, cash, and chi orbs.
