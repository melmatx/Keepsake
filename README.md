# Happy Birthday, Justin ♡

A tiny handmade birthday site. Plain HTML/CSS/JS, no build step, made for GitHub Pages.

## Make it yours
Edit **`js/config.js`**: name, candle count, scribbles, scrapbook memories, the letter, frog lines.

**Photos:** drop them into `photos/` (e.g. `photos/first-date.jpg`) and set each memory's `src`.
Square-ish photos look best. Add or remove memories freely.

**Photo booth:** `boothPrompts` (one per photo; the last one is always saved for the last photo),
`boothCheers`, and `boothCaption` (printed on every strip) live in `config.js` too.

## Preview locally
Open `index.html` in a browser, or run `python3 -m http.server` in this folder and visit
http://localhost:8000 (needed to test the mic-blowing feature and the photo booth camera,
which both only work on `localhost` or `https`, so GitHub Pages is fine).

## Put it on GitHub Pages
1. Create a new repo on GitHub and push this folder to it.
2. Repo → **Settings → Pages** → Source: *Deploy from a branch* → `main` / `(root)` → Save.
3. In a minute it's live at `https://<your-username>.github.io/<repo-name>/`.

## Hidden things to find
- Tap the present 3 times to open it
- Tap flames one by one, hold the button, or **blow on the phone** (mic)
- Drag the frog and lemon around; poke the frog a lot
- Flip the sticky note, tap the smiley
- Scrapbook: slap stickers anywhere, double-tap to peel. Add a photo and *shake it like a polaroid*
- Photo view: swipe, double-tap for ♡, leave kisses, summon the cat
- Notes: open the envelope, hold for a hug, pluck the daisy (it's rigged ♡)
- Booth: pull the cord (or tap the button) to open the curtain. 3·2·1 with pose prompts, a screen flash,
  and the strip whirs out of the slot still wet. *Fan it dry* (tap or shake), then tap it to leave hearts
- Booth formats: classic 2×6, trio, 35mm film (with date stamps), postcard grid, or two strips.
  Tap **style** to turn tall ↔ wide and pick the paper and the look. Change them after printing and it reprints
- "two strips" has a ✂ on the dotted line: drag it down to tear one for you, one for me
- Save / send / tuck it into the scrapbook (an unsaved strip gets tucked in on its own before the next round)
- Anything added on the phone (photos, booth strips) can be tossed from its photo view: "toss this one", tap twice
