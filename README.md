# Aeropay Network 💳⚡

[![Expo SDK 54](https://img.shields.io/badge/Expo-SDK%2054-000000.svg?style=for-the-badge&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB.svg?style=for-the-badge&logo=react)](https://reactnative.dev)
[![NativeWind v4](https://img.shields.io/badge/NativeWind-v4-06B6D4.svg?style=for-the-badge&logo=tailwindcss)](https://nativewind.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![CI Status](https://img.shields.io/badge/CI-Passing-16A34A.svg?style=for-the-badge&logo=githubactions)](https://github.com/shemaarafati2020/AEROPAY-NETWORK/actions)

**Aeropay Network** is a state-of-the-art fintech mobile application crafted with Expo SDK 54, Expo Router, NativeWind v4 (TailwindCSS v3), and React Native Reanimated. Designed for seamless multi-account management, instant PDF account statement generation, card security controls, and responsive cross-platform usability.

---

## 🌟 Key Features

- 💳 **Card & Account Management:**
  - Interactive credit/debit card carousel with custom account switching.
  - Connected financial instruments management modal with instant card freeze/unfreeze controls.
- 📄 **Branded PDF Statement Generator:**
  - Time-range selector (`3 Months`, `6 Months`, `12 Months`, or `Custom Date`).
  - Computer-generated official PDF statements featuring the Aeropay logo, verification stamp, balance summary, and categorized transaction log.
  - Native print & share integration via `expo-print` and `expo-sharing`.
- 🔔 **Global Toast System:**
  - Application-wide real-time notification toasts for transactional and security feedback.
- 🎨 **Utility-First Styling:**
  - NativeWind v4 + TailwindCSS v3 styling engine with dark and light glassmorphism.
- 🔐 **Security & Compliance:**
  - Dedicated Profile view, biometrics authentication toggles, device session management, and regulatory compliance disclosures.
- ⚡ **Automated Developer Workflow & CI/CD:**
  - **Husky pre-commit hook** enforcing zero-warning ESLint and strict TypeScript type-checking (`tsc --noEmit`).
  - **GitHub Actions CI Pipeline** running automated builds and lint checks on push/PR events.

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **Expo SDK 54** | Core mobile platform & native module runtime |
| **Expo Router v6** | Typed file-based route navigation |
| **NativeWind v4** | Utility-first TailwindCSS styling for React Native |
| **React Native Reanimated 4** | High-performance fluid UI micro-animations |
| **expo-print & expo-sharing** | Dynamic PDF document generation and file sharing |
| **Husky & ESLint 9** | Automated code quality & pre-commit enforcement |
| **TypeScript 5.9** | Strict type safety across all components & hooks |

---

## 📁 Repository Structure

```
AEROPAY NETWORK/
├── .github/workflows/      # Automated CI/CD GitHub Actions (ci.yml)
├── .husky/                 # Pre-commit git hook validation scripts
├── src/
│   ├── app/                # Expo Router file-based screens & layouts
│   │   ├── (tabs)/         # Bottom navigation tab views (Home, Send, Activity, Profile)
│   │   └── profile/        # Modal screen for profile & security settings
│   ├── components/         # Reusable UI components & animated elements
│   ├── context/            # Global Toast & application context providers
│   ├── constants/          # Design system tokens, colors, & typography
│   └── global.css          # TailwindCSS directives entrypoint
├── babel.config.js         # NativeWind Babel plugin configuration
├── metro.config.js         # Metro bundler NativeWind CSS integration
├── tailwind.config.js      # Custom theme colors & utility definitions
├── declarations.d.ts       # TypeScript module declarations
└── package.json            # Scripts & project dependencies
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have **Node.js (v18+)** and **npm** installed on your system.

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/shemaarafati2020/AEROPAY-NETWORK.git
cd AEROPAY-NETWORK
npm install
```

### 3. Running the App
Start the Expo development server:

```bash
npm start
```

Use **Expo Go** on your iOS/Android device or press `a` for Android Emulator / `i` for iOS Simulator.

---

## 🧪 Quality Scripts & CI

Run manual validation checks locally:

```bash
# Type-check TypeScript files
npm run type-check

# Lint with strict zero-warning policy
npm run lint
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
