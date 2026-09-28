# Design System Document: The Sonic Curator

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Curator"**
This design system rejects the "utilitarian database" feel of common music apps in favor of a high-end, editorial experience. It is designed to feel like a premium physical gallery where the interface recedes to let the artistry of the music take center stage. 

We break the "template" look through **Tonal Architecture**. Instead of rigid grids and harsh lines, we use intentional asymmetry and overlapping layers. This system treats the screen as a three-dimensional space where content floats at different altitudes, creating a sense of sophisticated immersion and tactile luxury.

## 2. Colors: Tonal Depth & Accents
Our palette is anchored in deep, midnight neutrals, punctuated by "vibrant electrics" that represent the pulse of the music.

### Core Palette
- **Background & Surfaces:** Built on `#131314` (Surface/Background). It is not a true black, but a deep charcoal that allows for "lower" depth levels.
- **Primary Accents (Indigo):** `primary` (#bbc3ff) and `primary_container` (#3d5afe). Use these for high-intent actions and to signify active auditory states.
- **Tertiary Accents (Emerald):** `tertiary` (#3ce36a) and `tertiary_container` (#007f32). These provide a sophisticated counterpoint to the indigo, used for success states, playback progress, or premium "Exclusive" tiering.

### Named Color Tokens
```css
--background: #131314;
--surface: #131314;
--primary: #bbc3ff;
--primary-container: #3d5afe;
--tertiary: #3ce36a;
--tertiary-container: #007f32;
--on-surface: #e5e2e3;
--on-surface-variant: #c5c5d9;
--surface-container: #201f20;
--surface-container-low: #1c1b1c;
--surface-container-high: #2a2a2b;
--surface-container-highest: #353436;
--surface-bright: #39393a;
--outline-variant: #444656;
```

### The "No-Line" Rule
**Explicit Instruction:** Sectioning via 1px solid borders is prohibited. Boundaries must be defined solely through background color shifts.
- To separate a sidebar from a main feed, use `surface_container` (#201f20) against the `background` (#131314).
- To define a card, use `surface_container_low` or `high` to create a natural, "molded" appearance.

## 3. Typography: Editorial Sans
We utilize **Manrope**, a clean, geometric sans-serif that balances modernism with high legibility.

- **Display Scale:** Reserved for artist names or hero playlist titles. Use these with tight letter-spacing (-0.02em) to create an authoritative, editorial feel.
- **Title & Headline Scale:** Used for section headers and track titles. These should feel bold and prominent.
- **Body & Label Scale:** `on_surface_variant` (#c5c5d9) should be used for secondary metadata (album names, timestamps) to create a clear visual hierarchy against the `on_surface` primary text.

### Typography Scale
```css
--font-family-heading: 'Manrope', sans-serif;
--font-family-body: 'Manrope', sans-serif;
--font-family-display: 'Manrope', sans-serif;
```

## 4. Elevation & Depth: Tonal Layering
Depth is not a decoration; it is functional hierarchy. We move away from heavy drop shadows toward "Ambient Light."

### The Layering Principle
Stack tiers to define importance:
1. **Lowest:** `surface_container_lowest` (#0e0e0f) - Use for the "well" or background of a scrolling feed.
2. **Base:** `surface` (#131314) - The standard app canvas.
3. **Raised:** `surface_container_low` (#1c1b1c) - Default card state.
4. **Floating:** `surface_container_highest` (#353436) - Modals or active player controls.

## 5. Shape & Roundness
- **Roundness:** 8px corner radius (ROUND_EIGHT) throughout the interface
- **Buttons:** Use full (pill) rounding for modern look
- **Cards:** Use md (0.75rem) or lg (1rem) rounding, no borders

## 6. Design System Notes for Stitch Generation

**DESIGN SYSTEM (REQUIRED):**
- Platform: Web Desktop, Desktop-first responsive design
- Palette: Sonic Dark (#131314 background), Indigo Electric (#3d5afe primary), Emerald Pulse (#3ce36a tertiary)
- Styles: 8px rounded corners, tonal layering elevation, glassmorphism effects with backdrop blur
- Typography: Manrope font family for all text scales
- Theme: Premium dark music curation interface with editorial sophistication

**Visual Guidelines:**
- No 1px borders allowed - use tonal layering for separation
- Cards use surface_container_low (#1c1b1c) to surface_container_high (#2a2a2b) transitions
- Floating elements (player bar) use surface_container_highest (#353436) with 24px backdrop blur
- Primary actions use primary_container (#3d5afe), secondary actions use outline style
- Progress bars use gradient from primary (#bbc3ff) to tertiary (#3ce36a) with 4px glow
- Asymmetric layouts encouraged to break "template" feel
- Deep charcoal backgrounds, never pure black or white

## 7. Component Patterns

### Music Cards
- Background: `surface_container_low` to `surface_container_high` on hover
- No dividers between tracks - use 16px or 24px vertical spacing
- Album art can overlap container edges for organic feel

### Navigation
- Use `surface_container` for sidebar separation
- Active states use `primary` (#bbc3ff) 
- No sharp borders, tonal shifts only

### Player Controls
- Floating design with glassmorphism
- Progress bar: gradient with glow effect
- Use `tertiary` for play state indicators

### Search & Input
- Background: `surface_container_highest`
- No borders, placeholder text uses `on_surface_variant`
- Focused state: subtle primary accent

This design system creates a sophisticated, gallery-like music experience that prioritizes content discovery and elegant curation over utilitarian functionality.