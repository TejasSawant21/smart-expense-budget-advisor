fetch("/api/admin/check", { credentials: "include" })
  .then(res => res.json())
  .then(data => {
    if (!data.loggedIn) {
      location.href = "index.html";
    } else {
      loadAdminStats();
    }
  });

function loadAdminStats() {
  fetch("/api/admin/stats", { credentials: "include" })
    .then(res => res.json())
    .then(data => {
      document.getElementById("totalUsers").innerText = data.totalUsers;
      document.getElementById("totalTransactions").innerText = data.totalTransactions;
      document.getElementById("totalIncome").innerText = "₹" + data.totalIncome;
      document.getElementById("totalExpense").innerText = "₹" + data.totalExpense;
    });
}

function adminLogout() {
  fetch("/api/admin/logout", {
    method: "POST",
    credentials: "include"
  }).then(() => location.href = "index.html");
}
