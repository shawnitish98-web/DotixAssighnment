# Dotix Job Scheduler - Server

Run the backend server (requires Node.js):

1. cd server
2. npm install
3. copy .env.example to .env and set `WEBHOOK_URL`
4. npm start

APIs:
- POST /jobs -> create job
- GET /jobs -> list jobs
- GET /jobs/:id -> job detail
- POST /run-job/:id -> simulate running job
- POST /webhook-test -> local webhook receiver
