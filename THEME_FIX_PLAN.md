# Dark/Light Contrast Fix Plan

## Global tokens and shells
- Increase dark-mode text-muted and border opacity; deepen dark panel/canvas so cards have separation comparable to light shadows.
- Add clear focus-visible outlines for pills, inputs, and buttons in both themes.
- Brighten header subtitle and nav pills in dark; make active/hover states more distinct.
- Define token pairs for every layer: panel, card, chat surface, input, pill, placeholders, and borders (regular/strong) for both light/dark.

## Create page
- Boost heading/subheading contrast in dark.
- Restyle inputs in dark with darker fills, lighter text/placeholder, and stronger outlines so they sit naturally on the shell.
- Raise the primary CTA contrast in dark (lighter fill or outline) and ensure hover/active states are visible.
- Lift the “Room details” card in light (darker text, slightly stronger border/shadow) and align its text contrast in dark.
- Ensure placeholders, helper text, and disabled states have paired light/dark colors.

## Join page
- Mirror the Create-page input and label treatments for dark (darker fills, brighter text/placeholder, stronger borders).
- Give the CTA a higher-contrast dark theme style.
- Increase card border/shadow in dark for clearer container edges; improve subheading/label readability.
- Verify field backgrounds/labels/placeholders align to the global token pairs.

## Chat page
- Brighten section labels (“Overview”, “Thread”) in dark.
- Increase info tile text and border contrast in dark; keep status color accents readable.
- Give the chat surface a clearer border/shadow in dark to define the panel.
- Tweak other-user and system bubbles in dark for crisper outlines/text; keep timestamps legible.
- Ensure mute/leave/send buttons have adequate dark-mode contrast and visible hover/focus states.
- Confirm chat input bar uses the same input token pair and that message list background/borders match the chat-surface tokens.
