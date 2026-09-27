# Layout structure plan

## 1. Status

Date: 2026-09-24.

This is a layout-structure plan. It specifies handling, text placement, and component interiors for the phone UI. It does not change routes, scoring, Convex, Clerk, speech, or copy.

An implementer can follow this file alone. Session notes are inlined here. Color tokens in `docs/atmospheric-glass-design.md` are not this plan. That draft's layout and LED-numeral decisions are superseded by this file.

Basis used by every map below: 393 × 852 pt, `insets.top` 59, `insets.bottom` 34. y is at scroll 0 unless a zone says it grows. Modal y is in that same frame with the iOS page-sheet top at y 0. Android full-screen shifts a modal header to y 67 (`insets.top + 8`); everything under it shifts by the same 51.

## 2. Rules

### User rules

1. Do not copy or recommend dot-matrix, LED, or segment digits. Numerals are plain SF Pro Rounded, regular, `tabular-nums`, through `ScoreValue` or `ThemedText`. Dots are progress or status markers only. They never form glyphs.
2. Phone UI only. Hands, backgrounds, watermarks, and the bezel are not design input.
3. The plan is layout: handling, text placement, component interiors. Colors by role only. No hex.

### Locks

These close the grammar drafts. Do not reopen them.

- **CO-08 score strip** uses the real bands from `constants/metrics.ts` `SCORE_BANDS`: Building min 0, Steady min 60, Strong min 75, Orator min 90. Four equal visual widths, 4pt gutters. Threshold labels are 60, 75, 90 under the gutters. The current marker value is ink. Do not draw 0 or 100 (band names mark the ends). Hide a threshold label whose center is within 28pt of the marker. This replaces TX-11's 0 / 60 / 75 / 90 / 100 row and its 8pt collision rule for this strip. TX-11(b) is not drawn as specified in the draft.
- **"avg NN" has one home:** the CO-09 chart header, right side, "avg" muted + number ink, `subhead`. Do not also draw it above the average line. TX-11(a)'s caption-12 plot-corner label is not drawn.
- **Dock** is icon-only, no minimize-on-scroll. Existing tab icons stay: `Home07Icon`, `AudioLinesIcon`, `Chart02Icon`. Do not rename them. Visible labels "Home" / "Practice" / "Analytics" become `accessibilityLabel` only.
- **Results tabs:** AI Coach (default) | Word Breakdown (freestyle: What You Said) | Skills. Playback stays on the Results canvas. Analytics has no folder tabs.
- **No new copy.** Existing strings only. A slot with no existing string is omitted.

### Chrome decisions

| # | Decision |
|---|---|
| D1 | Dock = icon-only circle dock (CH-08). Three 48 circles in a 176 × 64 glass stadium, centered. No labels and no minimize-on-scroll. Scrub and haptics are kept. Icons stay `Home07Icon`, `AudioLinesIcon`, `Chart02Icon`. |
| D2 | One control module = 48 for every circle, capsule field, pill, and in-card disc. Only two sizes exceed it: the 64 squircle chip (CH-02b) and the 80 primary disc (CH-11). |
| D3 | Every bottom bar is 64 tall: dock, two-pill tray, knob capsule, and sticky solid CTA. All share one bottom offset, `max(insets.bottom − 16, 12)`, which is 18 on a 34-inset device. Every bottom chrome sits at y 770–834. |
| D4 | Analytics period (Week / Month / All time) leaves the full-width segmented control. It becomes a CH-05b dropdown capsule in the TX-03 hero cluster's top-right slot. |
| D5 | Results lower half is a CH-07 folder-tab sheet: AI Coach (default) · Word Breakdown (freestyle: What You Said) · Skills. Playback stays on the canvas. Analytics stays one continuous sheet with the chart first. It is not a CH-07 host. |
| D6 | Knob moves right. `PrimaryButton` `knob` becomes label-left with the action circle on the right (CH-10). |
| D7 | Live session uses CH-11: restart · 80 primary finish disc · pause/resume, inside CO-10's bottom band. The session top-bar center stays empty. Freestyle keeps the Aa circle. Text-size is a live control on that screen today and must not be dropped. |
| D8 | Bottom chrome floats with no progressive-blur band (dock, tray, sticky CTA). The live session keeps its bottom blur because dense text runs behind the stage. Top progressive blur stays everywhere. |

Thumb zones on 852: top 25% is y 0–213 (exit, identity, low-frequency utilities only). Middle is y 213–639. Bottom 25% is y 639–852. The single commit action of a screen lives in the bottom 25%. Nothing destructive or committing goes in the top-right corner, except the close circle of a modal.

Chrome slice rules:

1. One module. Every tappable circle, capsule field, filter pill, tray pill, and in-card disc is 48 tall. Only the CH-02b chip (64) and the CH-11 primary (80) exceed it. Every bottom bar is 64. Nothing tappable is under 44, and no `hitSlop` is used to fake it.
2. Fill ranks actions; weight never does. Solid `inverseSurface` = the one primary or selected state per container. Tinted = secondary. Hairline outline = passive identity or dismiss. Glass = chrome container. `accent` fills only the one "go" handle on screen (CH-10 circle or CH-11 core).
3. Top 25% holds no commit. It holds exit (top-left), identity, and low-frequency utilities (top-right). The modal close is the only top-right dismiss. Each screen's commit lives in the bottom 25%, on the right half when it is a pair.
4. Bottom chrome shares one line. Dock, tray, floating knob, and sticky CTA all sit at `max(insets.bottom − 16, 12)` above the screen bottom and are 64 tall. Host scroll padding is offset + 64 + 32. Content scrolls beneath without a blur band. The top keeps its progressive blur.
5. Symmetric slots keep titles true. A bar with a centered title has equal-width side slots, with a spacer of the same size when a side is empty. Chrome sits on the 20 page margin. Bar → content gap is 48 (root, chip) or 32 (detail).
6. Selection is shape plus tone only. Filter pills, the dock, and folder tabs change fill or silhouette, and tone, never weight or size. Every selection change fires a selection haptic.
7. Icon-only controls must speak. Every control without visible text carries `accessibilityLabel`. When a visible label is removed, that existing string becomes the label. This plan invents no strings.
8. Nothing glass inside glass. Controls inside a glass tray or panel use ghost (`fillTranslucent` + hairline) or solid fills. The sheet and CO-10 are the only glass panels that hold children. CH-02 circles, the PlaybackPill stadium, and the CH-09 tray stay their own glass, with no glass nested inside them. Glass is never wrapped in an animated opacity.
9. Concentric nesting. An end-cap control's inset = container radius − control radius: 8 in a 64 capsule or tray, and 8 when docked in a 36 card. A corner control sits at the container's padding, within 3 pt of concentric.

### Text decisions

Each surface uses exactly two text tones, ink and muted. Other tones are reserved.

| Role | Canvas / card / frost | Mesh | Artwork |
|---|---|---|---|
| ink | `primary` | `onAtmosphere` | `onArtwork` |
| muted, text < 24 pt | `secondary` | `onAtmosphereMuted` | `onArtworkMuted` |
| muted, text ≥ 24 pt | `tertiary` | `onAtmosphereMuted` | `onArtworkMuted` |
| faint (missing-value dash only, ≥ 24 pt) | `numeralFaint` | `onAtmosphereFaint` | — |

Special tones, each limited to one use: `positive` (improving deltas only), `accentText` (accent as text, such as the tip number or "Try again"), `inverse` (text on solid ink fills), `onAccent` (text on lime), `focus` (the FOCUS pill), `dimmed` and `accentFaded` (reading surfaces only), `danger` (destructive settings rows).

Text slice rules:

1. Two tones per surface. Faint only marks a missing value. `positive`, `accentText`, `inverse`, and `onAccent` are role-locked.
2. Single weight. Regular for all reading text and every numeral. Medium only for labels on controls and caps/micro text. Bold only for the TX-02 payload and the wordmark. Hierarchy comes from ramp step plus tone, never from weight.
3. Numerals are plain SF Pro Rounded through `ScoreValue` with `tabular-nums`. No dot-matrix, LED, or segment digits or letters. Dotted marks are progress or status only (CO-12) and never form glyphs.
4. The numeral's baseline is the master line. Unit, caption stack, pair value, gauge value, and chord align to it. Upper lines hang above. Nothing is centered on a numeral's box.
5. Units stay on the baseline. They are demoted per TX-06 only beside `numeralTile` and larger. Symbol units hug. Word units take one space. Nothing is raised. Store-localized prices are never split.
6. Label is muted and ≤ the value's step. Value is ink. A number is named exactly once: by its container title or by its caption name line, never both.
7. One 80 pt numeral per screen. `numeralHero` appears only on the open canvas or a hero stage (TX-03 on Analytics, TX-04 on Results). Containers use `numeralLarge` or `numeralTile`.
8. One headline pattern per screen. TX-01 when the screen reports. TX-02 when the screen asks, at most once, and only with an existing emphasis suffix. A screen never uses both.
9. Headlines, greetings, numerals, and values never truncate. Titles wrap to 2 lines with a tail ellipsis. Labels and captions are single-line with a tail ellipsis and shrink first.
10. Case is presentation; words are copy. Only the `eyebrow` step renders all-caps. A string that leaves the eyebrow or pill context renders in its source case or sentence case. No string is added or reworded.

TX-11 forms that survive, after the locks:

| Form | Where | Text |
|---|---|---|
| (a) y-axis | CO-09 plot gutter | `100` / `50` / `0`, `footnote` 13 muted, left at x 20, centered on the gridlines. Plot starts x 56. |
| (a) reference line | not drawn | "avg NN" is the CO-09 header right slot, not a caption above the line. |
| (b) thresholds | CO-08 only | 60, 75, 90 under the gutters. Marker value ink. No 0, no 100. Hide a label whose center is within 28pt of the marker. |
| (c) cursor date | CO-09, under the drop | `point.detail`, source case, `footnote` 13 muted. Not shown in the TX-03 cluster. |
| (c) cursor value | CO-09 bubble | Bucket score, `callout` 16 `onAccent`. |
| (d) legend | Word Breakdown | Clear / Unclear / Skipped / Added. Dot `sm` 8, gap `xs` 4, `caption` 12 muted, `md` 12 between items. |

Type roles an implementer must not invent past:

| Text role | Pattern | Step | Tone | Weight |
|---|---|---|---|---|
| Greeting / tab title, line 1 | TX-01 | largeTitle 34/40 | ink | regular |
| Greeting line 2 | TX-01 | largeTitle 34/40 | muted | regular |
| Sign-in statement | TX-01 long | sectionTitle 24 | ink / muted | regular |
| Action headline lead | TX-02 | largeTitle 34/40 | muted | regular |
| Action headline payload | TX-02 | largeTitle 34/40 | ink | bold |
| Headline subtitle | TX-02 | subheadProse 15/21 | muted | regular |
| Chrome title | CH-02 / CH-04 | title3 20 | ink | regular |
| Section title / subtitle | TX-08 | sectionTitle 24 / subhead 15 | ink / muted | regular |
| Eyebrow | TX-03 / 04 / 05 | eyebrow 12 caps | muted | medium |
| Large card title | TX-08 | title3 20 | ink | regular |
| Small tile, pill, row title | TX-08 | headline 17 | ink | regular |
| Hero-card topic title | TX-08e | largeTitle 34/40 | ink | regular |
| Hero numeral | TX-03, TX-04 | numeralHero 80 | ink | regular |
| Large numeral | TX-03 compact, TX-05 | numeralLarge 56 | ink | regular |
| Tile numeral | TX-07e, CO-02 | numeralTile 28 | ink | regular |
| Unit beside hero / large | TX-06 | numeralUnit 28 | muted | regular |
| Unit beside tile numeral | TX-06 | subhead 15 | muted | regular |
| Missing-value dash | TX-06 | same as the value | faint if ≥ 24, else muted | regular |
| Delta line | TX-03, TX-04 | callout 16 | positive if improving, else muted; suffix muted | regular |
| Button label | CH-09 / 10 | headline 17 | ink / inverse / ctaLabel | medium |
| Chip / pill label | CH-03, CH-05b, CH-06 | subhead 15 | ink / inverse | medium |
| Folder-tab label | CH-07 | callout 16 | ink if selected, else muted | regular |
| Field value | CH-05a | body 17 | ink | regular |
| Bubble text | TX-10 | bodyProse 17/24 | ink | regular |
| Reading surface | session | 28 / 34 / 40, cycled | ink / dimmed / accentFaded / accent chip | medium |
| Word on the word-detail sheet | CH-04 | display 44 | ink | regular |
| Tab label | CH-08 | — | — | not drawn; `accessibilityLabel` only |

`semibold` and `heavy` leave the app UI. `bold` is the TX-02 payload and the wordmark only.

### Container decisions

Screen class assigns the composition. Onboarding is focus, not a card stack. That override wins.

| Class | Screens | Composition |
|---|---|---|
| Root tab | Home, Practice, Analytics | Canvas + one sheet. Dock floats over the sheet. |
| Detail | Results | Canvas + one sheet. Playback on the canvas. CH-07 tongue. CH-09 tray over the sheet. |
| Focus | Scripted live, freestyle live, onboarding steps | Canvas only. Live sessions dock CO-10. Onboarding has a sticky solid CTA, not a sheet. |
| Entry | Sign-in | Canvas only. The only objects are the wordmark, statement, pills, and CTAs. |
| Modal / form | Settings, passage editor, paywall, manage-subscription fallback, word-detail | Card stack or one slab on the canvas. No sheet panel. Word-detail is a form sheet. |

Sheet contents, in order, after the locks:

| Screen | Sheet |
|---|---|
| Home | This week (CO-06) → For you (CO-04 of CO-03) → Your progress (CO-04 of CO-02L, or empty state) → Words to master (CO-11) |
| Practice | For you (CO-04 of CO-03) → Drills (CO-04 of CO-03) → Your passages (CO-11) → one category library (CH-06b + CO-11). Not five stacked category groups. |
| Analytics | CO-09 chart first → Skills (CO-05) → Effort (CO-06 + CO-02S) → Records (CO-11). No CH-07. |
| Results, scored | AI Coach (TX-10, default) → Word Breakdown or What You Said → Skills (CO-05), switched by CH-07. Playback is not in the sheet. |
| Results, unscored | One panel: Word Breakdown or What You Said. No tongue. Playback still on the canvas. |

Container slice rules:

1. Three compositions, assigned by the class table above. No container sits on the canvas above a sheet, except the freestyle prompt bubble (TX-10, `card` fill, not glass) before the first committed words. A screen never has two sheets.
2. One reading column. Canvas and sheet text lands on x 20 / 373. The sheet bleeds to x 8. Text moves inward only inside cards (x 40 / 353). Focus reading uses side padding 24.
3. Radius ladder is monotonic. Corner-nested children subtract their inset. Tokens in this plan: 12 / 24 / 28 / 36 / full.
4. Four-corner discipline. Identity top-left. Action top-right only when a real existing route exists; otherwise the slot stays empty. Value bottom-left. Status bottom-right. A void of at least 24 separates the title zone from the value band.
5. One control module. Every disc is 48. At most one solid disc per container.
6. Numbers are plain type through `ScoreValue`. LED digits are deleted.
7. Carousels are 1-up + peek. First card on the page column. Peek at least 86, showing the next card's identity column. Snap per card. No scale, blur, or pager dots.
8. One quantity, one affordance. Skill score is the 20-dot meter or ring. Daily goal is CO-07 + CO-12d. Speaking-score position is CO-08.
9. Slots collapse. They never fake a missing value with invented copy. Fixed slot height only where a missing value would make siblings jump (CO-05 caption, CO-10 right caption, TX-03 row A).
10. Glass never nests. The sheet and the CO-10 stage are the only glass layers that hold children, each an absolute-fill sibling. Everything inside them uses plain fills (`card`, `fillTranslucent`, artwork mesh). CO-10's CH-11 primary outer disc is ghost `fillTranslucent`, not a nested glass disc.

Vertical rhythm: tight inside, loose between. Intra-component gaps are at most 24. Zone gaps are 24–48. CH-01 → first content is 48. CH-02 → hero is 32. Onboarding chip → title is 48. Heading → hero is 24. Last canvas module → sheet or tongue is 32. Section → section inside a sheet is 32, and the first section's header marginTop is 0.

## 3. What the six phone UIs taught

Lessons below are handling, text placement, and component anatomy. Each names its source image. Photograph backgrounds, hands, and glyph-style digits are not inputs.

### Handling

`destination/SnapInsta.to_772265137_18617062183056352_2453188185485907419_n.jpg` (dashboard). One control diameter for every tappable circle, capsule, and the chart cursor. Adjacent utilities kiss with a small gap and need no extra container. The commit is not in the header. An icon-only stadium dock floats over the sheet; the selected circle is a solid disc, the others are hairline, and the disc slides. Clarity keeps three icons, not the reference's five, and does not minimize the dock on scroll. Scrub and the selection haptic stay.

`destination/SnapInsta.to_772559948_18617062135056352_3600666737100004317_n.jpg` (credits). The same module is the search capsule, the filter pills, and every in-card disc. Selection on a filter is fill inversion only: no size change, no weight change. The action disc inverts against its own surface, so solid, tint, and outline rank the action without type weight. A filter sits just above the list it controls, not in a distant header.

`destination/SnapInsta.to_772433247_18617062228056352_1569324727035464879_n.jpg` (timeline). The selected folder tab is the sheet: labels share one baseline, the selected label sits on a tongue that is the panel's silhouette, and unselected labels float with no pill and no underline. A two-pill tray floats over the sheet; content scrolls under it and peeks below it, which is the scroll cue. Clarity keeps the primary pill trailing (Done), not leading.

`destination/SnapInsta.to_764364248_18615105223056352_6627931271072811523_n.jpg` (challenge). Equal side buttons keep a centered title on the screen axis even when one side is empty. The bottom control row is a triad on one axis: a larger center primary, two smaller peers. Centers share a line. Size, a ring, and the only warm fill mark the primary. That is the live-session finish row, scaled to an 80 disc and 48 sides so it matches the module.

`destination/SnapInsta.to_764844477_18615105082056352_4299724137727228782_n.jpg` (assistant). Focus mode has one chrome control: an oversized squircle back chip, out of thumb reach, large enough to hit. The field is the container. Conversational turns are the only opaque objects. The voice affordance sits in the bottom thumb zone and is not a second composer.

`destination/abc.png` (flask). The frame is asymmetric and the core is symmetric. Title left, dismiss right, on one center line. The dismiss is the only outlined control in the panel, inset in the corner. The commit capsule is label-left with a concentric action circle on the right, in the thumb zone. A detached context cluster (circle + name pill) can name the entity without becoming a nav bar. Fill state ranks controls: solid is actionable, ghost ring is dismiss, frosted container is the stage.

### Text placement

Dashboard image. A two-line opener at one size and one regular weight: line 1 ink, line 2 muted, flush left, ragged right. Tone is the only difference. The hero numeral is unlabeled. A small delta sits above it. A muted caption stack sits to its right, bottom-aligned so the last caption baseline equals the numeral baseline. A period capsule occupies the cluster's top-right and must not push the numeral down. Threshold labels sit in one row under a band strip; the current value is the only ink label in that row.

Credits image. Units, denominators, and suffixes share the numeral's baseline. They are smaller and muted. They are never superscript. A label-above-value stack and a right-anchored pair share the value baseline; labels float to the height their value size needs. Footer label-left / value-right sits on one baseline. Hierarchy is size plus tone, not weight.

Timeline image. One baseline locks three different readouts: an XL number, a small muted unit, a compact pair whose bottom line shares that baseline, and a gauge value on the chord. Captions mirror to the outer edge of the thing they name. Justified label-left / value-right rows need no dividers.

Challenge image. A centered, containerless stack: muted eyebrow, XL numeral, sparkline, faint dotted rule. Widths step outward. Band words stay in source case. Nothing in that stack is a button.

Assistant image. An ask is one size and one switch: the lead stays light, the payload goes heavy at a word boundary and stays heavy through the punctuation. Clarity has no hairline face, so the adopted substitute is regular + muted for the lead and bold + ink for the payload. Side alone identifies a turn: user right-anchored, system left-anchored, same fill, no tails, no names, no timestamps.

Flask image. Flanking readouts are a large numeral over a muted caption, mirrored to the outer gutters. The unit lives in the caption, not as a suffix on the numeral. Elbow leader-lines were measured on this image and are not adopted (TX-09). Do not add them.

### Component anatomy

Dashboard image. Open canvas above, one sheet below. The upper portion holds identity, the opener, and one hero metric, with no cards. One sheet, inset 8, large top radius, holds the detailed module. The dock floats over it. A band strip uses equal visual widths even when the numeric ranges are unequal, with 4pt gutters and a marker cap. The chart header is one module row: outline identity circle, title on its axis, trailing slot on the right pad line. The scrub cursor is an accent bubble on the series, a dotted drop, and a date under the base. Y labels sit in a left gutter. There is no full x-axis tick row.

Credits image. A square metric tile has four corners and a deliberate void: identity disc top-left, optional badge on the rim at 1:30, action disc top-right, one-line title, empty middle, hero number bottom-left, status slot bottom-right. A tinted feature card is denser: ring disc, two-line title, solid action disc, label-above-value, right-anchored pair, discrete marker track, footer. Carousels are 1-up with a peek sized to show the next card's identity column. No pager dots. Progress can wrap the identity disc as a thin arc, with no extra caption.

Timeline image. A split bar is two soft segments sized by the ratio, a fixed gap, and a "now" marker through the gap. Status tiles are portrait: label top, badge bottom, state in the badge and the tile fill, not in the label. Sections group under a left header with a right-aligned meta on the same baseline.

Challenge image. Skills are an equal-column collage. One tile expands in height only, never in width. Compacts stay a single row-unit. The emptied cell is a notch, not a fake card. A focus marker is a tint on the identity disc, not a border around the card.

Assistant image. Bubbles share one radius family and one opaque fill. A pending state is the same bubble with three dots, on the system's side. The prompt leaves when the first words commit.

Flask image. A glass stage holds one centered subject, side readouts on the inner grid, and the control row in the lower band. The subject may pass behind the docked controls. The stage is not itself a button.

## 4. Shared constants and pattern index

| Constant | Value |
|---|---|
| Screen | 393 × 852 pt |
| Page margin | 20. Content column x 20–373 (353 wide). |
| Control module | 48. Glyph on a 48 or 64 control is 20. CH-11 core glyph is 24. |
| Bottom bar | 64 tall. Offset `max(insets.bottom − 16, 12)` = 18. Bar at y 770–834. |
| Scroll inset under a 64 bar | 18 + 64 + 32 = 114. |
| Sheet | x 8–385 (inset 8). Top radius `hero` 36, bottom radius 0. Horizontal pad 12, so sheet text stays on x 20–373. Top pad 24. |
| Other radii | `sm` 12 small rects, `lg` 24 compact cards, `xl` 28 square cards, `full` stadiums and circles. Continuous corners except `full`. |
| Exceptions | CH-02b chip 64. CH-11 primary 80. Focus reading side padding 24. |

Geometry that is not a spacing token: carousel peek at least 86; CO-02S 172.5 × 196; CO-02L / CO-03 271 × 271; CO-08 band height 32; CO-07 bar height 48; chart cursor bubble 48; CO-10 wave max height 56.

### Pattern index

| ID | Anatomy | Screens |
|---|---|---|
| CH-01 | 48 root bar. SpeechMark left, no container. Streak capsule + settings circle right, gap 8. No title. Scrolls away. | Home, Practice, Analytics |
| CH-02 | 48 detail bar. Dismiss or back circle, centered title or empty center, trailing circle or equal spacer. Pinned over the top blur. | Results (title). Scripted live and freestyle live (center empty, Aa trailing on both). |
| CH-02b | 64 squircle back chip, radius `lg` 24. Progress dots on its axis, screen-centered. Trailing 64 spacer. | Onboarding, five steps. Step 1 is a dead spacer. |
| CH-03 | Centered cluster: 48 identity circle, gap 8, 48 name pill. Not a dismiss. | Paywall |
| CH-04 | Title left, 48 ghost close right, on one axis. Close is the only outlined control in its container. | Settings, paywall slab, passage editor, word detail |
| CH-05a | 48 stadium field. Hairline, 1pt `foreground` when focused. No leading glyph, no clear button. | Onboarding name, passage editor title |
| CH-05b | 48 dropdown capsule, width hugs the longest option, chevron 16. Native menu on iOS; glass popover elsewhere. | Analytics, in the TX-03 top-right slot |
| CH-06 | Equal-width 48 pills spanning the column, gap 8. Selection is fill only. | Passage editor (Slow / Natural / Brisk) |
| CH-06b | Same pill, but the row scrolls and each pill hugs its label. The pills are the heading. | Practice category library |
| CH-07 | Three labels, one baseline. Selected label sits on a 48 tongue that is the sheet silhouette. Tap only. | Results, scored only. Not Analytics. |
| CH-08 | 176 × 64 icon-only dock, three 48 circles, pitch 56. Selected disc slides. No minimize. | Home, Practice, Analytics |
| CH-09 | Two equal pills. Trayed: 64 glass stadium, ghost then solid, primary trailing. Untrayed: same pills, no tray, no nested glass. | Results tray. Live error pair. Word-detail pair (both ghost). |
| CH-10 | 64 stadium. Label left. 48 accent circle inset 8 on the right, concentric. Whole capsule is the target. | Home, Practice (in flow). Paywall (docked in the slab). Passage editor (floating). |
| CH-11 | Restart 48, finish 80, pause 48, one axis, no labels. Outer primary disc is ghost because it sits in glass. | Scripted live, freestyle live |
| CH-12 | 48 discs ranked solid, then tinted, then outline. At most one solid per container. | Home and Practice cards, shuffle disc, speaker disc, Practice-all capsule |
| TX-01 | Two lines, one step, one regular weight. Line 1 ink, line 2 muted. Flush left, ragged right, no truncation. | Home, Practice, Analytics. Sign-in uses the `sectionTitle` variant. |
| TX-02 | One switch, at a word boundary. Lead regular muted. Payload bold ink through the end. At most once per screen. | Five onboarding steps, paywall |
| TX-03 | Delta line over an unlabeled numeral. Caption stack on the numeral baseline. Optional capsule absolute top-right. | Analytics (hero 80). Home speaking-score tile (large 56). |
| TX-04 | Centered, no surface: eyebrow, hero numeral, band + delta, sparkline, dotted rule. | Results |
| TX-05 | One baseline: XL value + unit, a pair, and a gauge value on the chord. | Home daily goal |
| TX-06 | Unit on the value baseline, demoted beside large numerals, full size beside small values. Never superscript. Prices unsplit. | Every numeral with a unit |
| TX-07 | Five pair forms: label above value, justified row, mirrored captions, right-anchored stack, value over caption. | CO-03, CO-06 header, CO-07 (values in the segments; no caption row unless a value overflows), Results facts (TX-07e), CO-10 readouts, paywall prices, records |
| TX-08 | Section title on the column. Card title one line, on a padding line, naming the value so the caption name is omitted. | Sheet sections. CO-02 and CO-03 titles. Practice topic title (TX-08e, largeTitle). |
| TX-09 | Elbow leader-line callout. Evaluated and not adopted. | None |
| TX-10 | Bubbles, radius `lg` 24, fill `card`, not glass. System left, max width 305. User right. Same-speaker gap 8. | Freestyle live prompt. Results AI Coach. What You Said. |
| TX-11 | Y-axis labels, cursor date, cursor bubble, legend. Threshold row is the CO-08 lock, not the draft 0–100 row. "avg NN" is not a plot label. | Analytics chart. Results word legend. |
| CO-01 | Canvas + sheet, canvas + docked stage, or card stack. One scroll. Sheet is not a drag sheet. | Every screen, by the class table |
| CO-02 | Four-corner tile, plain numerals, void ≥ 24. L is 271 square, radius `xl` 28. S is 172.5 × 196, radius `lg` 24, no action disc when there is no route. | Home Your progress (L). Analytics Effort (S). |
| CO-03 | 271 square tinted card. Ring disc, title, solid play disc, metric pair, dot row, footer. | Home For you. Practice For you and Drills. |
| CO-04 | 1-up carousel, gap 8, peek ≥ 86, no dots, no scale, no blur. | Home and Practice carousels |
| CO-05 | Two columns. One skill expanded (208), the rest compact stadiums (64). Notch is empty sheet. | Analytics Skills. Results Skills tab. |
| CO-06 | Status tiles. Label top, badge bottom. Week is 7 columns. Month is 6 × 5. | Home This week. Analytics Effort, Week and Month only. |
| CO-07 | Two segments sized by the ratio, gap 20, now-marker in the gap. Radius `sm` 12. | Home, under TX-05 |
| CO-08 | Four equal bands, gutters 4, marker, thresholds 60 / 75 / 90. | Analytics |
| CO-09 | Chart module. Header with identity disc and the only "avg NN". Plot, bubble cursor, drop line, date. No action disc. | Analytics sheet, first section |
| CO-10 | Glass stage, all corners radius 36, inset 8. Side readouts, centered waveform, caption, CH-11 in the lower band. | Scripted live, freestyle live |
| CO-11 | Rows and groups on the reading column. Leading disc only when the row has an icon. Trailing slot on the pad line. | Home words. Practice passages. Analytics records. Onboarding choices. Settings groups. Word-detail column. |
| CO-12 | Display-only indicators. 12a bar, 12b ring arc, 12c one row of dots, 12d semicircle gauge. Markers never form digits. | Editor word count (12a). Cards, skills, day badges (12b). Skill and passage meters (12c). Home gauge (12d). |

## 5. Screen layouts

The maps, interiors, handling tables, and data homes below are the screen contract. The locks in chapter 2 are already applied in these maps.

### Root tabs and dock


Basis: 393 × 852, `insets.top` 59, `insets.bottom` 34. Page column x 20–373. Sheet x 8–385, top radius `hero` 36, horizontal pad 12 so sheet text stays on x 20–373. y below is at scroll 0 unless a zone says it grows. Numerals are plain SF Pro Rounded through `ScoreValue` / `ThemedText` (regular, `tabular-nums`). No LED, dot-matrix, or segment digits. Dots are CO-12 markers only.

Canvas order is the orchestrator lock, not the CO-01 budget table. That table sized tab headings at the retired display 44 + subhead pair (66). TX-01 is `largeTitle` 34/40, and every tab's line 2 wraps on 353, so each heading is 120 (3 × 40). Sheet tops below follow from that.

Glass on these screens: CH-01 capsules, the CH-08 tray, the CH-05b fallback menu, and the one sheet. Nothing inside the sheet is glass (lock 12). Cards inside the sheet use `card`, `fillTranslucent`, or artwork mesh.

---

## Dock and root top bar

`app/(tabs)/_layout.tsx`, `components/glass-tabs/glass-tab-bar.tsx`, `components/header-actions.tsx`. Chrome shared by the three root tabs. The dock is the only fixed element. CH-01 scrolls away under the status blur.

### Vertical map

| y | h | ID | Slot |
|---|---|---|---|
| 0–59 | 59 | status blur | Top `ProgressiveBlur`, height = `insets.top`. Stays. Bottom blur is removed (D8). |
| 67–115 | 48 | CH-01 | On each tab's scroll, not pinned. SpeechMark left. Streak capsule + settings circle right. See each screen for the streak source. |
| 770–834 | 64 | CH-08 | Fixed. 176 × 64 glass tray, centered x 108.5–284.5. Bottom offset `max(34 − 16, 12)` = 18. |

Scroll `paddingBottom` on every tab = 18 + 64 + 32 = 114. Replaces `TAB_BAR_SCROLL_INSET` 140. Content scrolls under the dock. No minimize-on-scroll.

### Component interiors

**CH-01** — y 67–115, axis y 91. Same on all three tabs.

```
x 20            84                                          ~247       317 325      373
  ┌──────────────┐                                           ╭─────────────╮ 8 ╭──────╮
  │ SpeechMark   │  64×20, onAtmosphere, v-centered          │12 flame 4 N 16│  │ cog20│
  │ no container │  left edge on 20, non-interactive         │  callout 16    │  │      │
  └──────────────┘  ◄──────── flex spacer ────────────────► ╰─────────────╯   ╰──────╯
                                                              48, hugs (~70)    48 circle
                                                              right edge of the pair on 373
```

- Capsule: `radius.full`, pad L 12 / R 16. Icon 20 then gap 4 then the streak integer. No unit. `callout` 16 medium, ink, tabular. Flame role when not Pro (`streakFlame`); crown role when Pro (`proGold`). Value is always the streak, even for Pro.
- Settings: 48 circle, cog glyph 20. Glass, `GlassContainer` gap 8 so the two pieces merge.
- No title in the bar.

**CH-08** — y 770–834. Icon-only. No labels.

```
x 108.5                                                         284.5
  ╭───────────────────────────────────────────────────────────────╮  y 770
  │ 8  ╭──────╮  8  ╭──────╮  8  ╭──────╮  8                      │
  │    │ home │     │ wave │     │ chart│                         │  circles y 778–826
  │    │  20  │     │  20  │     │  20  │                         │
  │    ╰──────╯     ╰──────╯     ╰──────╯                         │
  ╰───────────────────────────────────────────────────────────────╯  y 834
       c 140.5        c 196.5       c 252.5
       Home07Icon     AudioLinesIcon Chart02Icon
```

- Tray 176 × 64, `radius.full`, glass. Pad and gaps 8. Pitch 56.
- Selected: solid `tabHighlight` disc covering the circle, glyph `onTabHighlight`. Unselected: hairline `outline` ring, no fill, glyph `onAtmosphereMuted`.
- Disc slides; it is not inset.

### Handling

| Target | Size / shape | Action | State |
|---|---|---|---|
| Streak capsule | 48 stadium, hugs | Pro → `/manage-subscription`. Else → `/paywall`. | Disabled while `useSubscription().isLoading`, no dim. Pressed: glass `interactive`, else opacity 0.7. a11y label existing: "Manage Clarity Pro" / "Get Clarity Pro" / "Checking your subscription". Hint: `Current streak: N`. |
| Settings circle | 48 circle | `/settings` | a11y "Settings". Same pressed treatment. |
| SpeechMark | 64 × 20, not a target | — | `accessibilityElementsHidden` |
| Dock circle | 48 circle | Tap selects that tab (`router.navigate` `/`, `/practice`, `/analytics`). Disc springs (`springs.settle`), then navigation. | Selected = solid disc + `onTabHighlight`. Unselected = outline + `onAtmosphereMuted`. No disabled state. |
| Dock scrub | tray, horizontal pan, `activeOffsetX ±6` | Index = clamp((x − 8 − 24) / 56). Disc tracks 1:1. Haptic tick on each crossing. Navigate on release. | Scrub does not minimize. No labels to reveal. |
| Dock a11y | — | Visible labels "Home" / "Practice" / "Analytics" become `accessibilityLabel` only. | — |

### Data homes

| Field | Home |
|---|---|
| `stats.streak` (Home, Practice) / `summary.streak` (Analytics) | CH-01 capsule value |
| `access.isPro` | CH-01 icon (crown vs flame) and capsule route |
| `isLoading` | CH-01 capsule disabled, no visual dim |
| Tab index / href | CH-08 selected disc |
| Tab labels "Home" / "Practice" / "Analytics" | a11y only (not drawn) |

---

## Home

`app/(tabs)/index.tsx`. Root tab.

### Vertical map

Greeting case: line 2 wraps once (`"72% of today's speaking goal"` or `"A short session is enough to start"`), so TX-01 is 120. A one-line line 2 would pull everything below up 40; it does not fit at 34 on 353.

| y | h | ID | Slot |
|---|---|---|---|
| 0–59 | 59 | blur | Status blur. |
| 67–115 | 48 | CH-01 | `stats.streak`. |
| 115–163 | 48 | gap | `xxxxl`. |
| 163–283 | 120 | TX-01 | Line 1 ink: "Good Morning" / "Good Afternoon" / "Good Evening" (one line; `lead` + `tail` joined). Line 2 muted, no ink span on the percent: "NN% of today's speaking goal" if `percent > 0`, else "A short session is enough to start". `percent = round(stats.todayProgress × 100)`. `displayName` is not shown. |
| 283–307 | 24 | gap | `xxl`. |
| 307–394 | 87 | TX-05 | Daily goal row. See interior. |
| 394–418 | 24 | gap | `xxl`. Head of CO-07 sits in this band. |
| 418–490 | 72 | CO-07 | Split bar. Meta row omitted. Caption row omitted unless a value overflows. |
| 490–502 | 12 | gap | `md`. |
| 502–566 | 64 | CH-10 | "Start Practicing", mic role, full column x 20–373. In flow, not floating. |
| 566–598 | 32 | gap | `xxxl`. |
| 598 | — | CO-01 sheet | Top edge. Pad top 24 → content at 622. First section header marginTop is 0. |
| 622–638 | 16 | CO-06 header | "This week" ink left, "NN% today" muted right. `NN = round(todayProgress × 100)`. |
| 638–650 | 12 | gap | `md`. |
| 650–714 | 64 | CO-06 | 7 tiles. `weeklyHistory` (5 past), today, tomorrow. Letters from `now`. |
| 714–746 | 32 | gap | Next section. |
| 746–775 | 29 | section title | "For you". `sectionTitle` 24, natural box ~29. |
| 779–797 | 18 | subtitle | "Sharpen your speaking with these passages". |
| 809–1080 | 271 | CO-04 of CO-03 | `PASSAGES`. First card left edge x 20. Peek 86, clipped at sheet x 385. |
| 1112–1141 | 29 | section title | "Your progress". |
| 1145–1163 | 18 | subtitle | "Where your speaking stands right now". |
| 1175–1446 | 271 | CO-04 of CO-02L | 4 tiles when `records.length > 0`. Else EmptyStateCard, hugs content, replaces the carousel. |
| +32 | 29 | section title | "Words to master". Omitted, with its body, when `toMaster.length === 0`. |
| +4 | 18 | subtitle | "The ones that trip you up most often". |
| +12 | 48 | CO-11 header | "N words need work" / "1 word needs work". "Practice all" capsule right. |
| +12 | 72 × n | CO-11 rows | Up to 5 `{word, count}`. n ≤ 5. |

Dock floats at 770–834 over the sheet. At rest the For you title is just under the dock; the week tiles (650–714) clear it. First section header + 64 of content sit above y 770.


### Component interiors

**TX-01** — x 20–373, y 163. Not interactive. One `Text`, `accessibilityRole="header"`.

```
x 20                                                          373
y 163  Good Morning                          largeTitle 34/40 · regular · ink
y 203  72% of today's speaking               largeTitle 34/40 · regular · muted
y 243  goal                                  wraps, ragged right, no truncation
y 283  block bottom
```

Zero-percent line 2 is "A short session is enough to start" in the same muted step. The percent is not an ink/semibold span; TX-05 owns that number.

**TX-05 + CO-07 + CH-10** — canvas, x 20–373. Display except the capsule.

```
y 307  TODAY                                 eyebrow 12 caps · muted · left on 20
y 327  ┌────────────┐                                              ╭───◎───╮
       │            │                                              │  72%  │  gauge slot 96×48
       │  12   min  │  Daily speaking goal                         │       │  right edge 373
y 380  │            │  20 min                                      ┴───────┴  baseline
y 394  └────────────┘
       numeralLarge 56 ink + " min" numeralUnit 28 muted
       pair: footnote 13 muted over subhead 15 ink, lg 16 after the unit
       gauge: ScoreValue row, "%" hugs, centered on the chord (CO-12d)

y 418        ▼                         head 12×8, centered on the gap
y 442  ╭──────────────────────────╮          ╭────────────────────────╮
       │12 (◉)          8 min  20 │  gap 20  │12 (◉)        12 min  20│  bar 48, r sm 12
y 490  ╰══ done, accent rim 2pt ══╯          ╰─ remaining, translucent╯
       no caption row (no existing done/left strings)

y 502  ╭──────────────────────────────────────────────────────────────╮
       │ 24  Start Practicing                          ≥12   ╭──────╮ 8│  64
       │     headline 17 medium · ctaLabel                   │ mic20│  │  accent circle
y 566  ╰──────────────────────────────────────────────────────────────╯
```

- TX-05 XL = `round(minutesOnDay(records, now))`. Pair value = `goalMinutes`. Gauge = `round(todayProgress × 100)`. At 0 minutes: "0 min" and "0%". Strings: existing "TODAY", "Daily speaking goal", "min".
- CO-07: done = `round(todayProgress × goalMinutes)`, left = goal − done. Values "{done} min" / "{left} min", subhead 15 ink, right inset 20. p = 0 → one remaining segment, no marker. p ≥ 1 → one done segment, no marker. If a segment fails the value-fit test, that value drops to the otherwise-omitted caption row, outer-edge aligned.
- CH-10: whole capsule is the target. Circle is the handle, inset 8, concentric. Label left, not centered.

**CO-06 week tiles** — sheet, x 20–373. 7 × 43.57 × 64, gap 8, r sm 12. Display only.

```
x 20                                              x 373
  This week                                      42% today     footnote 13, one baseline
  ink                                            muted
                 ↕ 12
  ╭─────╮ ╭─────╮ ╭─────╮ ╭─────╮ ╭─────╮ ╭═════╮ ┌ - - ┐
  │  S  │ │  M  │ │  T  │ │  W  │ │  T  │ ║  F  ║ │  S  │   label top + 8, centered, ink
  │     │ │     │ │     │ │     │ │     │ ║     ║ │     │   except tomorrow: muted
  │ (✓) │ │ (○) │ │ (✓) │ │ (✓) │ │ (○) │ ║ (◔) ║ │     │   badge 24, bottom − 8
  ╰─────╯ ╰─────╯ ╰─────╯ ╰─────╯ ╰─────╯ ╰═════╯ └ - - ┘
  met     not met                         today    tomorrow
  fillTranslucent + hairline              ink rim  outline only, no badge
```

Letters are `DAY_LETTERS` for the date `now` builds (5 past, today, tomorrow). Badge: met = filled `positive` + tick 12; not met = hollow 1pt `track` ring; today arc = `todayProgress` (CO-12b on the 24 badge). Home cannot split "no practice" from "below goal"; both use the hollow ring. No numerals in badges.

**CO-03 passage card** — 271 × 271, r xl 28, pad 20, artwork mesh. Home "For you" and Practice "For you" (passage items). Local pt.

```
local x 0   20      68 80                     191 203       251 271
y 0   ╭──────────────────────────────────────────────────────────────╮
y 20  │   ╭────────╮  Title line 1                  ╭────────╮       │
      │  ( SpeechMark ) Title line 2                │ play 20│       │  solid disc
y 68  │   ╰────────╯  title3 20 · ≤2 · w 111        ╰────────╯       │  onArtwork
      │              Speak                         footnote muted, 1 line
y 92  │   Reading pace                                              │  footnote muted
y 112 │   ┌──────────┐                              Best score       │
      │   │ 150 wpm  │                              82 /100          │  subhead ink
y 179 │   └──────────┘  shared value baseline                        │
y 199 │   • • • • • • • • • • • • • • • • • • • •                    │  CO-12c, 20×4
y 231 │   ~2 mins                          Articulation · Pacing     │  one baseline
y 271 ╰──────────────────────────────────────────────────────────────╯
      left footnote muted                    right subhead ink, x 251
```

Slot fill, passage: the ring disc's mark is the existing `SpeechMark`, not a guessed icon. Arc = best score for this `passageId` (track only if never practiced). Title = `title`. "Speak" sits as a `footnote` muted line under the title block, one line, left-aligned with the title. The word "Start" is not drawn. The solid play disc replaces the Start pill; the whole card remains the press target. Left metric = existing "Reading pace" / `targetWpm` + "wpm". Right pair = existing "Best score" / `NN /100`, only when a record exists; otherwise the pair is omitted. Dots = current score in `skills[0]` from `skillProfile`, hidden when that skill has no samples. Footer = `duration` ··· skill labels joined " · ". Tones `onArtwork` / `onArtworkMuted`.

Freestyle item in a For you carousel (Practice only): same `SpeechMark`, same "Speak" line, same play disc, track only, title = topic title, left metric = "Reading pace" / freestyle target 150 + "wpm", no right pair, no dots, footer = "Impromptu" and the skill side collapses. "Start" is not drawn. The whole card remains the press target.

**CO-02L speaking-score tile** — first card of "Your progress". 271 × 271, r xl 28, pad 20. Mesh family. Local pt.

```
local x 0   20       68                                        203       251 271
y 0   ╭──────────────────────────────────────────────────────────────────╮
y 20  │   ╭────────╮                                      ╭────────╮     │
      │   │ chart  │  outline identity, no badge          │  arrow │     │  tinted
y 68  │   ╰────────╯                                      ╰────────╯     │
y 92  │   Speaking score                                  title3 20 ink  │  1 line
      │                         void ≥ 24                                │
y 164 │   ▲ 4 this week                          Row A, callout 16, minH 20│
y 184 │   ┌───────┐                                                     │
      │   │  72   │ /100   Strong                                       │  footnote muted
y 251 │   └───────┘        Last 7 days   last line on numeral baseline  │  status slot empty
y 271 ╰──────────────────────────────────────────────────────────────────╯
```

Title is the existing `SPEAKING SCORE` in sentence case (TX slice rule 10). Name line omitted because the title names it. Delta from `summary.scoreDelta`, suffix "this week"; arrow + value `positive` when improving, muted when flat or down; suffix always muted. Empty-but-held when null or 0. Numeral = `summary.score` (`numeralLarge`) + `/100`. No score: "–" faint, `/100` muted, caption "Last 7 days" only. Band word in source case ("Strong"), not uppercase. Tile tap → `/analytics`. Disc is not its own target.

Other three CO-02L tiles, same frame, bottom band is a plain value not TX-03. Status slot empty. No badge. Action disc same route.

| Tile | Identity | Title (existing) | Value |
|---|---|---|---|
| 2 | clock role | "practice" | `totalMinutes`, `h` if ≥ 60 else `min` |
| 3 | mic role | "session" / "sessions" | `totalSessions`, no unit |
| 4 | fire role | "best streak" | `longestStreak`, "day" / "days" |

**Words to master** — on the sheet, no frost card. Header 48: count ink + " word needs work" / " words need work" muted, subhead 15; "Practice all" solid 48 capsule, play glyph, right edge x 373. Row min 72, text-only:

```
x 20                                              325  373
  word                          title3 20 ink      3×  ╭────╮
                                no caption         fn  │ spk│  48 tinted
                                                       ╰────╯
  hairline from x 20
```

`count` and `×` hug at footnote, muted, baseline with the word, then gap 12, then the disc.

Empty progress (no records): section stays. Centered card-fill block (not glass): 52 icon ring (analytics-up role), "No progress yet", "Finish your first practice session and your 7-day score, minutes, sessions, and best streak will show up here." Subtitle max width 260. No tiles, no invented zeros.

### Handling

| Target | Size / shape | Action | State |
|---|---|---|---|
| CH-01, dock | — | See shared chrome. | — |
| TX-01, TX-05, CO-07, CO-06 | — | Display. | CO-07 widths animate 900ms from p = 0; reduced motion jumps. Where a control needs a label, it is the visible strings in that slot, in reading order. |
| CH-10 | 353 × 64 stadium | `router.push('/practice')`. Medium haptic. | Pressed scale 0.98. Not disabled on this screen. |
| CO-03 card | 271 × 271 | `/session/{id}`. Disc is decorative. | Pressed scale 0.98 + medium haptic. |
| CO-02L tile | 271 × 271 | `router.navigate('/analytics')`. | Same press. Disc decorative. |
| Practice all | 48 capsule, solid | Generates a passage from `toMaster` words → `/session/{id}`. | Busy: label "Creating passage", spinner replaces play, disabled. Failure: existing alert "Passage not created" + `error.message`. |
| Speaker disc | 48 circle, tinted | `speakWord(word)`. a11y "Hear {word}". | Busy: spinner, `accessibilityState.busy`. Failure: alert "Pronunciation unavailable" + message. One word at a time. |
| Sheet | — | Not a target. Not a drag sheet. No grabber. | Scrolls with the page. |

### Data homes

| Field | Home |
|---|---|
| `now` → greeting | TX-01 line 1 |
| `stats.todayProgress` → `percent` | TX-01 line 2 string; TX-05 gauge; CO-06 "NN% today" and today's arc |
| `stats.todayProgress`, `goalMinutes` | CO-07 done / left |
| `minutesOnDay(records, now)` | TX-05 XL |
| `goalMinutes` | TX-05 pair value |
| `stats.weeklyHistory` (5 booleans) | CO-06 past tiles |
| `now` → day letters, today, tomorrow | CO-06 labels and today/tomorrow states |
| `PASSAGES` id, title, duration, skills, artwork, targetWpm | CO-03. Ring mark is `SpeechMark`, not a guessed icon. "Speak" is the `footnote` under the title. "Start" is not drawn; the solid play disc replaces that pill; the whole card is the press target. `text` is not drawn here (session payload, not a card field today). |
| Best score for `passageId` | CO-03 ring arc + "Best score" pair, omitted if none |
| `skillProfile[skills[0]]` | CO-03 dot row, hidden if no samples |
| `summary.score`, `summary.scoreDelta` | CO-02L tile 1, TX-03 compact. Suffix "this week". |
| `totals`: `totalMinutes`, `totalSessions`, `longestStreak` | CO-02L tiles 2–4. Hidden, and named in the empty subtitle, when `records.length === 0`. |
| `toMaster[].word`, `toMaster[].count` (≤ 5) | CO-11 rows. Whole section omitted when empty. |
| `generatingPractice` | Practice all busy label |
| `speakingWord` | Speaker disc busy |
| Generation / pronunciation error strings | Existing alerts, not a layout slot |
| `displayName` | Not a home. The screen deliberately does not show it. |

---

## Practice

`app/(tabs)/practice.tsx`. Root tab.

### Vertical map

Line 2 "Passages, drills, or speak off script" is 37 characters, so `largeTitle`, and it wraps. Topic titles in `TOPICS` fit one line at 34 on 353. Prompt is mapped at its max, 3 lines; a shorter prompt pulls CH-10 and the sheet up.

| y | h | ID | Slot |
|---|---|---|---|
| 0–59 | 59 | blur | Status blur. |
| 67–115 | 48 | CH-01 | `stats.streak`. |
| 115–163 | 48 | gap | |
| 163–283 | 120 | TX-01 | "Practice" ink / "Passages, drills, or speak off script" muted. |
| 283–307 | 24 | gap | |
| 307–543 | 236 | freestyle block | Containerless. "Freestyle" and "No script. Speak off the cuff and see your words live" sit above "Suggested topic". |
| 543–567 | 24 | gap | |
| 567–631 | 64 | CH-10 | "Start Speaking", mic role, x 20–373. |
| 631–663 | 32 | gap | |
| 663 | — | sheet | Content at 687. First section marginTop 0. |
| 687–716 | 29 | section title | "For you". |
| 720–738 | 18 | subtitle | `recommendations.reason`, or "Picks that adapt as you practice" when reason is null. |
| 750–1021 | 271 | CO-04 of CO-03 | `recommendations.items` (passages, drills, or freestyle pseudo-items). |
| 1053–1082 | 29 | section title | "Drills". |
| 1086–1104 | 18 | subtitle | "One-minute workouts for a single skill". |
| 1116–1387 | 271 | CO-04 of CO-03 | `DRILLS` (6). |
| 1419–1448 | 29 | section title | "Your passages". |
| 1452–1470 | 18 | subtitle | "Practice your own words". |
| 1482– | 72 + 72×n | CO-11 | Custom rows, then AddPassageRow. n = `customPassages.length`. y below assumes n = 0 (add row only): group ends 1554. |
| 1586–1634 | 48 | CH-06b | 32 below the group. Pills are the heading. No title above. |
| 1646– | 72×m | CO-11 | One PassageGroup for the selected category. m = that category's passages. |

The old five stacked category groups are not drawn. "Freestyle" and "No script. Speak off the cuff and see your words live" are the existing section strings, hosted above "Suggested topic". Do not invent a new subtitle.


### Component interiors

**Freestyle canvas block** — x 20–373, y 307. No card, no mesh, no glass. Tones ink / muted (canvas).

```
x 20                                                          325      373
y 307  Freestyle                              title3 20 regular ink
       ↕ sm 8
y 335  No script. Speak off the cuff and see your words live
       footnote 13 muted, one line, tail ellipsis if needed
       ↕ xxl 24
y 372  Suggested topic                          footnote muted  ╭──────╮
       v-centered on the disc axis                            │ shuf │  48 tinted
y 420                                                         ╰──────╯
       ↕ 12
y 432  Introduce yourself                     largeTitle 34/40 ink · ≤ 2 lines
y 472  ↕ 8
y 480  Introduce yourself to someone you      subheadProse 15/21 muted · ≤ 3
       just met: who you are, what you do,    ragged right, no truncation
       and one thing you care about.
y 543  block bottom
       ↕ 24
y 567  ╭──────────────────────────────────────────────────────────────╮
       │ 24  Start Speaking                                 ╭──────╮ 8│
y 631  ╰──────────────────────────────────────────────────────────────╯
```

Shuffle is its own target (CH-12 tinted — secondary action, not the commit). CH-10 is the commit and sits outside the block. `topic.title` / `topic.prompt` / `topic.id`. "Freestyle" and the footnote are the existing section strings, not a new subtitle.

**CO-03 drill card** — same 271 frame as the Home passage card. Bands that differ:

```
y 20  ╭────────╮  Minimal Pairs                 ╭────────╮
     (  icon  )  Sharpen tricky sounds          │ play 20│   line 2 = blurb, muted, 1 line
y 68  ╰────────╯                                ╰────────╯
y 92  Reading pace
      110 wpm                          Best score          right pair only if a record exists
                                       82 /100
      • • • • …                        dots for DRILL_META.skill, hidden if no samples
      ~1 min                     Articulation               footer, one baseline
```

Ring icon = `SKILL_ICONS[DRILL_META.skill]`. Arc = best score keyed by drill id. Left metric uses the drill's `targetWpm` (110 / 170 / the others). Footer value = `SKILL_LABELS[meta.skill]`, one label, not a joined list. `drill.text` is not drawn.

**CH-06b** — scroll variant. Bleeds to the screen edges; content pad 20. Pill height 48, gap 8, label + 2 × 20. y shown for the zero-custom case.

```
x 0  20                                                       373  393
y 1586  ╭━━━━━━━━━━━━╮ 8 ╭────────╮ 8 ╭────────────╮ 8 ╭────────╮ 8 ╭───────────── ▶
        ┃  Stories   ┃   │  News  │   │ Narration  │   │ Poetry │   │ Tongue Twisters
        ╰━━━━━━━━━━━━╯   ╰────────╯   ╰────────────╯   ╰────────╯   ╰─────────────
        inverseSurface     hairline outline, primary label, no ellipsis
        inverse label
        ↕ 12
        one PassageGroup, selected category only
```

Pills: "Stories" · "News" · "Narration" · "Poetry" · "Tongue Twisters". Default Stories. `subhead` 15 medium, centered. No weight change on selection. After a tap, scroll the selected pill fully inside the 20 margins.

**Passage row** (CO-11, on the sheet, no frost group):

```
x 20  ╭──────────────╮ 16  Title                     headline 17 ink, 1 line
      │ 76×48 thumb  │     Articulation · Pacing     footnote muted, 1 line
      │ SpeechMark   │                          ~2 mins   trailing, footnote muted
      ╰──────────────╯                          baseline = title
```

Thumb uses `passage.artwork`. Caption is skill labels joined " · " only; `duration` moves to the trailing value. Add row: dotted 76 × 48 thumb, plus glyph, "Add your own" / "Paste any text, speech, or transcript", no trailing. Divider from x 112 (text column).

### Handling

| Target | Size / shape | Action | State |
|---|---|---|---|
| CH-01, dock | — | Shared chrome. | — |
| Shuffle disc | 48 circle, tinted | `randomTopic(current.id)`. a11y "Shuffle topic". Selection haptic. | Pressed opacity 0.7. Does not start a session. |
| CH-10 | 353 × 64 | `/session/freestyle?topicId={topic.id}`. | Pressed scale 0.98, medium haptic. |
| For you card | 271 × 271 | `openContent`: id prefix `freestyle-` → `/session/freestyle?topicId=`; else `/session/{id}`. | Pressed scale 0.98. Disc decorative. |
| Drill card | 271 × 271 | `/session/{drill.id}`. | Same. |
| Passage row | full width, ≥ 72 | `/session/{id}`. | Pressed opacity 0.7 + selection haptic. |
| Custom row long-press | same row | Alert "Delete passage?" / "“{title}” will be removed from your library." / Cancel / Delete → `removePassage`. | Library rows have no long-press. |
| Add row | full width, ≥ 72 | `/passage-editor`. | Same press as a row. |
| Category pill | 48 stadium, hugs | Selects that category. Selection haptic. Re-tap is a no-op. | Selected: `inverseSurface` + inverse label. Unselected: hairline, pressed fill `fillTranslucent`. One group swaps; no stacked groups. |

### Data homes

| Field | Home |
|---|---|
| `stats.streak` | CH-01 |
| `topic.id`, `topic.title`, `topic.prompt` | Freestyle block + CH-10 route |
| `recommendations.reason` | For you subtitle. Null → "Picks that adapt as you practice". |
| `recommendations.items` id, title, duration, skills, artwork, targetWpm | CO-03. Ring mark is `SpeechMark`, not a guessed icon. "Speak" is the `footnote` under the title. "Start" is not drawn; the solid play disc replaces that pill; the whole card is the press target. Freestyle items also carry `duration: "Impromptu"`, target 150, prompt as `text` (not drawn; title is). |
| `recommendations.weakest` | Not drawn. It only chooses items. |
| Best score + `skillProfile` for the item's skill | CO-03 arc, right pair, dot row. Omitted when absent. |
| `DRILLS` id, title, duration, artwork, targetWpm, skills | CO-03 drill card. `text` not drawn. |
| `DRILL_META.blurb`, `DRILL_META.skill` | Title line 2; ring icon, dots, footer skill label |
| `customPassages` id, title, duration, skills, artwork | Your passages rows. `text` not drawn. |
| Delete alert copy | Long-press alert, not a layout slot |
| `PASSAGES` filtered by `CATEGORY_TITLES` | Selected category's rows. All five categories have passages. |
| Category titles | CH-06b pills. Not repeated as section titles. |
| "Freestyle" | Freestyle block, above "Suggested topic". `title3` 20 regular ink. |
| "No script. Speak off the cuff and see your words live" | `footnote` 13 muted under "Freestyle", one line, tail ellipsis if needed. Gap `sm` 8 between them, then `xxl` 24 to the topic row. Not a new subtitle. |

---

## Analytics

`app/(tabs)/analytics.tsx`. Root tab. No CH-07. Period is CH-05b inside TX-03, not a segmented control.

### Vertical map

Line 2 "How your speaking is moving" wraps, so TX-01 is 120. Sheet at 564 is below the old 523 budget because that budget used a 66pt heading. Dock clearance still holds: chart header + 64 of the plot sit above y 770.

Empty (`summary.empty`): CH-05b still renders. It sits at y 307, height 48, right edge x 373 (the same right anchor as the filled cluster, so it does not jump when a score arrives). The empty card follows `xxl` 24 below it. TX-03, CO-08, and the sheet stay hidden. EmptyStateCard is on the canvas, card fill not glass. Title "No analytics yet". Subtitle "Finish a practice session and your speaking score, skills, and records will show up here."

Filled, range default Week:

| y | h | ID | Slot |
|---|---|---|---|
| 0–59 | 59 | blur | Status blur. |
| 67–115 | 48 | CH-01 | `summary.streak`. |
| 115–163 | 48 | gap | |
| 163–283 | 120 | TX-01 | "Analytics" / "How your speaking is moving". |
| 283–307 | 24 | gap | |
| 307–418 | 111 | TX-03 | Anatomy A. CH-05b in the top-right slot. |
| 418–442 | 24 | gap | |
| 442–532 | 90 | CO-08 | Band strip. Marker follows the score TX-03 is showing. |
| 532–564 | 32 | gap | |
| 564 | — | sheet | Content at 588. |
| 588–834 | — | CO-09 | Chart module. Header 588–636, plot 644–778, date ~790, footnote under that. Plot's first 64 clears the dock. |
| +32 | 29 | section title | "Skills". |
| +4 | 18 | subtitle | "How each part of your speaking is trending". |
| +12 | 280 | CO-05 | Collage. 208 if `focusSkill()` is null. |
| +32 | 29 | section title | "Effort". |
| +4 | 18 | subtitle | Week/Month: "Last {windowDays} days · words mastered is all-time". All time: "Across {windowDays} days of practice". |
| +12 | 16+12+64 | CO-06 | Week: 7 tiles. Month: 30 tiles, 6 × 5, tile 52.17 × 77. All time: section omitted. Header is first ··· last `formatMonthDay`, not "This week". |
| +24 | 400 | CO-02S | 2 × 2, gutter 8. 172.5 × 196. |
| +32 | 29 | section title | "Records". Shown when `recordRows.length > 0` (always, once the sheet is up — Total practice is unconditional). |
| +4 | 18 | subtitle | "Your all-time bests". |
| +12 | 72 × rows | CO-11 | Up to 3 rows. |


### Component interiors

**TX-03** — x 20–373, y 307, height 111. Capsule does not push the numeral.

```
x 20                                                                        373
y 307 ▲ 4 this week          callout 16                         ╭────────────────╮
      arrow+value positive or muted; suffix muted               │ 20 Week  8 ⌄ 20│  CH-05b
y 327                                                         │                │  top = delta cap + 4
y 343 ┌──────────┐                                            ╰────────────────╯  y 359
      │          │
      │    72    │ /100   SPEAKING SCORE     eyebrow 12 caps muted
y 399 │          │        Strong             footnote 13 muted · master baseline
y 418 └──────────┘
      numeralHero 80 ink · numeralUnit 28 muted · caption md 12 after the unit
```

Rest: numeral = `summary.score`, caption name + band (`scoreBand`, source case). No context line — the capsule is present, so at most 2 caption lines. Delta suffix "this week" / "this month" / none. Null or 0 delta: Row A empty, height held at 20. No score: "–" faint + `/100`, caption `SPEAKING SCORE` only.

Scrubbing (CO-09 drives it): Row A = "{n} session(s) · {minutes} min" or empty. Numeral = bucket score. Caption = `SPEAKING SCORE` / band, or "Practiced, not scored" / "No practice". The bucket date is not here.

**CH-05b** sits in the TX-03 top-right slot when the hero is up. Width locked to "All time" (~120), right edge 373. Value `subhead` 15 medium, ink, centered with a 16 chevron. 1pt ink border, no fill. When `summary.empty` it still renders under TX-01, and the empty card follows it.

**CO-08** — x 20–373, y 442, height 90. Display. Marker = the value TX-03 shows; hidden when that value is null.

```
x 20           105  109        194  198         284  288        373
y 442                                              ▼  cap 12×10 ink
y 468 ╭────────────╮╭────────────╮╭──────────────╮│╭────────────╮
      │8 Building  ││8 Steady    ││8 Strong  · ● │││8 Orator    │  85.25 × 32, r sm 12
y 500 ╰────────────╯╰────────────╯╰──────────────┴╯╰────────────╯  gutter 4
      caption 12: muted in inactive bands, ink in the band that holds the score
y 516        60              75         82            90
y 532   under gutter 1    under gutter 2  marker value   under gutter 3
        muted             muted           ink            muted
```

Bands are the real `SCORE_BANDS` in `constants/metrics.ts`: Building min 0, Steady min 60, Strong min 75, Orator min 90. Four equal visual widths (85.25), gutters 4. Threshold labels are only 60, 75, and 90, centered under the gutters. The marker value (the score TX-03 is showing; 82 in this sketch) is ink and centered on the marker. It is not a threshold. Do not draw 0 or 100; band names mark the ends. Hide a threshold label whose center is within 28pt of the marker. This replaces the draft row of 0 / 60 / 75 / 90 / 100 and the 8pt collision rule for this strip.

History dots: 4pt at each scored bucket's x, latest scored bucket 6pt. Data = the same `points[].score` as the chart. Active band = tinted / selected role. Inactive = `track` at low opacity. No per-band hues.

**CO-09 header** — first sheet section, x 20–373. No action disc (no route).

```
x 20        68  84                                                    373
y 588 ╭────────╮                                              avg 72
      │ chart  │  Speaking score          title3 20 ink       "avg" muted, number ink
      │  20    │  v-centered on the disc  outline disc        subhead, right edge 373
y 636 ╰────────╯
      ↕ 8
y 644 plot x 56–373, h 134
      100 ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  ╭────╮
      50  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │ 82 │  48 accent bubble, callout 16 onAccent
       0  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  ╰──┬─╯
                         ┆ dotted drop
                         ▲
y 790              Tue, Sep 24          point.detail, source case, footnote muted
y 818  Softer segments were scored on fewer skills. Each point is one week.
       caption muted, x 20. Second sentence only for All time.
```

Y labels `100` / `50` / `0`, footnote muted, left at x 20, centered on the gridlines. Plot starts x 56. Ghost avg line at the window score. Partial segments (scored on fewer than 5 skills) stay dotted. Weekday initials and first/middle/last ticks are not drawn. The date the user sees is the cursor `detail` under the drop line (one date, the reference pattern). `label` remains the data used only if `detail` is empty, in which case `label` is that cursor date.

Rest cursor: `isCurrent` if scored, else the last scored bucket. Nothing scored: no bubble, date still shows the current bucket. Unscored scrub: hollow 48 ring on the baseline, no value, no drop line, date still shown.

**CO-05** — 353 × 280 in the sheet. Default expanded skill = `focusSkill()` (weakest). Compacts keep `SKILL_ORDER` minus that skill. Notch is empty sheet.

```
x 20                     192 200                        373
  ┌ notch (empty) ─ ─ ┐ ╭──────────────────────────────╮  208 tall, r xl 28
  │                   │ │16 Pacing         ╭──────╮ 8  │  ring disc 48, CO-12b
  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │   FOCUS          │ icon │    │  FOCUS pill under the name
  ╭────────────────────╮│                  ╰──────╯    │
  │16 Articulation ╭──╮││  58 /100              [▲ 3]  │  numeralTile 28 · DeltaPill
  │   72 /100      │  │││  183 wpm · target 179        │  footnote, slot held at 16
  ╰────────────────╰──╯╯│  • • • • • • • • • • • • • • │  20 dots, pad bottom 20
  ╭────────────────────╮╰──────────────────────────────╯
  │16 Flow        ╭──╮│╭──────────────────────────────╮
  ╰────────────────╰──╯│16 Expression      ╭────╮     │  row D, both compact
                       ╰───────────────────╰────╯─────╯
  compact 172.5 × 64, r full. Name headline 17 over "NN /100" footnote.
```

Names: Articulation, Flow, Pacing, Fillers, Expression. Compact score is ink, unit muted; null score is a dash. Expanded caption strings, window framing: "{clean}% of words clean", "{wpm} wpm · target {target}", "{n} per session" (fillers), "{n} pause(s) per session". Expression has no caption; the 16 slot stays. Delta `hideZero`, no suffix. FOCUS pill is the existing "FOCUS", always on the weakest skill. Expanded disc fill `focusBg`; compact weakest gets `focusBg` only, no pill. Skill color is the arc and the lit dots, never the text. Fallback (fewer than 2 skills with data): no expanded card, 5 compacts, height 208.

**CO-06 on Analytics** — same tile anatomy as Home, above the CO-02S grid. Week: 7-col, labels = weekday initials. Month: 6-col, 52.17 × 77, label = day-of-month; the 1st shows the 3-letter month from `formatMonthDay`. Header: first bucket `formatMonthDay` ink left, last bucket muted right. All time: the grid is not drawn. Tile states use `sessions` and `minutes` against `goalMinutes` (met / below goal / none / today ink rim).

**CO-02S** — Effort grid. 172.5 × 196, r lg 24, pad 20. No action disc. Display only. Local:

```
y 20  ╭───────╮ (✓)          top-right empty
y 68  ╰───────╯
y 84  Day streak              headline 17, 1 line
      void
y 142 4 days          [▲ 1 day]   numeralTile 28 + unit · DeltaPill keeps its suffix
y 196
```

| Tile | Identity | Value | Status |
|---|---|---|---|
| Practice time | clock | `summary.minutes` as `min`, or `h` when All time and ≥ 60 | `minutesDelta`. DeltaPill suffix "min". |
| Sessions | mic | `summary.sessions`, unit "run" / "runs" | `sessionsDelta`. No suffix. |
| Day streak | fire | `summary.streak`, "day" / "days" | `streakDelta`. DeltaPill suffix "day" / "days". Tick badge when `todayProgress ≥ 1`. |
| Words mastered | outline disc, no glyph (the capsule has none today; do not invent one) | `mastered`, "word" / "words" | no status slot. All-time. |

DeltaPill keeps the existing suffix. Practice time suffix is "min". Day streak suffix is "day" / "days". Sessions has no suffix today, so it stays without one. If value + unit + pill overflow the inner width, the pill moves to the void's bottom edge (already the tile rule).

**Records rows** — CO-11 on the sheet, no card. Leading outline disc 48.

| Row | Icon role | Title | Caption | Trailing |
|---|---|---|---|---|
| Best score, only if `best` and `bestScore != null` | star | "Best score" | "{contentTitle or Passage/Drill/Freestyle} · {timeAgo}" | `NN /100` |
| Longest streak, only if `longest` | fire | "Longest streak" | `formatDayRange(start, end)` | `N` + "day" / "days" |
| Total practice | clock | "Total practice" | "across N session(s)" | `h` if minutes ≥ 60 else `min` |

Title headline 17 regular. Trailing value headline 17 regular + TX-06 unit, baseline with the title.

### Handling

| Target | Size / shape | Action | State |
|---|---|---|---|
| CH-01, dock | — | Shared chrome. | — |
| CH-05b | 48 stadium, ~120 wide | Opens single-select. Options "Week" / "Month" / "All time". Pick: selection haptic, `setRange`, menu closes, data below crossfades. | Pressed fill `fillTranslucent`. Open: chevron rotates 180°. Dismiss by outside tap or re-tap. Still rendered when empty, under TX-01; the empty card follows. iOS uses the native menu; other platforms use a glass popover, r lg 24, 8 below, rows 48, tick on the current row. |
| TX-03 numeral and captions | — | Not tappable. One a11y label: name, value, band, delta. | Scrub swaps do not move the numeral. |
| CO-08 | 353 × 90 | Display. Where it needs a label, it is the visible strings in that slot, in reading order. | Marker times 200ms to the shown score. Hides when null. |
| CO-09 plot | x 56–373 × 134 | Pan `activeOffsetX ±6`, `failOffsetY ±14`, plus long-press 200ms. Selection haptic per bucket. a11y "Speaking score by day", hint "Swipe across the chart to inspect a day. Its details read out above the chart." | Rest cursor on `isCurrent` or last scored. Release returns to rest. Same state drives TX-03 and CO-08. Unscored bucket: hollow ring, no drop line. |
| CO-05 compact | 172.5 × 64 | Selects that skill into the expanded slot. Selection haptic. Local, resets when the period changes. | Pressed opacity 0.7. Expanded card is not a target. FOCUS stays on the weakest skill wherever it sits. |
| CO-02S, CO-06, records rows | — | Display. Records rows do not navigate. | — |

### Data homes

| Field | Home |
|---|---|
| `summary.streak` | CH-01 value, and the Day streak tile |
| `range` / `RANGES` | CH-05b. Still rendered under TX-01 when `summary.empty`. In the TX-03 top-right slot only when the hero is up. |
| `windowDays` | Effort subtitle |
| `summary.empty` | Empty card follows CH-05b. Suppresses TX-03, CO-08, and the sheet. Does not suppress the capsule. |
| `summary.score`, `summary.scoreDelta`, `DELTA_SUFFIXES[range]` | TX-03. Delta also moves CO-08. |
| Band word (`scoreBand`) | TX-03 verdict; CO-08 active band name |
| `points[].score`, `sessions`, `minutes`, `skillCount`, `isCurrent`, `detail` | CO-09. Score also feeds CO-08 dots and the scrubbed TX-03 numeral. `detail` is the cursor date (source case, not uppercased). `skillCount < 5` dots the segment and can add the softer-skills footnote. |
| `points[].label` | Weekday initials and first/middle/last ticks are not drawn. The date the user sees is the cursor `detail` under the drop line (one date, the reference pattern). `label` remains the data used only if `detail` is empty, in which case `label` is that cursor date. |
| `points[].key` | Identity only, not drawn. |
| Note "Each point is one week." | CO-09 footnote, All time only |
| "Softer segments were scored on fewer skills." | CO-09 footnote, when any scored point has `skillCount < 5` |
| "avg NN" | CO-09 chart header, right side only. "avg" muted + number ink, `subhead`. Not drawn above the average line. |
| `summary.skills`, `summary.captions`, `summary.skillDeltas` | CO-05. Caption and delta draw on the expanded card; score draws on every pill. |
| `focusSkill()` | Which card is expanded at rest; FOCUS marker |
| `summary.days` sessions, minutes + `goalMinutes` | CO-06 tiles (Week / Month). Hidden for All time. |
| First / last bucket date | CO-06 header, `formatMonthDay` |
| `summary.minutes`, `minutesDelta` | Practice time tile. Unit `h` or `min`. DeltaPill suffix "min". |
| `summary.sessions`, `sessionsDelta` | Sessions tile. Unit run/runs. No DeltaPill suffix. |
| `summary.streakDelta` | Day streak DeltaPill. Suffix "day" / "days". |
| `todayProgress ≥ 1` | Day streak tick badge |
| `mastered` | Words mastered tile. No delta. |
| `recordRows`: best score, contentTitle, mode label, timeAgo, longest range + length, total minutes + session count | CO-11 records. Best and longest rows omitted when their data is absent. Total practice always present once the sheet is up. |

---

Basis: 393 × 852 pt, `insets.top` 59, `insets.bottom` 34. Page column x 20–373 unless a pattern names an exception. Numerals are plain SF Pro Rounded, regular, `tabular-nums`. Colors by role only. Icons by role, not by library name.

Resolved before the maps:

- Results sheet order follows lock 8, not CO-01's Playback → Skills → AI Coach → breakdown list. Playback stays on the canvas. Tabs are AI Coach | Word Breakdown (freestyle: What You Said) | Skills.
- CH-02 → hero is `xxxl` 32 (hero at y 147). CH-02, the TX cross-slice gap, and the thumb map agree. CO-01's 48 gap is the leftover.
- Freestyle keeps Aa. The source passes `onTextSize`, and text-size must not be dropped. CH-02's "spacer on freestyle, as today" does not match the source.
- `topic.prompt` is the TX-10 assistant bubble until the first committed words. That named host beats CO-01's blanket "nothing else carries a surface." The bubble is `card` fill, not glass.
- Lock 12 means the sheet and CO-10 are the only glass *panels that hold children*. CH-02 circles, the PlaybackPill stadium, and the CH-09 tray stay their own glass, with no glass nested inside them. CO-10's CH-11 primary outer disc is ghost `fillTranslucent`, not a nested glass disc.

---

## Scripted live — `app/session/[passageId].tsx`

Focus class. Canvas only + docked stage. AtmosphereCanvas `stage`. No sheet, no dock, no tray.

### Vertical map

Fixed layers. The teleprompter scrolls underneath the bar and underneath the stage.

| y | h | ID | Slot |
|---|---|---|---|
| 0–59 | 59 | — | Status / safe area. Top progressive blur starts here and covers the bar (`insets.top + 8 + 48 + bleed`). |
| 67–115 | 48 | CH-02 focus | Dismiss circle x 20–68, chevron-down 20. Center empty. Aa circle x 325–373, glyph `Aa` (`headline` 17, ink). |
| 139–598 | scroll | reading surface | Passage text. Side padding 24 (x 24–369), the focus exception to the page margin. Initial paddingTop = bar bottom + `xxl` 24. Bottom inset 254 so the tail can rest on the stage top; text may still scroll under the stage. |
| 358 | — | anchor | Active line held at 42% of the viewport, 240 above the stage top. Not a tap target. |
| 598–844 | 246 | CO-10 | Glass stage. Bottom = screen bottom − `sm` 8. See interior. |
| 844–852 | 8 | — | Screen margin below the stage. Bottom progressive blur stays behind the stage (D8). |

Reading paint, top to bottom inside the scroll, weight medium (type-role table; was semibold). Size cycles 28 → 34 → 40, default 34. Line height × 1.32. Paragraph gap × 1.1 of the size.

- Completed sentences: `dimmed`.
- Spoken words in the current sentence: `accentFaded`.
- Current word: `accent` on an `accentBg` chip, radius `xs` 6, pad H `xs` 4. Opacity 0.72 → 1 from `wordProgress` (`currentWordFraction`).
- Upcoming words: ink.
- `currentWordIndex` is the frontier that chooses those paints. It is not a printed numeral.

Unknown `passageId` renders nothing and leaves. No layout.

### Component interiors

**CH-02 focus bar** (y 67–115, axis y 91). Interior changes: circles 44 → 48, sides x 20, center slot emptied.

```
x 20    68                                              325    373
  ╭──────╮                                              ╭──────╮
  │  ↓   │              (center empty)                 │  Aa  │
  │  20  │                                              │  17  │
  ╰──────╯                                              ╰──────╯
  dismiss, glass, 48                                    text-size, glass, 48
```

**CO-10 stage** (x 8–385, y 598–844, radius `hero` 36 all corners, glass `strong` as an absolute-fill sibling). Inner grid x 28–365: side 64 · subject 209 · side 64.

```
x 8   28          92                                         301         365 385
y 598 ╭────────────────────────────────────────────────────────────────────────╮
      │ 20                                                                   20 │
y 618 │    142            ║ ║ ┃ ║ ┃┃ ║ ┃ ║ ║ ┃┃ ║ ┃ ║ ║ ┃ ║ ┃┃ ║ ┃       0:16  │
      │    WPM            26 bars · 3 wide · pitch 8 · 4–56 h            ~2 mins│
y 682 │    left x 28      subject centred on x 196.5              right x 365 │
y 690 │                       target 150 · good pace                             │
y 706 │                            ↕ xxl 24                                      │
y 730 │  ╭────╮                     ╭──────────╮                     ╭────╮      │
      │  │ ⟲  │                     │    ■     │                     │ ⏸  │      │
y 810 │  ╰────╯                     ╰──────────╯                     ╰────╯      │
      │                  bottom pad = max(xl 20, insets.bottom) = 34            │
y 844 ╰────────────────────────────────────────────────────────────────────────╯
```

- Left readout, left-aligned x 28: `liveWpm` as `numeralTile` 28 ink. Dash when `liveWpm` ≤ 0. Caption "WPM" (`footnote` 13 muted) under it. No inline unit.
- Subject: 26 bars, width 3, pitch 8, heights 4–56, driven by `meterLevel`. Recording: `accent`. Paused: `tertiary`, readouts frozen. Processing: bars drop to 4.
- Right readout, right-aligned x 365: `formatClock(elapsedMs)` as `numeralTile` 28 ink. Caption = `passage.duration` ("~2 mins", "~3 mins", or "~4 mins"), `footnote` muted. Processing: the value swaps to "Scoring…" (`subhead` 15 ink); the caption slot keeps its 16 height.
- Subject caption, centred, box top = band bottom + `sm` 8: existing LiveWpm line `target ${targetWpm} · ${paceLabel}`. `paceLabel` is one of "warming up", "too fast", "a bit fast", "too slow", "a bit slow", "good pace". One line, tail ellipsis at 337. `targetWpm` is `passage.targetWpm`.
- Values share a baseline. Captions share a baseline.

**CH-11 row** (y 730–810, centres on one axis). Sides 48 on the inner lines x 28–76 and x 317–365. Primary 80 on x 196.5. No labels in the row. Outer primary disc is ghost `fillTranslucent` because it sits in glass. Ring and halo are one SVG layer, not glass.

```
x 28      76                156.5                  236.5               317      365
  ╭──────╮                    ╭──────────────────────╮                    ╭──────╮
  │      │                  ╱   ░░ halo (level) ░░   ╲                  │      │
  │  ⟲   │                  │   ╭────────────────╮    │                  │  ⏸   │
  │  20  │                  │   │ ╭────────────╮ │    │                  │  20  │
  ╰──────╯                  │   │ │   ■  24    │ │    │                  ╰──────╯
  restart, ghost             ╲  │ ╰────────────╯ │   ╱                   pause ↔ resume
                              ╲ ╰────────────────╯  ╱                    ghost
                                ╰──────────────────╯
                        80 · ring Ø 56, 3 pt · core Ø 48 · glyph 24
```

Listening draw above. Other paints are in Handling. Glyphs: restart role, stop/finish role, pause role, play/resume role, mic role while arming.

**Error substitution** (same bottom band, stage band stays). CH-11 row is replaced. No icons — those two buttons have none today.

```
x 28                                                              365
  Something went wrong                         ← headline 17 ink
  {error.message, or the fallback sentence}    ← footnote 13 muted
  ╭──────────────────────────╮ 8 ╭──────────────────────────╮
  │         Dismiss          │   │        Try Again         │  48, untrayed CH-09
  ╰──────────────────────────╯   ╰──────────────────────────╯
  ghost, ink                         solid inverseSurface, inverse
```

Fallback sentence, existing: "Speech recognition is unavailable right now."

### Handling

| Target | Size / shape | Action | State |
|---|---|---|---|
| Dismiss | 48 circle, glass | Records the partial attempt `abandoned`, then `router.back()`. Disabled while `status === 'processing'` (opacity 0.5). Pressed: glass interactive, else opacity 0.7. | Chevron-down. |
| Aa | 48 circle, glass | Cycles text size 28 → 34 → 40. Selection haptic. | Glyph `Aa`. |
| Restart | 48 circle, ghost | If listening or paused: stop, record `abandoned`, then restart. Otherwise restart immediately. Pressed scale 0.96. | Disabled (opacity 0.5) while idle or processing. |
| Finish | 80 disc | `onStop` → score → `/session/results`. Medium haptic. End of passage still finishes as `completed` with no tap. | See status table. |
| Pause / resume | 48 circle, ghost | `onPauseToggle`. Medium haptic. | Pause glyph while listening; play glyph while paused. `accessibilityLabel` is the existing "Pause" / "Resume" string. |
| Dismiss (error) | half of the inner width × 48, ghost stadium | `onErrorDismiss` → same abandon-and-back path. | Label "Dismiss". |
| Try Again (error) | half × 48, solid stadium | `onRestart`. | Label "Try Again", inverse. |

| `status` | Primary core / ring / halo | Left | Right |
|---|---|---|---|
| `idle` (arming) | core `fill`, mic glyph `tertiary`; ring `track`; halo off; disabled | disabled | pause, disabled |
| `listening` | core `accent`, stop glyph `onAccent`; ring `accent`; halo from `meterLevel` (scale 0.9–1.1, opacity 0.2–0.6) | enabled | pause |
| `paused` | core `accent`, stop glyph; ring `track`; halo off | enabled | play (resume) |
| `processing` | core `accent`, spinner `onAccent` in place of the glyph; all three disabled | disabled | disabled |
| `error` | row replaced by the message + untrayed pair | — | — |
| `done` | not a resting paint; auto-finishes | — | — |

The stage itself is not a target. The reading surface is not a target.

### Data homes

| Field | Zone |
|---|---|
| Passage words (`tokenized`) | Reading surface |
| `currentWordIndex` | Reading paint (frontier) |
| `currentWordFraction` / `wordProgress` | Current-word chip opacity |
| Text size 28 / 34 / 40 | Aa, applied to the reading surface |
| `liveWpm` | CO-10 left value |
| `passage.targetWpm` | Subject caption "target N · …" |
| `paceLabel` | Subject caption, after the middot |
| `elapsedMs` | CO-10 right value |
| `passage.duration` | CO-10 right caption |
| `meterLevel` | Waveform heights; finish-disc halo while listening |
| `status` | CH-11 paints; dismiss disabled while processing; "Scoring…" while processing |
| `error.message` | Error band, or the fallback sentence |
| Passage title | Not on this screen. Snapshotted into the record only. |

---

## Freestyle live — `app/session/freestyle.tsx`

Focus class. Same chrome and stage as scripted. Differences are the reading column and the empty duration caption.

### Vertical map

| y | h | ID | Slot |
|---|---|---|---|
| 0–59 | 59 | — | Status. Top progressive blur. |
| 67–115 | 48 | CH-02 focus | Dismiss x 20–68. Center empty. Aa x 325–373. Same bar as scripted. |
| 139–598 | scroll | reading + TX-10 | Until the first committed words: assistant bubble. After that: live transcript. Side padding 24 for the transcript. Bottom inset 254. |
| 598–844 | 246 | CO-10 | Same stage. Right caption slot is empty but 16 tall. |
| 844–852 | 8 | — | Margin. Bottom blur stays. |

No active-line anchor. The transcript follows its tail unless the user scrolls up, and re-follows when the end is within 80 pt.

Empty column, before any `finalText` or `interimText`:

- TX-10 assistant bubble, left edge x 20, max width 305, radius `lg` 24, pad V `lg` 16 / H `xl` 20, fill `card`.
- Text is `topic.prompt`, `bodyProse` 17/24 regular ink, start-aligned. Replaces today's dimmed placeholder. Goes away when the first words commit. Not glass.

Spoken column:

- `finalText` in ink, weight medium, line height × 1.35, side padding 24.
- Interim tail in `accent` on an `accentBg` chip, radius `xs` 6, pad H `xs` 4, with a leading space when `finalText` is non-empty.

There is no auto-finish. Freestyle has no passage-end `done` path.

### Component interiors

CH-02, CO-10, and CH-11 match scripted, with two slot changes:

- Right caption: no string. `passage.duration` does not exist. The 16 pt slot stays so the value baseline does not jump.
- Subject caption uses `FREESTYLE_TARGET_WPM` (150): "target 150 · {paceLabel}".

**Prompt bubble** (only while both transcripts are empty). Interior changes vs the dimmed placeholder.

```
x 20                                                         x 325          x 373
╭──────────────────────────────────────────────────────────╮
│ {topic.prompt}                                           │  bodyProse ink
│ wraps, no truncation                                     │  max width 305
╰──────────────────────────────────────────────────────────╯
left edge = page margin 20 · radius lg 24 · fill card · not a button
```

**Error band** is the same untrayed pair as scripted.

### Handling

Same targets and status table as scripted, except:

- Finish does not fire from a passage end. Only the primary disc, via `onStop` → `/session/results`.
- Aa still cycles 28 → 34 → 40 and applies to both the prompt bubble's successor (the transcript) and, while empty, is unused by the bubble (the bubble is `bodyProse`, not the reading size). The control stays, because text-size is a live control on this screen today.
- Dismiss and restart still record `abandoned` when a take is in progress.

### Data homes

| Field | Zone |
|---|---|
| `topic.prompt` | TX-10 bubble, until the first committed words |
| `topic.title` | Not shown. Stored as `contentTitle` on the record only. |
| `finalText` | Transcript, ink |
| `interimText` | Transcript tail chip |
| Text size 28 / 34 / 40 | Aa, applied to the transcript |
| `liveWpm` | CO-10 left value |
| `FREESTYLE_TARGET_WPM` (150) | Subject caption |
| `paceLabel` | Subject caption |
| `elapsedMs` | CO-10 right value |
| Duration caption | Slot held empty (no string exists) |
| `meterLevel` | Waveform; halo while listening |
| `status` | CH-11; "Scoring…" while processing; dismiss disabled while processing |
| `error.message` | Error band |
| `fillerCount` | Not shown live. Counted into the record only. |

---

## Results — `app/session/results.tsx`

Detail class. Canvas + sheet. CH-09 tray over the sheet. No CH-08.

Scroll is one view. Padding top 147 (`insets.top + 8 + 48 + 32`). Padding bottom 114 (tray offset 18 + 64 + 32). Sides 20. No result: the screen renders nothing and pops. Not a layout.

### Vertical map — scored, sparkline present (≥ 3 points)

| y | h | ID | Slot |
|---|---|---|---|
| 0–59 | 59 | — | Status. Top progressive blur. Bar is pinned over it. |
| 67–115 | 48 | CH-02 | Dismiss x 20–68, chevron-down. Title "Session Complete", `title3` 20 regular ink, screen-centred, max width 233. Trailing 48 spacer. |
| 115–147 | 32 | — | `xxxl` 32. |
| 147–357 | 210 | TX-04 | Score stack through the dotted divider. See interior. |
| 357–389 | 32 | — | `xxxl` 32. |
| 389–438 | 49 | TX-07e | Facts row. Hidden when `spokenWords` ≤ 0; the slot collapses and the pill follows the divider by this same 32. |
| 438–450 | 12 | — | `md` 12, the existing gap before the pill. |
| 450–514 | 64 | PlaybackPill | Canvas. Not in a tab. |
| 514–546 | 32 | — | `xxxl` 32, measured to the tongue top. |
| 546–594 | 48 | CH-07 | Tongue. Default tab AI Coach. |
| 594– | — | CO-01 sheet | x 8–385, top radius `hero` 36, bottom radius 0. Horizontal pad 12 so content sits on x 20–373. Content pad top `xxl` 24. Glass `strong`, absolute-fill sibling. Nothing inside is glass. |
| 770–834 | 64 | CH-09 | Tray. Sheet content scrolls under it and peeks below it. No bottom blur (D8). |

Tongue top at y 546 is 64% H. CO-01's 54–62% first-paint budget assumed the pill lived in the sheet. Lock 8 put the pill on the canvas, so the budget yields.

Sparkline collapse (fewer than 3 scored points): the sparkline and its `xl` 20 gap drop out. Meta line is followed by `xxl` 24, then the divider. Divider moves from y 357 to y 305. Facts, pill, and tongue each move up 52. Tongue top y 494.

### Vertical map — unscored

Same bar. TX-04's eyebrow, numeral, meta line, and sparkline are replaced by UnscoredNotice. The divider stays.

Representative notice (2-line detail; line count moves everything below it):

| y | h | ID | Slot |
|---|---|---|---|
| 67–115 | 48 | CH-02 | Same "Session Complete" bar. |
| 147–283 | 136 | UnscoredNotice | 48 mic-off circle, `md` 12, title (`title` 22 regular, box 26), `sm` 8, detail (`subheadProse` muted, max width 305, 2 × 21). |
| 283–303 | 20 | — | `xl` 20, the divider's preceding gap. |
| 303 | 1 | TX-04 | Dotted divider, x 44–349. |
| 335–384 | 49 | TX-07e | Facts, only when `spokenWords` > 0. Otherwise this row is absent and the pill follows the divider by `xxxl` 32. |
| +12 | 64 | PlaybackPill | Still on the canvas. Often "Recording unavailable". |
| +32 | — | CO-01 sheet | Flat top, radius `hero` 36. No tongue, no tab row. The one panel keeps its heading. |

Unscored panel is Word Breakdown (scripted) or What You Said (freestyle). AI Coach and Skills are absent. No tab row.

### Component interiors

**TX-04 score stack** (hero top y 147, centred on x 196.5). Replaces the gauge mesh and the 270° arc. No surface.

```
x 20   44   60                    196.5                         333  349  373
y 147                    SPEAKING SCORE                  ← eyebrow 12 caps · muted
y 163                         ↕ xs 4
y 167                  ┌──────────────────┐
                       │   82   /100      │              ← numeralHero 80 ink + numeralUnit 28 muted
y 243 ════ baseline ═══│▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔│
y 262                  └──────────────────┘
y 262              Strong    ▲ 5 vs avg              ← callout 16 muted · md 12 · DeltaLabel
y 281                      ↕ xxl 24
y 305           ●──────╮       ╭───●──╮        ╭────◉   ← 273 × 32, x 60–333
y 337                  ╰───●───╯      ╰──●─────╯         prior ● · this session ◉
y 337                      ↕ xl 20
y 357     · · · · · · · · · · · · · · · · · · · · · · · · ← divider 305, x 44–349
```

- Eyebrow is the existing "SPEAKING SCORE" literal. Not a new string.
- Numeral is `sessionScore` (`speakingScore(result)`), never `overallScore`. Unit `/100`.
- Meta row, centred as one unit, baseline-aligned: band word in source case ("Orator", "Strong", "Steady", "Building"), then `md` 12, then DeltaLabel "▲ N vs avg". Arrow and value are `positive` when improving, muted when flat or declining. Suffix "vs avg" is muted. Delta omitted when null or 0; the band remains. Hidden entirely in the unscored replacement.
- Sparkline: this session plus up to 6 previous scored sessions from `history` (records excluding `recordId`), oldest left, this session the lens. No axis labels. Draws once, left to right. Static under reduced motion. Collapses under 3 points.
- Nothing in the stack is tappable.

**UnscoredNotice** (centred, max detail width 305). Circle shrinks 56 → 48. Glyph 20, mic-off role, muted.

```
                    ╭──────╮
                    │ mic  │  48, hairline outline
                    ╰──────╯
                       ↕ md 12
              We didn't hear anything          ← title 22 regular ink
                       ↕ sm 8
     Check that your mic is enabled and try    ← subheadProse muted
           speaking a little closer to it.
```

Title / detail pairs, existing, chosen in this order:

| Condition | Title | Detail |
|---|---|---|
| `spokenWords` ≤ 0 | "We didn't hear anything" | "Check that your mic is enabled and try speaking a little closer to it." |
| `recordId` == null | "Couldn't save this session" | "This attempt didn't make it into your history. Try again in a moment." |
| else | "Too short to score" | "It still counts toward your practice time and your streak." |

**Facts row** (x 20–373, containerless, no dividers, no glass). Four columns of 88.25. Value centred over the caption. Gap 0. Value `numeralTile` 28 ink, no unit. Caption `footnote` 13 muted.

```
x 20        108.25      196.5       284.75       373
     142          3           2          1:24
     WPM       Fillers      Pauses       Time
     col 88.25, value centred, caption centred
```

| Column | Value | Null paint |
|---|---|---|
| WPM | `round(paceWpm)` | Dash when `paceWpm` ≤ 0 |
| Fillers | `fillerCount` | 0 is a real zero, not a dash |
| Pauses | `pauseCount` | Dash when null |
| Time | `formatClock(durationMs)` | Always a clock |

Hidden entirely when `spokenWords` ≤ 0.

**PlaybackPill** (x 20–373, y 450–514 when the scored sparkline is present, height 64, radius full). Own glass stadium, sibling of the sheet, not inside it. Play disc is solid, not glass. Disc grows 44 → 48, inset 8 so it is concentric (24 + 8 = 32). Glyph 20. Gap after the disc stays `lg` 16. Clock pad right `lg` 16.

```
x 20  28                                                         357 373
  ╭─────────────────────────────────────────────────────────────────╮
  │ ╭──────╮  16   ▮▮ ▮ ▮▮▮ ▮ ▮▮ ▮▮▮ ▮ ▮ ▮▮▮ ▮▮              1:24   │
  │ │  ▶   │       bars 3 wide, h 3–24, flex                 clock  │
  │ │  20  │                                                        │
  │ ╰──────╯                                                        │
  ╰─────────────────────────────────────────────────────────────────╯
  8 inset · disc 48 solid inverseSurface · glyph inverse
  played bars: accentText · unplayed: tertiary
  clock: subhead 15 muted, tabular, right
```

Unavailable (no `audioUri` / playback not available): the disc, bars, and clock are replaced by "Recording unavailable", `subhead` muted, centred in the same 64 stadium.

While playing, the clock is `positionMs`. Otherwise it is `durationMs`. Bars tint up to `positionMs / durationMs`.

**CH-07 tab row — three states.** Tongue rise 48. Labels `callout` 16 regular, one baseline, selected ink, unselected muted. Selected label optically raised `xxs` 2 and centred on the flat. Hit area per tab ≈ 118 × 48. Tap only. Headings are not repeated inside the sheet.

Default, AI Coach selected (flat x 8–106, ramp 106–138):

```
y 546 ╭─────────────────────────╮
      │  AI Coach               ╰─╮       Word Breakdown              Skills
      │  x 20–86                     │   centred x 139–254      right x 333–373
y 594 │ x 8                         ╰────────────────────────────────────────╮
```

Center selected, Word Breakdown (flat x 119–274, ramps 87–119 and 274–306):

```
y 546                    ╭────────────────────────────╮
      AI Coach        ╭─╯       Word Breakdown          ╰─╮          Skills
y 594 ╭───────────────╯                                    ╰────────────────╮
```

Right selected, Skills (flat x 313–385, ramp 281–313, mirror of the default):

```
y 546                                              ╭─────────────────────────╮
      AI Coach              Word Breakdown      ╭─╯                    Skills │
y 594 ╭─────────────────────────────────────────╯                            │
```

Freestyle swaps the center string to "What You Said". Same slot rules: flat = label width + 2 × 20, centred on x 196.5. The three selection states do not change.

**Sheet panels** (first line is the existing sub-line, or omitted when none exists):

AI Coach (default). No sub-line exists, so none is invented. TX-10 thread, fill `card`, not glass, not a second card wrapper. `minHeight` 104. Bubbles max width 305, left edge x 20, radius `lg` 24, pad V 16 / H 20. Same-speaker gap `sm` 8.

```
pending
╭──────────────────────────────────────────────────────────╮
│ •  •  •                                                  │  dots xs 4, gap sm 8, ink
│                                                          │
│ Reviewing your session                                   │  headline 17 regular ink
│ Putting together a few pointers for you.                 │  footnoteProse muted
╰──────────────────────────────────────────────────────────╯

success
╭──────────────────────────────────────────────────────────╮
│ {breakdown.summary}                                      │  bodyProse regular ink
╰──────────────────────────────────────────────────────────╯
  ↕ sm 8
╭──────────────────────────────────────────────────────────╮
│ ┌──┐  Slow the opening line                              │  headline 17 ink
│ │1 │  Guidance sentence …                                │  subheadProse muted
│ └──┘  evidence …                                         │  footnoteProse muted
╰──────────────────────────────────────────────────────────╯
badge 28, radius sm 12, accentBg, number footnote medium accentText

error
╭──────────────────────────────────────────────────────────╮
│ Coaching couldn’t load                                   │  headline 17 ink
│ {coaching.error}                                         │  footnoteProse muted
│ Try again                                                │  subhead 15 medium accentText
╰──────────────────────────────────────────────────────────╯
Try again is a 48 control, not a bubble button. a11y label stays "Retry AI coaching".
```

Tips arrive in order. Title required; `guidance` and `evidence` omit their lines when absent. Coach text is selectable. Typing dots pulse unless reduced motion.

Word Breakdown. Sub-line is the coverage string (`footnote` 13 muted) when `total` > 0: "All N words read" or "X of N words read", plus " · N clear" when `source === 'azure'`. Then the existing card (fill `card`, hairline, radius `lg` 24, pad 20, gap 12):

```
x 40                                                              x 353
  {caption}                                          ← footnoteProse muted
  ● Clear   ● Unclear   ● Skipped   ● Added          ← TX-11d: dot sm 8, xs 4, caption 12 muted, md 12
  {passage words, body medium, line height 26}
```

Caption, existing:

| `source` / tappable | String |
|---|---|
| `live` | "Pronunciation scoring was unavailable, so this shows which words were recognized, not how clearly they were said." |
| azure, some tappable | "Tap a highlighted word to hear it and see which sound to work on." |
| azure, none tappable | "Every word came through clearly." |

Word paint, existing roles: Clear ink, Unclear `warn`, Skipped `danger` at 0.5 and struck through, Added `accentText`. Tappable words get a dotted underline and open `/session/word-detail?wordIndex=`. A word is tappable when omitted, mispronounced, or it has phonemes, or it has more than one syllable. Punctuation-only tokens are not counted in coverage. Inserted words are not part of `total`.

What You Said. No sub-line. Non-empty `transcript` is one TX-10 user bubble, right edge x 373, same max width, pad, and radius, text start-aligned, selectable. Empty transcript is not a bubble: "No speech was recognized this session.", `footnoteProse` muted, at x 20.

Skills. Sub-line "How this session compares to your average", `footnote` 13 muted. Then CO-05, 353 × 280 (or 208 when fewer than 2 skills have data). Replaces SkillCard. Pills and the expanded card use `card` fill, not glass.

```
x 20                     192.5 200.5                      373
      (notch, sheet shows)   ╭──────────────────────────────╮
                             │ Pacing          ╭──────╮     │  ring disc 48, inset 8
                             │ [FOCUS]         │ icon │     │  name headline 17
      ╭──────────────────────╮│                 ╰──────╯     │
      │ Articulation   ╭────╮│  58 /100              [▲3]   │  numeralTile 28 · DeltaPill
      │ 72 /100        │ico ││  183 wpm · target 179        │  footnote muted, slot held if absent
      ╰────────────────╰────╯│ • • • • • • • • • • • • • •  │  20-dot meter
      ╭──────────────────────╮│                              │
      │ Flow           ╭────╮│                              │
      ╰────────────────╰────╯╰──────────────────────────────╯
      ╭──────────────────────╮╭──────────────────────────────╮
      │ Fillers        ╭────╮││ Expression          ╭────╮   │
      ╰────────────────╰────╯╰────────────────────╰────╯────╯
```

Packing: expanded skill is `focusSkill()` (weakest with data), rows A–C on the right. Compacts keep `SKILL_ORDER` minus that skill. Fallback (fewer than 2 skills with data): 5 compacts, no notch, height 208, row-major, bottom-right cell empty.

Skill homes:

| Skill | Name | Score | Caption (session framing) | Delta |
|---|---|---|---|---|
| accuracy | Articulation | `skills.accuracy` | "{cleanPct}% of words clean" when present | vs average, `hideZero` |
| fluency | Flow | `skills.fluency` | "{n} pause(s)" plus " · longest {s}s" when `longestPauseMs` > 0 | same |
| pace | Pacing | `skills.pace` | "{wpm} wpm · target {targetWpm}" | same |
| fillers | Fillers | `skills.fillers` | "{fillerCount} used" | same |
| intonation | Expression | `skills.intonation` | none; 16 pt slot held | same |

Identity color is the ring arc and the lit meter dots only, never text. FOCUS pill (`focus` tone) stays on the weakest skill wherever it sits. Expanded disc also gets `focusBg`. Compact FOCUS is `focusBg` on the disc only. Null score is a dash.

**CH-09 tray** (y 770–834, x 20–373, height 64, radius full, glass, pad 8, gap 8). Primary is trailing. No blur behind it.

```
x 20                                                                          x 373
  ╭─────────────────────────────────────────────────────────────────────────────╮
  │ ╭─────────────────────────────────╮ 8 ╭─────────────────────────────────╮   │
  │ │        ⟲ 20   Retry             │   │██████  ✓ 20   Done  ████████████│   │
  │ ╰─────────────────────────────────╯   ╰─────────────────────────────────╯   │
  ╰─────────────────────────────────────────────────────────────────────────────╯
  x 28–192.5 ghost, ink                         x 200.5–365 solid inverseSurface, inverse
  pills 164.5 × 48 · label headline 17 medium · icon + label centred as one unit
```

### Handling

| Target | Size / shape | Action | State |
|---|---|---|---|
| Dismiss | 48 circle | Same as Done: `dismissTo('/')`. | Chevron-down. |
| Title, score stack, facts | — | Not targets. | — |
| Play / pause | 48 disc, solid, inset 8 in the 64 pill | Toggles playback. Light haptic. | Glyph play or pause. a11y "Play recording" / "Pause playback". Hidden when unavailable. |
| Tab | ≈ 118 × 48 | Switches panel. Selection haptic. Tongue springs. Content crossfades 150 ms, no slide. | Selected ink. Default leftmost. Not sticky. |
| Compact skill | 172.5 × 64 stadium | Selects that skill into the expanded slot. Selection haptic. | Local, resets on remount. |
| Expanded skill | 172.5 × 208 | No action. | — |
| Tappable word | the word's text bounds | `/session/word-detail?wordIndex=`. Selection haptic. | Dotted underline. a11y "{word}, {status}. Show detail." |
| Try again (coach) | 48, label `accentText` | `coaching.retry`. | a11y "Retry AI coaching". |
| Retry | 164.5 × 48 ghost | Medium haptic, `bumpRetry()`, `router.back()`. | Icon restart role + "Retry". |
| Done | 164.5 × 48 solid | Medium haptic, `dismissTo('/')`. | Icon tick role + "Done", inverse. |

Disabled paints follow CH-09: primary `inverseSurfaceMuted`, secondary `tertiary`. Neither results pill is disabled today.

### Data homes

| Field | Zone |
|---|---|
| "Session Complete" | CH-02 title |
| `sessionScore` | TX-04 numeral |
| `/100` | TX-04 unit |
| Band word | TX-04 meta |
| `averageScore` delta, suffix "vs avg" | TX-04 DeltaLabel; omitted when null or 0 |
| "SPEAKING SCORE" | TX-04 eyebrow; omitted when unscored |
| `history` prior scored sessions + this session | TX-04 sparkline; slot collapses under 3 points |
| Unscored title + detail | UnscoredNotice; branch on `spokenWords` and `recordId` |
| `paceWpm` | Facts, WPM |
| `fillerCount` | Facts, Fillers; also Fillers caption "{n} used" |
| `pauseCount` | Facts, Pauses; also Flow caption |
| `longestPauseMs` | Flow caption suffix |
| `durationMs` | Facts, Time; PlaybackPill clock when not playing |
| `spokenWords` | Gates the facts row and the unscored title |
| `recordId` | Gates "Couldn't save" vs "Too short"; also which history row is excluded. Not printed. |
| `audioUri` | PlaybackPill availability |
| `waveform` | PlaybackPill bars |
| `positionMs` | Clock while playing; played-bar count |
| `skills` (5) | CO-05 scores |
| Skill deltas vs average | CO-05 DeltaPill, `hideZero` |
| Skill captions (`cleanPct`, pace wpm, `targetWpm`) | CO-05 expanded caption; compact shows score only |
| FOCUS / `focusSkill()` | CO-05 pill + `focusBg` |
| `breakdown.summary` | AI Coach summary bubble |
| Tip `title`, `guidance`, `evidence`, index | Tip bubbles |
| Coach loading copy | Pending bubble |
| `coaching.error` | Error bubble |
| `words`, `source` | Word Breakdown passage, coverage, caption |
| Coverage read / total / clear | Word Breakdown sub-line |
| Legend Clear / Unclear / Skipped / Added | TX-11d row |
| `transcript` | What You Said bubble, or the empty sentence |
| Retry / Done | CH-09 tray |

`overallScore` is not shown. The derived `sessionScore` is the hero.

---

## Word detail — `app/session/word-detail.tsx` → `components/session/word-detail.tsx`

Modal class. formSheet, `fitToContents`, grabber visible, native swipe-down kept. Not a full-screen 852 layout: y below is sheet-local, measured from the content top under the system grabber. Sheet width 393, content column x 20–373. Missing `result` or word: render nothing and dismiss. Not a layout.

Card-stack composition, CO-11-style content column: no sheet panel, no floating tray, no 72 pt list rows (this screen has none). Text sits on x 20–373. Guidance and notes use the CO-11 caption step (`footnote` / `footnoteProse`, muted). The score is the row value. CH-09 pair is the last content row, not a trailing disc.

### Vertical map

Representative stack: scored word, three syllables, one guidance sentence, one prosody note, both actions. Rows omit themselves when their data is absent, and the stack closes up by `md` 12.

| y | h | ID | Slot |
|---|---|---|---|
| — | system | grabber | Above this map. Not a control we draw. |
| 16–64 | 48 | CH-04 | Word left, ghost close right. Header top is `lg` 16 from the content top. |
| 64–88 | 24 | — | Header → content, `xxl` 24. |
| 88–114 | 26 | TX-06 | `word.score` + `/100`, only when `score != null`. Omitted otherwise. No dash. |
| 126–150 | 24 | chips | Syllable row, only when `syllables.length` ≥ 2. |
| 162– | hug | prose | Guidance sentence, `footnoteProse` muted. |
| next | hug | prose | 0–3 prosody notes, `footnoteProse` muted, `md` 12 apart. |
| last | 48 | CH-09 untrayed | Hear it, and Hear yours when the take can be played. Last row. Not a floating tray. |
| +24 | 24 | — | Content pad bottom `xxl` 24. |

Gaps between content rows are `md` 12 (card-stack rhythm). Inserted words omit the action row entirely.

### Component interiors

**CH-04 header.** Word is `display` (line height 46), one line, tail truncation, ink. Top offset 1 so line 1's center sits on the close axis. Close is the only outlined control: 48 ghost circle, ✕ 20, inset 20 from the top and the right. Nothing between the word and the close.

```
sheet content x 0                                                         393
y 16
x 20  syllable                                              ╭──────╮ x 325–373
      ↑ display, top offset 1 so the line center = close    │  ✕   │ 48 ghost
      axis (y 40). 1 line, tail ellipsis.                    │  20  │ hairline outline
                                                             ╰──────╯
y 64
      ↕ xxl 24
```

The printed word is `word.word` with non-letter characters stripped. a11y label on the close stays "Close word details".

**Score** (when present). `ScoreValue` size `row`: `title` 22 regular ink, unit `/100` muted, one baseline. Left edge x 20. Not tappable.

**Syllable chips** (no grammar ID restyles them; geometry stays today's). Wrap row, gap `xs` 4. Each chip is a stadium, pad H `md` 12 / V `xs` 4. Grapheme is `syllable.grapheme`, else `syllable.syllable`, `footnote`. Score, when not null, is `caption` tertiary beside it, gap `xs` 4, rounded. Weak (`score` < `PHONEME_WEAK_MAX`, 60): fill `accentBg`, grapheme ink. Otherwise fill `fill`, grapheme muted.

```
x 20
  ╭────────────╮ xs ╭────────────╮ xs ╭────────────╮
  │ syl    88  │    │ la     42  │    │ ble    95  │
  ╰────────────╯    ╰────────────╯    ╰────────────╯
  weak = accentBg                          others = fill
```

There is no phoneme chip row today. Phoneme symbols stay inside the guidance sentence. Do not add a row.

**Guidance** — one sentence, existing branches:

| Condition | Sentence |
|---|---|
| omitted | "You skipped this word. Hear it, then read the line again." |
| inserted | "An extra word, not in the passage." |
| weakest phoneme, with a heard phoneme | "The /{phoneme}/ sound came out closer to /{heard}/. " + next |
| weakest phoneme, no heard | "The /{phoneme}/ sound is the weak part. " + next |
| mispronounced, no weakest | "Close, but not clear. " + compare or slow line |
| else | "Clearly said." |

`next` is "Compare the two clips, then say the word slowly." when Hear yours can play, else "Say the word slowly and hold that sound." Mispronounced without a weakest phoneme uses "Close, but not clear. Compare the two clips and slow the word down." or "Close, but not clear. Slow the word down and finish every sound."

**Prosody notes**, each its own line, only when the flag is set:

- `monotone`: "Delivered flat. Let the pitch move on this word."
- `unexpectedBreak`: "You broke here, but the sentence runs on."
- `missingBreak`: "The punctuation here wants a short rest."

**CH-09 untrayed pair** — last content row, x 20–373, gap `sm` 8, no tray, no glass. Pills 48, radius full, ghost (`fillTranslucent` + hairline `outline`). Label `headline` 17 medium (was `footnote`). Icon 20 + `sm` 8 + label, centred as one unit. Both ghost: there is no solid commit on this sheet.

Two actions:

```
x 20                                      196.5                                      373
  ╭─────────────────────────────────╮ 8 ╭─────────────────────────────────╮
  │     🔊 20   Hear it             │   │     🎤 20   Hear yours          │
  ╰─────────────────────────────────╯   ╰─────────────────────────────────╯
  equal width · 48 · ghost · ink
```

One action (Hear yours unavailable): "Hear it" takes the full width, same 48 ghost pill.

Busy: spinner replaces the icon. Failed: label becomes "Unavailable", tone `tertiary`, icon `tertiary`. Each pill has its own busy/failed state.

Inserted: this whole row is absent.

### Handling

| Target | Size / shape | Action | State |
|---|---|---|---|
| Close | 48 ghost circle | `router.back()`, or `router.replace('/')` if it cannot go back. Pressed opacity 0.6. | a11y "Close word details". |
| Grabber / swipe | system | Native dismiss, same as close. | — |
| Word, score, chips, guidance, notes | — | Not targets. | — |
| Hear it | 48 stadium, full width if alone, else half minus 4 | `speakWord` of the stripped word. Light haptic. | Hidden when `status === 'inserted'`. Busy spinner. Failed "Unavailable". |
| Hear yours | 48 stadium, half minus 4 | `playOwnAttempt` from `audioStartMs` to `audioEndMs`. Light haptic. | Shown only when `audioUri`, `audioStartMs`, and `audioEndMs` are all set. Same busy/failed paints. |

Speaking stops on unmount.

### Data homes

| Field | Zone |
|---|---|
| `word.word` (stripped) | CH-04 title; also the Hear it utterance |
| `word.score` | TX-06 row, omitted when null |
| `word.syllables[].grapheme` or `.syllable` | Chip label |
| `word.syllables[].score` | Chip score; also the weak tint when < 60 |
| `word.phonemes` / `weakestPhoneme` / `heard` | Guidance sentence only. No chip row exists. |
| `word.status` | Guidance branch; inserted hides the action row; omitted / mispronounced also decide tappable on the parent screen |
| `word.prosody.monotone` | Prosody note |
| `word.prosody.unexpectedBreak` | Prosody note |
| `word.prosody.missingBreak` | Prosody note |
| `audioUri` + `audioStartMs` + `audioEndMs` | Hear yours visibility and playback range |
| Hear it / Hear yours busy + "Unavailable" | The pill that was pressed |
| Close | CH-04 |

Basis: 393 × 852, `insets.top` 59, `insets.bottom` 34. Page column x 20–373. Bottom chrome offset `max(insets.bottom − 16, 12)` = 18, so a floating 64 bar sits at y 770–834. Modal y below is in that same 852 frame with the sheet top at y 0 (iOS page sheet, CH-04). Android full-screen shifts the header to y 67 (`insets.top + 8`); everything under it shifts by the same 51. Colors by role only. No new copy.

Screen class overrides CO-01’s “onboarding = card stack” row. Onboarding is focus. Choice cards still use the CO-11 OptionCard interior.

---

## Onboarding

Files: `app/(onboarding)/_layout.tsx`, `components/onboarding/onboarding-screen.tsx`, `components/onboarding/choice-row.tsx`, and the five steps. Class: **focus**. One anatomy. Steps differ only in the slot table.

Shared shell. Canvas is `AtmosphereCanvas` stage. No sheet. No dock. Top blur stays. Sticky CTA has no bottom blur (D8). Page padding is 20, not 16. Name-step CTA still rides the keyboard (`KeyboardStickyView`); the closed position is the y below.

### Vertical map

| y | h | ID | Slot |
|---|---|---|---|
| 0–59 | 59 | — | Status blur |
| 67–131 | 64 | CH-02b | Back squircle or 64 spacer. Axis y 99. Dots on that axis, screen-centered. Trailing 64 spacer. |
| 131–179 | 48 | — | `xxxxl` void |
| 179– | 40 × lines (≤ 3) | TX-02 | Headline. Lead regular muted, emphasis bold ink. See step table. |
| +12 | — | — | `md` |
| next | 21 × lines | TX-02 | Subtitle, `subheadProse` 15/21 muted. |
| +24 | — | — | `xxl` |
| next | content | step slot | Name capsule, choice cards, or mic rows. Scrolls. |
| +12 | content | — | Note, `footnoteProse` muted. Omitted when null. |
| 714–758 | 44 | — | Footer text button. Microphone only, and only in the states in the step table. Centered `subhead` 15 medium muted. Gap 12 to the CTA. |
| 770–834 | 64 | solid CTA | Sticky solid stadium, x 20–373. Not CH-10. |

Scroll bottom inset = 18 + 64 + 32 = 114, plus 56 when the footer is showing, so the last line clears the bar.

### Component interiors

**Shell** (focus, 393 wide)

```
x 0    20            84                         196.5              309        373
y 67   ╭──────────────╮                                              ┌ ─ ─ ─ ─ ┐
       │     ← 20     │         •  ▬▬  •  •  •                      │ 64 spacer│
y 99   │              │         dots on axis, screen-centered       │          │
y 131  ╰──────────────╯                                              └ ─ ─ ─ ─ ┘
         CH-02b 64 squircle, r lg 24, glass          step 1: leading spacer, no glyph
         ↕ 48
y 179  How much do you want          TX-02 largeTitle 34/40
       to practice?                  lead regular muted · payload bold ink to the "?"
         ↕ 12
       This sets your daily goal.    subheadProse 15/21 muted, ragged right, x 20–373
       You can change it any time
       in Settings.
         ↕ 24
       [ step slot — see table ]
         ↕ 12 when a note is set
       footnoteProse muted note

y 714  Not now                        footer, centered, only when the step table says so
         ↕ 12
y 770  ╭──────────────────────────────────────────────────────────────╮
       │                     Continue                                 │  64 solid
y 834  ╰──────────────────────────────────────────────────────────────╯  inverseSurface
         label headline 17 medium inverse, centered. No icon. No blur.
```

**Choice row** (CO-11 OptionCard, one card per option, x 20–373, r lg 24, glass). Accent and goal omit the disc. Priority skills include it. “Not sure yet” omits it.

```
local x  0   20      68  84                                      309 321  345 353
         ╭──────────────────────────────────────────────────────────────╮ r lg 24
y 0      │                                                              │
    12   │   ╭──────╮   Title                 headline 17 ink, 1 line   │  (✓) 24
         │   │ icon │   Caption               footnote 13 muted, 1 line │
    60   │   │  20  │                                                   │  mark right
         │   ╰──────╯   stack v-centered on the disc                    │  edge x 321
y 72     ╰──────────────────────────────────────────────────────────────╯
         min 72. Grows if the caption wraps. Cards gap md 12.
         disc 48 only when the row has an icon. Else text starts at x 20.
         selected: 1.5pt ink rim on the card + filled mark.
         unselected: no rim; mark is a 1.5pt track ring.
```

**Name capsule** (CH-05a, replaces the glass card)

```
x 20                                                                 373
     Your name                         footnote 13 muted, x = text start (20)
       ↕ 8
     ╭──────────────────────────────────────────────────────────────────╮
     │ 20  Your first name / typed value          body 17               │ 48
     ╰──────────────────────────────────────────────────────────────────╯
     hairline outline → 1pt foreground when focused. No leading glyph. No clear.
```

**Mic rows** (containerless, not OptionCards). Disc grows 40 → 48 (control module). Glyph stays 20. Rows gap 16.

```
x 20   ╭──────╮  12  Microphone, so Clarity can hear you read.     subheadProse muted
       │ mic  │      (wraps, flex 1, ragged right)
       │  20  │
       ╰──────╯  48, fillTranslucent + hairline frostRim, glyph onAtmosphere

granted / simulated only, same row:
       ╭──────╮  12  Microphone and speech recognition are on.     subheadProse ink
       │  ✓   │      or "Scripted speech is ready for this session."
       ╰──────╯  48, accent fill, tick onAccent
```

### Handling

| Target | Size / shape | Action | State |
|---|---|---|---|
| Back chip | 64 squircle, steps 2–5 | `router.back()`, selection haptic | Glass interactive; non-glass opacity 0.7. Step 1 is a dead 64 spacer. |
| Progress dots | 6 dot, active 20 × 6, gap 8 | None | Current `onAtmosphere`. Done `onAtmosphereMuted`. Upcoming `track`. |
| Choice card | full card, ≥ 72, r lg 24 | Writes that step’s setting. Re-tap of the current value is a no-op. | `radio` + `selected`. Selected = ink rim + filled accent mark. Pressed: glass interactive, else opacity 0.85. |
| Name field | 353 × 48 stadium | Edits `displayName` draft. Return key runs Continue. | Focus border 1pt `foreground`. Max 24. Placeholder “Your first name”. |
| Mic row discs | 48 circles | None | Granted/simulated disc is accent. Others are outline beds. |
| Footer | text, min 44 × hug, centered | `finish` → writes `onboardingCompletedAt` | “Not now” if undetermined. “Continue without it” if blocked. Pressed opacity 0.6. |
| CTA | 353 × 64 stadium, y 770–834 | Step table | Solid `inverseSurface`, label inverse. Disabled: `inverseSurfaceMuted`, layout unchanged. Checking disables it. |

Continue on name, accent, goal, and priority always pushes the next route, even if the write failed. The note is the only failure signal. Microphone `finish` does not navigate; the root guard swaps in the tabs when `onboardingCompletedAt` stamps.

### Data homes

Shared fields live in the shell. Step fields live in the slot column.

| Field | Home |
|---|---|
| Step index (`name accent goal priority microphone`) | CH-02b dots |
| Back availability (index > 0) | CH-02b chip vs spacer |
| `emphasis` suffix | TX-02 payload |
| Subtitle | TX-02 subtitle |
| Write-failed note | Note under the slot |
| CTA label | Solid CTA |

**Name** — `app/(onboarding)/name.tsx`

| Field | Home |
|---|---|
| Title “What should we call you?” / *call you?* | TX-02 |
| “Clarity uses your name to greet you on the home screen. Nothing else.” | Subtitle |
| “Your name” | CH-05a label |
| `displayName` draft, prefilled from stored then Clerk `firstName` | CH-05a value |
| “Your first name” | CH-05a placeholder |
| “Continue” | CTA → `/(onboarding)/accent` |
| “That name could not be saved right now. You can set it in Settings later.” | Note, only after a failed write |

**Accent** — `app/(onboarding)/accent.tsx`

| Field | Home |
|---|---|
| “Which accent do you speak?” / *you speak?* | TX-02 |
| “Your reading is scored against this accent. Picking the one you actually speak stops your own vowels being counted as mistakes.” | Subtitle |
| American / United States (`en-US`, default) | Choice card |
| British / United Kingdom | Choice card |
| Australian / Australia | Choice card |
| Canadian / Canada | Choice card |
| Indian / India | Choice card |
| `accentLocale` selection | Card rim + mark |
| “Per-sound feedback, the tips that name a sound like /θ/, is available for American English only. You still get word and syllable scores.” | Note, when `!hasPhonemeDetail` |
| “That choice could not be saved. Your device may be out of storage.” | Note, replaces the phoneme note after a failed write |
| “Continue” | CTA → `/(onboarding)/goal` |

**Goal** — `app/(onboarding)/goal.tsx`

| Field | Home |
|---|---|
| “How much do you want to practice?” / *practice?* | TX-02 |
| “This sets your daily goal. You can change it any time in Settings.” | Subtitle |
| “5 minutes” / “A quick daily rep.” | Choice card |
| “10 minutes” / “A steady habit.” | Choice card |
| “20 minutes” / “Real practice time.” (default) | Choice card |
| “30 minutes” / “You are training for something.” | Choice card |
| `goalMinutes` selection | Card rim + mark |
| Write-failed note (same string as accent) | Note |
| “Continue” | CTA → `/(onboarding)/priority` |

**Priority** — `app/(onboarding)/priority.tsx`

| Field | Home |
|---|---|
| “What do you want to work on?” / *work on?* | TX-02 |
| “Clarity starts you here. Once you have a few sessions, your own results take over.” | Subtitle |
| Articulation / “Say every sound clearly.” + target icon | Choice card, 48 disc |
| Flow / “Speak smoothly, without stumbles.” + wave icon | Choice card, 48 disc |
| Pacing / “Hold a steady speed.” + speed icon | Choice card, 48 disc |
| Fillers / “Cut the um and the uh.” + chat icon | Choice card, 48 disc |
| Expression / “Add melody and emphasis.” + theater icon | Choice card, 48 disc |
| “Not sure yet” / “Start with a mix and let Clarity work it out.” | Choice card, no disc. Selected only after a tap, not on arrival. Stores null. |
| `prioritySkill` / `notSure` | Card rim + mark |
| Write-failed note | Note |
| “Continue” | CTA → `/(onboarding)/microphone`. Untouched (not `notSure` and still null) is not stamped. |

**Microphone** — `app/(onboarding)/microphone.tsx`

| Field | Home |
|---|---|
| “Clarity needs to hear you” / *hear you* | TX-02 |
| “Your device will ask for each permission in its own dialog.” | Subtitle |
| “Microphone, so Clarity can hear you read.” | Mic row |
| “Speech recognition, so it can follow the words and score them.” | Voice row |
| “Your recording is sent to a speech service to be scored.” | Shield row |
| “Microphone and speech recognition are on.” | Granted row, `granted` only |
| “Scripted speech is ready for this session.” | Granted row, `simulated` only |
| “Allow microphone access” | CTA, `undetermined` and `checking` |
| “Start practicing” | CTA, `granted` or `simulated` → `finish` |
| “Open Settings” | CTA, `blocked` → `Linking.openSettings()` |
| “Continue” | CTA, `restricted` → `finish` |
| CTA disabled | `checking` only |
| “Not now” | Footer, `undetermined` → `finish` |
| “Continue without it” | Footer, `blocked` → `finish` |
| “This session uses scripted speech, so it does not need microphone access.” | Note, `simulated` |
| “Speech recognition is not available on this device. Simulators usually lack it. Try a physical device.” | Note, `!available` and not simulated |
| “Clarity cannot score a reading without the microphone. Turn it on in Settings whenever you are ready.” | Note, `blocked` |
| “Speech recognition is turned off by a restriction on this device. A parent or an administrator controls it.” | Note, `restricted` |
| “Clarity could not finish setting up on this device. Tap again to retry.” | Note, failed `finish`. Replaces the state note. CTA stays so the retry has a target. |

---

## Sign-in

File: `app/(auth)/sign-in.tsx`. Class: **entry**. Canvas only. No header, no sheet, no dock.

### Vertical map

iOS, no status line, no dev button. Android drops the Apple row; Google then occupies y 770–834 alone.

| y | h | ID | Slot |
|---|---|---|---|
| 0–59 | 59 | — | Status blur |
| 67–115 | 48 | wordmark | SpeechMark 64 × 20, tone `accent`, then “Clarity” `headline` 17 bold `onAtmosphere`. Gap 8. Left edge x 20. Not tappable. |
| 115–474 | flex | — | Void. Statement is bottom-anchored, not top-anchored. |
| 474–590 | 116 | TX-01 | `sectionTitle` 24, pitch ≈ 29. Line 1 ink. Line 2 muted, 3 lines. Bold lead is removed. |
| 614–662 | 48 | pills | Pace · Pronunciation · Fluency. Gap 24 below the statement. |
| 662–694 | 32 | — | `xxxl` |
| 694–758 | 64 | solid CTA | “Continue with Apple”. iOS only. |
| 758–770 | 12 | — | `md` |
| 770–834 | 64 | frost CTA | “Continue with Google”. |

Status lines, when set, sit centered in the 32pt gap and grow upward into the void. They do not move the CTAs. The dev text button, when the build has one, sits in that same gap under the status lines, centered, `subhead` 15 medium muted. It does not sit below Google: the lower CTA owns y 770–834.

### Component interiors

```
x 20                                                              373
y 67   ▮▯▮▮  Clarity                         SpeechMark h 20 + headline 17 bold
y 115
       (void)
y 474  Practice out loud.                   sectionTitle 24 regular ink
       Track your pace, pronunciation,      sectionTitle 24 regular muted
       and the words that slow you down.    ≤ 3 lines, ragged right
         ↕ 24
y 614  ╭────────╮ 8 ╭─────────────────╮ 8 ╭──────────╮
       │  Pace  │   │  Pronunciation  │   │  Fluency │   48, hairline + fillTranslucent
y 662  ╰────────╯   ╰─────────────────╯   ╰──────────╯   subhead 15 medium, centered
       not buttons. Hug label + 20 each side.

y 694  ╭──────────────────────────────────────────────────────────────╮
       │              (Apple 20)  Continue with Apple                 │  64 solid
y 758  ╰──────────────────────────────────────────────────────────────╯  inverse label
         ↕ 12
y 770  ╭──────────────────────────────────────────────────────────────╮
       │              (Google 20)  Continue with Google               │  64 frost
y 834  ╰──────────────────────────────────────────────────────────────╯  ink label
       icon + label centered as one unit. Gap 8. headline 17 medium.
```

### Handling

| Target | Size / shape | Action | State |
|---|---|---|---|
| Apple CTA | 353 × 64 stadium | Apple sign-in | iOS only. Solid. Disabled while `busy` or Clerk is not loaded. Pressed opacity 0.85. |
| Google CTA | 353 × 64 stadium | Google sign-in | Frost, on the canvas (not nested in a sheet). Same disabled rule. |
| Dev text button | hug × ≥ 44, centered | Dev password or simulator test sign-in | Only if `SIMULATOR_TEST_EMAIL` or `DEV_ACCOUNT`. Label “Sign in as dev test user” or “Sign in as dev (development build only)”. Pressed or disabled opacity 0.6. |
| Pills, wordmark, statement | — | None | Statement may use `IntroReveal`. |

Failure copy, centered `footnote` muted, in the gap above the CTAs. One of: the auth error from `describeAuthError`, “Connecting…”, “Simulator sign-in needs the Clerk development environment.”, “The simulator test user is not configured.”, “Dev sign-in failed. Check the Metro console.” A cancel does not set a failure.

### Data homes

| Field | Home |
|---|---|
| SpeechMark + “Clarity” | Wordmark row |
| “Practice out loud.” | TX-01 line 1, ink, regular |
| “Track your pace, pronunciation, and the words that slow you down.” | TX-01 line 2, muted |
| Pace / Pronunciation / Fluency | Pill row |
| “Continue with Apple” | Upper CTA, iOS |
| “Continue with Google” | Lower CTA |
| `failure` | Status line above the CTAs |
| “Connecting…” | Status line, `!clerk.loaded` |
| `SIMULATOR_AUTH_ERROR` | Status line, automation builds |
| Dev button label | Text button above the CTAs, dev builds only |
| `busy` | Disables both CTAs and the dev button. No spinner and no label change. |

---

## Settings

File: `app/settings.tsx`. Class: **modal**, card stack. No commit bar. No new rows.

### Vertical map

Sheet top = y 0. Content scrolls. Later sections sit below 852; y is content y, not viewport y.

| y | h | ID | Slot |
|---|---|---|---|
| 16–64 | 48 | CH-04 | “Settings” `title3` 20 regular, x 20. Close circle x 325–373. |
| 88–103 | 15 | eyebrow | ACCOUNT |
| 111–383 | 272 | CO-11 group | Account card. 200 tall if there is no email. |
| 415–430 | 15 | eyebrow | YOUR ACCENT |
| 438–495 | 57 | blurb | Accent blurb, 3 lines `footnoteProse`. |
| 503–879 | 376 | CO-11 group | 5 accent rows. |
| +12 | wrap | note | Phoneme note, only if the selected locale is not `en-US`. |
| +32 | 15 | eyebrow | DAILY GOAL |
| +8 | 38 | blurb | Goal blurb, 2 lines. |
| next | 304 | CO-11 group | 4 goal rows. |
| +32 | 15 | eyebrow | WHAT YOU WANT TO WORK ON |
| +8 | 38 | blurb | Priority blurb, 2 lines. |
| next | 448 | CO-11 group | 5 skill rows + “Not sure yet”. |
| +32 | 15 | eyebrow | PRIVACY |
| +8 | 72 | CO-11 group | Switch row. |
| +12 | wrap | note | Write-failed note, only after a failed write. |

Section gap is 32. Eyebrow sits 8 above its card. A blurb, when the section has one, sits between them with 8 above the card. Card padding H 20, V 8. Scroll padding bottom = 34 + 32.

### Component interiors

**Account card** (the group whose interior is not a radio list). Glass strong, r lg 24, x 20–373.

```
local x 0            20                                          333
        ╭──────────────────────────────────────────────────────────╮
   8    │  Name                              footnote 13 muted     │
        │  Your first name / draft           headline 17 ink       │  inline input
  80    │──────────────────────────────────────────────────────────│  hairline, text column
        │  Signed in as                      footnote 13 muted     │  omitted if no email
        │  user@mail                         headline 17 ink       │
        │──────────────────────────────────────────────────────────│
        │  Sign out                          headline 17 danger    │  56
        │──────────────────────────────────────────────────────────│
        │  Delete account                    headline 17 danger    │  56
   +8   ╰──────────────────────────────────────────────────────────╯
        text-only rows, padding V 16, min 56. No leading disc. No mark.
```

**Choice group** (accent, goal, priority — same interior). Mark only when selected. No empty ring. No leading disc.

```
local x 0   20                                              289 301  333
        ╭──────────────────────────────────────────────────────────╮
        │  American                          headline 17 ink   (✓) │  inverse mark 24
        │  United States                     footnote 13 muted     │  only if selected
        │──────────────────────────────────────────────────────────│
        │  British                                                 │
        │  United Kingdom                                          │
        ╰──────────────────────────────────────────────────────────╯
        row min 56, grows to fit the caption. Divider from inner x 20 to inner right.
```

Privacy row is the account-row shape with a native Switch trailing, no caption, no mark.

### Handling

| Target | Size / shape | Action | State |
|---|---|---|---|
| Close | 48 ghost circle | `router.back()`, selection haptic | `fillTranslucent` + 1pt ring. Glyph ✕ 20. Pressed opacity 0.6. a11y “Close”. Sheet swipe-down still dismisses. |
| Name input | row, ≥ 56 | Drafts `displayName`. Blur or Done commits. | Max 24. Placeholder “Your first name”. Stays editing if the write fails, so the draft is not replaced. |
| Email row | row | None | Hidden when `primaryEmailAddress` is null. |
| Sign out | full row, ≥ 56 | Alert “Sign out of Clarity?” / “Your practice history on this device is removed.” Cancel · Sign out | Danger. Disabled while `busy`, opacity 0.6. Confirm warns, then `signOutAndClear`. Failure alert “Sign out failed” / “Check your connection and try again.” |
| Delete account | full row, ≥ 56 | Alert “Delete your account?” / “This removes your account and everything Clarity has stored for it. It cannot be undone.” Cancel · Delete account | Danger. Same busy rule. Failure alert “Could not delete your account” / “Check your connection and try again.” |
| Accent / goal / skill / Not sure yet | full row, ≥ 56 | `choose` writes that setting. Re-tap of the current value is a no-op. | `radio`. Selected = inverse filled mark. Pressed opacity 0.6. Selection haptic. |
| Switch | native | Writes `improveClarity` | On = true. Selection haptic. |
| Eyebrows, blurbs, notes | — | None | — |

### Data homes

| Field | Home |
|---|---|
| “Settings” | CH-04 title |
| ACCOUNT | Eyebrow |
| “Name” + `displayName` draft | Account row 1 |
| “Your first name” | Name placeholder |
| “Signed in as” + email | Account row 2, if email |
| “Sign out” + both alert strings | Account row 3 + system alert |
| “Delete account” + both alert strings | Account row 4 + system alert |
| YOUR ACCENT | Eyebrow |
| Accent blurb (same sentence as the accent step subtitle) | Blurb |
| American…Indian + region | Accent card, 5 rows |
| `accentLocale` | Inverse mark on the selected row |
| Phoneme note (same sentence as the accent step) | Note under the accent card |
| DAILY GOAL | Eyebrow |
| “Your goal ring on Home fills as you reach this each day.” | Blurb |
| 5 / 10 / 20 / 30 minutes + the four captions | Goal card |
| `goalMinutes` | Inverse mark |
| WHAT YOU WANT TO WORK ON | Eyebrow |
| “This picks your early suggestions. Once you have a few scored sessions, Clarity follows your measured results instead.” | Blurb |
| Five skill titles + `SKILL_GOALS` captions | Priority card |
| “Not sure yet” / “Start with a mix and let Clarity work it out.” | Last priority row. Selected when `prioritySkill === null`. |
| `prioritySkill` | Inverse mark |
| PRIVACY | Eyebrow |
| “Use my data to improve Clarity” | Privacy row title |
| `improveClarity` | Switch |
| “That preference could not be saved. Your device may be out of storage.” | Note under Privacy |

---

## Paywall

File: `app/paywall.tsx`. Class: **modal**. Not a card stack. CH-03, then one mesh slab.

### Vertical map

Available build. Sheet top = y 0. Slab `flexGrow`s so Continue is on the first paint and Restore sits just below the fold.

| y | h | ID | Slot |
|---|---|---|---|
| 16–64 | 48 | CH-03 | Crown circle + “Clarity **Pro**” pill, centered. |
| 88–852 | flex | slab | Mesh, r hero 36, x 20–373. Interior below. |
| below slab | hug | text button | “Restore purchase”, centered, `subhead` 15 medium muted. Gap 24 under the slab. |
| next | hug | legal | “Terms of Use” · “\|” · “Privacy Policy”, `caption` 12 muted, gap 12. |

Unavailable build replaces this whole map with one centered slab. No CH-03, no close, no plans. Swipe-down is the only dismiss.

### Component interiors

**Slab** (local pt, width 353, padding 20, inner x 20–333). Close inset = padding, so it sits at local (285, 20).

```
local 0                                                                 353
    ╭────────────────────────────────────────────────────────────────────╮ r hero 36
 20 │  4 Get the full power of          largeTitle 34/40          ╭────╮ │
    │    Clarity                        lead muted regular        │ ✕20│ │ 48 ghost
    │                                  payload "Clarity" bold ink ╰────╯ │  axis y 44
    │    ↕ 24 from header bottom                                          │
    │    ╭────╮  Unlimited practice sessions          subheadProse ink   │
    │    │ ✓  │  Personal AI speech coaching                             │
    │    ╰────╯  Full speaking analytics and history                     │
    │     28    Early access to new features          rows gap 12        │
    │    ↕ flex, min 32                                                   │
    │    ╭────────────────────────────────────────────────────────────╮ │
    │    │ (✓) Annual  [Save 44%]                      $XX.XX         │ │ 64 stadium
    │    │                                             $X.XX / mo     │ │
    │    ╰────────────────────────────────────────────────────────────╯ │
    │    │ ( ) Monthly                                 $XX.XX         │ │
    │    │                                             per month      │ │
    │    │ ( ) Weekly                                  $XX.XX         │ │
    │    │                                             per week       │ │  gap 8
    │    ↕ 8                                                           │
 8  │ ╭────────────────────────────────────────────────────────╮ 8    │
    │ │ Continue with Clarity Pro                    ╭──────╮  │      │  CH-10, 64
    │ │ headline 17 medium ctaLabel                  │  →20 │  │      │  inset 8 L/R/B
    │ ╰──────────────────────────────────────────────╰──────╯──╯      │
    ╰────────────────────────────────────────────────────────────────────╯
```

Plan row, local to the 64 stadium: mark 24 at x 20, title `title3` 20 regular, badge 22 hugging “Save NN%” (`caption` 12 medium, hairline), price column right-aligned at the inner pad. Price is the store `priceString` whole, `title3` 20 regular, never split. Second line `footnote` 13 muted: annual uses `pricePerMonthString + " / mo"` when the store provides it, otherwise the caption “per year”; monthly “per month”; weekly “per week”.

Loading replaces the three stadia with one 208-tall slot (3 × 64 + 2 × 8) and a spinner. Load failure uses that same slot for “Plans could not load. Check your connection and reopen this screen.”

**Unavailable slab** (centered, x 20–373, padding 24, gap 12, r hero 36):

```
        ╭────────╮
        │   ♛ 32 │   64 tile, r md 20, fillTranslucent + hairline, crown proGold
        ╰────────╯
        Clarity Pro is unavailable          title 22 regular, centered, onAtmosphere
        This build has no store connected,  subheadProse muted, centered
        so plans cannot load. Try the app
        on a device or simulator build.
```

### Handling

| Target | Size / shape | Action | State |
|---|---|---|---|
| CH-03 crown + pill | 48 circle, 48 pill | None | Identity. a11y text. |
| Close | 48 ghost circle | `router.back()` once | Double-dismiss latch (`dismissed` ref). Pressed opacity 0.6. a11y “Close”. Swipe-down kept. |
| Plan card | full stadium, ≥ 64 | Selects that package | `radio`. Selected = 1.5pt ink rim + inverse filled mark. Default selection is the first sorted plan (Annual). Pressed opacity 0.85. |
| Continue | slab inner width − 16 × 64, CH-10 | `purchasePackage` | Disabled when `busy` or nothing is selected. Disabled track `inverseSurfaceMuted`, circle `fill`, glyph `tertiary`, layout unchanged. Busy: spinner `onAccent` in the circle, label stays. |
| Restore purchase | text, centered | `restore()` | Disabled while `busy`. Pressed opacity 0.85. |
| Terms of Use | caption | Opens the Apple EULA URL | — |
| Privacy Policy | caption | Opens the privacy URL | — |

Purchase results, system alerts, not new screens:

| Outcome | What happens |
|---|---|
| purchased | Success haptic, `refresh()`, close |
| pending | “Payment pending” / “Your payment is still processing. Clarity Pro unlocks as soon as it clears.” Paywall stays. |
| failed | “Purchase failed” / `result.message` |
| cancelled | Stay open. No alert. |
| restored | Success haptic, close |
| nothing to restore | “Nothing to restore” / “We could not find a Clarity Pro purchase on this store account. Make sure you are signed in with the account you bought it on.” |
| restore failed | “Restore failed” / `result.message` |

### Data homes

| Field | Home |
|---|---|
| Crown | CH-03 circle, `proGold` |
| “Clarity” + “Pro” | CH-03 pill |
| “Get the full power of ” / **Clarity** | TX-02 in the slab header |
| Close | CH-04 circle |
| Four feature strings | Feature rows, tick disc + prose |
| Annual / Monthly / Weekly | Plan cards, that order |
| `priceString` | Plan price, unsplit |
| `pricePerMonthString` or “per year” / “per month” / “per week” | Plan caption |
| “Save {n}%” | Badge on Annual only, and only when `annualSavings` is non-null |
| Selected package id | Plan rim + mark. Default first plan. |
| Plans loading | 208 slot, spinner |
| “Plans could not load. Check your connection and reopen this screen.” | That same slot |
| “Continue with Clarity Pro” | CH-10 |
| `busy` | Continue spinner + both actions disabled |
| “Restore purchase” | Text button under the slab |
| “Terms of Use” / “Privacy Policy” | Legal row |
| Unavailable title, body, crown tile | Centered slab, `!available` only |

---

## Manage subscription

File: `app/manage-subscription.tsx`. Class: **modal**.

### Vertical map

**Store build** (Customer Center loads): the RevenueCat view fills y 0–852. Clarity draws no header, no card, and no CTA. Its chrome, plan rows, and entitlement actions are that view’s.

**Fallback** (Expo Go, or the native view failed to load):

| y | h | ID | Slot |
|---|---|---|---|
| 0–852 | — | canvas | Ambient. Slab vertically centered. |
| ~300–552 | hug | slab | x 20–373, r hero 36, mesh, padding 20, gap 12. |

### Component interiors

Fallback slab only. The Customer Center is not restyled.

```
x 20                                                                 373
     ╭───────────────────────────────────────────────────────────────╮
 20  │  Subscriptions are unavailable here     title 22 regular      │  centered
     │  ↕ 12                                                         │
     │  Manage billing in a development or     subheadProse muted    │  centered
     │  store build. Expo Go cannot talk to                          │
     │  the App Store or Play Billing.                               │
     │  ↕ 12                                                         │
     │  ╭─────────────────────────────────────────────────────────╮  │
     │  │                        Close                            │  │  64 solid
     │  ╰─────────────────────────────────────────────────────────╯  │  not CH-10
 20  ╰───────────────────────────────────────────────────────────────╯
```

### Handling

| Target | Size / shape | Action | State |
|---|---|---|---|
| Customer Center dismiss | the view’s own control, plus swipe-down | `router.back()` once | `dismissed` latch. |
| Restore completed | inside the view | `refresh()` | Entitlement re-read. |
| Refund request completed | inside the view | `refresh()` | Same. |
| Promotional offer succeeded | inside the view | `refresh()` | Same. |
| Showing manage subscriptions | inside the view | `refresh()` | Same, so a store cancel is visible on return. |
| Fallback Close | inner width × 64 solid stadium | `router.back()` once | Label “Close”, `headline` 17 medium inverse, centered. Same latch. |

The view’s own rows cover the active plan, plan change, cancel, iOS refund request, and “I paid and nothing happened.” Which of those appear is dashboard config, not a Clarity layout. They are not redrawn here.

### Data homes

| Field | Home |
|---|---|
| Active plan, change, cancel, refund, missing-purchase report | Customer Center view, store build |
| Restore / refund / offer / manage-subscription callbacks | `refresh()` on the paths above. No extra row. |
| “Subscriptions are unavailable here” | Fallback slab title |
| “Manage billing in a development or store build. Expo Go cannot talk to the App Store or Play Billing.” | Fallback body |
| “Close” | Fallback solid 64 |

---

## Passage editor

File: `app/passage-editor.tsx`. Class: **modal**, card stack. Save is floating CH-10, not a commit bar inside a card.

### Vertical map

Sheet top = y 0. Save is screen-fixed at y 770–834 and rides the keyboard.

| y | h | ID | Slot |
|---|---|---|---|
| 16–64 | 48 | CH-04 | “New Passage” `title3` 20 regular, x 20. Close x 325–373. |
| 88–111 | 23 | label | “Title”, `footnote` 13 muted. |
| 119–167 | 48 | CH-05a | Title capsule. Replaces the Title card. |
| 199– | ≥ 222 | CO card | “Your words” card. Gap 32 from the capsule. |
| +32 | 13 | caption | “Reading pace”, `footnote` 13 muted, left-aligned on x 20. |
| +8 | 48 | CH-06 | Slow / Natural / Brisk. `sm` 8 below the caption. |
| 770–834 | 64 | CH-10 | “Save to Library”, x 20–373. |

Scroll inset bottom = 114 so the pace pills clear the capsule. No bottom blur.

### Component interiors

**Header + pace + save**

```
sheet top
  16
  x 20  New Passage                              ╭──────╮ x 325–373
        title3 20 regular                        │  ✕20 │ 48 ghost
                                                 ╰──────╯

  … title capsule, words card …
x 20  Reading pace                                          footnote 13 muted
      ↕ sm 8
x 20            132.3      140.3           252.7      260.7           373
  ╭──────────────╮  8  ╭──────────────────╮  8  ╭──────────────────╮
  │     Slow     │     ┃     Natural      ┃     │      Brisk       │  48
  ╰──────────────╯     ╰──────────────────╯     ╰──────────────────╯
  hairline, ink label       inverseSurface          hairline
  subhead 15 medium, centered. Equal width 112.3.

y 770 ╭───────────────────────────────────────────────────────────╮
      │ 24  Save to Library                          ╭──────╮ 8  │  64
      │     headline 17 medium ctaLabel              │ book │    │  circle 48
y 834 ╰──────────────────────────────────────────────╰──────╯────╯
        x 20                                              x 373
        track ctaTrack · circle accent · glyph onAccent
```

**Your words card** (glass strong, r lg 24, padding 20). The new piece is the CO-12a bar.

```
local 0                                                                 353
    ╭────────────────────────────────────────────────────────────────────╮
 20 │  Your words                              footnote 13 muted        │
    │  ↕ 8                                                               │
    │  Paste any text, speech, or transcript…  bodyProse 17/24           │
    │  multiline, min 150, max 260, top-aligned                          │
    │  ──────────── hairline divider, margin 12 ────────────             │
    │  ○━━━━━━━━━━━━━━●········   CO-12a hairline, band 12               │
    │  hidden once wordCount ≥ 20                                        │
    │  12 of 20 words needed                   footnote 13 tabular       │
 20 ╰────────────────────────────────────────────────────────────────────╯
```

### Handling

| Target | Size / shape | Action | State |
|---|---|---|---|
| Close | 48 ghost circle | `router.back()`, selection haptic | Same ghost treatment as Settings. a11y “Close”. Swipe-down kept. |
| Title capsule | 353 × 48 | Edits title, clears `saveError` | Max 48. Placeholder “My speech”. Focus border 1pt `foreground`. Return key moves to the body. |
| Words field | card inner × 150–260 | Edits text, clears `saveError` | Max `PASSAGE_TEXT_MAX` (50000). |
| Pace pill | 112.3 × 48 | Sets `paceIndex`. Selection haptic. | Re-tap of the selected pill is a no-op. Selected fill slides. Default index 1, Natural. |
| Save | 353 × 64, y 770–834 | `addPassage({ title, text, targetWpm })` | Disabled until title is non-empty and words ≥ 20. Disabled track `inverseSurfaceMuted`, circle `fill`, glyph `tertiary`, layout unchanged. Success haptic then `router.back()`. Failure haptic, stay, meta line turns danger. |

### Data homes

| Field | Home |
|---|---|
| “New Passage” | CH-04 title |
| “Title” | Label above the capsule |
| Title draft | CH-05a value |
| “My speech” | Placeholder |
| “Your words” | Card label |
| Passage text | Multiline field |
| “Paste any text, speech, or transcript…” | Placeholder |
| Words toward 20 | CO-12a bar, hidden at ≥ 20 |
| “At least 20 words to save” | Meta, `wordCount === 0` |
| “{n} of 20 words needed” | Meta, 0 < n < 20 |
| “{n} words · ~{m} min(s) at {wpm} wpm” | Meta, n ≥ 20. Minutes plural when > 1. WPM is 120 / 150 / 175 from the selected pill. |
| “Couldn't save this passage. Your device may be out of storage.” | Meta, danger, replaces the preview |
| Slow / Natural / Brisk | CH-06 pills. WPM is not drawn on the pill. |
| “Reading pace” | Caption above the pills, `footnote` 13 muted, left-aligned on x 20, then `sm` 8, then CH-06. |
| “Save to Library” + book glyph | CH-10 |
| `canSave` | CH-10 disabled state |

## 6. Structural cutover

Shape changes only. No code in this plan. No route, scoring, Convex, or copy change.

| What changes | Files | Shape |
|---|---|---|
| Dock becomes icon-only, 176 × 64, three 48 circles, no labels, no minimize-on-scroll. Icons stay `Home07Icon`, `AudioLinesIcon`, `Chart02Icon`. | `components/glass-tabs/glass-tab-bar.tsx`, `components/glass-tabs/minimize-context.tsx`, `app/(tabs)/_layout.tsx` | `GlassTabBar` loses the label block, the expanded/minimized height pair, and the scroll-driven minimize. Scrub stays. `useMinimizeOnScroll` leaves the tab screens. Scroll inset becomes 114. |
| Knob moves right. | `components/ui/primary-button.tsx` | `variant="knob"` is label-left, accent circle inset 8 on the right, 64 tall. The circle is the handle. The label is not centered. Callers: Home "Start Practicing", Practice "Start Speaking", paywall Continue, passage editor "Save to Library". |
| LED numerals and metric capsules are removed. | `components/ui/led-number.tsx`, `components/ui/metric-capsule.tsx`, `components/ui/index.ts`, `constants/led-digits.ts` | Delete `LedNumber`, `MetricCapsule`, and the digit maps. No replacement glyph component. Numerals are `ScoreValue` / `ThemedText`. Analytics Effort tiles become CO-02S in `app/(tabs)/analytics.tsx`. |
| Progress card splits. | `components/progress-card.tsx`, `app/(tabs)/index.tsx` | The speaking-score head becomes the first CO-02L tile (TX-03 compact). The other three totals become the other three CO-02L tiles. The uppercase band pill goes. The card component does not survive as one surface. |
| Daily goal card dissolves. | `components/daily-goal-card.tsx`, `app/(tabs)/index.tsx` | The stage and shelf become TX-05 + CO-07 + CH-10 on the Home canvas. No fan, no card around them. |
| Segmented control leaves Analytics. | `components/segmented-control.tsx`, `app/(tabs)/analytics.tsx` | Week / Month / All time becomes CH-05b in the TX-03 slot. `SegmentedControl` stays for the passage editor pace pills (`app/passage-editor.tsx`), which become CH-06 equal pills. It does not stay on Analytics. |
| Results gains folder tabs. Playback stays on the canvas. | `app/session/results.tsx`, `components/session/results-footer.tsx` | Scored results: canvas holds TX-04, facts, and `PlaybackPill`. CH-07 switches AI Coach (default) / Word Breakdown (freestyle: What You Said) / Skills. `ResultsFooter` becomes the CH-09 tray (no bottom blur). Unscored results have no tongue. |
| Score gauge leaves the results hero. | `components/session/score-gauge.tsx`, `app/session/results.tsx` | The mesh and 270° arc become the containerless TX-04 stack. |
| Speaking score card splits. | `components/analytics/speaking-score-card.tsx`, `components/analytics/score-chart.tsx`, `app/(tabs)/analytics.tsx` | Hero moves to canvas TX-03. Chart becomes sheet CO-09. "avg NN" lives only in the chart header. |
| Freestyle card dissolves. | `components/practice/freestyle-card.tsx`, `app/(tabs)/practice.tsx` | The card becomes the containerless Practice canvas block. CH-10 sits outside it. |
| Skill cards become the collage. | `components/metrics/skill-card.tsx` | CO-05 on Analytics and on the Results Skills tab. One expanded card, compact pills, notch is empty sheet. |
| Week rings become status tiles. | `components/weekly-progress.tsx` | CO-06. No day-of-month numeral under Home letters. No dashed rings. |
| Header grows a mark and the module. | `components/header-actions.tsx`, tab screens | Capsule and cog 40 → 48. SpeechMark on the left. No title in the bar. |
| Session chrome and stage. | `components/session/session-top-bar.tsx`, `components/session/practice-controls.tsx`, `components/session/live-wpm.tsx`, `app/session/[passageId].tsx`, `app/session/freestyle.tsx` | Circles 44 → 48. Center slot empty. WPM and clock move into CO-10. Aa stays on freestyle. Finish row becomes CH-11. |
| Playback disc grows into the module. | `components/session/playback-pill.tsx` | Disc 44 → 48, inset 8. Stays on the Results canvas, own glass, not inside the sheet. |
| Carousel becomes 1-up. | `components/passage-carousel.tsx` | Drop 2-up, off-center scale, and blur. First card on x 20. Peek ≥ 86. |
| Coaching and transcript leave card chrome for bubbles. | `components/session/ai-coaching-card.tsx`, `components/session/transcript-card.tsx` | TX-10 bubbles, fill `card`, not a second glass card. |
| Word detail actions become an untrayed pair. | `components/session/word-detail.tsx`, `app/session/word-detail.tsx` | CH-04 header. CH-09 pills as the last content row, both ghost, not a floating tray. |

Do not add a folder-tab control to Analytics. Do not draw a second "avg NN". Do not draw 0 or 100 on the score strip. Do not restore minimize-on-scroll. Do not rename the dock icons.
