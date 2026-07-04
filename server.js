require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Database connection error:", err);
    return;
  }
  console.log("✅ Connected to MySQL database");
});

/* ============================================================
   USERS  (Create, Read, Update, Delete)
   ============================================================ */

// POST Route to Add User
app.post("/add-user", (req, res) => {
  const { fullName, email, password, role, city } = req.body;
  console.log("📥 Received user data:", req.body);

  const query = `INSERT INTO users (fullname, email, password, role, city)
                   VALUES (?, ?, ?, ?, ?)`;

  db.query(query, [fullName, email, password, role, city], (err, result) => {
    if (err) {
      console.error("❌ Error inserting user:", err);
      return res.status(500).send("Server Error");
    }

    console.log("✅ User added successfully");
    res.status(200).send("User added");
  });
});

// GET Route to Retrieve Users
app.get("/get-users", (req, res) => {
  const query = "SELECT * FROM users";

  db.query(query, (err, result) => {
    if (err) {
      console.error("❌ Error fetching users:", err);
      return res.status(500).send("Server Error");
    }

    res.status(200).json(result);
  });
});

// PUT Route to Update a User
app.put("/update-user/:id", (req, res) => {
  const { id } = req.params;
  const { fullName, email, password, role, city } = req.body;

  const query = `UPDATE users
                 SET fullname = ?, email = ?, password = ?, role = ?, city = ?
                 WHERE UserID = ?`;

  db.query(query, [fullName, email, password, role, city, id], (err, result) => {
    if (err) {
      console.error("❌ Error updating user:", err);
      return res.status(500).send("Error updating user");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("User not found");
    }

    console.log("✅ User updated:", id);
    res.status(200).send("User updated successfully");
  });
});

// DELETE Route to Delete a User
app.delete("/delete-user/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM users WHERE UserID = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("❌ Error deleting user:", err);
      return res.status(500).send(
        "Error deleting user. They may have related tickets, payments, or feedback records."
      );
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("User not found");
    }

    console.log("✅ User deleted:", id);
    res.status(200).send("User deleted successfully");
  });
});

// GET Route to Fetch Users for dropdown
app.get("/get-users-dropdown", (req, res) => {
  const query = "SELECT UserID, FullName FROM Users";

  db.query(query, (err, result) => {
    if (err) {
      console.error("❌ Error fetching users for dropdown:", err);
      return res.status(500).send("Error fetching users");
    }

    res.status(200).json(result);
  });
});

/* ============================================================
   BUSES  (Create, Read, Update, Delete)
   ============================================================ */

// POST Route to Add a New Bus
app.post("/add-bus", (req, res) => {
  const { busNumber, busType, totalSeats, operatorName } = req.body;

  const query = `INSERT INTO Buses (BusNumber, BusType, TotalSeats, OperatorName)
                 VALUES (?, ?, ?, ?)`;

  db.query(
    query,
    [busNumber, busType, totalSeats, operatorName],
    (err, result) => {
      if (err) {
        console.error("❌ Error inserting bus:", err);
        return res.status(500).send("Error adding bus");
      }

      console.log("✅ Bus added:", result.insertId);
      res.status(200).send("Bus added successfully");
    }
  );
});

// GET Route to Fetch All Buses
app.get("/get-buses", (req, res) => {
  const query = "SELECT * FROM Buses";

  db.query(query, (err, result) => {
    if (err) {
      console.error("❌ Error fetching buses:", err);
      return res.status(500).send("Error fetching buses");
    }

    res.status(200).json(result);
  });
});

// PUT Route to Update a Bus
app.put("/update-bus/:id", (req, res) => {
  const { id } = req.params;
  const { busNumber, busType, totalSeats, operatorName } = req.body;

  const query = `UPDATE Buses
                 SET BusNumber = ?, BusType = ?, TotalSeats = ?, OperatorName = ?
                 WHERE BusID = ?`;

  db.query(
    query,
    [busNumber, busType, totalSeats, operatorName, id],
    (err, result) => {
      if (err) {
        console.error("❌ Error updating bus:", err);
        return res.status(500).send("Error updating bus");
      }

      if (result.affectedRows === 0) {
        return res.status(404).send("Bus not found");
      }

      console.log("✅ Bus updated:", id);
      res.status(200).send("Bus updated successfully");
    }
  );
});

// DELETE Route to Delete a Bus
app.delete("/delete-bus/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM Buses WHERE BusID = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("❌ Error deleting bus:", err);
      return res.status(500).send(
        "Error deleting bus. It may have related tickets."
      );
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Bus not found");
    }

    console.log("✅ Bus deleted:", id);
    res.status(200).send("Bus deleted successfully");
  });
});

// GET Route to Fetch Buses for dropdown
app.get("/get-buses-dropdown", (req, res) => {
  const query = "SELECT BusID, BusNumber, BusType FROM Buses";

  db.query(query, (err, result) => {
    if (err) {
      console.error("❌ Error fetching buses for dropdown:", err);
      return res.status(500).send("Error fetching buses");
    }

    res.status(200).json(result);
  });
});

/* ============================================================
   ROUTES  (Create, Read, Update, Delete)
   ============================================================ */

// POST Route to Add a New Route
app.post("/add-route", (req, res) => {
  const { source, destination, distance, estimatedTime } = req.body;

  const query = `INSERT INTO Routes (Source, Destination, Distance_KM, EstimatedTime)
                 VALUES (?, ?, ?, ?)`;

  db.query(
    query,
    [source, destination, distance, estimatedTime],
    (err, result) => {
      if (err) {
        console.error("❌ Error inserting route:", err);
        return res.status(500).send("Error adding route");
      }

      console.log("✅ Route added:", result.insertId);
      res.status(200).send("Route added successfully");
    }
  );
});

// GET Route to Fetch All Routes
app.get("/get-routes", (req, res) => {
  const query = "SELECT * FROM Routes";

  db.query(query, (err, result) => {
    if (err) {
      console.error("❌ Error fetching routes:", err);
      return res.status(500).send("Error fetching routes");
    }

    res.status(200).json(result);
  });
});

// PUT Route to Update a Route
app.put("/update-route/:id", (req, res) => {
  const { id } = req.params;
  const { source, destination, distance, estimatedTime } = req.body;

  const query = `UPDATE Routes
                 SET Source = ?, Destination = ?, Distance_KM = ?, EstimatedTime = ?
                 WHERE RouteID = ?`;

  db.query(
    query,
    [source, destination, distance, estimatedTime, id],
    (err, result) => {
      if (err) {
        console.error("❌ Error updating route:", err);
        return res.status(500).send("Error updating route");
      }

      if (result.affectedRows === 0) {
        return res.status(404).send("Route not found");
      }

      console.log("✅ Route updated:", id);
      res.status(200).send("Route updated successfully");
    }
  );
});

// DELETE Route to Delete a Route
app.delete("/delete-route/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM Routes WHERE RouteID = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("❌ Error deleting route:", err);
      return res.status(500).send(
        "Error deleting route. It may have related tickets."
      );
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Route not found");
    }

    console.log("✅ Route deleted:", id);
    res.status(200).send("Route deleted successfully");
  });
});

// GET Route to Fetch Routes for dropdown
app.get("/get-routes-dropdown", (req, res) => {
  const query = "SELECT RouteID, Source, Destination FROM Routes";

  db.query(query, (err, result) => {
    if (err) {
      console.error("❌ Error fetching routes for dropdown:", err);
      return res.status(500).send("Error fetching routes");
    }

    res.status(200).json(result);
  });
});

/* ============================================================
   TICKETS  (Create, Read, Update, Delete)
   ============================================================ */

// POST Route to Add a New Ticket
app.post("/add-ticket", (req, res) => {
  const { userId, busId, routeId, seatNumber, bookingDate, journeyDate, status } = req.body;

  const query = `INSERT INTO Tickets (UserID, BusID, RouteID, SeatNumber, BookingDate, JourneyDate, Status)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    query,
    [userId, busId, routeId, seatNumber, bookingDate, journeyDate, status],
    (err, result) => {
      if (err) {
        console.error("❌ Error inserting ticket:", err);
        return res.status(500).send("Error adding ticket");
      }

      console.log("✅ Ticket added:", result.insertId);
      res.status(200).send("Ticket added successfully");
    }
  );
});

// GET Route to Fetch All Tickets with joined data
app.get("/get-tickets", (req, res) => {
  const query = `
    SELECT 
      t.TicketID, 
      t.SeatNumber, 
      t.BookingDate, 
      t.JourneyDate, 
      t.Status,
      u.UserID,
      u.FullName AS UserName,
      b.BusID,
      b.BusNumber,
      b.BusType,
      r.RouteID,
      CONCAT(r.Source, ' to ', r.Destination) AS RouteName
    FROM Tickets t
    JOIN Users u ON t.UserID = u.UserID
    JOIN Buses b ON t.BusID = b.BusID
    JOIN Routes r ON t.RouteID = r.RouteID
    ORDER BY t.TicketID DESC
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("❌ Error fetching tickets:", err);
      return res.status(500).send("Error fetching tickets");
    }

    res.status(200).json(result);
  });
});

// PUT Route to Update a Ticket
app.put("/update-ticket/:id", (req, res) => {
  const { id } = req.params;
  const { userId, busId, routeId, seatNumber, bookingDate, journeyDate, status } = req.body;

  const query = `UPDATE Tickets
                 SET UserID = ?, BusID = ?, RouteID = ?, SeatNumber = ?,
                     BookingDate = ?, JourneyDate = ?, Status = ?
                 WHERE TicketID = ?`;

  db.query(
    query,
    [userId, busId, routeId, seatNumber, bookingDate, journeyDate, status, id],
    (err, result) => {
      if (err) {
        console.error("❌ Error updating ticket:", err);
        return res.status(500).send("Error updating ticket");
      }

      if (result.affectedRows === 0) {
        return res.status(404).send("Ticket not found");
      }

      console.log("✅ Ticket updated:", id);
      res.status(200).send("Ticket updated successfully");
    }
  );
});

// DELETE Route to Delete a Ticket
app.delete("/delete-ticket/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM Tickets WHERE TicketID = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("❌ Error deleting ticket:", err);
      return res.status(500).send(
        "Error deleting ticket. It may have related payments, cancellations, or feedback."
      );
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Ticket not found");
    }

    console.log("✅ Ticket deleted:", id);
    res.status(200).send("Ticket deleted successfully");
  });
});

// GET single ticket by id (used to pre-fill the edit form)
app.get("/get-ticket/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM Tickets WHERE TicketID = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("❌ Error fetching ticket:", err);
      return res.status(500).send("Error fetching ticket");
    }

    if (result.length === 0) {
      return res.status(404).send("Ticket not found");
    }

    res.status(200).json(result[0]);
  });
});

// GET Route to Fetch Tickets for dropdown (only booked tickets)
app.get("/get-tickets-dropdown", (req, res) => {
  const query = `
    SELECT 
      t.TicketID,
      u.FullName AS UserName,
      CONCAT(r.Source, ' to ', r.Destination) AS RouteName
    FROM Tickets t
    JOIN Users u ON t.UserID = u.UserID
    JOIN Routes r ON t.RouteID = r.RouteID
    WHERE t.Status = 'Booked'
    ORDER BY t.TicketID DESC
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("❌ Error fetching tickets for dropdown:", err);
      return res.status(500).send("Error fetching tickets");
    }

    res.status(200).json(result);
  });
});

// GET Route to Fetch Tickets for dropdown (only booked tickets) - for cancellations
app.get("/get-booked-tickets-dropdown", (req, res) => {
  const query = `
    SELECT 
      t.TicketID,
      u.FullName AS UserName,
      CONCAT(r.Source, ' to ', r.Destination) AS RouteName,
      b.BusNumber,
      t.JourneyDate
    FROM Tickets t
    JOIN Users u ON t.UserID = u.UserID
    JOIN Routes r ON t.RouteID = r.RouteID
    JOIN Buses b ON t.BusID = b.BusID
    WHERE t.Status = 'Booked'
    ORDER BY t.TicketID DESC
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("❌ Error fetching booked tickets:", err);
      return res.status(500).send("Error fetching booked tickets");
    }

    res.status(200).json(result);
  });
});

// GET Route to Fetch Tickets for dropdown (only booked tickets) - for feedback
app.get("/get-tickets-for-feedback", (req, res) => {
  const query = `
    SELECT 
      t.TicketID,
      u.FullName AS UserName,
      CONCAT(r.Source, ' to ', r.Destination) AS RouteName,
      b.BusNumber,
      t.JourneyDate
    FROM Tickets t
    JOIN Users u ON t.UserID = u.UserID
    JOIN Routes r ON t.RouteID = r.RouteID
    JOIN Buses b ON t.BusID = b.BusID
    WHERE t.Status = 'Booked'
    ORDER BY t.TicketID DESC
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("❌ Error fetching tickets for feedback:", err);
      return res.status(500).send("Error fetching tickets");
    }

    res.status(200).json(result);
  });
});

/* ============================================================
   PAYMENTS  (Create, Read, Update, Delete)
   ============================================================ */

// POST Route to Add a New Payment
app.post("/add-payment", async (req, res) => {
  try {
    console.log("Incoming payment data:", req.body);

    const { ticketId, amount, paymentDate, paymentMethod, status } = req.body;

    if (!ticketId || !amount || !paymentDate || !paymentMethod || !status) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (isNaN(ticketId) || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount or ticket ID" });
    }

    const ticketCheck = await new Promise((resolve, reject) => {
      db.query("SELECT 1 FROM Tickets WHERE TicketID = ?", [ticketId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    if (ticketCheck.length === 0) {
      return res.status(400).json({ error: "Ticket does not exist" });
    }

    const result = await new Promise((resolve, reject) => {
      const query = `INSERT INTO Payments (TicketID, Amount, PaymentDate, PaymentMethod, Status)
                     VALUES (?, ?, ?, ?, ?)`;
      db.query(
        query,
        [ticketId, amount, paymentDate, paymentMethod, status],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });

    console.log("Payment inserted with ID:", result.insertId);
    res.status(201).json({
      message: "Payment added successfully",
      paymentId: result.insertId,
    });
  } catch (error) {
    console.error("Payment processing error:", error);
    res.status(500).json({
      error: "Error processing payment",
      details: error.message,
    });
  }
});

// GET Route to Fetch All Payments with joined ticket data
app.get("/get-payments", async (req, res) => {
  try {
    const query = `
        SELECT 
            p.PaymentID,
            p.Amount,
            p.PaymentDate,
            p.PaymentMethod,
            p.Status,
            t.TicketID,
            u.FullName AS UserName,
            CONCAT(r.Source, ' to ', r.Destination) AS RouteName
        FROM Payments p
        JOIN Tickets t ON p.TicketID = t.TicketID
        JOIN Users u ON t.UserID = u.UserID
        JOIN Routes r ON t.RouteID = r.RouteID
        ORDER BY p.PaymentDate DESC, p.PaymentID DESC
    `;

    const payments = await new Promise((resolve, reject) => {
      db.query(query, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    res.status(200).json(payments);
  } catch (error) {
    console.error("Failed to fetch payments:", error);
    res.status(500).json({
      error: "Failed to fetch payments",
      details: error.message,
    });
  }
});

// PUT Route to Update a Payment
app.put("/update-payment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { ticketId, amount, paymentDate, paymentMethod, status } = req.body;

    if (!ticketId || !amount || !paymentDate || !paymentMethod || !status) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const query = `UPDATE Payments
                   SET TicketID = ?, Amount = ?, PaymentDate = ?, PaymentMethod = ?, Status = ?
                   WHERE PaymentID = ?`;

    const result = await new Promise((resolve, reject) => {
      db.query(
        query,
        [ticketId, amount, paymentDate, paymentMethod, status, id],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Payment not found" });
    }

    console.log("✅ Payment updated:", id);
    res.status(200).json({ message: "Payment updated successfully" });
  } catch (error) {
    console.error("❌ Error updating payment:", error);
    res.status(500).json({ error: "Error updating payment", details: error.message });
  }
});

// DELETE Route to Delete a Payment
app.delete("/delete-payment/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM Payments WHERE PaymentID = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("❌ Error deleting payment:", err);
      return res.status(500).send("Error deleting payment");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Payment not found");
    }

    console.log("✅ Payment deleted:", id);
    res.status(200).send("Payment deleted successfully");
  });
});

/* ============================================================
   CANCELLATIONS  (Create, Read, Update, Delete)
   ============================================================ */

// POST Route to Add a New Cancellation
app.post("/add-cancellation", (req, res) => {
  const { ticketId, cancellationDate, refundAmount, reason } = req.body;

  // First update the ticket status to 'Cancelled'
  const updateTicketQuery = `UPDATE Tickets SET Status = 'Cancelled' WHERE TicketID = ?`;

  db.query(updateTicketQuery, [ticketId], (err, result) => {
    if (err) {
      console.error("❌ Error updating ticket status:", err);
      return res.status(500).send("Error updating ticket status");
    }

    const insertCancellationQuery = `INSERT INTO Cancellations (TicketID, CancellationDate, RefundAmount, Reason)
                                   VALUES (?, ?, ?, ?)`;

    db.query(
      insertCancellationQuery,
      [ticketId, cancellationDate, refundAmount, reason],
      (err, result) => {
        if (err) {
          console.error("❌ Error inserting cancellation:", err);
          return res.status(500).send("Error adding cancellation");
        }

        console.log("✅ Cancellation added:", result.insertId);
        res.status(200).send("Cancellation added successfully");
      }
    );
  });
});

// GET Route to Fetch All Cancellations with joined ticket data
app.get("/get-cancellations", (req, res) => {
  const query = `
    SELECT 
      c.CancellationID,
      c.CancellationDate,
      c.RefundAmount,
      c.Reason,
      t.TicketID,
      u.FullName AS UserName,
      CONCAT(r.Source, ' to ', r.Destination) AS RouteName,
      b.BusNumber,
      t.JourneyDate
    FROM Cancellations c
    JOIN Tickets t ON c.TicketID = t.TicketID
    JOIN Users u ON t.UserID = u.UserID
    JOIN Routes r ON t.RouteID = r.RouteID
    JOIN Buses b ON t.BusID = b.BusID
    ORDER BY c.CancellationDate DESC
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("❌ Error fetching cancellations:", err);
      return res.status(500).send("Error fetching cancellations");
    }

    res.status(200).json(result);
  });
});

// PUT Route to Update a Cancellation
app.put("/update-cancellation/:id", (req, res) => {
  const { id } = req.params;
  const { cancellationDate, refundAmount, reason } = req.body;

  const query = `UPDATE Cancellations
                 SET CancellationDate = ?, RefundAmount = ?, Reason = ?
                 WHERE CancellationID = ?`;

  db.query(query, [cancellationDate, refundAmount, reason, id], (err, result) => {
    if (err) {
      console.error("❌ Error updating cancellation:", err);
      return res.status(500).send("Error updating cancellation");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Cancellation not found");
    }

    console.log("✅ Cancellation updated:", id);
    res.status(200).send("Cancellation updated successfully");
  });
});

// DELETE Route to Delete a Cancellation
app.delete("/delete-cancellation/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM Cancellations WHERE CancellationID = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("❌ Error deleting cancellation:", err);
      return res.status(500).send("Error deleting cancellation");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Cancellation not found");
    }

    console.log("✅ Cancellation deleted:", id);
    res.status(200).send("Cancellation deleted successfully");
  });
});

// GET single cancellation by id (used to pre-fill the edit form)
app.get("/get-cancellation/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM Cancellations WHERE CancellationID = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("❌ Error fetching cancellation:", err);
      return res.status(500).send("Error fetching cancellation");
    }

    if (result.length === 0) {
      return res.status(404).send("Cancellation not found");
    }

    res.status(200).json(result[0]);
  });
});

/* ============================================================
   FEEDBACK  (Create, Read, Update, Delete)
   ============================================================ */

// POST Route to Add a New Feedback
app.post("/add-feedback", (req, res) => {
  const { userId, ticketId, rating, comment, feedbackDate } = req.body;

  const query = `INSERT INTO Feedback (UserID, TicketID, Rating, Comment, FeedbackDate)
                 VALUES (?, ?, ?, ?, ?)`;

  db.query(
    query,
    [userId, ticketId, rating, comment, feedbackDate],
    (err, result) => {
      if (err) {
        console.error("❌ Error inserting feedback:", err);
        return res.status(500).send("Error adding feedback");
      }

      console.log("✅ Feedback added:", result.insertId);
      res.status(200).send("Feedback added successfully");
    }
  );
});

// GET Route to Fetch All Feedback with joined user and ticket data
app.get("/get-feedback", (req, res) => {
  const query = `
    SELECT 
      f.FeedbackID,
      f.Rating,
      f.Comment,
      f.FeedbackDate,
      u.UserID,
      u.FullName AS UserName,
      t.TicketID,
      CONCAT(r.Source, ' to ', r.Destination) AS RouteName,
      b.BusNumber
    FROM Feedback f
    JOIN Users u ON f.UserID = u.UserID
    JOIN Tickets t ON f.TicketID = t.TicketID
    JOIN Routes r ON t.RouteID = r.RouteID
    JOIN Buses b ON t.BusID = b.BusID
    ORDER BY f.FeedbackDate DESC
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("❌ Error fetching feedback:", err);
      return res.status(500).send("Error fetching feedback");
    }

    res.status(200).json(result);
  });
});

// PUT Route to Update Feedback
app.put("/update-feedback/:id", (req, res) => {
  const { id } = req.params;
  const { rating, comment, feedbackDate } = req.body;

  const query = `UPDATE Feedback
                 SET Rating = ?, Comment = ?, FeedbackDate = ?
                 WHERE FeedbackID = ?`;

  db.query(query, [rating, comment, feedbackDate, id], (err, result) => {
    if (err) {
      console.error("❌ Error updating feedback:", err);
      return res.status(500).send("Error updating feedback");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Feedback not found");
    }

    console.log("✅ Feedback updated:", id);
    res.status(200).send("Feedback updated successfully");
  });
});

// DELETE Route to Delete Feedback
app.delete("/delete-feedback/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM Feedback WHERE FeedbackID = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("❌ Error deleting feedback:", err);
      return res.status(500).send("Error deleting feedback");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Feedback not found");
    }

    console.log("✅ Feedback deleted:", id);
    res.status(200).send("Feedback deleted successfully");
  });
});

// GET single feedback by id (used to pre-fill the edit form)
app.get("/get-feedback-item/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM Feedback WHERE FeedbackID = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("❌ Error fetching feedback item:", err);
      return res.status(500).send("Error fetching feedback");
    }

    if (result.length === 0) {
      return res.status(404).send("Feedback not found");
    }

    res.status(200).json(result[0]);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
