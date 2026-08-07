# DTB Payment Gateway Simulator

A containerized digital wallet and payment gateway simulator built for the DTB Internship Project. This system demonstrates core financial flows including wallet balances, merchant payments, and basic daily settlements.

##  Tech Stack
*   **Frontend:** React Native (Mobile UI)
*   **Backend:** Java / Spring Boot (Auth, Wallet, Settlement Services)
*   **Database:** PostgreSQL
*   **Infrastructure:** Docker & Docker Compose

## Core Features
*   **Customer App:** View wallet balances, review recent transactions, and approve/reject pending merchant requests.
*   **Merchant App:** Monitor available/pending balances and create payment requests.
*   **Admin Dashboard:** High-level system overview tracking total users, wallets, transactions, and last settlement run.
*   **Containerized Environment:** Fully orchestrated backend, frontend, and database via Docker.

## Getting Started

### Prerequisites
*   [Docker](https://docs.docker.com/get-docker/) installed and running.

### Installation & Execution
This project is configured to run all services (Frontend, Backend, and PostgreSQL) via a single command.

1. Clone the repository:
   ```bash
   git clone [https://github.com/yourusername/dtb-payment-gateway.git](https://github.com/ynam-fo-eno/dtb-payment-gateway.git)
   cd dtb-payment-gateway