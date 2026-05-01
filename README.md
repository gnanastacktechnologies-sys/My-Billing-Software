# GnanaStack Technologies Billing & Project Management System

## Overview
A complete MERN stack application built by GnanaStack Technologies. It includes a project-based billing system, invoice generation via PDF with Cloudinary upload, WhatsApp integration, and full mobile responsiveness.

## Features
- **Authentication**: JWT-based secure login for a single admin.
- **Dashboard**: High-level statistics with Chart.js visualization.
- **Project Management**: Create, Track (In Progress), and Complete projects using the GnanaStack workflow.
- **Invoice Generation**: Auto-incrementing, PDF creation (PDFKit), and Cloudinary integration.
- **WhatsApp Integration**: One-click invoice sending via WhatsApp.
- **Settings**: Configure invoice prefix and starting counter.
- **Profile**: Update admin profile details and password.
- **UI/UX**: Beautiful, responsive, mobile-first design using Tailwind CSS with premium glassmorphism. Dark mode supported.

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
   MONGO_URI=mongodb://localhost:27017/gnanastack_billing
   JWT_SECRET=supersecretjwtkey_gnanastack_123
   CLOUDINARY_CLOUD_NAME=YOUR_CLOUDINARY_CLOUD_NAME
   CLOUDINARY_API_KEY=YOUR_CLOUDINARY_API_KEY
   CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_API_SECRET
   
   ADMIN_EMAIL=admin@gnanastack.com
   ADMIN_PASSWORD=gnanaadmin123
   ```
4. Run the seed script to create the initial admin user:
   ```bash
   node seed.js
   ```
   *(This will dynamically create an admin using your `.env` variables)*
5. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update `.env` file in the `frontend` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open the provided localhost URL in your browser.

## Default Credentials
- **Email**: admin@gnanastack.com
- **Password**: gnanaadmin123

## Notes
- To test the invoice functionality, please ensure you replace the Cloudinary credentials in the `backend/.env` file with actual valid keys. Otherwise, the invoice generation will fail.
- The UI is designed to be mobile-first and fully responsive.
- The system prevents duplicate or malformed invoices and safely stores them.
