document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const message = document.getElementById("login-message");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      message.textContent = "❌ Please fill all fields!";
      message.style.color = "red";
      return;
    }

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      console.log("LOGIN RESULT:", { data, error });

      if (error) {
        message.textContent = "❌ " + error.message;
        message.style.color = "red";
        return;
      }

      // success
      message.textContent = "✅ Login Successful!";
      message.style.color = "green";

      localStorage.setItem("loggedIn", "true");

      setTimeout(() => {
        window.location.href = "student-dashboard.html";
      }, 800);
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      message.textContent = "❌ Server error, try again!";
      message.style.color = "red";
    }
  });
});
