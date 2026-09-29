# What Did You See?

An interactive experiment and ten-slide presentation about visual pattern completion, backward masking, and recurrent processing.

The experience begins without explaining the hypothesis. Visitors categorize briefly presented, partially occluded objects under masked and unmasked conditions. Their local result becomes the opening evidence in a presentation of:

> Loo, C., & Buchsbaum, B. R. (2026). Fragile recurrent processing in Aphantasia: Evidence from visual pattern completion. *Consciousness and Cognition, 143*, 104100. https://doi.org/10.1016/j.concog.2026.104100

## Important scientific status

This project is an **independent educational reconstruction inspired by the experimental logic of the paper**. It is:

- not the authors' official code or implementation;
- not a clinical or diagnostic test for aphantasia;
- not a full replication of the published study;
- not evidence about an individual participant's imagery ability or consciousness.

Browser presentation timing depends on the display refresh rate, operating system, and rendering environment. The app measures actual frame-based exposure duration locally, but it should be treated as a classroom demonstration unless it is validated on controlled hardware and used under an appropriate research protocol.

## Experience structure

1. **Calibration** — six masked trials adapt exposure duration and occlusion to the visitor's display and performance.
2. **Experiment** — 18 randomized masked/unmasked trials using the calibrated difficulty.
3. **Personal result** — masked and unmasked accuracy plus an individual masking-cost estimate.
4. **Paper story** — ten slides moving from first-person experience to hypothesis, design, result, interpretation, and limitations.

All responses remain in memory in the visitor's browser. Nothing is transmitted or stored.

## Run locally

No build step or backend is required. Serve the directory with any static web server:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

Opening `index.html` directly may work, but a local server is recommended because the JavaScript is loaded as an ES module.

## Controls

- Experiment responses: number keys `1–4` or on-screen buttons
- Presentation: `←`, `→`, `Page Up`, `Page Down`, or `Space`
- Fullscreen: presentation control at the bottom right
- Secondary scientific notes: hover or keyboard-focus the underlined annotations

## Deploy to GitHub Pages

This repository is a static site. In GitHub:

1. Open **Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Choose `main` and `/ (root)`.
4. Save. The site will be available at `https://azibom.github.io/what-did-you-see/`.

## Design and accessibility

- No external fonts, analytics, trackers, or runtime dependencies
- Keyboard-accessible responses and slide navigation
- Focus-visible explanations as an alternative to hover
- Reduced-motion support through `prefers-reduced-motion`
- Responsive layouts for presentation and individual use

## Citation and further reading

- [Paper DOI](https://doi.org/10.1016/j.concog.2026.104100)
- [PubMed record](https://pubmed.ncbi.nlm.nih.gov/42492460/)

## License

The software and original visual design in this repository are released under the MIT License. The paper and its contents remain the property of their respective authors and publisher.
