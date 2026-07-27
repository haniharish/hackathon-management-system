# HackVerse - Hackathon Management System

HackVerse is a full-stack web application for managing hackathons from start to finish. It gives organizers a place to create events, participants a way to register and submit projects, and judges the tools to review submissions and publish results.

I built this project to make the usual hackathon workflow simpler and keep everything in one place.

## What it can do

- User signup, login, and role-based access
- Create and manage hackathons
- Register for hackathons and manage registrations
- Create teams, invite members, and handle join requests
- Submit projects with links and uploaded files
- Assign judges and review submissions
- Leaderboard, winners, dashboards, and basic analytics
- User/profile management for admins

The app has four roles: `admin`, `organizer`, `judge`, and `participant`.

## Tech used

- React, Vite, Tailwind CSS, and Axios on the frontend
- Node.js and Express on the backend
- MongoDB with Mongoose for the database
- JWT for authentication
- Cloudinary and Multer for file uploads

## Project structure

```text
Hackathon-management-system/
├── client/        # React frontend
└── server/        # Express API and database models
```

## Running the project locally

Make sure Node.js is installed first.

1. Install frontend dependencies:

   ```bash
   cd client
   npm install
   ```

2. Install backend dependencies:

   ```bash
   cd ../server
   npm install
   ```

3. Create a `.env` file inside the `server` folder:

   ```env
   PORT=5001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret

   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

   MongoDB is optional for exploring the app because the server can fall back to in-memory demo data. You will need MongoDB if you want to seed or save real data. Cloudinary is needed for file uploads.

4. Start the backend from the `server` folder:

   ```bash
   npm run dev
   ```

5. In another terminal, start the frontend from the `client` folder:

   ```bash
   npm run dev
   ```

Open the local URL shown by Vite in your browser. The API runs on `http://localhost:5001`.

## Demo account

When using the fallback data, you can log in with:

```text
Email: demo@hackverse.com
Password: password123
```

## Seed the database

If `MONGODB_URI` is set, this command adds sample users, hackathons, teams, submissions, and reviews:

```bash
cd server
npm run seed
```

## Build for production

```bash
cd client
npm run build
```

The backend will serve the built frontend when `NODE_ENV` is set to `production`.

## Notes

This is a learning/project build, so there are still things I would improve next, such as better test coverage, stricter upload validation, and deployment configuration.
