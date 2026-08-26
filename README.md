# DTB Payment Gateway Simulator (Mobile App)

A containerized digital wallet and mobile client built for the DTB Internship Project. This system interfaces with the Django backend to demonstrate core financial flows including authentication, wallet balances, merchant payments, and profile management.

## Tech Stack
* **Frontend (Mobile):** React Native
* **Frontend (Web):** Next.js (Admin/Web Client)
* **Backend:** Django & Django REST Framework
* **Database:** PostgreSQL
* **Infrastructure:** Docker & Docker Compose

## Core Features
* **Authentication & Roles:** Secure JWT-based login and registration supporting distinct Customer and Merchant roles.
* **Wallet Management:** Real-time tracking of balances, recent transactions, and profile editing.
* **Payment Processing:** Seamless customer-to-merchant payment flows via email/identifier lookups.
* **Containerized Environment:** Fully orchestrated backend database services via Docker.

---

## Getting Started

Because this project runs across multiple layers (Dockerized backend, web client, and mobile client), you will need to open **three separate terminal windows/tabs** to run the complete environment concurrently.

### Prerequisites
* [Docker](https://docs.docker.com/get-docker/) installed and running.
* [Node.js](https://nodejs.org/) installed for running the frontend and mobile apps on the browser.
* [Android Studio] Heavy, I know, but needed for testing it on an emulator of a phone. 
   More on how to setup Android Studio and an appropriate emulator on React NAtive's setup docs (https://reactnative.dev/docs/set-up-your-environment)
---

### Running the Project (Multi-Terminal Setup)

#### Terminal 1: The Backend (Docker)
1. Navigate to your backend directory:
   ```bash
   cd payment-gateway-backend

2. Spin up the containerized backend and database:
   ```bash
   docker compose up -d
 (If you had major changes to Dockerfile for example you may run "docker compose down" first then the terminal immediately above)

3. To check that it's running:
   ```bash
   docker compose logs -f backend

#### Terminal 2: The Frontend (Next.js)
1. Navigate to your web frontend directory:
   ```bash
   cd frontend

2. If you're yet to, install dependencies:
   ```bash
   npm install

3. Run the development server using this command:
   ```bash
   npm run dev
(This will be accessed via the link: http://localhost:3000)



#### Terminal 2: Mobile (React Native and React Native CLI)
NB1: For testing on an emulator to work, we need the emulator on so run it via Android Studio first.
NB2: Run on your Android Emulator (ensure your API calls target http://10.0.2.2:8000 to talk to your local Docker container).


1. Navigate to your mobile directory:
   ```bash
      cd Pg-mobile

2. If you're yet to, install dependencies:
   ```bash
   npm install

3. Run using this command:
   ```bash
   npm run android


OR if you use React Native CLI's way of running it:
    ```bash
   npx react-native run-android

(This will automatically link tot he emulator you've been having on previously)
