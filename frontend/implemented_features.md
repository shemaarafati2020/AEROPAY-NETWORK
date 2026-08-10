# Aeropay Network - Frontend Features & Implementation

This document outlines all the features, architectural decisions, and UI components implemented in the frontend of the Aeropay Network app.

## 🏗 Architecture & Framework

- **Expo SDK 54**: Built on the latest Expo SDK utilizing the Managed Workflow for rapid development.
- **Expo Router**: Implemented file-based routing for seamless navigation across tabs and screens (`src/app`).
- **TypeScript**: Strict type-checking and interface definitions to ensure code stability and maintainability.
- **React Native Reanimated**: Integrated advanced worklet-based animations running on the UI thread for buttery-smooth 60FPS performance.

## 🎨 UI/UX Design System

- **Light & Dark Mode**: Full native support for system theme changes using a custom `useTheme` hook.
- **Equity Mobile Aesthetic**: The design language is modeled after the Equity Mobile App, utilizing a deep Maroon (`#A51C24`) as the primary accent color.
- **Micro-Animations**:
  - **Staggered Entrances**: Elements gracefully fade in and slide up (`FadeInDown`, `FadeInUp`) with delays when the screen mounts.
  - **Interactive Springs**: Pressable elements (like the Quick Action buttons) shrink slightly upon press and spring back using `withSpring` physics.
- **Iconography**: Standardized vector icons using `@expo/vector-icons` (Ionicons) for a clean, consistent look.

## 📱 Components & Screens

### 1. Tab Navigation (`_layout.tsx`)

- Custom bottom tab bar with dynamic color tinting based on active state and system theme.
- Tabs implemented: **Home**, **Fund**, **Send**, **Recipients**, and **Activity**.

### 2. Home Screen (`index.tsx`)

A completely customized, high-fidelity dashboard containing:

- **Header Section**:
  - Minimalist user profile icon.
  - Dynamic greeting text ("Manage your accounts and cards, all in one place").
  - Notification bell with an active unread badge.
- **Primary Account Card**:
  - A visually striking maroon card displaying the active account type ("Current acc") and account number.
  - Interactive pagination dots below the card to indicate multiple swipeable accounts.
- **Balance Display**:
  - Clean layout showing "Available balance".
  - Large, bold typography for the amount (`50,550.00 KES`) alongside a dropdown chevron.
- **Quick Actions Grid**:
  - Four primary actions: **Transact**, **Account information**, **Stop payment**, and **Manage cards**.
  - Styled as circular buttons with white backgrounds, red borders, and centered red icons.
- **Transaction History Module**:
  - **Search & Filter**: A modern rounded search bar input paired with a standalone options/filter button.
  - **Date Range Selector**: A styled pill showing the active date filter ("15 Jun - 15 May 2023").
  - **Sub-Navigation Tabs**: Interactive tabs filtering between "Completed" and "In progress".
  - **Transaction List**: A scrollable list of recent transactions. Each item features an up/down arrow icon indicating credit/debit, transaction title, date, and color-coded amounts (Red for debit, Green for credit).

## 🛠 Fixes & Optimizations

- **Expo Go Compatibility**: Stripped out conflicting custom native modules (`expo-dev-client`, `react-native-worklets`) to ensure the app runs flawlessly in the standard Expo Go client.
- **Network Tunnelling**: Integrated `@expo/ngrok` to bypass local Wi-Fi and firewall restrictions, guaranteeing connection between the laptop and the mobile device.
- **TypeScript Fixes**: Resolved silent structural typing errors in hooks and spread operator issues inside `StyleSheet.create`.
- **Git Version Control**: Created the `designUI` branch, committed the new design changes, and successfully pushed the code to the remote GitHub repository.

## 🛡️ Trust & Safety Layer (Production Features)

Based on professional fintech standards, we moved beyond just a "happy-path demo" by implementing foundational trust and safety features:

### 1. Biometric Security & Real Intent

- **Face ID / Fingerprint Gating**: Integrated `expo-local-authentication` directly into the transaction `confirm.tsx` screen.
- **Transaction Friction**: Users must explicitly verify their identity via hardware biometrics (or device PIN fallback) _before_ any money movement is processed, ensuring the physical slide-to-confirm is backed by cryptographic user intent.

### 2. Failure & Reversal UX

- **Dynamic Status Timeline**: The transfer `status.tsx` timeline is no longer a guaranteed success loop. It dynamically handles network failures (e.g., Safaricom API timeouts).
- **Clear Refund States**: When a transfer fails midway, the UI explicitly transitions to an amber "Reversing" state and clearly communicates that funds have been refunded to the user's Main Wallet, preventing customer panic.
- **Idempotency Keys**: The status screen explicitly surfaces mock Idempotency Keys (`req_9x12nf821ms`), a visual indicator that the backend architecture prevents double-charging on network retries.
- **Dispute Access**: Added a clear "Open Dispute" path right below the transaction reference for failed transfers.
