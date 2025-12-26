function setBudget() {
  fetch("http://localhost:5000/api/budgets", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      category: bCategory.value,
      monthly_limit: bLimit.value,
      month: bMonth.value
    })
  })
  .then(res => res.json())
  .then(data => alert(data.message));
}

function checkOverspending() {
  fetch("http://localhost:5000/api/budgets", { credentials: "include" })
    .then(res => res.json())
    .then(budgets => {
      budgets.forEach(b => {
        let spent = expenses
          .filter(e => e.category === b.category)
          .reduce((sum, e) => sum + Number(e.amount), 0);

        if (spent > b.monthly_limit) {
          document.getElementById("alertBox").classList.remove("hidden");
          document.getElementById("alertBox").innerText =
            `⚠ Overspending Alert: ${b.category} limit exceeded!`;
        }
      });
    });
}
