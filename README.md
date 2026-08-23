# Last-Mile Delivery Tracker

**Developer:** Vijay Bala K G 

**Registration Number:** 23BCE1920

**Institution:** Vellore Institute of Technology, Chennai

**Program:** B.Tech Computer Science 

A comprehensive logistics operations platform featuring complex pricing rules, dynamic agent assignment, and real-time delivery tracking. Built with FastAPI (Backend) and React/Vite (Frontend).
---

## 1. System Design Write-Up

### Architecture Overview
The platform is designed as a decoupled system featuring a robust FastAPI backend for high-performance API routing and a React single-page application (SPA) for a responsive, role-based user interface. The system employs JWT-based authentication to securely route users to Customer, Agent, or Admin dashboards.

### Rate Calculation Engine & Zone Detection
The core pricing engine avoids hardcoding by relying on admin-configured Rate Cards and Zones. 
* **Zone Detection:** When an order is created, the system maps the provided pickup and drop-off base cities to their respective Admin-defined Zones. If the pickup and drop zones match, it flags the delivery as "Intra-city"; if they differ, it is "Inter-city". 
* **Volumetric Math:** The system computes the volumetric weight using the standard logistics divisor `(L × B × H) / 5000`. 
* **Billable Logic:** It determines the highest value between the actual weight and the volumetric weight. This billable weight is multiplied by the per-kg charge defined in the relevant Rate Card (filtered by B2B/B2C and Intra/Inter rules). Finally, it checks the payment type and appends the COD surcharge if applicable.

### Auto-Assignment Logic
To optimize delivery times, agent assignment operates on a nearest-availability model. When an Admin triggers auto-assignment, the backend queries the database for active delivery agents stationed in the order's designated Pickup Zone. The system filters for agents whose status is `AVAILABLE` and assigns the order to the agent with the lowest active delivery queue. This ensures equitable load balancing across the fleet.

### Failed Delivery & Immutable Lifecycle
The order tracking system utilizes an append-only event log to guarantee an immutable history. Every status transition (`PENDING` → `ASSIGNED` → `IN_TRANSIT` → `DELIVERED`/`FAILED`) records a timestamp and the actor responsible. 
If an agent marks a delivery as `FAILED`, the system flags the order and automatically triggers an asynchronous notification payload to the customer. The customer's dashboard unlocks a "Reschedule" action. Upon rescheduling, the previous agent is unassigned, the delivery date is updated, and the order is routed back into the auto-assignment queue for a fresh delivery attempt.

---

## 2. Rate Calculation Logic (Step-by-Step)
1. **Input Variables:** Length (cm), Breadth (cm), Height (cm), Actual Weight (kg).
2. **Volumetric Weight:** Calculated as `Vol_Wt = (L * B * H) / 5000`.
3. **Billable Weight:** `Max(Actual Weight, Vol_Wt)`.
4. **Base Rate Lookup:** Database queried for matching Rate Card based on:
   - Route: Intra-zone vs. Inter-zone
   - Type: B2B vs. B2C
5. **Base Calculation:** `Total = Base Charge + (Billable Weight * Per_Kg_Charge)`.
6. **Surcharges:** If Payment Type == `COD`, add `COD_Surcharge`.

---

## 3. Database Schema

**Users Table**
* `id` (UUID, PK)
* `email` (String, Unique)
* `password_hash` (String)
* `role` (Enum: CUSTOMER, AGENT, ADMIN)
* `zone_id` (UUID, FK - for Agents)

**Zones Table**
* `id` (UUID, PK)
* `name` (String)
* `base_city` (String)

**Rate Cards Table**
* `id` (UUID, PK)
* `zone_id` (UUID, FK)
* `rate_type` (Enum: INTRA, INTER)
* `customer_type` (Enum: B2B, B2C)
* `base_charge` (Float)
* `per_kg_charge` (Float)
* `cod_surcharge` (Float)

**Orders Table**
* `id` (UUID, PK)
* `tracking_number` (String, Unique)
* `customer_id` (UUID, FK)
* `agent_id` (UUID, FK, Nullable)
* `pickup_address`, `drop_address` (String)
* `billable_weight` (Float)
* `total_charge` (Float)
* `current_status` (Enum)

**Tracking History Table**
* `id` (UUID, PK)
* `order_id` (UUID, FK)
* `status` (Enum)
* `timestamp` (DateTime)
* `remarks` (String)

---

## 4. API Documentation

### Auth & Users
* `POST /users/register` - Create new user account.
* `POST /users/login` - Authenticate and return JWT token.

### Orders (Customer & Admin)
* `POST /orders/` - Create a new order (calculates charge automatically).
* `GET /orders/my-orders` - Retrieve logged-in customer's orders.
* `POST /orders/{id}/reschedule` - Reschedule a FAILED order.
* `GET /track/{tracking_number}` - Public endpoint returning full tracking timeline.

### Logistics (Admin & Agent)
* `POST /admin/zones` - Create delivery zones.
* `POST /admin/rate-cards` - Configure dynamic pricing rules.
* `POST /orders/{id}/auto-assign` - Trigger nearest-agent routing logic.
* `PUT /agents/orders/{id}/status` - Agent updates delivery status.

---

## 5. Setup Guide

### Prerequisites
* Python 3.10+
* Node.js v18+
* PostgreSQL or SQLite

### Backend Setup (FastAPI)
1. Navigate to the backend directory.
2. Create a virtual environment: `python -m venv venv`
3. Activate the environment: `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt`
5. Run the server: `uvicorn app.main:app --reload`
*Server will run at [http://127.0.0.1:8000](http://127.0.0.1:8000)*

### Frontend Setup (React + Vite)
1. Navigate to the `frontend/` directory.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
*Application will run at http://localhost:5173*

---

## 6. .env.example

```env
# Backend Environment Variables
DATABASE_URL=sqlite:///./sql_app.db
# Or for PostgreSQL: DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=your_super_secret_jwt_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Email Integration (Standard SMTP)
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=notifications@parceltracker.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
```
