document.addEventListener("DOMContentLoaded", async () => {
  // =========================================================
  // 🟦 SECTION 1: SUPABASE INIT
  // =========================================================
  const supabaseUrl = "https://iupwqyksdntdccnzoxrb.supabase.co";
  const supabaseKey = "sb_publishable_hUYF2MqC5s12fi-3mRoSng_-pwwzK2V";
  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

  let user = null;
  let student = null;

  // =========================================================
  // 🟦 SECTION 2: INIT USER AUTH
  // =========================================================
  async function initUser() {
    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !data.user) {
      window.location.href = "login.html";
      return;
    }

    user = data.user;

    const { data: studentData, error: studentError } = await supabaseClient
      .from("students")
      .select("*")
      .eq("auth_user_id", user.id)
      .single();

    if (studentError) {
      console.log("Student fetch error:", studentError.message);
      return;
    }

    student = studentData;

    loadStudentUI();
    loadResults();
    loadStudentFees();
    loadPaymentHistory();
  }

  // =========================================================
  // 🟦 SECTION 3: STUDENT UI
  // =========================================================
  function loadStudentUI() {
    const nameEl = document.getElementById("student-name-header");
    const idEl = document.getElementById("student-id-display");
    const classEl = document.getElementById("student-class");
    const imgEl = document.getElementById("student-profile");

    if (nameEl)
      nameEl.textContent = "Welcome, " + (student?.name || user.email);

    if (idEl) idEl.textContent = "ID: " + student.auth_user_id;
    if (classEl) classEl.textContent = student?.class || "Class not set";
    if (imgEl) imgEl.src = "images/image.png";
  }

  // =========================================================
  // 🟦 SECTION 4: LOGOUT (SAFE)
  // =========================================================
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabaseClient.auth.signOut();
      window.location.href = "login.html";
    });
  }

  // =========================================================
  // 🟦 SECTION 5: NAVIGATION (SAFE FIXED)
  // =========================================================
  function safe(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", fn);
  }

  const main = document.getElementById("main-dashboard");
  const resultsPage = document.getElementById("results-page");
  const idCard = document.getElementById("id-card-page");

  safe("go-results", () => {
    if (main) main.style.display = "none";
    if (resultsPage) resultsPage.style.display = "block";
    loadResults();
  });

  safe("go-id-card", () => {
    if (main) main.style.display = "none";
    if (idCard) idCard.style.display = "block";

    document.getElementById("id-card-name").textContent =
      student?.name || user.email;

    document.getElementById("id-card-id").textContent =
      "ID: " + student.auth_user_id;

    document.getElementById("id-card-class").textContent =
      student?.class || "Class not set";
  });

  safe("results-back-btn", () => {
    if (resultsPage) resultsPage.style.display = "none";
    if (main) main.style.display = "block";
  });

  safe("id-card-back-btn", () => {
    if (idCard) idCard.style.display = "none";
    if (main) main.style.display = "block";
  });

  // =========================================================
  // 🟦 SECTION 6: RESULTS SYSTEM
  // =========================================================
  async function loadResults() {
    const tableBody = document.querySelector("#results-page tbody");
    const avgEl = document.getElementById("average-score");
    const perfEl = document.getElementById("performance-level");

    if (!tableBody || !student) return;

    tableBody.innerHTML = "";

    const { data } = await supabaseClient
      .from("results")
      .select("*")
      .eq("student_id", student.auth_user_id);

    const resultsData = data || [];

    let total = 0;

    resultsData.forEach((r) => {
      const score = Number(r.score);
      total += score;

      const grade =
        score >= 70
          ? "A"
          : score >= 60
            ? "B"
            : score >= 50
              ? "C"
              : score >= 40
                ? "D"
                : "F";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${r.subject}</td>
        <td>${score}</td>
        <td>${grade}</td>
      `;
      tableBody.appendChild(row);
    });

    const avg = resultsData.length
      ? (total / resultsData.length).toFixed(2)
      : 0;

    if (avgEl) avgEl.textContent = avg;

    if (perfEl) {
      perfEl.textContent =
        avg >= 70
          ? "Excellent"
          : avg >= 60
            ? "Very Good"
            : avg >= 50
              ? "Good"
              : avg >= 40
                ? "Pass"
                : "Fail";
    }
  }

  // =========================================================
  // 🟢 SECTION 7: FEES SYSTEM (FIXED + FUTURE SAFE)
  // =========================================================
  async function loadStudentFees() {
    if (!student) return;

    const { data, error } = await supabaseClient
      .from("fees_settings")
      .select("*")
      .eq("student_id", student.auth_user_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Fees load error:", error.message);
      return;
    }

    if (!data || data.length === 0) return;

    const fee = data[0];

    const set = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };

    set("student-balance", fee.balance ?? 0);
    set("student-term", fee.term ?? "---");
    set("student-session", fee.session ?? "---");
    set("student-amount-due", fee.amount_due ?? 0);
  }

  // =========================================================
  // 🟢 SECTION 8: PAYMENT HISTORY
  // =========================================================
  async function loadPaymentHistory() {
    if (!student) return;

    const { data, error } = await supabaseClient
      .from("fees_payments")
      .select("*")
      .eq("student_id", student.auth_user_id)
      .order("timestamp", { ascending: false });

    if (error) {
      console.log("Payment history error:", error.message);
      return;
    }

    const tableBody = document.getElementById("paymentHistoryBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    (data || []).forEach((p) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${p.amount_paid}</td>
        <td>${p.term}</td>
        <td>${p.session}</td>
        <td>${p.balance_after}</td>
        <td>${new Date(p.timestamp).toLocaleString()}</td>
      `;

      tableBody.appendChild(row);
    });
  }

  // =========================================================
  // 🟦 SECTION 9: START APP
  // =========================================================
  initUser();
});
