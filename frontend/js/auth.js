/* ---------- REGISTER ---------- */
function register() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!name || !email || !password) {
    alert("All fields are required");
    return;
  }

  fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      location.href = "index.html";
    });
}

/* ---------- LOGIN ---------- */
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Email and password required");
    return;
  }

  fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.user) {
        location.href = "dashboard.html";
      } else {
        alert("Invalid login");
      }
    })
    .catch(() => alert("Server error"));
}

/* ---------- LOGOUT ---------- */
function logout() {
  fetch("http://localhost:5000/api/auth/logout", {
    method: "POST",
    credentials: "include"
  }).then(() => {
    location.href = "index.html";
  });
}

/* ---------- AUTH CHECK (AUTO PROTECT PAGES) ---------- */
function checkAuth() {
  fetch("http://localhost:5000/api/auth/check", {
    credentials: "include"
  })
    .then(res => res.json())
    .then(data => {
      if (!data.loggedIn) {
        location.href = "index.html";
      }
    });
}
