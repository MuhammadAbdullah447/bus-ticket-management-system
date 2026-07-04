-- ============================================================
-- Bus Ticket Booking & Management System
-- Database Schema
-- ============================================================
-- Run this entire file in MySQL Workbench (or via CLI) to create
-- the database and all tables needed for this project.
--
-- Usage:
--   mysql -u root -p < database.sql
-- or paste the contents into MySQL Workbench and execute.
-- ============================================================

CREATE DATABASE IF NOT EXISTS BusTicketSystem;
USE BusTicketSystem;

-- ==========================
-- USERS
-- ==========================
CREATE TABLE IF NOT EXISTS Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    FullName VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Role VARCHAR(50),
    City VARCHAR(100)
);

-- ==========================
-- BUSES
-- ==========================
CREATE TABLE IF NOT EXISTS Buses (
    BusID INT AUTO_INCREMENT PRIMARY KEY,
    BusNumber VARCHAR(30) NOT NULL,
    BusType VARCHAR(50),
    TotalSeats INT,
    OperatorName VARCHAR(100)
);

-- ==========================
-- ROUTES
-- ==========================
CREATE TABLE IF NOT EXISTS Routes (
    RouteID INT AUTO_INCREMENT PRIMARY KEY,
    Source VARCHAR(100),
    Destination VARCHAR(100),
    Distance_KM INT,
    EstimatedTime VARCHAR(50)
);

-- ==========================
-- TICKETS
-- ==========================
CREATE TABLE IF NOT EXISTS Tickets (
    TicketID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT,
    BusID INT,
    RouteID INT,
    SeatNumber VARCHAR(10),
    BookingDate DATE,
    JourneyDate DATE,
    Status VARCHAR(30),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (BusID) REFERENCES Buses(BusID),
    FOREIGN KEY (RouteID) REFERENCES Routes(RouteID)
);

-- ==========================
-- PAYMENTS
-- ==========================
CREATE TABLE IF NOT EXISTS Payments (
    PaymentID INT AUTO_INCREMENT PRIMARY KEY,
    TicketID INT,
    Amount DECIMAL(10,2),
    PaymentDate DATE,
    PaymentMethod VARCHAR(50),
    Status VARCHAR(30),
    FOREIGN KEY (TicketID) REFERENCES Tickets(TicketID)
);

-- ==========================
-- FEEDBACK
-- ==========================
CREATE TABLE IF NOT EXISTS Feedback (
    FeedbackID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    TicketID INT NOT NULL,
    Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Comment TEXT,
    FeedbackDate DATE NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (TicketID) REFERENCES Tickets(TicketID)
);

-- ==========================
-- CANCELLATIONS
-- ==========================
CREATE TABLE IF NOT EXISTS Cancellations (
    CancellationID INT AUTO_INCREMENT PRIMARY KEY,
    TicketID INT NOT NULL,
    CancellationDate DATE NOT NULL,
    RefundAmount DECIMAL(10,2),
    Reason TEXT,
    FOREIGN KEY (TicketID) REFERENCES Tickets(TicketID)
);

-- ============================================================
-- Done! All 7 tables created:
-- Users, Buses, Routes, Tickets, Payments, Feedback, Cancellations
-- ============================================================
