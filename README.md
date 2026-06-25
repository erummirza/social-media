# 🌐 Social Media App

[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-brightgreen)](https://mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

A full-stack social media application with user authentication, real-time messaging, and post sharing capabilities.

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

This is a full-featured social media platform that allows users to:
- Create accounts and log in securely
- Share posts with images and text
- Like and comment on posts
- Follow other users
- Send and receive real-time messages
- Receive notifications

---

## ✨ Features

### User Features
- ✅ User registration and login with JWT authentication
- ✅ Password reset via email
- ✅ Profile management (avatar, bio, etc.)
- ✅ Follow/Unfollow users

### Social Features
- ✅ Create, edit, delete posts
- ✅ Upload images to posts
- ✅ Like and unlike posts
- ✅ Add comments to posts
- ✅ Real-time notifications

### Messaging
- ✅ Real-time chat using WebSockets
- ✅ Private messaging between users
- ✅ Online/offline status

### Security
- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ XSS and CSRF protection
- ✅ Rate limiting

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI Library |
| **React Router v6** | Routing |
| **Redux Toolkit** | State Management |
| **Material-UI** | UI Components |
| **Axios** | HTTP Requests |
| **Socket.io-client** | Real-time communication |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime |
| **Express.js** | Web Framework |
| **MongoDB** | Database |
| **Mongoose** | ODM for MongoDB |
| **JWT** | Authentication |
| **Socket.io** | Real-time WebSockets |
| **Multer** | File Uploads |
| **Bcrypt** | Password Hashing |

---

## 🏗️ Architecture
