# PlateUp Render Setup (Worker + Static)

This repo contains two parts:
- server/: Node worker (Express) which caches articles from TheMealDB and exposes /api/articles and /api/automation/generate
- public/: Static front-end. Deploy this on Render as a Static Site (publish directory public) and it will fetch articles from the worker API.

Quick start locally
1. Install Node 18+
2. From repo root: npm install (no external deps required)
3. Run generator locally: node server/scripts/generateArticles.js
4. Run server: node server/index.js
5. Visit http://localhost:10000/api/articles to see cached JSON

On Render
1. Create a Web Service on Render for the worker:
   - Connect repo, set Build command: npm install
   - Start command: npm start
   - Add environment variable AUTOMATION_SECRET (choose a strong secret)
2. Create a Static Site on Render for the frontend:
   - Connect same repo, Publish directory: public
   - No build command
3. To generate articles on demand: send POST to https://<worker-url>/api/automation/generate?secret=YOUR_SECRET or with header x-automation-secret.
4. To automate: create a Render Cron Job that sends the POST to the worker endpoint every day/hour as you wish.

Notes:
- The generator uses TheMealDB search endpoint. It writes cached JSON to server/data/articles.json which the worker serves.
- Frontend fetches the worker's /api/articles to display content.
