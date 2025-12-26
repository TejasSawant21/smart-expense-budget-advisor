const API = "http://localhost:5000/api";
let allTx = [];

let selectedMonth = new Date().getMonth();
let selectedYear  = new Date().getFullYear();

function monthName(m,y){
  return new Date(y,m).toLocaleString('default',{month:'long',year:'numeric'});
}

function loadDashboard(){
  applyTheme();
  fetch(`${API}/expenses`,{credentials:"include"})
    .then(r=>r.status===401?location.href="index.html":r.json())
    .then(data=>{
      allTx=data;
      overview();
      scoreCalc();
      updateMonthlyComparison();
      updateSavingsGoal();
      budgetAlerts();
      filterTx();
      monthlySummary();
      smartInsights();
      fillExpenseCategory();
    });
}

/* KPI */
function overview(){
  let inc=sum("income"), exp=sum("expense");
  income.innerText="₹"+inc;
  expense.innerText="₹"+exp;
  balance.innerText="₹"+(inc-exp);
  savings.innerText=inc?Math.round(((inc-exp)/inc)*100)+"%":"0%";
}

/* SCORE */
function scoreCalc(){
  let inc=sum("income"), exp=sum("expense");
  score.innerText=inc
    ? Math.round(Math.min(((inc-exp)/inc)*100,100))+" / 100"
    : "0 / 100";
}

/* 🔥 IMPROVED MONTHLY COMPARISON */
function updateMonthlyComparison(){
  let cm=selectedMonth, cy=selectedYear;
  let pm=cm===0?11:cm-1, py=cm===0?cy-1:cy;

  let cur=monthExpense(cm,cy);
  let prev=monthExpense(pm,py);

  monthLabel.innerText =
    `${monthName(cm,cy)}  vs  ${monthName(pm,py)}`;

  if(!prev){
    comparison.innerText="No previous month data";
    comparisonNote.innerText="Add more transactions to see trends";
    return;
  }

  let diff=cur-prev;
  let pct=Math.abs(((diff)/prev)*100).toFixed(1);

  if(diff>0){
    comparison.innerText=`⬆ Expenses increased by ₹${diff}`;
    comparisonNote.innerText=`Increase of ${pct}% compared to last month`;
    comparison.className="fw-semibold text-danger";
  }else{
    comparison.innerText=`⬇ Expenses reduced by ₹${Math.abs(diff)}`;
    comparisonNote.innerText=`Reduction of ${pct}% compared to last month`;
    comparison.className="fw-semibold text-success";
  }
}

function prevMonth(){
  selectedMonth===0?(selectedMonth=11,selectedYear--):selectedMonth--;
  updateMonthlyComparison();
  fillExpenseCategory();
  monthlySummary();
  smartInsights();
}
function nextMonth(){
  let n=new Date();
  if(selectedYear===n.getFullYear()&&selectedMonth===n.getMonth())return;
  selectedMonth===11?(selectedMonth=0,selectedYear++):selectedMonth++;
  updateMonthlyComparison();
  fillExpenseCategory();
  monthlySummary();
  smartInsights();
}

/* GOAL */
function setGoal(){
  localStorage.setItem("goal",goalInput.value);
  updateSavingsGoal();
}
function updateSavingsGoal(){
  let goal=+localStorage.getItem("goal");
  if(!goal)return;
  let saved=sum("income")-sum("expense");
  goalBar.style.width=Math.min((saved/goal)*100,100)+"%";
  goalText.innerText=`Saved ₹${saved} of ₹${goal}`;
}

/* ALERTS */
function budgetAlerts(){
  alerts.innerHTML="";
  fetch(`${API}/budgets`,{credentials:"include"})
    .then(r=>r.json())
    .then(b=>{
      b.forEach(x=>{
        let spent=allTx.filter(t=>t.category===x.category&&t.type==="expense")
                        .reduce((s,t)=>s+ +t.amount,0);
        if(spent>x.monthly_limit)
          alerts.innerHTML+=`<div>⚠ ${x.category} budget exceeded</div>`;
      });
      if(!alerts.innerHTML)alerts.innerText="No alerts";
    });
}

/* RECENT */
function filterTx(){
  let f=filter.value;
  recent.innerHTML="";
  let now=new Date();
  allTx.filter(t=>{
    let d=new Date(t.created_at);
    if(f==="today")return d.toDateString()===now.toDateString();
    if(f==="month")return d.getMonth()===now.getMonth();
    return true;
  }).slice(-5).reverse()
    .forEach(t=>{
      recent.innerHTML+=`<li class="list-group-item">${t.category} — ₹${t.amount}</li>`;
    });
}

/* EMI */
function calcEMI(){
  let P=+loan.value,R=+rate.value/1200,N=+months.value;
  emiResult.innerText=P&&R&&N
    ? "Monthly EMI: ₹"+Math.round((P*R*Math.pow(1+R,N))/(Math.pow(1+R,N)-1))
    : "Enter valid values";
}

/* SUMMARY */
function monthlySummary(){
  let inc=sum("income"), exp=sum("expense");
  monthSummary.innerText=
    `${monthName(selectedMonth,selectedYear)} | Income ₹${inc}, Expense ₹${exp}, Saving ₹${inc-exp}`;
  balanceWarning.innerText=
    inc && (inc-exp)<inc*0.2 ? "⚠ Your balance is getting low" : "";
}

/* 🔥 IMPROVED SMART INSIGHTS */
function smartInsights(){
  let inc=sum("income"), exp=sum("expense");

  incomeStatus.innerText =
    inc>=exp
      ? "🟢 You are managing expenses well this month"
      : "🔴 Expenses are higher than income this month";

  let tx=allTx.filter(t=>{
    let d=new Date(t.created_at);
    return d.getMonth()===selectedMonth&&d.getFullYear()===selectedYear;
  }).length;

  txCount.innerText =
    tx>20
      ? "📊 High transaction activity this month"
      : "📉 Low transaction activity this month";
}

/* EXPENSE CATEGORY TABLE */
function fillExpenseCategory(){
  const table=document.getElementById("expenseCategoryTable");
  if(!table)return;
  table.innerHTML="";
  const list=allTx.filter(t=>{
    let d=new Date(t.created_at);
    return t.type==="expense"&&d.getMonth()===selectedMonth&&d.getFullYear()===selectedYear;
  });
  if(!list.length){
    table.innerHTML=`<tr><td colspan="3" class="text-muted">No expenses this month</td></tr>`;
    return;
  }
  let total=list.reduce((s,t)=>s+ +t.amount,0), map={};
  list.forEach(t=>map[t.category]=(map[t.category]||0)+ +t.amount);
  Object.entries(map).forEach(([c,a])=>{
    table.innerHTML+=`
      <tr>
        <td>${c}</td>
        <td>₹${a}</td>
        <td>${((a/total)*100).toFixed(1)}%</td>
      </tr>`;
  });
}

/* HELPERS */
function sum(type){
  return allTx.filter(t=>t.type===type).reduce((s,t)=>s+ +t.amount,0);
}
function monthExpense(m,y){
  return allTx.filter(t=>t.type==="expense" &&
    new Date(t.created_at).getMonth()===m &&
    new Date(t.created_at).getFullYear()===y
  ).reduce((s,t)=>s+ +t.amount,0);
}

/* THEME */
function toggleTheme(){
  document.body.classList.toggle("light");
  localStorage.setItem("theme",document.body.classList.contains("light")?"light":"dark");
}
function applyTheme(){
  if(localStorage.getItem("theme")==="light")
    document.body.classList.add("light");
}

/* LOGOUT */
function logout(){
  fetch(`${API}/auth/logout`,{credentials:"include"})
    .then(()=>location.href="index.html");
}

loadDashboard();
