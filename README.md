# 🎓 EduManage: School Management System

A full-stack web application that helps schools manage students, teachers, attendance, examinations, report cards and fees from one dashboard. It has role-based access for **Admin**, **Teacher** and **Student**, and works on desktop and mobile.

🔗 **Live Demo:** https://school-management-eight-umber.vercel.app/
⚙️ **Backend API:** https://school-management-i2kw.onrender.com

> ⏳ The backend runs on a free plan and sleeps when idle. The first request can take 30 to 50 seconds to wake up.

---

## ✨ Features

- 🔐 **Authentication:** JWT login, bcrypt password hashing, protected routes
- 👥 **Role-based access:** Admin, Teacher and Student permissions
- 🎓 **Student management:** add, search, delete, with duplicate protection (same roll number, class and section)
- 👨‍🏫 **Teacher management:** subject, qualification, experience, contact details
- 📝 **Attendance:** mark a whole class at once (present, absent, late), edit later, view percentage
- 📊 **Examinations and results:** upload marks, automatic total, percentage and grade, printable report cards
- 💳 **Fee management:** tuition, transport and hostel fees, payment status, printable receipts
- 📈 **Dashboard:** stat cards, attendance trend chart, fee collection donut chart, recent students
- 🌙 **Light and dark theme** (remembered after refresh)
- 🚪 **Logout confirmation popup**, profile menu and notifications panel
- 📱 **Responsive design** with a collapsible sidebar

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Axios, Recharts, Lucide Icons, CSS3 |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas with Mongoose |
| Authentication | JSON Web Tokens (JWT), bcryptjs |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas (database) |

---

## 📂 Project Structure

```
school-management/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Layout (sidebar, header, logout popup)
│   │   ├── pages/           # Login, Dashboard, Students, Teachers,
│   │   │                    # Attendance, Results, Fees
│   │   ├── services/        # Axios API setup
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vercel.json
│
├── server/                  # Node + Express backend
│   ├── controllers/
│   ├── middleware/          # JWT protect and role authorize
│   ├── models/              # User, Student, Teacher, Attendance, Result, Fee
│   ├── routes/
│   ├── utils/               # Reusable CRUD router
│   └── server.js
│
└── README.md
```

---

## 🔑 User Roles

| Feature | Admin | Teacher | Student |
|---|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ❌ |
| View students | ✅ | ✅ | ✅ |
| Add or delete students | ✅ | ❌ | ❌ |
| Manage teachers | ✅ | ✅ (no delete) | ❌ |
| Mark attendance | ✅ | ✅ | ❌ |
| Upload marks | ✅ | ✅ | ❌ |
| View report cards | ✅ | ✅ | ✅ |
| Add fees and mark paid | ✅ | ❌ | ❌ |
| View fees | ✅ | ✅ | ✅ |

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user (student role) | Public |
| POST | `/api/auth/login` | Login and get a JWT | Public |
| GET, POST | `/api/students` | List (search and filter) or add students | Role based |
| PUT, DELETE | `/api/students/:id` | Update or delete a student | Admin |
| GET, POST | `/api/teachers` | List or add teachers | Admin, Teacher |
| GET, POST | `/api/fees` | List or add fees | Role based |
| POST | `/api/fees/:id/pay` | Mark paid and generate a receipt | Admin |
| POST | `/api/attendance` | Save attendance for a class | Admin, Teacher |
| GET | `/api/attendance/date/:date` | Attendance for one date | Admin, Teacher |
| GET | `/api/attendance/student/:id` | Student history and percentage | Logged in |
| POST | `/api/results` | Upload marks | Admin, Teacher |
| GET | `/api/results/student/:id` | Report card with total, percentage and grade | Logged in |
| GET | `/api/dashboard` | Dashboard statistics | Admin, Teacher |

Protected routes need the header `Authorization: Bearer <token>`.

---

## 🚀 Run Locally

### Prerequisites

- [Node.js](https://nodejs.org) (LTS)
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or a local MongoDB)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/school-management.git
cd school-management
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a file `server/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string/schooldb
JWT_SECRET=your_long_random_secret
```

Start the server:

```bash
npm run dev
```

### 3. Set up the frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173**.

### 4. Create the first admin

New registrations get the `student` role. To create the first admin, register a user, then open MongoDB Atlas → **Browse Collections** → `users`, and change that user's `role` to `admin`.

---

## 🌍 Deployment

| Service | Settings |
|---|---|
| **Render** (backend) | Root directory `server`, build `npm install`, start `npm start`, env vars `MONGO_URI` and `JWT_SECRET` |
| **Vercel** (frontend) | Root directory `client`, framework Vite, env var `VITE_API_URL=https://your-backend.onrender.com/api` |
| **MongoDB Atlas** | Network access allows `0.0.0.0/0` |

---

## 🔒 Security Notes

- Passwords are hashed with bcrypt and never stored in plain text.
- Routes are protected with JWT, and roles are checked on the server.
- Public registration always creates a `student` account.
- Secrets live in `.env` files, which are excluded by `.gitignore`.

---

## 🔮 Future Improvements

- Timetable management
- Student-only view of their own attendance, results and fees
- Notifications from real data
- Admin page to create teacher and student accounts
- Parent portal and teacher-parent chat
- Unit tests and a CI/CD pipeline with GitHub Actions

---

## 👨‍💻 Author

**THEJA NAVEEN**
GitHub: https://github.com/theja1212-hub
LinkedIn: [your-linkedin](https://linkedin.com/in/your-linkedin)

⭐ If you like this project, give it a star!
