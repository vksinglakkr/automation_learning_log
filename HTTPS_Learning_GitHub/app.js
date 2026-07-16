// NOTE: Replace with your active Workflow A Ingestion Webhook URL
const N8N_INGEST_URL = "YOUR_WORKFLOW_A_WEBHOOK_URL_HERE";

document.addEventListener("DOMContentLoaded", () => {
  // Setup Timestamp
  const now = new Date();
  document.getElementById("timestamp").textContent = now.toLocaleString();

  const form = document.getElementById("registrationForm");
  const successBox = document.getElementById("successBox");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      student_name: document.getElementById("studentName").value,
      student_email: document.getElementById("studentEmail").value,
      student_phone: document.getElementById("studentPhone").value,
      student_college: document.getElementById("studentCollege").value,
      github_username: document.getElementById("githubUser").value.trim()
    };

    try {
      const response = await fetch(N8N_INGEST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        form.style.display = "none";
        successBox.style.display = "block";
      } else {
        alert("Server returned error response. Please try again.");
      }
    } catch (err) {
      alert("Failed to reach the database server. Check your n8n network.");
    }
  });
});
