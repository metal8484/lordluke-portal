document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const message = document.getElementById("login-message");

  const modal = document.getElementById("successModal");
  const closeBtn = document.getElementById("closeModal");

  function openModal() {
    modal.style.display = "flex";
  }

  function closeModal() {
    modal.style.display = "none";
  }

  closeBtn?.addEventListener("click", closeModal);
  // =====================================================
  // 🔐 LOGIN SYSTEM (UNCHANGED - WORKING)
  // =====================================================
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

      message.textContent = "✅ Login Successful!";
      message.style.color = "green";

      localStorage.setItem("loggedIn", "true");
      const user = data.user;

      if (!user) {
        message.textContent = "❌ User not found";
        return;
      }

      const { data: student, error: studentError } = await supabaseClient
        .from("students")
        .select("*")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      console.log("AUTH EMAIL:", user.email);
      console.log("STUDENT:", student);
      console.log("STUDENT ERROR:", studentError);
      if (studentError) {
        console.log(studentError);
      }

      if (!student) {
        message.textContent = "❌ Student record not found";
        return;
      }

      if (student.must_change_password === true) {
        window.location.href = "new-password.html";
      } else {
        window.location.href = "student-dashboard.html";
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      message.textContent = "❌ Server error, try again!";
      message.style.color = "red";
    }
  });

  // =====================================================
  // 🔁 FORGOT PASSWORD (FIXED FLOW - IMPORTANT)
  // =====================================================
  document.addEventListener("click", async (e) => {
    if (e.target && e.target.id === "forgotPasswordLink") {
      e.preventDefault();

      const email = prompt("Enter your registered email address:");
      if (!email) return;

      try {
        // 1. FIND STUDENT
        const { data: student, error: studentError } = await supabaseClient
          .from("students")
          .select("id, auth_user_id, name, email, phone")
          .eq("email", email.trim())
          .single();

        if (studentError || !student) {
          alert("Student not found");
          return;
        }

        // 2. CREATE RESET REQUEST
        const { data, error } = await supabaseClient
          .from("password_reset_requests")
          .insert([
            {
              student_email: student.email,
              student_name: student.name,
              student_id: student.id,
              auth_user_id: student.auth_user_id,
              student_phone: student.phone,
              status: "Pending",
              message: "Password reset requested",
            },
          ])
          .select();

        if (error) {
          alert("Failed: " + error.message);
          return;
        }

        openModal();
      } catch (err) {
        console.error(err);
        alert("Unexpected error occurred");
      }
    }
  });
});
