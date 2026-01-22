# PayTR 3D Secure Simulation (Mock E-Commerce)

This project is a high-realism portfolio demo that simulates the "Use of PayTR 3D Secure Iframe" flow in an e-commerce context. 
It follows Official PayTR standards: **Kuruş-based amounts**, **basket integrity checks**, and **HMAC-SHA256 hash verification**.

## 🚀 Enhanced Features
- **📦 In-Memory Stock Management**: 
    - Real-time inventory tracking (updates after successful payment).
    - Frontend validation prevents adding more than available stock.
    - "Sold Out" states with grayscale UI filter.
- **🛡️ Security & Integrity**:
    - **Total Validation**: Backend verifies `total_amount == sum(items)`.
    - **Hash Verification**: Mandatory SHA256 signature check for all incoming bank callbacks.
- **⚡ Pro Simulation Layer**:
    - **Mock PayTR Iframe**: Full credit card entry and 3D Secure OTP simulation.
    - **Mock Bank (Webhook)**: Asynchronous 200ms callback delivery to simulate real-world webhooks.
- **📱 Modern Frontend**:
    - Redux Toolkit state management (memory-based cart).
    - Tailwind CSS v4 styling with dynamic "Live Stock" badges.
    - Cache-busting (timestamped) product fetching.

## 🛠️ Project Structure
- `/backend`: Node.js Express (TypeScript) - Port 5000
- `/frontend`: React + Vite (Tailwind 4) - Port 5173

## 🏗️ Switching to Real PayTR
When you are ready to go live:
1. **Config**: Update `backend/src/config/paytr.mock.ts` with your real `merchant_id`, `key`, and `salt`.
2. **Endpoints**:
    - **Token Request**: Use `https://www.paytr.com/odeme/guvenli/`
    - **Iframe**: PayTR requires an HTML Form POST to their URL. Update `Checkout.tsx` to use a hidden form submit instead of the simulation iframe src.
3. **Internal Logic**: Look for `// REAL PAYTR` comments in the following files:
    - [Checkout.tsx](file:///c:/PayTR-Simulation/frontend/src/pages/Checkout.tsx)
    - [paytr.service.ts](file:///c:/PayTR-Simulation/backend/src/services/paytr.service.ts)
    - [mock-bank.controller.ts](file:///c:/PayTR-Simulation/backend/src/controllers/mock-bank.controller.ts)
4. **Environment**: Replace local URLs (`localhost:5000`) with your production domain in the `app.post` / `axios.get` calls.

## 🚦 How to Run
1. **Start Backend**: `cd backend && npm install && npm run dev`
2. **Start Frontend**: `cd frontend && npm install && npm run dev`
3. Open `http://localhost:5173`

## 🛠 Tech Stack
- **Frontend**: React 19, Redux, Tailwind CSS v4, Lucide Icons, Vite.
- **Backend**: Express, Node.js, TypeScript, Crypto (HMAC-SHA256), UUID.
