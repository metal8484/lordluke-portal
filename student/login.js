console.log("LOGIN JS IS WORKING");

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const message = document.getElementById("login-message");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const studentId = document.getElementById("student-id").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      // Supabase check
      const { data, error } = await supabaseClient
        .from("students")
        .select("*")
        .eq("student_id", studentId)
        .eq("password", password);

      if (error) throw error;

      if (data.length > 0) {
        const student = data[0];
        localStorage.setItem("currentStudent", JSON.stringify(student));

        message.textContent = "✅ Login Successful!";
        message.style.color = "green";

        setTimeout(() => {
          window.location.href = "student-dashboard.html";
        }, 800);
      } else {
        message.textContent = "❌ Invalid ID or Password!";
        message.style.color = "red";
      }
    } catch (err) {
      console.error(err);
      message.textContent = "❌ Server error, try again!";
      message.style.color = "red";
    }
  });
});
