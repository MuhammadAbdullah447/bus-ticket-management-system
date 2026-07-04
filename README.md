# 🚌 Bus Ticket Booking & Management System

A full-stack web application for managing a bus ticket booking system, built with **Node.js**, **Express**, **MySQL**, and vanilla **HTML/CSS/JavaScript**. The system supports complete **CRUD (Create, Read, Update, Delete)** operations across all core entities of a real-world bus ticketing platform.

## ✨ Features

This project manages 7 interconnected entities, each with full CRUD support:

| Module | Description |
|---|---|
| 👤 **Users** | Manage passenger accounts (name, email, role, city) |
| 🚌 **Buses** | Manage the bus fleet (bus number, type, seat capacity, operator) |
| 🛣️ **Routes** | Manage travel routes (source, destination, distance, estimated time) |
| 🎫 **Tickets** | Book tickets linking a user, bus, and route, with seat & journey details |
| 💳 **Payments** | Record and track payments against booked tickets |
| ❌ **Cancellations** | Process ticket cancellations and refund amounts |
| ⭐ **Feedback** | Collect passenger ratings and comments for completed trips |

Each module supports:
- ✅ **Create** — add new records via a form
- 📋 **Read** — view all records in a sortable table
- ✏️ **Update** — edit existing records inline
- 🗑️ **Delete** — remove records with a confirmation prompt

## 🛠️ Tech Stack

**Frontend:** HTML5, CSS3, Vanilla JavaScript (Fetch API)
**Backend:** Node.js, Express.js
**Database:** MySQL
**Other tools:** CORS, Body-Parser, Dotenv

## 📂 Project Structure

```
SQLProject/
├── SQLP/                  # Frontend files
│   ├── index.html         # Landing page
│   ├── about.html         # About page
│   ├── contact.html       # Contact page
│   ├── users.html         # Users CRUD page
│   ├── buses.html         # Buses CRUD page
│   ├── routes.html        # Routes CRUD page
│   ├── tickets.html       # Tickets CRUD page
│   ├── payments.html      # Payments CRUD page
│   ├── cancellation.html  # Cancellations CRUD page
│   ├── feedback.html      # Feedback CRUD page
│   ├── script.js          # All frontend logic (fetch calls, DOM updates)
│   └── styles.css         # Styling
├── server.js               # Express server + all API routes
├── database.sql            # MySQL schema (run this first!)
├── package.json
├── .env                     # Your local DB credentials (not committed)
└── .gitignore
```

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- [MySQL](https://dev.mysql.com/downloads/) installed and running

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd SQLProject
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up the database
Open MySQL Workbench (or the MySQL CLI) and run the schema file included in this repo:
```bash
mysql -u root -p < database.sql
```
This creates the `BusTicketSystem` database with all 7 tables.

### 4. Configure environment variables
Create a `.env` file in the project root (same folder as `server.js`):
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=BusTicketSystem
PORT=3000
```
> ⚠️ Never commit your real `.env` file — it's already excluded via `.gitignore`.

### 5. Run the server
```bash
node server.js
```
You should see:
```
🚀 Server running at http://localhost:3000
✅ Connected to MySQL database
```

### 6. Open the app
Open `SQLP/index.html` in your browser (or use a tool like VS Code's "Live Server" extension) and start exploring the system.


## 🔮 Future Improvements

- Add user authentication (login/signup with hashed passwords using `bcryptjs`, already included as a dependency)
- Add search & filter functionality on each table
- Add pagination for large datasets
- Deploy live (e.g. backend on Render/Railway, database on PlanetScale or Railway MySQL)

## 📄 License

This project is open source and available under the ISC License.

---

⭐ If you found this project useful or interesting, feel free to star the repo!
