/* ============================================================
   GLOBAL HELPERS
   ============================================================ */

// Toggle between the "Add/Edit" form view and the "Records" table view
window.toggleView = function (formId, tableId) {
  const form = document.getElementById(formId);
  const table = document.getElementById(tableId);

  if (!form || !table) return;

  if (form.style.display !== "none") {
    form.style.display = "none";
    table.style.display = "block";
  } else {
    form.style.display = "block";
    table.style.display = "none";
  }
};

// Generic form validator (used by multiple forms)
window.validateForm = function (formId) {
  const form = document.getElementById(formId);
  const inputs = form.querySelectorAll("[required]");
  let isValid = true;

  inputs.forEach((input) => {
    if (!input.value) {
      input.style.borderColor = "red";
      isValid = false;
    } else {
      input.style.borderColor = "";
    }
  });

  return isValid;
};

// Small helper to show a temporary alert banner (used on pages that have it)
window.showAlert = function (type, message) {
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;

  const container = document.querySelector(".data-management .container");
  if (container) {
    container.prepend(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
  }
};

/* ============================================================
   USERS  (Create, Read, Update, Delete)
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  const addUserForm = document.getElementById("addUserForm");
  const userTableBody = document.getElementById("userTableBody");

  if (!addUserForm || !userTableBody) return; // not on users.html

  const formTitle = document.getElementById("formTitle");
  const submitBtn = document.getElementById("submitBtn");
  let editUserId = null;

  function resetUserForm() {
    editUserId = null;
    addUserForm.reset();
    if (formTitle) formTitle.textContent = "Add New User";
    if (submitBtn) submitBtn.textContent = "Add User";
    document.getElementById("password").required = true;
  }

  function fetchUsers() {
    fetch("http://localhost:3000/get-users")
      .then((response) => response.json())
      .then((data) => {
        userTableBody.innerHTML = "";
        data.forEach((user) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${user.UserID}</td>
            <td>${user.FullName}</td>
            <td>${user.Email}</td>
            <td>${user.Role}</td>
            <td>${user.City ?? ""}</td>
            <td>
                <button class="btn btn-edit" onclick='editUser(${JSON.stringify(user)})'>
                    ✏️ Edit
                </button>
                <button class="btn btn-delete" onclick="deleteUser(${user.UserID})">
                    🗑 Delete
                </button>
            </td>
          `;
          userTableBody.appendChild(row);
        });
      })
      .catch((error) => console.error("Error fetching users:", error));
  }

  addUserForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!validateForm("addUserForm")) return;

    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;
    const city = document.getElementById("city").value;

    const payload = { fullName, email, password, role, city };

    const isEditing = editUserId !== null;
    const url = isEditing
      ? `http://localhost:3000/update-user/${editUserId}`
      : "http://localhost:3000/add-user";
    const method = isEditing ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) throw new Error(isEditing ? "Failed to update user" : "Failed to add user");
        return response.text();
      })
      .then((data) => {
        alert("✅ " + data);
        resetUserForm();
        fetchUsers();
      })
      .catch((error) => {
        alert("❌ Error: " + error.message);
      });
  });

  // Called from the Edit button in the table
  window.editUser = function (user) {
    editUserId = user.UserID;
    document.getElementById("fullName").value = user.FullName;
    document.getElementById("email").value = user.Email;
    document.getElementById("password").value = user.Password || "";
    document.getElementById("password").required = false; // don't force re-entering password
    document.getElementById("role").value = user.Role;
    document.getElementById("city").value = user.City || "";

    if (formTitle) formTitle.textContent = "Edit User";
    if (submitBtn) submitBtn.textContent = "Update User";

    // Switch from table view back to form view
    toggleView("userTable", "userForm");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Called from the Delete button in the table
  window.deleteUser = function (id) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    fetch(`http://localhost:3000/delete-user/${id}`, { method: "DELETE" })
      .then((response) => {
        if (!response.ok) return response.text().then((msg) => { throw new Error(msg); });
        return response.text();
      })
      .then((data) => {
        alert("✅ " + data);
        fetchUsers();
      })
      .catch((error) => {
        alert("❌ Error: " + error.message);
      });
  };

  // Expose fetchUsers + reset so toggleView/cancel can call it
  window.fetchUsers = fetchUsers;
  window.resetUserForm = resetUserForm;

  // Re-fetch whenever we flip to the table view, and clear any stale edit state
  const originalToggleView = window.toggleView;
  window.toggleView = function (formId, tableId) {
    const table = document.getElementById(tableId);
    const switchingToTable = table && table.style.display === "none";
    originalToggleView(formId, tableId);
    if (tableId === "userTable" && switchingToTable) {
      fetchUsers();
      resetUserForm();
    }
  };

  fetchUsers();
});

/* ============================================================
   BUSES  (Create, Read, Update, Delete)
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  const addBusForm = document.getElementById("addBusForm");
  const busTableBody = document.querySelector("#busTable tbody");

  if (!addBusForm || !busTableBody) return; // not on buses.html

  let editBusId = null;
  const busFormTitle = document.querySelector("#busForm .form-title");
  const busSubmitBtn = addBusForm.querySelector("button[type='submit']");

  function resetBusForm() {
    editBusId = null;
    addBusForm.reset();
    if (busFormTitle) busFormTitle.textContent = "Add New Bus";
    if (busSubmitBtn) busSubmitBtn.textContent = "Add Bus";
  }

  function fetchBuses() {
    fetch("http://localhost:3000/get-buses")
      .then((response) => response.json())
      .then((data) => {
        busTableBody.innerHTML = "";
        data.forEach((bus) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${bus.BusID}</td>
            <td>${bus.BusNumber}</td>
            <td>${bus.BusType}</td>
            <td>${bus.TotalSeats}</td>
            <td>${bus.OperatorName}</td>
            <td>
                <button class="btn-icon edit" title="Edit" onclick='editBus(${JSON.stringify(bus)})'>
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete" title="Delete" onclick="deleteBus(${bus.BusID})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
          `;
          busTableBody.appendChild(row);
        });
      })
      .catch((error) => console.error("❌ Error fetching buses:", error));
  }

  addBusForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const busNumber = document.getElementById("busNumber").value;
    const busType = document.getElementById("busType").value;
    const totalSeats = document.getElementById("totalSeats").value;
    const operatorName = document.getElementById("operatorName").value;

    const payload = { busNumber, busType, totalSeats, operatorName };

    const isEditing = editBusId !== null;
    const url = isEditing
      ? `http://localhost:3000/update-bus/${editBusId}`
      : "http://localhost:3000/add-bus";
    const method = isEditing ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) throw new Error(isEditing ? "Failed to update bus" : "Failed to add bus");
        return response.text();
      })
      .then((data) => {
        alert("✅ " + data);
        resetBusForm();
        fetchBuses();
      })
      .catch((error) => {
        alert("❌ Error: " + error.message);
      });
  });

  window.editBus = function (bus) {
    editBusId = bus.BusID;
    document.getElementById("busNumber").value = bus.BusNumber;
    document.getElementById("busType").value = bus.BusType;
    document.getElementById("totalSeats").value = bus.TotalSeats;
    document.getElementById("operatorName").value = bus.OperatorName;

    if (busFormTitle) busFormTitle.textContent = "Edit Bus";
    if (busSubmitBtn) busSubmitBtn.textContent = "Update Bus";

    toggleView("busTable", "busForm");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.deleteBus = function (id) {
    if (!confirm("Are you sure you want to delete this bus?")) return;

    fetch(`http://localhost:3000/delete-bus/${id}`, { method: "DELETE" })
      .then((response) => {
        if (!response.ok) return response.text().then((msg) => { throw new Error(msg); });
        return response.text();
      })
      .then((data) => {
        alert("✅ " + data);
        fetchBuses();
      })
      .catch((error) => {
        alert("❌ Error: " + error.message);
      });
  };

  window.fetchBuses = fetchBuses;

  const prevToggleView = window.toggleView;
  window.toggleView = function (formId, tableId) {
    const table = document.getElementById(tableId);
    const switchingToTable = table && table.style.display === "none";
    prevToggleView(formId, tableId);
    if (tableId === "busTable" && switchingToTable) {
      fetchBuses();
      resetBusForm();
    }
  };

  fetchBuses();
});

/* ============================================================
   ROUTES  (Create, Read, Update, Delete)
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  const addRouteForm = document.getElementById("addRouteForm");
  const routeTableBody = document.querySelector("#routeTable tbody");

  if (!addRouteForm || !routeTableBody) return; // not on routes.html

  let editRouteId = null;
  const routeFormTitle = document.querySelector("#routeForm .form-title");
  const routeSubmitBtn = addRouteForm.querySelector("button[type='submit']");

  function resetRouteForm() {
    editRouteId = null;
    addRouteForm.reset();
    if (routeFormTitle) routeFormTitle.textContent = "Add New Route";
    if (routeSubmitBtn) routeSubmitBtn.textContent = "Add Route";
  }

  function fetchRoutes() {
    fetch("http://localhost:3000/get-routes")
      .then((response) => response.json())
      .then((data) => {
        routeTableBody.innerHTML = "";
        data.forEach((route) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${route.RouteID}</td>
            <td>${route.Source}</td>
            <td>${route.Destination}</td>
            <td>${route.Distance_KM}</td>
            <td>${route.EstimatedTime}</td>
            <td>
                <button class="btn-icon edit" title="Edit" onclick='editRoute(${JSON.stringify(route)})'>
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete" title="Delete" onclick="deleteRoute(${route.RouteID})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
          `;
          routeTableBody.appendChild(row);
        });
      })
      .catch((error) => console.error("❌ Error fetching routes:", error));
  }

  addRouteForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const source = document.getElementById("source").value;
    const destination = document.getElementById("destination").value;
    const distance = document.getElementById("distance").value;
    const estimatedTime = document.getElementById("estimatedTime").value;

    const payload = { source, destination, distance, estimatedTime };

    const isEditing = editRouteId !== null;
    const url = isEditing
      ? `http://localhost:3000/update-route/${editRouteId}`
      : "http://localhost:3000/add-route";
    const method = isEditing ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) throw new Error(isEditing ? "Failed to update route" : "Failed to add route");
        return response.text();
      })
      .then((data) => {
        alert("✅ " + data);
        resetRouteForm();
        fetchRoutes();
      })
      .catch((error) => {
        alert("❌ Error: " + error.message);
      });
  });

  window.editRoute = function (route) {
    editRouteId = route.RouteID;
    document.getElementById("source").value = route.Source;
    document.getElementById("destination").value = route.Destination;
    document.getElementById("distance").value = route.Distance_KM;
    document.getElementById("estimatedTime").value = route.EstimatedTime;

    if (routeFormTitle) routeFormTitle.textContent = "Edit Route";
    if (routeSubmitBtn) routeSubmitBtn.textContent = "Update Route";

    toggleView("routeTable", "routeForm");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.deleteRoute = function (id) {
    if (!confirm("Are you sure you want to delete this route?")) return;

    fetch(`http://localhost:3000/delete-route/${id}`, { method: "DELETE" })
      .then((response) => {
        if (!response.ok) return response.text().then((msg) => { throw new Error(msg); });
        return response.text();
      })
      .then((data) => {
        alert("✅ " + data);
        fetchRoutes();
      })
      .catch((error) => {
        alert("❌ Error: " + error.message);
      });
  };

  window.fetchRoutes = fetchRoutes;

  const prevToggleView2 = window.toggleView;
  window.toggleView = function (formId, tableId) {
    const table = document.getElementById(tableId);
    const switchingToTable = table && table.style.display === "none";
    prevToggleView2(formId, tableId);
    if (tableId === "routeTable" && switchingToTable) {
      fetchRoutes();
      resetRouteForm();
    }
  };

  fetchRoutes();
});

/* ============================================================
   TICKETS  (Create, Read, Update, Delete)
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  const addTicketForm = document.getElementById("addTicketForm");
  const ticketTableBody = document.querySelector("#ticketTable tbody");

  if (!addTicketForm || !ticketTableBody) return; // not on tickets.html

  let editTicketId = null;
  const ticketFormTitle = document.querySelector("#ticketForm .form-title");
  const ticketSubmitBtn = addTicketForm.querySelector("button[type='submit']");

  const today = new Date().toISOString().split("T")[0];
  const bookingDateInput = document.getElementById("bookingDate");
  if (bookingDateInput) bookingDateInput.value = today;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const journeyDateInput = document.getElementById("journeyDate");
  if (journeyDateInput) journeyDateInput.min = tomorrow.toISOString().split("T")[0];

  function resetTicketForm() {
    editTicketId = null;
    addTicketForm.reset();
    if (bookingDateInput) bookingDateInput.value = today;
    if (ticketFormTitle) ticketFormTitle.textContent = "Add New Ticket";
    if (ticketSubmitBtn) ticketSubmitBtn.textContent = "Add Ticket";
  }

  function fetchDropdownData() {
    fetch("http://localhost:3000/get-users-dropdown")
      .then((response) => response.json())
      .then((users) => {
        const userSelect = document.getElementById("userId");
        const currentVal = userSelect.value;
        userSelect.innerHTML = '<option value="">Select User</option>';
        users.forEach((user) => {
          const option = document.createElement("option");
          option.value = user.UserID;
          option.textContent = `${user.FullName} (ID: ${user.UserID})`;
          userSelect.appendChild(option);
        });
        if (currentVal) userSelect.value = currentVal;
      });

    fetch("http://localhost:3000/get-buses-dropdown")
      .then((response) => response.json())
      .then((buses) => {
        const busSelect = document.getElementById("busId");
        const currentVal = busSelect.value;
        busSelect.innerHTML = '<option value="">Select Bus</option>';
        buses.forEach((bus) => {
          const option = document.createElement("option");
          option.value = bus.BusID;
          option.textContent = `${bus.BusNumber} - ${bus.BusType} (ID: ${bus.BusID})`;
          busSelect.appendChild(option);
        });
        if (currentVal) busSelect.value = currentVal;
      });

    fetch("http://localhost:3000/get-routes-dropdown")
      .then((response) => response.json())
      .then((routes) => {
        const routeSelect = document.getElementById("routeId");
        const currentVal = routeSelect.value;
        routeSelect.innerHTML = '<option value="">Select Route</option>';
        routes.forEach((route) => {
          const option = document.createElement("option");
          option.value = route.RouteID;
          option.textContent = `${route.Source} to ${route.Destination} (ID: ${route.RouteID})`;
          routeSelect.appendChild(option);
        });
        if (currentVal) routeSelect.value = currentVal;
      });
  }

  function fetchTickets() {
    fetch("http://localhost:3000/get-tickets")
      .then((response) => response.json())
      .then((tickets) => {
        ticketTableBody.innerHTML = "";
        tickets.forEach((ticket) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${ticket.TicketID}</td>
            <td>${ticket.UserName} (ID: ${ticket.UserID})</td>
            <td>${ticket.BusNumber} (ID: ${ticket.BusID})</td>
            <td>${ticket.RouteName} (ID: ${ticket.RouteID})</td>
            <td>${ticket.SeatNumber}</td>
            <td>${formatDateForDisplay(ticket.BookingDate)}</td>
            <td>${formatDateForDisplay(ticket.JourneyDate)}</td>
            <td><span class="status-${ticket.Status.toLowerCase()}">${ticket.Status}</span></td>
            <td>
                <button class="btn-icon edit" title="Edit" onclick='editTicket(${JSON.stringify(ticket)})'>
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete" title="Delete" onclick="deleteTicket(${ticket.TicketID})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
          `;
          ticketTableBody.appendChild(row);
        });
      })
      .catch((error) => console.error("Error fetching tickets:", error));
  }

  function formatDateForDisplay(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split("T")[0];
  }

  fetchDropdownData();
  fetchTickets();

  addTicketForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const userId = document.getElementById("userId").value;
    const busId = document.getElementById("busId").value;
    const routeId = document.getElementById("routeId").value;
    const seatNumber = document.getElementById("seatNumber").value;
    const bookingDate = document.getElementById("bookingDate").value;
    const journeyDate = document.getElementById("journeyDate").value;
    const status = document.getElementById("status").value;

    const payload = { userId, busId, routeId, seatNumber, bookingDate, journeyDate, status };

    const isEditing = editTicketId !== null;
    const url = isEditing
      ? `http://localhost:3000/update-ticket/${editTicketId}`
      : "http://localhost:3000/add-ticket";
    const method = isEditing ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) throw new Error(isEditing ? "Failed to update ticket" : "Failed to add ticket");
        return response.text();
      })
      .then((data) => {
        alert("✅ " + data);
        resetTicketForm();
        fetchTickets();
      })
      .catch((error) => {
        alert("❌ Error: " + error.message);
      });
  });

  window.editTicket = function (ticket) {
    editTicketId = ticket.TicketID;
    document.getElementById("userId").value = ticket.UserID;
    document.getElementById("busId").value = ticket.BusID;
    document.getElementById("routeId").value = ticket.RouteID;
    document.getElementById("seatNumber").value = ticket.SeatNumber;
    document.getElementById("bookingDate").value = formatDateForDisplay(ticket.BookingDate);
    document.getElementById("journeyDate").value = formatDateForDisplay(ticket.JourneyDate);
    document.getElementById("status").value = ticket.Status;

    if (ticketFormTitle) ticketFormTitle.textContent = "Edit Ticket";
    if (ticketSubmitBtn) ticketSubmitBtn.textContent = "Update Ticket";

    toggleView("ticketTable", "ticketForm");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.deleteTicket = function (id) {
    if (!confirm("Are you sure you want to delete this ticket?")) return;

    fetch(`http://localhost:3000/delete-ticket/${id}`, { method: "DELETE" })
      .then((response) => {
        if (!response.ok) return response.text().then((msg) => { throw new Error(msg); });
        return response.text();
      })
      .then((data) => {
        alert("✅ " + data);
        fetchTickets();
      })
      .catch((error) => {
        alert("❌ Error: " + error.message);
      });
  };

  window.fetchTickets = fetchTickets;

  const prevToggleView3 = window.toggleView;
  window.toggleView = function (formId, tableId) {
    const table = document.getElementById(tableId);
    const switchingToTable = table && table.style.display === "none";
    prevToggleView3(formId, tableId);
    if (tableId === "ticketTable" && switchingToTable) {
      fetchTickets();
      resetTicketForm();
    }
  };
});

/* ============================================================
   PAYMENTS  (Create, Read, Update, Delete)
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  const addPaymentForm = document.getElementById("addPaymentForm");
  if (!addPaymentForm) return; // not on payments.html

  let editPaymentId = null;
  const paymentFormTitle = document.querySelector("#paymentForm .form-title");
  const paymentSubmitBtn = addPaymentForm.querySelector("button[type='submit']");

  const today = new Date().toISOString().split("T")[0];
  const paymentDateInput = document.getElementById("paymentDate");
  if (paymentDateInput) paymentDateInput.value = today;

  function resetPaymentForm() {
    editPaymentId = null;
    addPaymentForm.reset();
    if (paymentDateInput) paymentDateInput.value = today;
    if (paymentFormTitle) paymentFormTitle.textContent = "Add New Payment";
    if (paymentSubmitBtn) paymentSubmitBtn.textContent = "Add Payment";
  }

  function formatDateForDisplay(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split("T")[0];
  }

  async function initializePaymentPage() {
    try {
      document.getElementById("ticketId").innerHTML = '<option value="">Loading tickets...</option>';
      await Promise.all([fetchTicketsForDropdown(), fetchPayments()]);
    } catch (error) {
      console.error("Initialization error:", error);
      showAlert("error", "Failed to initialize page: " + error.message);
    }
  }

  function validatePaymentForm() {
    let isValid = true;
    const requiredFields = ["ticketId", "amount", "paymentDate", "paymentMethod"];
    requiredFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (!field.value) {
        field.style.borderColor = "#dc3545";
        isValid = false;
      } else {
        field.style.borderColor = "";
      }
    });

    const amount = document.getElementById("amount");
    if (amount.value && parseInt(amount.value) <= 0) {
      amount.style.borderColor = "#dc3545";
      isValid = false;
    }

    if (!isValid) showAlert("error", "Please fill all required fields correctly");
    return isValid;
  }

  async function fetchTicketsForDropdown() {
    try {
      const response = await fetch("http://localhost:3000/get-tickets-dropdown");
      if (!response.ok) throw new Error("Failed to fetch tickets");

      const tickets = await response.json();
      const ticketSelect = document.getElementById("ticketId");
      const currentVal = ticketSelect.value;
      ticketSelect.innerHTML = '<option value="">Select Ticket</option>';

      tickets.forEach((ticket) => {
        const option = document.createElement("option");
        option.value = ticket.TicketID;
        option.textContent = `Ticket #${ticket.TicketID} - ${ticket.UserName} (${ticket.RouteName})`;
        ticketSelect.appendChild(option);
      });
      if (currentVal) ticketSelect.value = currentVal;
    } catch (error) {
      console.error("Ticket dropdown error:", error);
      document.getElementById("ticketId").innerHTML = '<option value="">Error loading tickets</option>';
      throw error;
    }
  }

  async function fetchPayments() {
    try {
      const tbody = document.querySelector("#paymentTable tbody");
      tbody.innerHTML = '<tr><td colspan="7" class="loading">Loading payments...</td></tr>';

      const response = await fetch("http://localhost:3000/get-payments");
      if (!response.ok) throw new Error("Failed to fetch payments");

      const payments = await response.json();
      displayPayments(payments);
    } catch (error) {
      console.error("Payment fetch error:", error);
      const tbody = document.querySelector("#paymentTable tbody");
      tbody.innerHTML = '<tr><td colspan="7" class="error">Error loading payments</td></tr>';
      throw error;
    }
  }

  function displayPayments(payments) {
    const tbody = document.querySelector("#paymentTable tbody");
    tbody.innerHTML = "";

    if (payments.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="no-data">No payments found</td></tr>';
      return;
    }

    payments.forEach((payment) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${payment.PaymentID}</td>
        <td>Ticket #${payment.TicketID} - ${payment.UserName} (${payment.RouteName})</td>
        <td>$${payment.Amount}</td>
        <td>${formatDateForDisplay(payment.PaymentDate)}</td>
        <td>${payment.PaymentMethod}</td>
        <td><span class="status-${payment.Status.toLowerCase()}">${payment.Status}</span></td>
        <td>
            <button class="btn-icon edit" title="Edit" onclick='editPayment(${JSON.stringify(payment)})'>
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon delete" title="Delete" onclick="deletePayment(${payment.PaymentID})">
                <i class="fas fa-trash"></i>
            </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  initializePaymentPage();

  addPaymentForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    try {
      if (!validatePaymentForm()) return;

      const submitBtn = addPaymentForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

      const paymentData = {
        ticketId: parseInt(document.getElementById("ticketId").value),
        amount: parseInt(document.getElementById("amount").value),
        paymentDate: document.getElementById("paymentDate").value,
        paymentMethod: document.getElementById("paymentMethod").value,
        status: document.getElementById("status").value,
      };

      const isEditing = editPaymentId !== null;
      const url = isEditing
        ? `http://localhost:3000/update-payment/${editPaymentId}`
        : "http://localhost:3000/add-payment";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Payment operation failed");
      }

      alert("✅ " + (isEditing ? "Payment updated successfully!" : "Payment added successfully!"));

      resetPaymentForm();
      await fetchPayments();
    } catch (error) {
      console.error("Payment error:", error);
      alert("❌ Error: " + error.message);
    } finally {
      const submitBtn = addPaymentForm.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.innerHTML = editPaymentId ? "Update Payment" : "Add Payment";
    }
  });

  window.editPayment = function (payment) {
    editPaymentId = payment.PaymentID;
    document.getElementById("ticketId").value = payment.TicketID;
    document.getElementById("amount").value = payment.Amount;
    document.getElementById("paymentDate").value = formatDateForDisplay(payment.PaymentDate);
    document.getElementById("paymentMethod").value = payment.PaymentMethod;
    document.getElementById("status").value = payment.Status;

    if (paymentFormTitle) paymentFormTitle.textContent = "Edit Payment";
    if (paymentSubmitBtn) paymentSubmitBtn.textContent = "Update Payment";

    toggleView("paymentTable", "paymentForm");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.deletePayment = function (id) {
    if (!confirm("Are you sure you want to delete this payment?")) return;

    fetch(`http://localhost:3000/delete-payment/${id}`, { method: "DELETE" })
      .then((response) => {
        if (!response.ok) return response.text().then((msg) => { throw new Error(msg); });
        return response.text();
      })
      .then((data) => {
        alert("✅ " + data);
        fetchPayments();
      })
      .catch((error) => {
        alert("❌ Error: " + error.message);
      });
  };

  window.fetchPayments = fetchPayments;

  window.toggleView = function (formId, tableId) {
    const form = document.getElementById(formId);
    const table = document.getElementById(tableId);

    if (form.style.display !== "none") {
      form.style.display = "none";
      table.style.display = "block";
      fetchPayments();
      resetPaymentForm();
    } else {
      form.style.display = "block";
      table.style.display = "none";
    }
  };
});

/* ============================================================
   CANCELLATIONS  (Create, Read, Update, Delete)
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  const addCancellationForm = document.getElementById("addCancellationForm");
  if (!addCancellationForm) return; // not on cancellation.html

  let editCancellationId = null;
  const cancellationFormTitle = document.querySelector("#cancellationForm .form-title");
  const cancellationSubmitBtn = addCancellationForm.querySelector("button[type='submit']");

  const today = new Date().toISOString().split("T")[0];
  document.getElementById("cancellationDate").value = today;

  function resetCancellationForm() {
    editCancellationId = null;
    addCancellationForm.reset();
    document.getElementById("cancellationDate").value = today;
    if (cancellationFormTitle) cancellationFormTitle.textContent = "Add New Cancellation";
    if (cancellationSubmitBtn) cancellationSubmitBtn.textContent = "Add Cancellation";
  }

  function formatDateForDisplay(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split("T")[0];
  }

  function fetchBookedTickets() {
    fetch("http://localhost:3000/get-booked-tickets-dropdown")
      .then((response) => response.json())
      .then((data) => {
        const ticketSelect = document.getElementById("ticketId");
        const currentVal = ticketSelect.value;
        ticketSelect.innerHTML = '<option value="">Select Ticket</option>';

        data.forEach((ticket) => {
          const option = document.createElement("option");
          option.value = ticket.TicketID;
          option.textContent = `Ticket #${ticket.TicketID} - ${ticket.UserName} (${ticket.RouteName}, Bus: ${ticket.BusNumber}, ${new Date(ticket.JourneyDate).toLocaleDateString()})`;
          ticketSelect.appendChild(option);
        });
        if (currentVal) ticketSelect.value = currentVal;
      })
      .catch((error) => console.error("Error fetching booked tickets:", error));
  }

  function fetchCancellations() {
    fetch("http://localhost:3000/get-cancellations")
      .then((response) => response.json())
      .then((data) => {
        const tbody = document.getElementById("cancellationTableBody");
        tbody.innerHTML = "";

        data.forEach((cancellation) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${cancellation.CancellationID}</td>
            <td>Ticket #${cancellation.TicketID}</td>
            <td>${cancellation.UserName}</td>
            <td>${cancellation.RouteName}</td>
            <td>${cancellation.BusNumber}</td>
            <td>${new Date(cancellation.CancellationDate).toLocaleDateString()}</td>
            <td>$${cancellation.RefundAmount}</td>
            <td>${cancellation.Reason}</td>
            <td>
              <button class="btn-icon edit" title="Edit" onclick='editCancellation(${JSON.stringify(cancellation)})'>
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-icon delete" title="Delete" onclick="deleteCancellation(${cancellation.CancellationID})">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          `;
          tbody.appendChild(row);
        });
      })
      .catch((error) => console.error("Error fetching cancellations:", error));
  }

  fetchBookedTickets();
  fetchCancellations();

  addCancellationForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!validateForm("addCancellationForm")) return;

    const ticketId = document.getElementById("ticketId").value;
    const cancellationDate = document.getElementById("cancellationDate").value;
    const refundAmount = document.getElementById("refundAmount").value;
    const reason = document.getElementById("reason").value;

    const isEditing = editCancellationId !== null;

    if (isEditing) {
      // Editing only updates the cancellation record (not the ticket status again)
      fetch(`http://localhost:3000/update-cancellation/${editCancellationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancellationDate, refundAmount, reason }),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to update cancellation");
          return response.text();
        })
        .then((data) => {
          alert("✅ " + data);
          resetCancellationForm();
          fetchCancellations();
          fetchBookedTickets();
        })
        .catch((error) => alert("❌ Error: " + error.message));
    } else {
      fetch("http://localhost:3000/add-cancellation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, cancellationDate, refundAmount, reason }),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to add cancellation");
          return response.text();
        })
        .then((data) => {
          alert("✅ " + data);
          resetCancellationForm();
          fetchCancellations();
          fetchBookedTickets();
        })
        .catch((error) => alert("❌ Error: " + error.message));
    }
  });

  window.editCancellation = function (cancellation) {
    editCancellationId = cancellation.CancellationID;

    // The ticket dropdown only lists currently-booked tickets, so make sure
    // this cancellation's ticket shows up as a selectable (disabled-looking) option too.
    const ticketSelect = document.getElementById("ticketId");
    let optionExists = Array.from(ticketSelect.options).some(
      (opt) => opt.value === String(cancellation.TicketID)
    );
    if (!optionExists) {
      const option = document.createElement("option");
      option.value = cancellation.TicketID;
      option.textContent = `Ticket #${cancellation.TicketID} - ${cancellation.UserName} (${cancellation.RouteName})`;
      ticketSelect.appendChild(option);
    }
    ticketSelect.value = cancellation.TicketID;
    ticketSelect.disabled = true; // ticket shouldn't change once a cancellation exists

    document.getElementById("cancellationDate").value = formatDateForDisplay(cancellation.CancellationDate);
    document.getElementById("refundAmount").value = cancellation.RefundAmount;
    document.getElementById("reason").value = cancellation.Reason;

    if (cancellationFormTitle) cancellationFormTitle.textContent = "Edit Cancellation";
    if (cancellationSubmitBtn) cancellationSubmitBtn.textContent = "Update Cancellation";

    toggleView("cancellationTable", "cancellationForm");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.deleteCancellation = function (id) {
    if (!confirm("Are you sure you want to delete this cancellation record?")) return;

    fetch(`http://localhost:3000/delete-cancellation/${id}`, { method: "DELETE" })
      .then((response) => {
        if (!response.ok) return response.text().then((msg) => { throw new Error(msg); });
        return response.text();
      })
      .then((data) => {
        alert("✅ " + data);
        fetchCancellations();
      })
      .catch((error) => alert("❌ Error: " + error.message));
  };

  window.fetchCancellations = fetchCancellations;
  window.fetchBookedTickets = fetchBookedTickets;

  window.toggleView = function (formId, tableId) {
    const form = document.getElementById(formId);
    const table = document.getElementById(tableId);

    if (form.style.display !== "none") {
      form.style.display = "none";
      table.style.display = "block";
      fetchCancellations();
      resetCancellationForm();
      document.getElementById("ticketId").disabled = false; // re-enable for "add new"
    } else {
      form.style.display = "block";
      table.style.display = "none";
    }
  };
});

/* ============================================================
   FEEDBACK  (Create, Read, Update, Delete)
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  const addFeedbackForm = document.getElementById("addFeedbackForm");
  if (!addFeedbackForm) return; // not on feedback.html

  let editFeedbackId = null;
  const feedbackFormTitle = document.querySelector("#feedbackForm .form-title");
  const feedbackSubmitBtn = addFeedbackForm.querySelector("button[type='submit']");

  const today = new Date().toISOString().split("T")[0];
  document.getElementById("feedbackDate").value = today;

  function resetFeedbackForm() {
    editFeedbackId = null;
    addFeedbackForm.reset();
    document.getElementById("feedbackDate").value = today;
    if (feedbackFormTitle) feedbackFormTitle.textContent = "Add New Feedback";
    if (feedbackSubmitBtn) feedbackSubmitBtn.textContent = "Add Feedback";
  }

  function formatDateForDisplay(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split("T")[0];
  }

  function fetchUsersForFeedback() {
    fetch("http://localhost:3000/get-users-dropdown")
      .then((response) => response.json())
      .then((data) => {
        const userSelect = document.getElementById("userId");
        const currentVal = userSelect.value;
        userSelect.innerHTML = '<option value="">Select User</option>';

        data.forEach((user) => {
          const option = document.createElement("option");
          option.value = user.UserID;
          option.textContent = `${user.FullName} (ID: ${user.UserID})`;
          userSelect.appendChild(option);
        });
        if (currentVal) userSelect.value = currentVal;
      })
      .catch((error) => console.error("Error fetching users:", error));
  }

  function fetchTicketsForFeedback() {
    fetch("http://localhost:3000/get-tickets-for-feedback")
      .then((response) => response.json())
      .then((data) => {
        const ticketSelect = document.getElementById("ticketId");
        const currentVal = ticketSelect.value;
        ticketSelect.innerHTML = '<option value="">Select Ticket</option>';

        data.forEach((ticket) => {
          const option = document.createElement("option");
          option.value = ticket.TicketID;
          option.textContent = `Ticket #${ticket.TicketID} - ${ticket.UserName} (${ticket.RouteName}, Bus: ${ticket.BusNumber})`;
          ticketSelect.appendChild(option);
        });
        if (currentVal) ticketSelect.value = currentVal;
      })
      .catch((error) => console.error("Error fetching tickets:", error));
  }

  function fetchFeedback() {
    fetch("http://localhost:3000/get-feedback")
      .then((response) => response.json())
      .then((data) => {
        const tbody = document.getElementById("feedbackTableBody");
        tbody.innerHTML = "";

        data.forEach((feedback) => {
          let starsHtml = "";
          for (let i = 1; i <= 5; i++) {
            starsHtml += i <= feedback.Rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
          }

          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${feedback.FeedbackID}</td>
            <td>${feedback.UserName}</td>
            <td>Ticket #${feedback.TicketID}</td>
            <td>${feedback.RouteName}</td>
            <td>${feedback.BusNumber}</td>
            <td><div class="star-rating">${starsHtml}</div></td>
            <td>${feedback.Comment}</td>
            <td>${new Date(feedback.FeedbackDate).toLocaleDateString()}</td>
            <td>
              <button class="btn-icon edit" title="Edit" onclick='editFeedback(${JSON.stringify(feedback)})'>
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-icon delete" title="Delete" onclick="deleteFeedback(${feedback.FeedbackID})">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          `;
          tbody.appendChild(row);
        });
      })
      .catch((error) => console.error("Error fetching feedback:", error));
  }

  fetchUsersForFeedback();
  fetchTicketsForFeedback();
  fetchFeedback();

  addFeedbackForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!validateForm("addFeedbackForm")) return;

    const userId = document.getElementById("userId").value;
    const ticketId = document.getElementById("ticketId").value;
    const ratingInput = document.querySelector('input[name="rating"]:checked');
    const rating = ratingInput ? ratingInput.value : null;
    const comment = document.getElementById("comment").value;
    const feedbackDate = document.getElementById("feedbackDate").value;

    if (!rating) {
      alert("Please select a rating");
      return;
    }

    const isEditing = editFeedbackId !== null;

    if (isEditing) {
      fetch(`http://localhost:3000/update-feedback/${editFeedbackId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment, feedbackDate }),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to update feedback");
          return response.text();
        })
        .then((data) => {
          alert("✅ " + data);
          resetFeedbackForm();
          fetchFeedback();
        })
        .catch((error) => alert("❌ Error: " + error.message));
    } else {
      fetch("http://localhost:3000/add-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ticketId, rating, comment, feedbackDate }),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to add feedback");
          return response.text();
        })
        .then((data) => {
          alert("✅ " + data);
          resetFeedbackForm();
          fetchFeedback();
        })
        .catch((error) => alert("❌ Error: " + error.message));
    }
  });

  window.editFeedback = function (feedback) {
    editFeedbackId = feedback.FeedbackID;

    const userSelect = document.getElementById("userId");
    const ticketSelect = document.getElementById("ticketId");

    // Ensure the user/ticket for this feedback are selectable even if not in the active dropdown list
    ensureOptionExists(userSelect, feedback.UserID, `User (ID: ${feedback.UserID})`);
    ensureOptionExists(
      ticketSelect,
      feedback.TicketID,
      `Ticket #${feedback.TicketID}`
    );

    userSelect.value = feedback.UserID;
    ticketSelect.value = feedback.TicketID;
    userSelect.disabled = true;
    ticketSelect.disabled = true;

    const starInput = document.getElementById(`star${feedback.Rating}`);
    if (starInput) starInput.checked = true;

    document.getElementById("comment").value = feedback.Comment;
    document.getElementById("feedbackDate").value = formatDateForDisplay(feedback.FeedbackDate);

    if (feedbackFormTitle) feedbackFormTitle.textContent = "Edit Feedback";
    if (feedbackSubmitBtn) feedbackSubmitBtn.textContent = "Update Feedback";

    toggleView("feedbackTable", "feedbackForm");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  function ensureOptionExists(select, value, label) {
    const exists = Array.from(select.options).some((opt) => opt.value === String(value));
    if (!exists) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      select.appendChild(option);
    }
  }

  window.deleteFeedback = function (id) {
    if (!confirm("Are you sure you want to delete this feedback?")) return;

    fetch(`http://localhost:3000/delete-feedback/${id}`, { method: "DELETE" })
      .then((response) => {
        if (!response.ok) return response.text().then((msg) => { throw new Error(msg); });
        return response.text();
      })
      .then((data) => {
        alert("✅ " + data);
        fetchFeedback();
      })
      .catch((error) => alert("❌ Error: " + error.message));
  };

  window.fetchFeedback = fetchFeedback;
  window.fetchUsersForFeedback = fetchUsersForFeedback;
  window.fetchTicketsForFeedback = fetchTicketsForFeedback;

  window.toggleView = function (formId, tableId) {
    const form = document.getElementById(formId);
    const table = document.getElementById(tableId);

    if (form.style.display !== "none") {
      form.style.display = "none";
      table.style.display = "block";
      fetchFeedback();
      resetFeedbackForm();
      document.getElementById("userId").disabled = false; // re-enable for "add new"
      document.getElementById("ticketId").disabled = false;
    } else {
      form.style.display = "block";
      table.style.display = "none";
    }
  };
});
