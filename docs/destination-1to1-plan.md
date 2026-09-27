# Destination 1:1 plan

Status: plan, 2026-09-27. Nothing here is implemented yet.

## 1. What this is

This plan makes each Clarity screen read as its reference in `destination/` at 1:1: the same canvas, material, ink, accent, corner radii, and component anatomy. Clarity's routes, copy, data, scoring, and stores stay as they are.

It sits on top of the two existing design docs:

| Doc | Role | Relationship |
|---|---|---|
| `docs/layout-structure-plan.md` | Geometry and handling contract: where things go (CH-/TX-/CO- patterns). Written from these same six images. | **Kept.** This plan cites its pattern IDs and does not re-derive geometry. Where 1:1 needs a different layout, the row is marked **Δ layout** and names the section it overrides. |
| `docs/atmospheric-glass-design.md` | Color draft written against an older `destination/` set (Flasks per day and the metric capsules, since deleted in `39437c6`). Its palette is what `constants/colors.ts` holds today. | **Replaced** wherever the references disagree. The key names stay where they still mean the same thing. |

The missing layer is the scheme. The layout plan says "colors by role only, no hex," so it never set a color. That is why Home's geometry now matches the dashboard reference but the screen still doesn't look like it: the canvas is lilac with a dark orb, ink is plum-tinted, the sheet is milky glass, and cards are 28-radius pastel meshes. The references have a neutral pearl canvas, pure-black ink, an opaque white sheet, and 40-radius cards.

Basis is 393 × 852 pt, as in the layout plan. The references are 3072 × 4096 renders with a phone screen about 850 px wide at 1500 px display width, which works out to about 2.16 display px per pt. All hex values below were sampled from the images (8 × 8 px box averages). Hands, bezels, backgrounds, and watermarks are not inputs.

## 2. Decisions to confirm (defaults applied)

Each row is where 1:1 collides with a standing rule. The plan is written with the **default** column. Flipping a default changes only the rows it names.

| # | Collision | Reference | Standing rule | Default in this plan |
|---|---|---|---|---|
| Q1 | Numeral style | S4 draws dot-matrix digits ($42.520, $6.3k). S1, S2, S3, and S6 draw plain numerals. | Layout plan user rule 1: no dot-matrix, LED, or segment digits. | **Keep plain SF Pro Rounded numerals everywhere.** This is the plan's one deliberate non-1:1 element. No other row depends on it. |
| Q2 | Band strip colors | S1 tints its bands red, amber, and green: a quality traffic light. | `constants/metrics.ts`: a score is never colored by how good it is. | **Keep the anatomy, drop the traffic light.** Bands use `fillTranslucent`. The band that holds the marker gets `accentBg`. The marker dot is lime. |
| Q3 | Thin face | S5's lead line ("Hello Alex / Can") is a hairline face. | Only Regular, Medium, Semibold, Bold, and Heavy are bundled. Layout plan TX-02 substitutes regular + muted. | **Add `SF-Pro-Rounded-Light.otf` as `fonts.light`**, used only by the TX-02 lead (onboarding, paywall). It comes from the same Apple SF Pro Rounded package and license as the five faces already in `assets/fonts/`. If the file can't be added, keep the regular + muted substitute. |
| Q4 | Photos | S1 has an avatar, S4 has four avatar pills. | Clarity has no user photos. | **No photo slots.** Where a photo sat, a 48 identity disc with a Hugeicon takes the slot, or the slot collapses. |
| Q5 | Name in the greeting | "Hey, Stewart!" (S1), "Hello Alex" (S5). | Layout plan: `displayName` is deliberately not shown, and there is no new copy. | **Keep "Good Morning" / "Good Afternoon" / "Good Evening."** The two-line anatomy and tones match; the words stay Clarity's. |
| Q6 | Typeface | S1–S3 use a neo-grotesk. S5 uses a geometric rounded face. | `AGENTS.md`: SF Pro Rounded everywhere. | **Keep SF Pro Rounded.** Match size, tracking, weight step, and tone instead. |
| Q7 | Where lime goes | Lime marks "current / done / now" in four references: the S1 chart bubble, S3 check badges and marker, S4 sparkline dots, S2 card dot rows. | Layout plan chrome rule 2: `accent` fills only the one "go" handle per screen. | **Widen the rule.** Lime fills the go handle **and** current-value markers: cursor bubble, now-marker, met-day badge, the lit dots of a dot meter, and the band-strip marker. It is never a text color on pearl. |
| Q8 | Full-bleed chroma screens | S3, S4, and S5 paint the whole screen with a saturated mesh and white type. | Not ruled on. Today every screen uses the pale canvas. | **Yes.** Live sessions, Results, and onboarding become full-bleed mesh screens (§3). This is the single largest visual change and the core of "1:1." |

## 3. The 1:1 map

The six references come from three design families. The map below gives every Clarity screen exactly one source scheme.

| Ref | File | What it is | Scheme | Clarity screens that take the whole scheme | Pieces other screens borrow |
|---|---|---|---|---|---|
| S1 | `SnapInsta.to_772265137_…jpg` | Credit dashboard, light | **Pearl dashboard** | Home, Analytics | CH-01 top bar, CH-08 dock, CO-09 chart, CO-08 band strip |
| S2 | `SnapInsta.to_772559948_…jpg` | "Your Credits" catalog, light | **Pearl catalog** | Practice | Square white tiles (Home "Your progress"), tinted feature cards (every CO-03), CH-06/06b filter pills |
| S3 | `SnapInsta.to_772433247_…jpg` | "Paid Amount" detail, warm mesh | **Card detail** | Results | CO-06 status tiles (Home, Analytics), CO-07 split bar (Home), CH-07 folder tongue, CH-09 tray |
| S4 | `SnapInsta.to_764364248_…jpg` | "Bitcoin Challenge," teal mesh | **Teal chroma** | Scripted live session | TX-04 centered stack (Results), CH-11 triad with orb primary, glass circles on chroma |
| S5 | `SnapInsta.to_764844477_…jpg` | Assistant, green mesh | **Green chroma** | Freestyle live session, onboarding | TX-02 ask, TX-10 bubbles (AI Coach, What You Said), CH-02b squircle chip |
| S6 | `abc.png` | Flask device, frosted blue stage | **Frost stage** | Paywall | CO-10 glass stage (both live screens), CH-03 context cluster, CH-04 title + outline close, CH-10 knob on glass |

**Why S3 maps to Results.** S3 is the detail page of S2's "TD Bank" card: the same $12,340, 36 m., and 03.05.2024. Tapping a tinted card opens a screen painted with that card's mesh. Clarity's version: a passage card's mesh carries through the session into Results. So the canvas of a scripted live session and its Results is the passage's mesh, not one fixed color. For that to still look like the references, passage artwork is retuned onto the six reference meshes (§5.2). The default passage uses teal, so a first-run user sees S4 literally.

Sign-in, Settings, the passage editor, Manage subscription, and the word-detail sheet are forms. They take the pearl scheme (S1/S2 surfaces) with no mesh.

## 4. What the references measure

### 4.1 Pearl (S1, S2)

| Role | Sampled | Today in `colors.ts` (light) | Gap |
|---|---|---|---|
| Canvas base | `#E3E8EE` cool top-left, `#ECEBF0` center, `#EDE4DD`/`#EBE6DF` warm right edge | `#EEEDF3` lilac, plus rose/lilac/blue fog pools and a dark orb mask | Canvas needs to be neutral-cool with a faint warm edge. No rose pool, no orb. |
| Sheet / card | `#FFFFFF` opaque | Home sheet is `GlassSurface tint="strong"` (translucent milk). Cards are `card` `#FFFFFF`. | Sheet becomes opaque white. |
| Ink | `#060606`–`#0D0D0D` neutral | `foreground` `#16131D` (plum) | Neutral near-black. |
| Muted ink | `#898D90` (S1 line 2), `#8A898E` (S2 placeholder), `#9C9C9C` (S2 "/38") | `secondary` `#55515F`, `tertiary` `#76727F` | Neutral gray. The reference gray fails contrast (2.7:1 on canvas), so §5.1 darkens it just enough to pass. |
| Hairline ring (outline circle, search field, ghost pill) | `#D3D4D9`, `#D6D5DA`, `#CACDD2`, `#E1E1E1`, `#E3DFDE` | `outline` `rgba(22,19,29,0.18)` | Lighter: about 12–14% black. |
| Tinted disc (↗ on a card) | `#F5F5F5` on white, `#D7D7D7` on the sheet | `fillTranslucent` `rgba(28,22,48,0.06)` | Close. Neutralize the hue. |
| Solid / selected | `#0D0D0D` (filter pill, dock disc, card action disc) | `inverseSurface`/`tabHighlight` `#17141F` | Neutral near-black. |
| Dock tray | `#F9F9F9`–`#FFFFFF`, unselected ring `#E5E5E5` | Glass tray, `outline` rings | Lighter tray, lighter rings. |
| Lime | `#DFFF31`–`#DFFE34` (S3 badge and marker), `#C6E364` (S4 dot, under grain) | `accent` `#D6FF4A` | Within a few ΔE. **Keep `#D6FF4A`.** |
| Warning badge | `#E19A03` amber, `#CE4404` red | none | No Clarity data backs a warning, so it is not used (§2 Q4 applies: the slot collapses). |

Geometry on pearl, measured:

| Element | Measured | Layout plan today | Gap |
|---|---|---|---|
| Square card (S2 white tile, S2 TD card) | ≈ 278 × 280 pt, continuous corner extent ≈ 58 pt, which is **radius ≈ 38–40** | CO-02L / CO-03 271 × 271, `xl` 28 | **Radius 40** (§5.3). Size already matches. |
| Every circle, capsule, pill, and search field | 110 px ≈ 50 pt → **48** module | 48 | Matches. |
| Filter pill | 48 tall, hugs label, `#0D0D0D` selected / hairline ghost | CH-06b | Matches. |

### 4.2 Chroma meshes (S2 cards, S3, S4, S5, S6)

White ink contrast is given for each stop, because it decides where text may sit.

| Mesh | Deep (text zone) | Base | Glow | Bloom | Notes |
|---|---|---|---|---|---|
| **Teal** (S4) | `#024A5C` (9.8:1) | `#16999B` (3.5:1) | `#45DAC8` aqua (1.7:1) | `#DFA0A1` rose (2.2:1), lilac trace `#D1C3EA` | Deep band across the top third. Aqua bloom center-left at ≈ 55% height. Rose bloom bottom-center at ≈ 78%. Foot `#40756F` at the bottom edge. |
| **Green** (S5) | `#0B3107` top-right (14.4:1) | `#287808` (5.6:1) | `#86CC19` lime (2.0:1) | `#AAD339` pale lime (1.7:1) | Darkest corner top-right. Bright band center-left. Lime-yellow bottom-center. |
| **Dusk** (S3) | `#504621` olive (9.4:1) | `#986234` amber (5.1:1) | `#AE7556` (3.8:1) | `#C5A399`/`#BF7571` rose (2.3–3.5:1) | Olive top-left, amber center, rose right and bottom-right. |
| **Olive** (S2 TD card) | `#2B3505` (13.0:1) | `#5A682A` (6.1:1) | `#C4DD68` (1.5:1) | `#91A83D` | Dark top-left, luminous bottom-center/right. |
| **Rose** (S2 second card) | `#956561` (4.9:1) | `#A2806E` | `#C1A57E` peach-gold | `#B17C79` | Mauve top, gold foot. |
| **Blue** (S6) | `#153351` navy (12.9:1) | `#3E6D8E` (5.6:1) | `#8EB6C9` (2.2:1) | `#52A5C9` frost cyan | Navy low center, pale cyan frost at the top. |

The rule every chroma reference follows: **white ink lives in the Deep and Base regions. The luminous Glow and Bloom regions carry only opaque white objects (pills, bubbles, tiles) with dark ink inside.** S4's white pills sit exactly over the aqua bloom, and S5's bubbles sit over the lime. The one exception is S3, which prints "Updates" and "Left To Pay" in white on rose at 2.3:1. The retuned dusk mesh darkens that pool (§5.2) rather than copying the failure.

Objects on chroma, measured:

| Element | Measured | Target |
|---|---|---|
| Glass circle (S4 sides, S5 back chip) | Frosted white ≈ 15–20% over the mesh, blur, hairline rim | `GlassSurface` on iOS 26. Fallback `rgba(255,255,255,0.18)` fill + `rgba(255,255,255,0.35)` hairline. |
| Opaque pill, bubble, card (S4 pills, S5 bubbles, S3 tray primary) | `#FFFFFF` / `#EDEDED`, ink `#111111` | White solid, `foreground` ink. **On chroma, "solid" means white, not black.** |
| Translucent tile (S3 months) | White ≈ 10–14% over the mesh, hairline ≈ 20% white; the missed tile is a darker glass | `rgba(255,255,255,0.12)` + `rgba(255,255,255,0.22)` hairline |
| Grain | Clearly visible on S4, S5, and the S2 cards | `atmosphere.grain.mesh` (0.10 / 0.12) today. Tune in QA toward 0.12–0.14 for full-bleed. |

### 4.3 Type

| Ref | Role | Measured | Clarity step |
|---|---|---|---|
| S1 | Greeting, 2 lines | ≈ 34 pt, regular, line 1 ink, line 2 muted | TX-01 `largeTitle` 34/40. Matches. |
| S1 | Hero numeral "730" | ≈ 80 pt regular, tight tracking | `numeralHero`. Matches. |
| S2 | "24/38", "23%" | ≈ 56 pt, denominator ≈ 28 muted on the same baseline | `numeralLarge` + `numeralUnit`. Matches. |
| S2 | Card title "Payments on Time" | ≈ 20 pt regular | `title3` with `weight="regular"`. Matches. |
| S5 | "Hello Alex / Can **I help you?**" | ≈ 34 pt, hairline lead, bold payload | TX-02. The lead needs `fonts.light` (Q3). |
| S4 | Centered title "Bitcoin Challenge" | ≈ 20 pt regular, white | CH-02 `title3`. Matches. |

Type is already close. The gap is almost entirely ink color (plum → neutral) and the missing light face.

## 5. Token changes (`constants/`)

One PR, additive where possible. Every new key goes into **both** `light` and `dark`, or `colors.ts` will not compile (`dark` is `Record<keyof typeof light, string>`).

### 5.1 Pearl retune: existing keys, new light values

These are changes, not additions. They move every light-mode screen at once, which is the intent: the whole app shares one pearl.

| Key | Light today | Light 1:1 | Why |
|---|---|---|---|
| `background`, `atmosphereCanvas` | `#EEEDF3` | `#E8EAEE` | S1/S2 canvas average |
| `canvasFog` (top pool) | rose `rgba(236,170,200,0.50)` | cool `rgba(214,224,236,0.60)` | S1 top-left `#E3E8EE` |
| `canvasFogCore` | lilac `rgba(206,190,246,0.60)` | `rgba(236,235,242,0.70)` | S1 center `#ECEBF0` |
| `canvasFogLow` | blue `rgba(190,214,240,0.55)` | warm `rgba(240,228,218,0.60)` | S1/S2 right edge `#EDE4DD` |
| `foreground`, `onAtmosphere` | `#16131D` | `#0D0D0D` | Sampled ink |
| `secondary` | `#55515F` | `#63676C` | Reference hue at ≥ 4.5:1 on every canvas pool and on white (4.53–5.7). The literal `#898D90` is 2.7:1. |
| `tertiary` | `#76727F` | `#7A7E83` | Muted ≥ 24 pt (TX-01 line 2). ≥ 3.25:1 everywhere, so it passes the large-text bar. |
| `onAtmosphereMuted` | `rgba(22,19,29,0.62)` | `rgba(13,13,13,0.60)` | Neutral hue, same job |
| `outline` | `rgba(22,19,29,0.18)` | `rgba(13,16,24,0.14)` | Sampled rings `#D3D4D9`–`#CACDD2` |
| `divider` | `rgba(22,19,29,0.08)` | `rgba(13,13,13,0.07)` | Neutral hue |
| `fillTranslucent` | `rgba(28,22,48,0.06)` | `rgba(13,13,13,0.05)` | S2 ↗ disc `#F5F5F5` on white |
| `inverseSurface`, `tabHighlight`, `ctaTrack` | `#17141F` | `#0D0D0D` | Sampled solid |
| `frostFallback` | `rgba(255,255,255,0.58)` | `rgba(255,255,255,0.72)` | S1 dock tray reads near-white |
| `accentBg` | `rgba(214,255,74,0.45)` | unchanged | Used for the band holding the marker (Q2) |

Dark pearl has no reference, because all six are light or self-lit. Derive it from the light retune in the dark-polish PR (§8, PR 12): neutral graphite rather than plum, so both modes share one hue family. Until then, dark keeps today's values.

### 5.2 Six chroma meshes: new keys

Four stops each. The **same values go in both `light` and `dark`**, because a mesh is self-lit artwork, like `onArtwork` today.

| Keys | Deep | Base | Glow | Bloom |
|---|---|---|---|---|
| `meshTeal*` | `#024A5C` | `#1A8F96` | `#45DAC8` | `#DFA0A1` |
| `meshGreen*` | `#0B3107` | `#287808` | `#86CC19` | `#AAD339` |
| `meshDusk*` | `#504621` | `#8A6236` | `#AE7556` | `#A0685F` (S3's rose darkened to 4.5:1 so labels can sit on it) |
| `meshOlive*` | `#2B3505` | `#5A682A` | `#C4DD68` | `#91A83D` |
| `meshRose*` | `#7E5452` | `#A2806E` | `#C1A57E` | `#B17C79` |
| `meshBlue*` | `#153351` | `#3E6D8E` | `#8EB6C9` | `#52A5C9` |

Also new, for objects on chroma:

| Key | Both schemes | Role |
|---|---|---|
| `frostOnMesh` | `rgba(255,255,255,0.18)` | Glass-circle fallback fill and translucent tiles on chroma |
| `frostRimOnMesh` | `rgba(255,255,255,0.35)` | Its hairline |
| `tileOnMesh` | `rgba(255,255,255,0.12)` | S3 status tile |
| `solidOnMesh` | `#FFFFFF` | Solid pill, bubble, or disc on chroma |
| `onSolidOnMesh` | `#0D0D0D` | Ink on it |

Pool geometry is per mesh and belongs in `constants/atmosphere.ts` as `atmosphere.mesh.<name>`: a list of `{ stop, cx, cy, rx, ry }` in fractions of the surface. This follows the "one gradient per View, px radii resolved from `onLayout`" rule already in `atmosphere-surface.tsx`. Positions come from §4.2 (for example, teal: Deep band `cy 0.15`, Glow `cx 0.35 cy 0.55`, Bloom `cx 0.5 cy 0.78`).

**Artwork resolves to a mesh key.** `Passage['artwork']` today is `{ base, blob }` raw `rgba()` pairs, spread over `constants/passages.ts`, `constants/drills.ts`, `services/user-passages.ts` (`ARTWORK_PRESETS`, persisted per custom passage), `services/practice-generation.ts`, and `lib/recommendations.ts` (`FREESTYLE_ARTWORK`). Add a `mesh: MeshName` field to built-in content and assign:

| Content | Mesh |
|---|---|
| Passages, in list order | teal, olive, dusk, rose, blue |
| Drills | the same five, round-robin |
| Freestyle (card, live, results) | green |
| Generated word-practice passage | olive |
| Custom passages | round-robin over teal, olive, dusk, rose, blue |

Custom passages keep storing `{ base, blob }`. Convex validates that exact shape (`convex/schema.ts` line 93, `assertStops` in `convex/passages.ts`), so changing the stored shape would mean a schema migration. Instead, a pure `meshFor(passage)` helper in `lib/` resolves the mesh at render time: built-in content returns its `mesh` field; a custom passage whose artwork equals one of the `ARTWORK_PRESETS` returns that preset's mesh; anything else hashes the passage id onto the five. No Convex or storage change is needed. The raw `rgba()` values in built-in content can then be deleted.

### 5.3 Radius

| Key | Today | 1:1 | Users |
|---|---|---|---|
| new `xxl` | none | **40** | Every square card: CO-02L, CO-03, S2 tiles, the Analytics CO-09 card if boxed |
| `hero` | 36 | **44** | Sheet top corners and the CO-10 stage. The sheet holds 40 cards inset 12, so 44 keeps it visually concentric (the layout plan's "within 3 pt"). Today's only callers are those two: the Home sheet in `app/(tabs)/index.tsx` and the stage in `components/session/practice-controls.tsx`. |
| `xl` | 28 | unchanged | Stays for compact cards (CO-02S 172.5 × 196) |

Update the ladder note in `constants/radius.ts` and the layout plan's §4 radius row in the same PR.

### 5.4 Fonts and type

- `constants/fonts.ts`: add `light: 'SFProRounded-Light'` (Q3). Add the file to `constants/font-assets.ts` and to the `expo-font` plugin list in `app.json`.
- `constants/typography.ts`: no new steps. TX-02's lead passes `weight="light"`.

### 5.5 `constants/atmosphere.ts`

- `atmosphere.mesh.*` pool geometry (§5.2).
- `grain.canvas` light 0.06 → **0.04**: the S1 canvas grain is barely visible.
- `fog`: unused on pearl once the orb is removed (§6.1). Keep the keys until PR 13 cleanup.

## 6. Primitive changes (`components/ui/`)

Extraction follows the `AGENTS.md` rule: two or more screens, a nameable role, an API smaller than the implementation.

### 6.1 `AtmosphereCanvas`: gains `scheme`

```tsx
<AtmosphereCanvas scheme="pearl" />          // Home, Practice, Analytics, forms (default)
<AtmosphereCanvas scheme={passage.mesh} />   // live sessions, Results
<AtmosphereCanvas scheme="green" />          // onboarding
```

- `pearl`: base + three subtle pools (§5.1). **No orb mask.** Grain `grain.canvas`.
- A mesh name: full-bleed mesh with the §5.2 geometry, grain `grain.mesh`. Also sets the status bar to `light` (`expo-status-bar`); pearl sets `dark`.
- The existing `mode="stage"` stays for the live screens' reading band, applied on top of the mesh.

### 6.2 `AtmosphereSurface`: mesh keys replace family pastels

`mesh` accepts the six `MeshName`s. The `hero | minutes | sessions | streak | mastered` families go away with their consumers: Home's progress tiles become white (§7.2), and Analytics' `MetricCapsule`s are replaced by CO-02S. `artwork` is gone (§5.2). Radius default becomes `xxl`.

### 6.3 New `Sheet`

This qualifies for extraction: Home, Practice, Analytics, and Results all host one, the role is nameable, and the API is `{ surface: 'pearl' | 'mesh', children }`.

- `pearl`: opaque `card` fill, top corners `hero` 44, bottom square and bled past the scroll end (as `app/(tabs)/index.tsx` does now). **Not glass.** This lifts the "nothing inside the sheet may be glass" constraint on pearl screens.
- `mesh`: the Results tongue sheet (S3). `tileOnMesh` fill with a `GlassSurface` absolute sibling on iOS 26, carrying the CH-07 tongue silhouette.
- Moves the sheet code out of `app/(tabs)/index.tsx`.

### 6.4 New `ControlDisc`

This qualifies for extraction: 10+ call sites across every screen class. It is the one 48 circle with five fills:

| `fill` | Look | Where |
|---|---|---|
| `outline` | Transparent, `outline` hairline, ink glyph | CH-01 settings (S1), CH-04 close, card identity disc (S2) |
| `tinted` | `fillTranslucent`, no rim | Card ↗ / speaker disc (S2) |
| `solid` | `inverseSurface` on pearl, `solidOnMesh` on chroma | Card action disc (S2), dock selected |
| `glass` | `GlassSurface` circle; fallback `frostOnMesh` + `frostRimOnMesh` | CH-02 on chroma (S4), CH-11 sides |
| `accent` | Lime + `onAccent` glyph | CH-10 handle on pearl |

`size` is `48 | 64 | 80`, with only CH-02b and CH-11 passing the larger sizes. Replaces the hand-rolled discs in `header-actions.tsx`, `home/passage-rail.tsx`, `home/progress-rail.tsx`, `words-to-master.tsx`, and the session bars.

### 6.5 Unchanged or retired

- `GlassSurface`: unchanged. On 1:1 screens it appears only on the dock, chroma circles, the Results tongue, the CO-10 stage, and the paywall slab.
- `PrimaryButton`: `knob` gains `on: 'pearl' | 'mesh'`. The handle is lime on pearl and white on glass or mesh (S6 "Start Cycle"). `solid` on mesh renders `solidOnMesh`.
- `LedNumber`, `MetricCapsule`, `constants/led-digits.ts`, `TickBar`/`TickGauge`, `@tanstack/charts`: deleted in PR 13, once Analytics and Results no longer import them (Q1 default).

## 7. Screen by screen

Each screen PR implements its layout-plan section **and** its scheme together. Only Home's layout is built today; the other screens still predate the layout contract, so doing both in one pass avoids touching every file twice. "Match" lists the visible traits a side-by-side check must find (§9).

### 7.1 Root chrome: CH-01 top bar and CH-08 dock (S1)

| Change | Files |
|---|---|
| CH-01 settings and streak become `ControlDisc fill="outline"` / an outline capsule on the pearl canvas, not glass. **Δ layout** (Dock and root top bar, CH-01: "Glass, GlassContainer gap 8"). S1's circles are hairline and unfilled. | `components/header-actions.tsx` |
| Dock tray is `GlassSurface tint="strong"` over pearl. The fallback is `frostFallback` (now near-white). Unselected circles use the lighter `outline` ring with an **ink** glyph; today they use `onAtmosphereMuted`. The selected disc is `#0D0D0D`. | `components/glass-tabs/glass-tab-bar.tsx` |
| Practice and Analytics drop `useMinimizeOnScroll` and `TAB_BAR_SCROLL_INSET` and adopt the 114 inset, as Home already did. | `app/(tabs)/practice.tsx`, `app/(tabs)/analytics.tsx`, `components/placeholder-screen.tsx` |

Match: hairline circles with no fill at the top. The dock is a near-white stadium with one black disc and hairline peers with ink glyphs.

### 7.2 Home (S1, with S2 cards and S3 tiles)

| Zone | 1:1 change |
|---|---|
| Canvas | `scheme="pearl"`: no orb, neutral pools. |
| TX-01 greeting | Colors only: line 1 `#0D0D0D`, line 2 `tertiary` `#7A7E83`. |
| TX-05 goal row | Ink retune. The CO-12d gauge arc stays ink. |
| CO-07 split bar (S3) | Done segment `accentBg` fill + lime ◉ pip. Left segment `fillTranslucent` + hairline ◯ pip. The now-marker head **and a 1 pt lime line through the gap** (S3). Today the head is ink with no line (Q7). |
| CH-10 "Start Practicing" | Unchanged: 64 stadium, lime handle on the right. |
| Sheet | `Sheet surface="pearl"`: opaque white, radius 44. Replaces the `GlassSurface` block in `app/(tabs)/index.tsx`. |
| CO-06 week tiles (S3) | Met badge = **lime fill + `onAccent` tick** (today: `positive` green). Not met = hollow `track` ring (no ×; Home can't call a day failed). Today's tile gets an ink rim; tomorrow is outline only. Tile radius stays `sm` 12. |
| For you, CO-03 (S2 TD card) | `AtmosphereSurface mesh={passage.mesh}` at radius **40**. Action disc = `ControlDisc fill="solid"`, pinned black in both modes as on S2. The identity ring arc is white, 2 pt. Lit dots in the dot row are **lime**, unlit are `frostRimOnMesh` (S2 dot rows). |
| Your progress, CO-02L (S2 white tiles) | **Δ layout** (Home CO-02L: "Mesh family"). Tiles become **opaque white `card`, radius 40**. Identity disc is `outline`, action disc is `tinted` ↗ (`ArrowUpRight01Icon`, already imported). Numeral ink, denominator/unit muted on the baseline, title `title3` regular ink. Warning badge slot collapses (Q4). The sheet is white too, so each tile gets a `divider` hairline to separate from it. S2's tiles sit on the grey canvas; the Home sheet is white. |
| Words to master | Colors only. The speaker disc becomes `ControlDisc fill="tinted"`. |

Files: `app/(tabs)/index.tsx`, `components/home/{goal-row,passage-rail,progress-rail}.tsx`, `components/weekly-progress.tsx`, `components/words-to-master.tsx`.

Match: pale neutral canvas. Black two-line greeting with a grey second line. White sheet with big round corners. Olive/teal/rose grainy square cards with black discs and lime dots. White square stat tiles with hairline icon circles and ↗ discs. Lime check badges in the week row.

### 7.3 Analytics (S1, with S3 month tiles and S4 skill collage)

Implements the layout plan's Analytics section plus:

| Zone | 1:1 change |
|---|---|
| TX-03 hero | The "+6 pts" form: delta `callout` above an unlabeled `numeralHero` ink, caption stack bottom-aligned on the numeral baseline. CH-05b period dropdown as an **outline** 48 capsule with a chevron (S1 "Transunion ⌄"). Replaces `SegmentedControl`. |
| CO-08 band strip (S1) | Four equal soft rounded bands (`sm` 12) with gutters of 4. Fills per Q2. Scattered history dots inside each band in `track`. The latest point is a lime dot with a lime ring. A black ▼ marker with a 1 pt ink line. Threshold labels 60 / 75 / 90 muted; the marker value is ink. |
| Sheet | `Sheet surface="pearl"`. |
| CO-09 chart (S1 "Credit History") | Header: outline identity disc + `title3` title + "avg NN" right (the layout plan's lock; no ↗, since there is no route). Plot: y labels `footnote` muted in a left gutter, **dashed** gridlines `chartGrid`, series line 1.5 pt ink with small ink vertex dots, faded ghost series in `track` for the previous period if the data exists (otherwise omitted), **lime 48 bubble** with the value in `onAccent`, dotted drop line to an ink ▲ at the base, date `footnote` muted under it. |
| Skills, CO-05 (S4 pill collage) | Expanded skill is an opaque white card, radius 40. Compacts are white 64 stadiums. The identity disc sits where S4's avatar sat. |
| Effort, CO-06 month (S3) + CO-02S | 6 × 5 month tiles, lime met badges. CO-02S white tiles replace `MetricCapsule`. |
| Records, CO-11 | Colors only. |

Files: `app/(tabs)/analytics.tsx`, `components/analytics/*`, `components/metrics/skill-card.tsx`, `components/metrics/skill-row.tsx`.

Match: S1's top half (delta over a big black numeral, caption stack, outline dropdown), the soft band strip with a black marker, and a white sheet with a dashed-grid line chart and a lime value bubble.

### 7.4 Practice (S2)

Implements the layout plan's Practice section plus:

| Zone | 1:1 change |
|---|---|
| For you, Drills | CO-03 mesh cards per §7.2. |
| Your passages | CO-11 rows. Each row's leading thumb is a 48 `AtmosphereSurface` circle in the passage's mesh. |
| Category library | CH-06b pills: `#0D0D0D` selected, hairline ghost others, 48 tall, hugging their labels (S2 "All Credits / Active"). **Δ layout** (Practice: "CH-06b + CO-11"). In S2 the pills control a **1-up carousel of mesh cards**, not rows. Proposed: the library renders the selected category as a CO-04 carousel of CO-03 cards. Needs your sign-off, because it changes how many passages are visible at once. |
| Search capsule | S2 has one. Clarity has no search, so it is **not added**; that would be a feature. |

Files: `app/(tabs)/practice.tsx`, `components/practice/*`, `components/passage-carousel.tsx` (its local `CARD_TINT` map also goes; see the anti-pattern table in the glass doc).

Match: black/ghost filter pills directly above a row of big grainy tinted cards with black discs.

### 7.5 Scripted live session (S4 canvas, S6 stage)

| Zone | 1:1 change |
|---|---|
| Canvas | `AtmosphereCanvas scheme={passage.mesh}` plus `mode="stage"`. Default passage = teal. Status bar light. |
| CH-02 top bar | `ControlDisc fill="glass"` close (left) and Aa (right), 48. Center empty. |
| Teleprompter | Reading text `onAtmosphere` (white on mesh), past text `onAtmosphereMuted`, the live word on a lime chip with `onAccent` ink. Reading sizes stay in `constants/session-theme.ts`. |
| CO-10 stage (S6) | Glass panel, radius 44, inset 8, docked at the bottom. Side readouts are S6's flanking numerals: large numeral over a muted caption, mirrored to the outer gutters (WPM left, time right). The waveform is centered. |
| CH-11 triad (S4) | Restart and pause are `ControlDisc fill="glass"` 48. The finish disc is 80: ghost `fillTranslucent` outer disc, inner 64 **lime core** (Q7 go handle) with S4's iridescent ring as an SVG circle stroked with a `LinearGradient` (react-native-svg `Defs`), stops from `meshTealBloom` → `accent` → `meshTealGlow`. No Skia. |

Files: `app/session/[passageId].tsx`, `components/session/{session-top-bar,teleprompter,practice-controls,live-wpm,live-waveform}.tsx`, `constants/session-theme.ts` (colors only).

Match: the whole screen is the passage's saturated mesh with grain, frosted circles at the top, white reading text, a frosted stage at the bottom with big flanking numbers, and a three-button row with a larger glowing center.

### 7.6 Freestyle live session (S5)

| Zone | 1:1 change |
|---|---|
| Canvas | `scheme="green"`. |
| Top bar | CH-02 per the layout plan (glass circles, Aa trailing). S5's squircle chip is onboarding's CH-02b and is not reused here. |
| Prompt | TX-10 white bubble, left, radius `lg` 24, `onSolidOnMesh` ink, before the first committed words. |
| Live transcript | Committed words as a right-anchored white bubble (S5 "Show me information…"), pending state as S5's three-dot white bubble on the left. **Δ layout** (Freestyle live) if the plan's transcript is not bubble-shaped today. |
| Waveform | **Δ layout** ("live waveform stays round-cap bars"). S5's bottom edge is 3–5 overlapping thin white sine paths at 40–70% alpha, amplitude-driven through Reanimated animated props on SVG `Path`. Keep the bars behind a flag until the line version is measured on a low-end device. |
| CO-10 / CH-11 | As in §7.5, on green. |

Files: `app/session/freestyle.tsx`, `components/session/{live-transcript,live-waveform}.tsx`.

### 7.7 Results (S3 canvas and sheet, S4 stack)

| Zone | 1:1 change |
|---|---|
| Canvas | `scheme` = the session's mesh (passage mesh, or green for freestyle). |
| CH-02 | Glass circles, centered title (the existing string). |
| TX-04 stack (S4) | Muted eyebrow, `numeralHero` white, band word + delta, sparkline as a 1.5 pt white line with white vertex dots and **lime** on the latest point, then a dotted `frostRimOnMesh` rule. |
| Playback pill | Stays on the canvas as a glass stadium. |
| Sheet with CH-07 tongue (S3) | `Sheet surface="mesh"`. Labels share one baseline. The selected label sits on the tongue. Unselected labels are `onAtmosphereMuted` with no pill. |
| AI Coach, TX-10 (S5) | White bubbles, radius 24, dark ink, no tails. |
| Word Breakdown | Words on `tileOnMesh` chips. Verdict colors stay (existing rule). |
| Skills, CO-05 | White pill collage as in §7.3. |
| CH-09 tray (S3) | 64 glass stadium. Ghost pill leading, **white solid** pill trailing (on chroma, solid = white). |

Files: `app/session/results.tsx`, `components/session/{score-gauge,results-footer,playback-pill,ai-coaching-card,word-breakdown,transcript-card}.tsx`. `score-gauge.tsx` loses its tick ring.

Match: the practiced card's mesh fills the screen. A centered white score with a sparkline and dotted rule. A translucent sheet whose selected tab is a raised tongue. White chat bubbles. A floating two-pill tray with a white primary.

### 7.8 Onboarding (S5)

| Zone | 1:1 change |
|---|---|
| Canvas | `scheme="green"` on all five steps. |
| CH-02b | 64 squircle glass back chip, radius `lg` 24. Progress dots white / `frostRimOnMesh`. |
| TX-02 | Lead `largeTitle` **`weight="light"`** white. Payload `weight="bold"` white. One switch at a word boundary. |
| Choices | CO-11 rows become white opaque pills/cards, radius 24, ink text. Selected gets an ink rim + `SelectionMark`. |
| Sticky CTA | White solid 64 capsule, ink label. |
| Name field (CH-05a) | White field, ink text, 1 pt ink rim when focused. |

Files: `app/(onboarding)/*`, `components/onboarding/*`, `components/ui/option-card.tsx`.

### 7.9 Paywall (S6)

| Zone | 1:1 change |
|---|---|
| Canvas | Pearl. |
| CH-03 context cluster | Centered: 48 identity circle (SpeechMark) + 48 frost name pill ("Clarity Pro"), gap 8. |
| Slab | `AtmosphereSurface mesh="blue"` with a `GlassSurface` absolute-fill sibling over it, radius 44. Title left white, CH-04 outline close right with a white hairline ring. |
| Prices | S6's mirrored readouts: large numeral over a muted caption. Store-localized prices are never split. |
| CH-10 | Docked in the slab: frosted capsule, label left, **white** 48 handle (`PrimaryButton knob on="mesh"`). |

Files: `app/paywall.tsx` (its duplicate `PRO_GOLD` goes too).

### 7.10 Forms: sign-in, settings, passage editor, manage subscription, word detail

Pearl canvas, white cards (`xl` 28 for compact groups, `xxl` 40 for any square card), CH-04 outline close, black solid CTAs, CH-06 black/ghost pills (editor Slow / Natural / Brisk), outline 48 fields. There is no mesh on these screens. Word detail keeps its form sheet.

## 8. Build order

Each PR leaves the app shippable. PR 1 changes every light screen's colors at once. That is accepted: a half-pearl app looks worse than an all-pearl one.

| PR | Scope | Depends on | Done when |
|---|---|---|---|
| 1 | Tokens: pearl retune (§5.1), six meshes + on-mesh keys (§5.2), `radius.xxl` + `hero` 44 (§5.3), `fonts.light` (§5.4), `atmosphere.mesh` (§5.5) | — | Typecheck passes. Drift audit unchanged. Every light screen is neutral. |
| 2 | Primitives: `AtmosphereCanvas scheme`, `AtmosphereSurface` mesh keys, `Sheet`, `ControlDisc`, `PrimaryButton knob on`; `mesh` on built-in content + `meshFor()` for custom passages | 1 | Home, Practice, and Analytics render with no visual regressions. An existing custom passage renders with a mesh. |
| 3 | Root chrome (§7.1) | 2 | Top bar and dock match S1. |
| 4 | Home (§7.2) | 3 | Side-by-side with S1/S2 passes §9. |
| 5 | Analytics (§7.3) | 3 | Passes vs S1. `SegmentedControl` and `MetricCapsule` are no longer imported here. |
| 6 | Practice (§7.4), with the library-carousel Δ only after sign-off | 3 | Passes vs S2. |
| 7 | Scripted live (§7.5) | 2 | Passes vs S4 on the teal passage. The teleprompter reads at every text size. |
| 8 | Freestyle live (§7.6); the waveform lines ship behind a flag | 7 | Passes vs S5. |
| 9 | Results (§7.7) | 7 | Passes vs S3 + S4, scored and unscored. |
| 10 | Onboarding (§7.8) | 2 | Passes vs S5 on all five steps. |
| 11 | Paywall + forms (§7.9, §7.10) | 3 | Passes vs S6 / pearl. |
| 12 | Dark pearl derivation, Android no-glass pass, reduced transparency | 4–11 | Every screen is legible in dark mode, on Android, and with reduce transparency. |
| 13 | Cleanup: delete `LedNumber`, `MetricCapsule`, `led-digits.ts`, tick meters, `@tanstack/charts`, unused `fog` keys, `useMinimizeOnScroll` if nothing calls it | 5, 9 | Grep shows no importers. `bun run typecheck` passes. |

PRs 4–6 can run in parallel after 3. PRs 7 and 10 can start right after 2.

## 9. Verifying 1:1

1. **Reference board.** For each screen, pair the reference with a simulator capture of the same state on a 393 × 852 device (iPhone 15/16 Pro, iOS 26 so liquid glass renders). The references are perspective shots, so compare feature by feature using each §7 "Match" list, not by pixel overlay.
2. **Color spot-check.** Sample the capture at the same roles as §4 (canvas, ink, muted, ring, solid, each mesh stop). Pearl roles should land within a few ΔE of the §5.1 targets, and mesh pools should visibly sit where §4.2 places them.
3. **Contrast.** White on each mesh is ≥ 4.5:1 wherever text < 24 pt sits, and ≥ 3:1 for ≥ 24 pt. The §4.2 table gives each stop's ratio. No text goes on a Glow or Bloom pool.
4. **Drift audit** (`AGENTS.md`): the five greps stay at today's baseline. Today that is one hex-grep hit, and it is a false positive: the issue number `expo/expo#41024` in a comment in `components/glass-tabs/fading-tab-slot.tsx`. Hex values go only into `constants/`.
5. **`bun run typecheck`**, both programs.
6. **Fallbacks:** Android (no liquid glass) shows the `frostOnMesh`/`frostFallback` looks. Reduce Transparency unmounts grain only. Reduce Motion jumps the sweeps. Dark mode is checked on every screen after PR 12.
7. **Behavior unchanged:** every route, haptic, accessibility label, loading state, and alert listed in the layout plan's Handling tables still holds.

## 10. Risks

| Risk | Mitigation |
|---|---|
| The pearl retune in PR 1 shifts every light screen before its layout PR lands. | Accepted. PR 1 changes only values, not structure, so screens stay coherent. |
| White ink on a luminous pool fails contrast. | §4.2 rule: text only in Deep/Base regions. Contrast check in §9.3. |
| The `experimental_backgroundImage` mesh may not paint on some Android builds. | Keep the `backgroundColor: Base` underlay (already the pattern in `AtmosphereSurface`), so a no-paint path is still the right hue. |
| Line waveform cost on low-end devices. | Ships behind a flag (PR 8), and the bars remain. |
| Custom-passage artwork is stored and validated as `{ base, blob }`. | Resolved to a mesh at render time by `meshFor()` (§5.2). The stored shape, the Convex schema, and sync stay untouched. |
| Several **Δ layout** rows override the approved layout contract. | Each is marked, and the layout plan is updated in the same PR that ships it. The Practice library change (§7.4) waits for explicit sign-off. |
| Q1–Q8 flipped later. | Each default is isolated to the rows it names. |
