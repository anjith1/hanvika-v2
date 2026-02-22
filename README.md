# Hanvika – Service Management Platform

A full-stack MERN-based service marketplace platform with role-based authentication, modular backend architecture, and modern SaaS-style UI.

---

## 🚀 Project Overview

Hanvika is a scalable service ecosystem where:

- Users can browse service categories
- Users authenticate securely using JWT
- Service Partners (Workers) manage services
- Role-based dashboards are implemented
- Reviews system is integrated
- Modern sidebar-based UI
- Backend follows modular MVC architecture

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- React Router
- Context API (Auth)
- Axios
- Environment-based API config
- Modern Sidebar Layout
- JWT stored in localStorage

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcrypt password hashing
- Modular MVC structure

---

## 📁 Project Structure

```
hanvika-project/
 ├── backend/
 ├── ns/ (frontend)
 ├── package.json
 └── README.md
```

---

## 🔐 Authentication Flow

1. User logs in via `/api/auth/login`
2. Backend validates credentials
3. JWT is generated
4. Token stored in localStorage
5. Role-based redirect handled on frontend

Supported roles:
- USER
- WORKER

---

## ⚙ Environment Configuration

### Backend (.env)

```
PORT=5003
MONGO_URI=<your_mongodb_atlas_url>
JWT_SECRET=<your_secret>
```

Backend must use:

```js
const PORT = process.env.PORT || 5003;
```

---

### Frontend (.env)

```
VITE_API_URL=http://localhost:5003
```

⚠ Never hardcode API URLs.

Always use:

```js
import.meta.env.VITE_API_URL
```

---

## ▶ Running Locally

From project root:

```
npm install
npm run dev
```

This starts:

- Backend server
- Frontend server
- Both connected correctly

---

## 📡 API Structure

### Auth
```
POST /api/auth/login
GET  /api/auth/test
```

### Reviews
```
GET /api/reviews
```

---

## 🧩 Development Rules

- Do not modify authentication without discussion
- Do not hardcode API URLs
- Follow modular backend structure
- Keep frontend and backend contracts consistent
- Create new features in separate modules

---

## 🚀 Deployment (Render)

- Deploy backend as Web Service
- Deploy frontend as Static Site
- Add environment variables manually
- Whitelist MongoDB IP
- Use process.env.PORT

---

## 📌 Current Features

✔ JWT Authentication  
✔ Role-based dashboards  
✔ Sidebar layout  
✔ Modern worker grid  
✔ Reviews API  
✔ Modular backend  

---

## 📈 Planned Features

- Booking system
- Payment integration
- Admin dashboard
- Availability calendar
- Notifications
- Analytics

---

## 👥 Team Workflow

When adding new features:

Backend:
```
models/<feature>.model.js
controllers/<feature>.controller.js
routes/<feature>.routes.js
```

Frontend:
```
pages/<Feature>
components/<Feature>
services/<featureService>
```

---

## 🏁 Project Status

Active Development – Version 2.0
Structured for team scalability and production deployment.
