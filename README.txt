Mikey Wins Tracker PWA - JSON File Version

Important change:
- Progress is no longer intended to live only in browser storage.
- The app uses a JSON file that can be saved to the tablet and loaded again.

How Mikey uses it:
1. Open the app.
2. Load his existing JSON file from the Save / Load tab.
3. Add wins.
4. Tap Save JSON File when finished.
5. Keep the newest JSON file as the backup/source of truth.

Recommended:
- Create a folder on the tablet called Mikey Wins Tracker.
- Save the JSON file there each time.
- Periodically delete older copies if needed.

Files to upload to the Mitsubishi PWA site:
- index.html
- styles.css
- app.js
- manifest.json
- service-worker.js
- icon.svg
