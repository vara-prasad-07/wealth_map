# WealthMap

**WealthMap** is a comprehensive financial analytics platform where admins manage companies, and employees explore investment opportunities. The project showcases full-stack development using Vue 3, Vite, and Firebase.

## 🌟 Features

- **Role-based Authentication:**
    - Separate signup and login for Admins and Employees using Firebase Authentication.
    - Securely manage user roles and company associations.
- **Admin Dashboard:**
    - Admins can create new companies and manage their profiles.
    - Bookmark feature for quickly accessing notable owners or properties.
- **Richest Owners Leaderboard:**
    - Real-time list of the richest owners, showing rank, net worth, age, and country.
    - Advanced filtering and search for owners.
- **Owner Profiles \& Analytics:**
    - Detailed view for each owner, including net worth history (with charts) and properties.
    - Visualize owner property locations and values.
- **Investment Properties Mapping:**
    - Interactive MapView to explore and visualize properties on the map.
    - Properties display address, type, market value, and description.
- **Modern UI/UX:**
    - Responsive, mobile-first design.
    - User-friendly interface with modals for details and forms.


## ⚙️ Tech Stack

- **Frontend:** Vue 3 (composition API), Vite
- **Cloud Backend:** Firebase (Auth \& Firestore)
- **Styling:** CSS, scoped styles, modern UI patterns


## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or newer recommended)
- npm (or yarn)
- Firebase project \& credentials (obtain from https://console.firebase.google.com/)


### Setup Instructions

1. **Clone the Repository**

```bash
git clone https://github.com/vara-prasad-07/wealth_map.git
cd wealth_map
```

2. **Install Dependencies**

```bash
npm install
# or
yarn install
```

3. **Firebase Configuration**
    - Copy your Firebase config and update `src/firebase.js`.
    - Ensure Firestore and Authentication are enabled in your Firebase project.
4. **Start the Development Server**

```bash
npm run dev
# or
yarn dev
```

5. **Access the App**
    - By default, navigate to [http://localhost:5173](http://localhost:5173) in your browser.

### 📝 Folder Structure

- `src/components/`
    - Core Vue components (MapView, AdminSignup, auth, Owners, etc.)
- `src/layout/`, `src/router/`, `src/assets/`
    - Layout, routing config, and static assets
- `src/firebase.js`
    - Firebase initialization (add your config here)
- `public/`
    - Static public files (favicon, etc.)


## 📈 Demo

Check out the deployed version at: [wealthmap.netlify.app](https://wealthmap.netlify.app/)

## 🛡️ Security \& Notes

- Do **not** commit sensitive Firebase credentials to the repository.
- Follow best practices for securing API keys and environment files.
- The repo uses only public demo data; replace with your own as needed.


## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.
