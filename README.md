# DTB Payment Gateway Simulator

A containerized digital wallet and payment gateway simulator built for the DTB Internship Project. This system demonstrates core financial flows including wallet balances, merchant payments, and basic daily settlements.

##  Tech Stack
*   **Frontend:** React Native (Mobile UI)
*   **Backend:** Django
*   **Database:** SQLite
*   **Infrastructure:** Docker & Docker Compose

## Core Features
*   **Customer App:** View wallet balances, review recent transactions, and approve/reject pending merchant requests.
*   **Merchant App:** Monitor available/pending balances and create payment requests.
*   **Containerized Environment:** Fully orchestrated backend, frontend, and database via Docker.

## Getting Started

### Prerequisites
*   [Docker](https://docs.docker.com/get-docker/) installed and running.

### Installation & Execution
This project is configured to run all services (Frontend, Backend, and PostgreSQL) via a single command.

1. Clone the repository:
   ```bash
   git clone https://github.com/ynam-fo-eno/mobile-payment-gateway-dtb-proj.git 
   (https://github.com/ynam-fo-eno/mobile-payment-gateway-dtb-proj)
   cd dtb-payment-gateway