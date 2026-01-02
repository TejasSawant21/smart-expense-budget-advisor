console.log("dashboard.js loaded");
let pieChartInstance = null;
let trendChartInstance = null;


const API = "http://localhost:5000/api";
let allTx = [];
let editModal;

/* ================= DOM ================= */
const incomeEl = income;
const expenseEl = expense;
const balanceEl = balance;
const savingsEl = savings;
const scoreEl = score;

const recentEl = recent;
const expenseCategoryTableEl = expenseCategoryTable;
const monthSummaryEl = monthSummary;
const balanceWarningEl = balanceWarning;
const topCategoryEl = topCategory;
const incomeStatusEl = incomeStatus;
const txCountEl = txCount;

const goalBarEl = goalBar;
const goalTextEl = goalText;

/* ================= AUTH ================= */
fetch(`${API}/auth/check`, { credentials: "include" })
  .then(r => r.json())
  .then(d => {
    if (!d.loggedIn) location.href = "index.html";
    editModal = new bootstrap.Modal(document.getElementById("editModal"));
    loadDashboard();
  });

/* ================= ADD ================= */
function addTx() {
  const titleVal = title.value.trim();
  const amtVal = Number(amount.value);
  const typeVal = type.value;
  const catVal = category.value || "General";

  if (!titleVal || !amtVal) return alert("Enter title & amount");

  let finalAmt = typeVal === "expense" ? -amtVal : amtVal;

  fetch(`${API}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      title: titleVal,
      amount: finalAmt,
      category: catVal
    })
  }).then(() => {
    title.value = "";
    amount.value = "";
    category.value = "";
    loadDashboard();
  });
}

/* ================= LOAD ================= */
function loadDashboard() {
  fetch(`${API}/expenses`, { credentials: "include" })
    .then(r => r.json())
    .then(data => {
     const now = new Date();
allTx = (data || []).filter(t => {
  const d = new Date(t.created_at || Date.now());
  if (selectedMonth === "current") {
    return d.getMonth() === now.getMonth();
  } else {
    return d.getMonth() === now.getMonth() - 1;
  }
});

      updateKPIs();
      updateSavingsGoal();
      monthlySummary();
      smartInsights();
      expenseByCategory();
      recentTx();
      budgetAlerts();
      applyFilters();
      renderCategoryChart();
      drawMonthlyTrend();
      renderExpensePieChart();
      renderMonthlyTrendChart();
      savingsPrediction();
      smartSuggestions();


    });
}

/* ================= KPI ================= */
function updateKPIs() {
  let inc = 0, exp = 0;

  allTx.forEach(t => {
    const a = Number(t.amount);
    if (a > 0) inc += a;
    else exp += Math.abs(a);
  });

  incomeEl.innerText = `₹${inc.toFixed(2)}`;
  expenseEl.innerText = `₹${exp.toFixed(2)}`;
  balanceEl.innerText = `₹${(inc - exp).toFixed(2)}`;
  savingsEl.innerText = inc ? Math.round(((inc - exp) / inc) * 100) + "%" : "0%";
  scoreEl.innerText = inc ? Math.min(100, Math.round(((inc - exp) / inc) * 100)) + " / 100" : "—";
}

/* ================= RECENT (EDIT + DELETE) ================= */
function recentTx() {
  recentEl.innerHTML = "";

  allTx.slice().reverse().forEach(t => {
    recentEl.innerHTML += `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>
          ${t.amount > 0 ? "Income" : "Expense"}:
          ${t.title} — ₹${Math.abs(Number(t.amount)).toFixed(2)}
        </span>
        <div>
          <button class="btn btn-sm btn-warning me-1" onclick='openEdit(${JSON.stringify(t)})'>Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteTx(${t.id})">Delete</button>
        </div>
      </li>`;
  });
}

/* ================= OPEN EDIT ================= */
function openEdit(t) {
  editId.value = t.id;
  editTitle.value = t.title;
  editAmount.value = Math.abs(Number(t.amount));
  editType.value = t.amount > 0 ? "income" : "expense";
  editCategory.value = t.category || "General";
  editModal.show();
}

/* ================= SAVE EDIT ================= */
function saveEdit() {
  const id = editId.value;
  let amt = Number(editAmount.value);
  if (editType.value === "expense") amt = -amt;

  fetch(`${API}/expenses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      title: editTitle.value,
      amount: amt,
      category: editCategory.value
    })
  }).then(() => {
    editModal.hide();
    loadDashboard();
  });
}

/* ================= DELETE ================= */
function deleteTx(id) {
  if (!confirm("Delete transaction?")) return;
  fetch(`${API}/expenses/${id}`, {
    method: "DELETE",
    credentials: "include"
  }).then(() => loadDashboard());
}

/* ================= BUDGET ALERT ================= */
function budgetAlerts() {
  let inc = 0, exp = 0;
  allTx.forEach(t => {
    const a = Number(t.amount);
    if (a > 0) inc += a;
    else exp += Math.abs(a);
  });

  alerts.innerText =
    exp / inc > 0.8 ? "🔴 High spending alert!" :
    exp / inc > 0.6 ? "🟠 Spending warning" :
    "🟢 Spending under control";
}

/* ================= SAVINGS GOAL ================= */
function setGoal() {
  localStorage.setItem("goal", goalInput.value);
  updateSavingsGoal();
}

function updateSavingsGoal() {
  const goal = Number(localStorage.getItem("goal"));
  if (!goal) return;

  let saved = 0;
  allTx.forEach(t => saved += Number(t.amount));
  goalBarEl.style.width = Math.min((saved / goal) * 100, 100) + "%";
  goalTextEl.innerText = `Saved ₹${saved.toFixed(2)} of ₹${goal}`;
}

/* ================= SUMMARY & INSIGHTS ================= */
function monthlySummary() {
  let inc = 0, exp = 0;
  allTx.forEach(t => {
    const a = Number(t.amount);
    if (a > 0) inc += a;
    else exp += Math.abs(a);
  });
  monthSummaryEl.innerText =
    `Income ₹${inc.toFixed(2)}, Expense ₹${exp.toFixed(2)}, Balance ₹${(inc - exp).toFixed(2)}`;
}

function smartInsights() {
  txCountEl.innerText = `🧾 ${allTx.length} transactions`;
}

/* ================= CATEGORY ================= */
function expenseByCategory() {
  expenseCategoryTableEl.innerHTML = "";
  let map = {}, total = 0;

  allTx.forEach(t => {
    if (t.amount < 0) {
      const c = t.category || "General";
      const v = Math.abs(Number(t.amount));
      map[c] = (map[c] || 0) + v;
      total += v;
    }
  });

  Object.entries(map).forEach(([c, v]) => {
    expenseCategoryTableEl.innerHTML += `
      <tr>
        <td>${c}</td>
        <td>₹${v.toFixed(2)}</td>
        <td>${((v / total) * 100).toFixed(1)}%</td>
      </tr>`;
  });
}

function renderExpensePieChart() {
  const ctx = document.getElementById("pieChart");
  if (!ctx) return;

  let categoryMap = {};
  let total = 0;

  allTx.forEach(t => {
    if (Number(t.amount) < 0) {
      const cat = t.category || "General";
      const val = Math.abs(Number(t.amount));
      categoryMap[cat] = (categoryMap[cat] || 0) + val;
      total += val;
    }
  });

  const labels = Object.keys(categoryMap);
  const values = Object.values(categoryMap);

  if (pieChartInstance) pieChartInstance.destroy();

  pieChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: [
          "#38bdf8",
          "#22c55e",
          "#facc15",
          "#f97316",
          "#a855f7"
        ],
        borderWidth: 2
      }]
    },
    options: {
  responsive: true,
  animation: {
    animateScale: true,
    animateRotate: true,
    duration: 1200
  },
  plugins: {
    legend: {
      position: "bottom",
      labels: { color: "#e5e7eb" }
    }
  },
  cutout: "65%"
}

  });
}

function renderMonthlyTrendChart() {
  const ctx = document.getElementById("trendChart");
  if (!ctx) return;

  let dailyExpense = Array(31).fill(0);

  allTx.forEach(t => {
    if (Number(t.amount) < 0 && t.created_at) {
      const day = new Date(t.created_at).getDate();
      dailyExpense[day - 1] += Math.abs(Number(t.amount));
    }
  });

  if (trendChartInstance) trendChartInstance.destroy();

  trendChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: dailyExpense.map((_, i) => `Day ${i + 1}`),
      datasets: [{
        label: "Daily Expense (₹)",
        data: dailyExpense,
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56,189,248,0.15)",
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      animation: {
  duration: 1200,
  easing: "easeOutQuart"
},

      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { ticks: { color: "#cbd5f5" } },
        y: { ticks: { color: "#cbd5f5" } }
      }
    }
  });
}


/* ================= LOGOUT ================= */
function logout() {
  fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" })
    .then(() => location.href = "index.html");
}

function toggleTheme() {
  document.body.classList.toggle("light");
}

function applyFilters() {
  const search =
    document.getElementById("searchInput")?.value.toLowerCase() || "";
  const filter =
    document.getElementById("filter")?.value || "all";

  const filtered = allTx.filter(t => {
    const titleMatch = t.title.toLowerCase().includes(search);
    return titleMatch;
  });

  recent.innerHTML = "";

  if (!filtered.length) {
    recent.innerHTML =
      `<li class="list-group-item text-muted">No matching transactions</li>`;
    return;
  }

  filtered.slice().reverse().forEach(t => {
    recent.innerHTML += `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>
          ${Number(t.amount) > 0 ? "Income" : "Expense"}:
          ${t.title} — ₹${Math.abs(Number(t.amount)).toFixed(2)}
        </span>
        <div>
          <button class="btn btn-sm btn-warning me-1" onclick='openEdit(${JSON.stringify(t)})'>Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteTx(${t.id})">Delete</button>
        </div>
      </li>`;
  });
}

let categoryChart;

function renderCategoryChart() {
  const ctx = document.getElementById("categoryChart");
  if (!ctx) return;

  const categoryMap = {};
  let total = 0;

  allTx.forEach(t => {
    if (Number(t.amount) < 0) {
      const cat = t.category || "General";
      const val = Math.abs(Number(t.amount));
      categoryMap[cat] = (categoryMap[cat] || 0) + val;
      total += val;
    }
  });

  const labels = Object.keys(categoryMap);
  const values = Object.values(categoryMap);

  if (!labels.length) return;

  if (categoryChart) categoryChart.destroy();

  categoryChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: values,
        borderWidth: 2,
        borderColor: "#020617",
        backgroundColor: [
          "#38bdf8",
          "#22c55e",
          "#facc15",
          "#fb7185",
          "#a78bfa",
          "#fb923c"
        ]
      }]
    },
    options: {
      cutout: "65%",
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#cbd5f5",
            padding: 15,
            boxWidth: 14
          }
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const value = ctx.raw;
              const pct = ((value / total) * 100).toFixed(1);
              return ` ₹${value} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

let trendChart;

/* ================= MONTHLY EXPENSE TREND ================= */
function drawMonthlyTrend() {
  const daily = {};

  // Collect expenses day-wise
  allTx.forEach(t => {
    if (t.amount < 0) {
      const d = new Date(t.created_at || Date.now()).getDate();
      daily[d] = (daily[d] || 0) + Math.abs(Number(t.amount));
    }
  });

  const days = Object.keys(daily).sort((a, b) => a - b);
  const values = days.map(d => daily[d]);

  const ctx = document.getElementById("trendChart");
  if (!ctx) return;

  if (trendChart) trendChart.destroy();

  trendChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: days.map(d => `Day ${d}`),
      datasets: [{
        label: "Expenses (₹)",
        data: values,
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56,189,248,0.15)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: "#38bdf8"
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { ticks: { color: "#cbd5f5" } },
        y: { ticks: { color: "#cbd5f5" } }
      }
    }
  });
}

let selectedMonth = "current";

function changeMonth() {
  selectedMonth = document.getElementById("monthSelect").value;
  loadDashboard();
}

function smartInsights() {
  let food = 0, total = 0;

  allTx.forEach(t => {
    if (t.amount < 0) {
      total += Math.abs(t.amount);
      if (t.category?.toLowerCase() === "food") {
        food += Math.abs(t.amount);
      }
    }
  });

  let msg = "Spending looks balanced";

  if (total > 0 && (food / total) > 0.3) {
    msg = "Food expenses are high this month";
  }

  document.getElementById("topCategory").innerText = msg;
  txCountEl.innerText = `🧾 ${allTx.length} transactions`;
}

function smartSuggestions() {
  let income = 0, expense = 0;

  allTx.forEach(t => {
    if (t.amount > 0) income += t.amount;
    else expense += Math.abs(t.amount);
  });

  let suggestion = "Good job managing expenses";

  if (expense > income * 0.7) {
    suggestion = "Try reducing discretionary spending by 10%";
  }

  document.getElementById("suggestion").innerText = suggestion;
}


function exportCSV() {
  let csv = "Title,Amount,Category,Date\n";

  allTx.forEach(t => {
    csv += `${t.title},${t.amount},${t.category || "General"},${t.created_at || ""}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `expense-report-${selectedMonth}.csv`;
  a.click();
}


function exportPDF() {
  const win = window.open("", "", "width=800,height=600");
  win.document.write("<h2>Expense Report</h2><hr>");
  allTx.forEach(t => {
    win.document.write(
      `<p>${t.title} — ₹${Math.abs(t.amount)} (${t.category || "General"})</p>`
    );
  });
  win.print();
}

function applyDateFilter() {
  const from = new Date(document.getElementById("fromDate").value);
  const to = new Date(document.getElementById("toDate").value);

  if (!from || !to) return;

  allTx = allTx.filter(t => {
    const d = new Date(t.created_at || Date.now());
    return d >= from && d <= to;
  });

  updateKPIs();
  updateSavingsGoal();
  monthlySummary();
  smartInsights();
  expenseByCategory();
  recentTx();
  budgetAlerts();
}

function downloadCharts() {
  const charts = document.querySelectorAll("canvas");

  charts.forEach((canvas, index) => {
    const link = document.createElement("a");
    link.download = `chart-${index + 1}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}


function savingsPrediction() {
  let income = 0, expense = 0;

  allTx.forEach(t => {
    const a = Number(t.amount);
    if (a > 0) income += a;
    else expense += Math.abs(a);
  });

  const monthlySaving = income - expense;
  const goal = Number(localStorage.getItem("goal"));

  if (!goal || monthlySaving <= 0) {
    document.getElementById("prediction").innerText =
      "Set a goal to see prediction";
    return;
  }

  const months = Math.ceil(goal / monthlySaving);

  document.getElementById("prediction").innerText =
    `At current rate, you will reach your goal in ${months} month(s)`;
}

function calcEMI() {
  const P = Number(loan.value);
  const R = Number(rate.value) / 12 / 100;
  const N = Number(months.value);

  if (!P || !R || !N) {
    emiResult.innerText = "Enter all EMI fields";
    return;
  }

  const emi =
    (P * R * Math.pow(1 + R, N)) /
    (Math.pow(1 + R, N) - 1);

  emiResult.innerText =
    `Monthly EMI: ₹${emi.toFixed(2)}`;
}
