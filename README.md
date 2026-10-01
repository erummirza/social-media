# 🌐 Social Media App

[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4-black)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-brightgreen)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/Authentication-JWT-orange)](https://jwt.io/)

A full-stack MERN social media platform featuring secure authentication,
post creation and interaction, user profiles, follow/unfollow functionality,
and a separate admin moderation panel.

---

## 🚀 Live Demo

### 🌐 Application

**Live Application:**  
https://social-media2.pages.dev/

### 👨‍💼 Admin Dashboard

**Admin Dashboard:**  
https://social-media2.pages.dev/admin/dashboard

> The application is deployed with a React frontend and Node.js/Express backend.

---

## 🎥 Demo Video

▶️ **[Watch the Social Media App Demo](YOUR_VIDEO_LINK)**

The demo will demonstrate:

- User registration/login
- Dashboard
- Creating posts
- Viewing posts/feed
- Like/Unlike
- Follow/Unfollow
- User profiles
- Admin login
- User management
- Post moderation

---

## 📸 Screenshots

### 🔐 Login

![Login](screenshots/login.png)

### 🏠 Dashboard

![Dashboard](screenshots/dashboard.png)

### 📝 Posts & Feed

![Posts](screenshots/feed.png)

### 👤 User Profile

![Profile](screenshots/profile.png)

### 👨‍💼 Admin Dashboard

![Admin Dashboard](screenshots/admin-panel.png)

---

# 🎯 Overview

This project is a full-stack social media application built using the MERN
stack.

The platform provides user authentication, social networking functionality,
content publishing and engagement, user profiles, and administrative
moderation.

The application demonstrates a complete frontend/backend architecture using
React, Node.js, Express.js and MongoDB.

---

# ✨ Features

## 🔐 Authentication

- User registration
- Secure password hashing using bcrypt
- JWT-based authentication
- Protected routes
- Session/token expiration
- Separate admin authentication

## 👥 Social Features

- Discover users
- Who to Follow
- Follow users
- Unfollow users
- View user profiles
- View user posts
- Followers / Following relationships

## 📝 Posts

- Create text posts
- View posts in feed
- Like posts
- Unlike posts
- Delete own posts
- View posts by user

## 👤 Dashboard & Profiles

- Personalized dashboard
- User profile information
- Post statistics
- Followers statistics
- Following statistics

## 👨‍💼 Admin Panel

- Separate admin login
- Admin dashboard
- Platform statistics
- View all users
- Delete users
- View all posts
- Delete posts
- Platform moderation

## 🔌 REST API

The application uses REST APIs for communication between the React frontend
and Node.js/Express backend.

API functionality includes:

- Authentication
- Users
- Profiles
- Follow / Unfollow
- Posts
- Likes
- Admin
- User management
- Post management

---

# 🛠️ Tech Stack

## Frontend

| Technology | Purpose |
|------------|---------|
| React 19 | User Interface |
| React Router v7 | Application Routing |
| Axios | API Communication |
| JavaScript | Application Logic |
| HTML5 / CSS3 | UI Structure & Styling |

## Backend

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | REST API |
| MongoDB | Database |
| Mongoose | MongoDB ODM |
| JWT | Authentication |
| bcrypt | Password Hashing |

## Deployment

| Component | Platform |
|------------|----------|
| Frontend | Cloudflare Pages |
| Backend | Vercel |
| Database | MongoDB Atlas |

---

# 🏗️ Architecture

```text
                    ┌───────────────────┐
                    │       User        │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │   React Frontend  │
                    │     React 19      │
                    └─────────┬─────────┘
                              │
                         Axios / HTTP
                              │
                              ▼
                    ┌───────────────────┐
                    │  Express REST API │
                    │     Node.js       │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │     Mongoose      │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │      MongoDB      │
                    └───────────────────┘

                     Authentication
                           │
                           ▼
                      JWT + bcrypt

                      Admin Panel
                           │
                           ▼
                     Admin APIs
