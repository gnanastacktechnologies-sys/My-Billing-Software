# Srinivasan Murugan Billing & Project Management System

## Overview
A complete MERN stack application built for Srinivasan Murugan by GnanaStack Technologies. It includes a project-based billing system, invoice generation via PDF with Cloudinary upload, WhatsApp integration, and full mobile responsiveness.

## Features
- **Authentication**: JWT-based secure login for a single admin.
- **Dashboard**: High-level statistics with Chart.js visualization.
- **Project Management**: Create, Track (In Progress), and Complete projects.
- **Invoice Generation**: Auto-incrementing, PDF creation (PDFKit), and Cloudinary integration.
- **WhatsApp Integration**: One-click invoice sending via WhatsApp.
- **Settings**: Configure invoice prefix and starting counter.
- **Profile**: Update admin profile details and password.
- **UI/UX**: Beautiful, responsive, mobile-first design using Tailwind CSS. Dark mode supported.

## Technology Stack
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Cloudinary, PDFKit.
- **Frontend**: React (Vite), Tailwind CSS, React Router, Axios, React Hot Toast, Chart.js, Lucide Icons.

## Setup Instructions

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB running locally or a MongoDB URI
- Cloudinary Account (for storing PDFs)

### 1. Backend Setup
1. Open terminal and navigate to the `backend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/sm_billing
   JWT_SECRET=supersecretjwtkey_sm_billing_123
   CLOUDINARY_CLOUD_NAME=YOUR_CLOUDINARY_CLOUD_NAME
   CLOUDINARY_API_KEY=YOUR_CLOUDINARY_API_KEY
   CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_API_SECRET
   ```
4. Run the seed script to create the initial admin user:
   ```bash
   node seed.js
   ```
   *(This will create an admin with email: `admin@example.com` and password: `password123`)*
5. Start the backend server:
   ```bash
   npm start
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the provided localhost URL in your browser.

## Default Credentials
- **Email**: admin@example.com
- **Password**: password123

## Notes
- To test the invoice functionality, please ensure you replace the Cloudinary credentials in the `backend/.env` file with actual valid keys. Otherwise, the invoice generation will fail.
- The UI is designed to be mobile-first and fully responsive.
- The system prevents duplicate or malformed invoices and safely stores them.
