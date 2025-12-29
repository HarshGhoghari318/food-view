# MERN Food Reels 📽️🍔

A small MERN (MongoDB, Express, React, Node) project that implements a Reels-style feed for food items with user authentication, comments, save/bookmark, likes, shares and food-partner accounts.

---

## 🔍 Quick overview

- **Frontend:** React + Vite (src in `frontend/src`) — Reels feed, comments UI, profile pages, login/register flows.
- **Backend:** Express + Mongoose (files under `backend/src`) — Authentication, food CRUD, comments, likes, saves.
- **Database:** MongoDB (connection currently in `backend/src/db/db.js`).

---

## 📁 Project structure (important files)

- backend/
  - app.js — server entry (default port 3000)
  - src/
    - controller/ — route handlers (auth, food)
    - db/ — DB connection
    - middlewares/ — auth middleware
    - models/ — Mongoose models
    - routes/ — Express routes
- frontend/
  - src/ — React app
    - pages/ — major pages (Reels, Profile, Auth)
    - style/ — CSS files (reels.css, theme.css)

---

## 🚀 Getting started (local development)

> Make sure you have Node.js and npm installed (Node v18+ recommended).

### 1) Backend

1. Open a terminal and go to the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` in `backend/` and set (at minimum):

```
JWT_SECRET=your_jwt_secret_here
MONGO_URI=your_mongodb_connection_string_here
```

> Note: The repo currently contains a hardcoded connection string in `backend/src/db/db.js`. For production or team work, replace that with `process.env.MONGO_URI` and keep secrets in `.env`.

4. Start the server (two options):

- Using node:

```bash
node app.js
```

- Using nodemon (recommended for development):

```bash
npx nodemon app.js
```

The server listens on port `3000` by default.


### 2) Frontend

1. Open a new terminal and go to the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the dev server:

```bash
npm run dev
```

By default Vite serves at `http://localhost:5173` (CORS in backend allows that origin in `app.js`).

---

## 🧭 API Endpoints (important)

Base: `http://localhost:3000/api`

### Auth
- `POST /auth/user/register` — register user
- `POST /auth/user/login` — login user (cookie-based token)
- `GET /auth/user/me` — get current user (protected)
- `POST /auth/user/follow/:id` — follow/unfollow a food partner (protected)

- Food Partner routes (register/login/lookup)

### Food
- `GET /food/getfoods` — get feed (protected)
- `POST /food/create` — create food (food partner only)
- `POST /food/like/:id` — toggle like (protected)
- `POST /food/comment/:id` — add comment (protected)
- `GET /food/comments/:id` — fetch comments (protected)
- `POST /food/share/:id` — increment share (protected)
- `POST /food/save/:id` — toggle save/bookmark (protected)

---

## ✅ Features implemented

- Reels-style feed with auto-play behavior
- Likes, save/bookmark (persisted), and share counts
- Comment system with modal UI (fetch, newest-first, submit)
- User and FoodPartner authentication (cookie + JWT)
- Profile pages for users and partners

---

## 🧪 Dev notes & troubleshooting

- If the backend is updated, restart nodemon or the node process to pick up changes.
- If you see 500s on posting comments or save actions, check the backend console for logs and ensure `JWT_SECRET` and DB connection are set.

> Tip: Consider adding `scripts` in `backend/package.json`:
>
> ```json
> "scripts": {
>   "start": "node app.js",
>   "dev": "nodemon app.js"
> }
> ```

---

## 🛠️ Suggested next tasks

- Move DB credentials into `.env` and use `process.env.MONGO_URI` in `connectDB()`
- Add unit / integration tests for critical endpoints
- Add small success/error toasts in UI for actions (save, comment, share)

---

## 📝 Contribution & contact

- Feel free to open issues or send PRs to improve features or fix bugs.

---

Thank you! If you want, I can also:
- Add a `README` section for deployment steps (Heroku, Docker, or Azure),
- Add backend `npm` scripts and a `.env.example` file,
- Or update `connectDB()` to use `MONGO_URI` from `.env` and remove hard-coded credentials.

Which would you like next? 🔧