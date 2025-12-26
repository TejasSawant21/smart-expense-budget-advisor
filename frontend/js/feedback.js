function sendFeedback() {
  fetch("http://localhost:5000/api/feedback", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: feedbackMsg.value
    })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    feedbackMsg.value = "";
  });
}
