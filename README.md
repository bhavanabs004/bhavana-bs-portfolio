# Bhavana B S Portfolio - Emotion HQ Edition

Static, GitHub Pages-ready professional portfolio for Bhavana B S.

This version keeps the original resume content and updates the presentation into an original, emotion-command-center inspired theme with interactive movable characters, memory orbs, animated canvas particles, skill tabs, clickable project impact cards, dark/light mode, and mobile responsiveness.

## Local Preview

Run the local server from this folder:

```powershell
.\serve.ps1 -Port 5173
```

Then open:

```text
http://127.0.0.1:5173/
```

You can also open `index.html` directly in a browser because the site has no build step.

## GitHub Pages

1. Add these files to the repository root.
2. Commit and push to the `main` branch.
3. In GitHub, open Settings > Pages.
4. Set Source to Deploy from a branch.
5. Select `main` and `/root`, then save.

## Files

- `index.html` - portfolio content and interactive mood-board structure
- `styles.css` - responsive visual design and character/orb styling
- `script.js` - animations, draggable objects, skill tabs, scroll reveals, copy email
- `assets/Bhavana-B-S-Resume.pdf` - downloadable resume
- `serve.ps1` - tiny local static server
