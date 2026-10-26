# Contributing

Thanks for helping make the map more accurate. Corrections, new events and fixes are all welcome.

## Just spotted a mistake?

[Open an issue](https://github.com/mhb8898/iran-iraq-war-map/issues/new/choose) and pick **Historical correction**. Include the event link (the address bar shows `#event-id`) and, if you can, a source: a book with page number, an article, or a Wikipedia section.

## Making a change yourself

1. Fork the repo and create a branch.
2. Install and run it:
   ```bash
   npm install
   npm run dev
   ```
3. Make your change. Most historical content lives in `src/data/`:
   - `events.ts`: operations, battles, air and naval strikes. Each has dates, a summary, arrows (with `unit` for the formation on each axis), `forces`, `sites` and `refs`.
   - `zones.ts` / `phases.ts`: the drawn areas of control and which side held them at each date.
   - `sites.ts`: air bases, oil terminals, ports, dams, passes and where formations were based.
   - `places.ts`, `refs.ts`: towns and the bibliography.
4. Check your work:
   ```bash
   npm run check   # data consistency: dates, ids, coordinates, units
   npm run build   # type check and production build
   ```
5. Open a pull request. Say what you changed and where it comes from.

## Ground rules for historical content

- **Cite it.** New claims need a source in the event's `refs` (or in the PR description).
- **Neutral wording.** Describe what each side did and claimed; where Iranian and Iraqi accounts differ, say so rather than picking one.
- **Approximate is fine, made up is not.** Front lines are hand-drawn to roughly ±5–10 km. If you're unsure of a unit or a position, leave it out or note the uncertainty.

## Code changes

The app is Vite + TypeScript + d3, with no framework. Match the style of the surrounding code and keep changes focused. Check both desktop and a phone-sized window, since the layout differs below 900 px.
