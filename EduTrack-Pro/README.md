# 🎓 EduTrack Pro

A modern, responsive **Student Progress Tracking SaaS Platform** built using **React.js** and **Firebase**, designed to help students monitor their academic progress while enabling instructors to track learner performance through an intuitive dashboard.

---

## 📖 About the Project

EduTrack Pro is a web-based learning analytics platform that provides students with real-time insights into their enrolled courses, completed modules, grades, attendance, and overall learning progress.

The application also includes an **Instructor Dashboard** where instructors and coordinators can monitor learner performance, analyze progress, and view academic statistics.

The project demonstrates real-world frontend development concepts including:

- Authentication
- API Integration
- State Management
- Data Persistence
- Protected Routes
- Responsive Design
- Error Handling
- Dashboard Development
- Data Visualization
- Deployment

---

# ✨ Features

## 👨‍🎓 Student Module

- Student Login
- Student Dashboard
- Student Profile
- Overall Completion Percentage
- Course Progress Cards
- Progress Bars
- Modules Completed
- Grade Analytics
- Attendance Tracking
- Weekly Progress
- Quiz Performance
- Assignment Performance

---

## 👨‍🏫 Instructor Module

- Instructor Login
- Instructor Dashboard
- View All Students
- Student Progress Monitoring
- Course-wise Progress
- Performance Analytics
- Search Students
- Filter Students

---

## 🔐 Authentication

- Secure Login
- Protected Routes
- Persistent Sessions
- Logout Functionality

---

## 📊 Analytics

Implemented using **Chart.js**

- 📈 Line Chart
- 📊 Bar Chart
- 🍩 Doughnut Chart

---

## 🌐 Responsive Design

The application is fully responsive and optimized for

- Mobile Devices
- Tablets
- Laptops
- Desktop Screens

---

# 🛠️ Technology Stack

## Frontend

- React.js
- Tailwind CSS
- React Router DOM
- Axios
- Chart.js

---

## Backend

- Firebase Authentication
- Firebase Firestore

---

## Deployment

- Vercel

---

# 📁 Project Structure

```text
src/
│
├── assets/
├── components/
├── charts/
├── context/
├── hooks/
├── layouts/
├── pages/
├── services/
├── utils/
├── App.jsx
└── main.jsx
```

---

# 🚀 Installation

## Clone the Repository

```bash
git clone https://github.com/your-username/edutrack-pro.git
```

---

## Navigate to the Project

```bash
cd edutrack-pro
```

---

## Install Dependencies

```bash
npm install
```

---

## Start Development Server

```bash
npm run dev
```

---

# 🔥 Firebase Configuration

Create a `.env` file in the project root.

```env
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

---

# 📊 Charts Used

The project visualizes learner performance using:

- Bar Chart
- Doughnut Chart
- Line Chart

These charts represent:

- Quiz Scores
- Assignment Performance
- Weekly Learning Progress
- Attendance Percentage

---

# 🔐 Authentication Flow

1. User visits the application.
2. User selects Student or Instructor login.
3. Credentials are verified using Firebase Authentication.
4. User is redirected to the respective dashboard.
5. Session persists after page refresh.
6. User can securely log out.

---

# 📡 API & Database

The application uses Firebase Firestore to store and retrieve:

- Student Information
- Course Details
- Progress Records
- Grades
- Attendance
- Dashboard Data

---

# 💾 Data Persistence

The application supports:

- Firebase Authentication Persistence
- Local Storage
- Session Storage

---

# ⚠️ Error Handling

The application gracefully handles:

- Invalid Login Credentials
- Network Errors
- API Failures
- Missing Data
- Empty Course Lists
- Session Expiry

---

# 🎯 User Roles

## Student

Students can

- View Profile
- View Courses
- Track Progress
- View Grades
- Monitor Attendance
- Analyze Performance

---

## Instructor

Instructors can

- View All Students
- Monitor Learner Progress
- Analyze Performance
- Search Students
- Review Course Completion

---

# 📱 Responsive Support

The application is optimized for

- 📱 Mobile
- 💻 Laptop
- 🖥️ Desktop
- 📟 Tablet

---

# 🧪 Testing Checklist

Before deployment, ensure that:

- Authentication works correctly.
- Protected routes are secure.
- Dashboard loads successfully.
- APIs fetch data correctly.
- Charts render properly.
- Loading states are displayed.
- Error states are handled.
- Layout is responsive.
- No console errors remain.

---

# 🌍 Deployment

The application is deployed using **Vercel**.

To deploy:

```bash
npm run build
```

Deploy the generated build through the Vercel Dashboard or Vercel CLI.

---

# 👥 Development Team

## Product Management

- Product Manager

---

## Technical Leadership

- Frontend Lead

---

## Development Teams

### Admin Team

Responsible for:

- Instructor Dashboard
- Learner Monitoring
- Analytics Dashboard

---

### Dashboard Team

Responsible for:

- Authentication
- Dashboard Layout
- Navigation
- Protected Routes

---

### Student Team

Responsible for:

- Student Dashboard
- Student Profile
- Progress Cards
- Charts
- Analytics

---

### Backend Team

Responsible for:

- Firebase
- APIs
- Authentication
- Firestore
- Data Persistence

---

# 📌 Coding Standards

- Follow reusable component architecture.
- Maintain clean folder structure.
- Write modular code.
- Use meaningful variable names.
- Keep UI responsive.
- Handle loading and error states.
- Follow Git workflow with feature branches.
- Submit Pull Requests for every completed feature.

---

# 🎯 Future Enhancements

- Dark Mode
- Multi-language Support
- Certificate Generation
- Leaderboards
- Assignment Submission
- AI-based Learning Insights
- Push Notifications
- Real-time Updates

---

# 📄 License

This project is developed for educational purposes and learning modern frontend development practices.

---

# ❤️ Acknowledgements

Special thanks to all developers, contributors, mentors, and reviewers involved in the successful development of **EduTrack Pro**.

---

## 📧 Contact

For questions, suggestions, or collaboration:

**Project:** EduTrack Pro  
**Version:** 1.0.0
