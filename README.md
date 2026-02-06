# Faz o Simples - Admin Dashboard

![React](https://img.shields.io/badge/React-18-blue?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwind-css&logoColor=white)

A modern, high-performance **Admin Dashboard** for the **Faz o Simples** Sports Management System. Built with a focus on UX/UI excellence, this responsive web application empowers administrators to manage soccer games, track financial health, and oversee user memberships with ease.

## 🚀 Project Overview

This dashboard serves as the command center for the "Faz o Simples" ecosystem. It interfaces with a Node.js backend to provide real-time control over:
*   **Game Management**: Scheduling, roster management, and "guest" vs "member" tracking.
*   **Financial Auditing**: Visualizing revenue streams, tracking pending payments, and managing debts.
*   **User Administration**: Detailed profiles, role management, and activity logs.

## ✨ Key Features

*   **Real-time Roster View**: Dynamic player lists with instant status updates (Paid/Pending, Guest/Member).
*   **Financial Visualization**: Interactive charts using **Recharts** for revenue analysis.
*   **Mobile-First Design**: Fully responsive interface optimized for on-the-go management via mobile devices.
*   **Seamless State Management**: Powered by **React Context API** for global state persistence (Auth, Workspace).
*   **Modern UI Components**: Built with **Shadcn/UI** and **Tailwind CSS** for a clean, consistent, and accessible aesthetic.
*   **Robust Data Fetching**: Optimized API layer using **Axios** with interceptors for auth and error handling.
*   **Dark Mode Support**: Built-in theming capabilities.

## 🛠️ Tech Stack

*   **Core**: React 18, TypeScript, Vite
*   **Styling**: Tailwind CSS, PostCSS
*   **UI Library**: Shadcn/UI (Radix Primitives)
*   **State Management**: Context API + Custom Hooks
*   **Data Visualization**: Recharts
*   **Routing**: React Router DOM v6
*   **HTTP Client**: Axios
*   **Utilities**: date-fns, clsx, tailwind-merge

## 📂 Project Structure

```text
src/
├── components/       # Reusable UI components (BF-*, UI primitives)
├── contexts/         # Global state providers (AuthContext, ThemeContext)
├── hooks/            # Custom React hooks (useAuth, useToast)
├── layouts/          # Layout components (MainLayout, AuthLayout)
├── lib/              # Utilities and configurations (axios, utils)
├── pages/            # Application views and route components
├── routes/           # Route definitions and configuration
├── services/         # Business logic and service layers
└── styles/           # Global styles and Tailwind configuration
```

## ⚡ Getting Started

### Prerequisites

*   Node.js (v18+)
*   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-org/bot-interface.git
    cd bot-interface
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory:
    ```env
    VITE_API_BASE_URL=http://localhost:3000/api
    ```

4.  **Run the Development Server**
    ```bash
    npm run dev
    ```

5.  **Build for Production**
    ```bash
    npm run build
    ```

---

*Designed and engineered for efficiency and simplicity.*
