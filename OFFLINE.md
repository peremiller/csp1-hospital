# Automatic full-app offline saving

Open the canonical URL `https://peremiller.github.io/csp1-hospital/` once while connected. All app pages and the local images, fonts, scripts, stylesheets and data required by the interface is saved automatically. The status bar confirms completeness; no Save click is needed. Keep site data and a charged device. Saved hospital information works offline. Live maps, phone calls and messages need their services.

After editing public files run `python3 scripts/build-offline.py` before publishing. This regenerates the release hash and full asset manifest. The worker is limited to this repository’s GitHub Pages subpath; it excludes APIs, authenticated requests, writes and other origins, and retains the previous complete release during a failed update. Existing browser-local records are unchanged.
