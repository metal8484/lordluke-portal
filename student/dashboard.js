document.addEventListener("DOMContentLoaded", async () => {
  // =========================================================
  // 🟦 SUPABASE INIT
  // =========================================================
  let allResults = [];

  const supabaseUrl = "https://iupwqyksdntdccnzoxrb.supabase.co";
  const supabaseKey = "sb_publishable_hUYF2MqC5s12fi-3mRoSng_-pwwzK2V";
  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

  let user = null;
  let student = null;

  // =========================================================
  // 🟦 AUTH
  // =========================================================
  async function initUser() {
    const { data } = await supabaseClient.auth.getUser();

    if (!data.user) {
      window.location.href = "login.html";
      return;
    }

    user = data.user;

    const { data: studentData } = await supabaseClient
      .from("students")
      .select("*")
      .eq("auth_user_id", user.id)
      .single();

    student = studentData;

    loadUI();
    loadResults();
    loadFees();
    loadPayments();

    // =========================================================
    // 🟦 FIX: ID CARD INIT (ONLY ADDITION)
    // =========================================================
    loadIDCard();
  }

  // =========================================================
  // 🟦 UI
  // =========================================================
  function loadUI() {
    document.getElementById("student-name-header").textContent =
      "Welcome, " + (student?.name || user.email);

    document.getElementById("student-id-display").textContent =
      "ID: " + student.auth_user_id;

    document.getElementById("student-class").textContent =
      student?.class || "Class not set";
  }

  // =========================================================
  // 🟦 FIX: ID CARD FUNCTION (ONLY ADDITION)
  // =========================================================
  function loadIDCard() {
    const btn = document.getElementById("go-id-card");
    const page = document.getElementById("id-card-page");
    const back = document.getElementById("id-card-back-btn");

    const name = document.getElementById("id-card-name");
    const id = document.getElementById("id-card-id");
    const cls = document.getElementById("id-card-class");
    const img = document.getElementById("id-card-img");

    if (name) name.textContent = student?.name || "";
    if (id) id.textContent = student?.auth_user_id || "";
    if (cls) cls.textContent = student?.class || "";
    if (img) img.src = "images/image.png";

    // OPEN ID CARD
    btn?.addEventListener("click", () => {
      document.getElementById("main-dashboard").style.display = "none";
      document.getElementById("results-page").style.display = "none";
      page.style.display = "block";
    });

    // BACK BUTTON
    back?.addEventListener("click", () => {
      page.style.display = "none";
      document.getElementById("main-dashboard").style.display = "block";
    });
  }

  // =========================================================
  // 🟦 LOGOUT
  // =========================================================
  document.getElementById("logout-btn")?.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    window.location.href = "login.html";
  });

  // =========================================================
  // 🟦 NAVIGATION
  // =========================================================
  const main = document.getElementById("main-dashboard");
  const resultsPage = document.getElementById("results-page");

  document.getElementById("go-results")?.addEventListener("click", () => {
    main.style.display = "none";
    resultsPage.style.display = "block";
  });

  document.getElementById("results-back-btn")?.addEventListener("click", () => {
    resultsPage.style.display = "none";
    main.style.display = "block";
  });

  // =========================================================
  // 🟦 LOAD RESULTS
  // =========================================================
  async function loadResults() {
    const { data } = await supabaseClient
      .from("results")
      .select("*")
      .eq("student_id", student.auth_user_id)
      .order("created_at", { ascending: false });

    allResults = data || [];

    renderResults(allResults);
    loadSessions();
  }

  // =========================================================
  // 🟦 RENDER RESULTS
  // =========================================================
  function renderResults(resultsData) {
    const tbody = document.querySelector("#results-page tbody");
    const avgEl = document.getElementById("average-score");
    const perfEl = document.getElementById("performance-level");

    tbody.innerHTML = "";

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

      tbody.innerHTML += `
        <tr>
          <td>${r.subject}</td>
          <td>${score}</td>
          <td>${grade}</td>
          <td>${r.term || "N/A"}</td>
          <td>${r.session || "N/A"}</td>
        </tr>
      `;
    });

    const avg = resultsData.length
      ? (total / resultsData.length).toFixed(2)
      : 0;

    avgEl.textContent = avg;

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

  // =========================================================
  // 🟦 FILTER SYSTEM (UNCHANGED)
  // =========================================================
  document.getElementById("apply-filter")?.addEventListener("click", () => {
    const termInput = document.getElementById("filter-term")?.value || "";
    const sessionInput = document.getElementById("filter-session")?.value || "";

    const term = termInput.trim().toLowerCase();
    const session = sessionInput.trim().toLowerCase();

    let filtered = [...allResults];

    if (term) {
      filtered = filtered.filter((r) =>
        (r.term || "").toLowerCase().includes(term),
      );
    }

    if (session) {
      filtered = filtered.filter((r) =>
        (r.session || "").toLowerCase().includes(session),
      );
    }

    renderResults(filtered);
  });

  function loadSessions() {
    const select = document.getElementById("filter-session");
    if (!select) return;

    select.innerHTML = `<option value="">All Sessions</option>`;

    const sessions = [...new Set(allResults.map((r) => r.session))];

    sessions.forEach((s) => {
      if (!s) return;
      const option = document.createElement("option");
      option.value = s;
      option.textContent = s;
      select.appendChild(option);
    });
  }

  // =========================================================
  // 🟦 PRINT SYSTEM (UNCHANGED)
  // =========================================================
  document.getElementById("print-result-btn")?.addEventListener("click", () => {
    const term = document.getElementById("filter-term")?.value || "All Terms";
    const session =
      document.getElementById("filter-session")?.value || "All Sessions";

    const rows = document.querySelector("#results-page tbody").innerHTML;

    const printWindow = window.open("", "", "width=900,height=1000");

    printWindow.document.write(`
      <html>
      <head>
        <title>Result Sheet</title>
        <style>
          body { font-family: Arial; padding: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: center; }

          .header { text-align: center; }

          .signature {
            margin-top: 70px;
            display: flex;
            justify-content: space-between;
          }

          .signature div {
            text-align: center;
            width: 200px;
          }

          .line {
            border-top: 1px solid #000;
            margin-top: 50px;
            padding-top: 5px;
          }

          img {
            width: 150px;
            height: 80px;
            display: block;
            margin: auto;
          }
        </style>
      </head>

      <body>

        <div class="header">
          <h2>LORD LUKE.TECH SCHOOL</h2>
          <p>Student Result Sheet</p>
        </div>

        <p><b>Name:</b> ${student?.name}</p>
        <p><b>ID:</b> ${student?.auth_user_id}</p>
        <p><b>Class:</b> ${student?.class}</p>
        <p><b>Term:</b> ${term}</p>
        <p><b>Session:</b> ${session}</p>

        <table>
          <tr>
            <th>Subject</th>
            <th>Score</th>
            <th>Grade</th>
            <th>Term</th>
            <th>Session</th>
          </tr>
          ${rows}
        </table>

        <div class="signature">

          <div>
            <img src="./images/teacher-sign.png">
            <div class="line">Class Teacher</div>
          </div>

          <div>
            <img src="./images/principal-sign.png">
            <div class="line">Principal</div>
          </div>

        </div>

        <script>
          window.onload = () => window.print();
        <\/script>

      </body>
      </html>
    `);

    printWindow.document.close();
  });

  // =========================================================
  // 🟦 FEES + PAYMENTS
  // =========================================================
  async function loadFees() {
    const { data } = await supabaseClient
      .from("fees_settings")
      .select("*")
      .eq("student_id", student.auth_user_id)
      .order("created_at", { ascending: false });

    if (!data?.length) return;

    const fee = data[0];

    document.getElementById("student-balance").textContent = fee.balance;
    document.getElementById("student-term").textContent = fee.term;
    document.getElementById("student-session").textContent = fee.session;
  }

  async function loadPayments() {
    const { data } = await supabaseClient
      .from("fees_payments")
      .select("*")
      .eq("student_id", student.auth_user_id)
      .order("timestamp", { ascending: false });

    const body = document.getElementById("paymentHistoryBody");
    if (!body) return;

    body.innerHTML = "";

    data?.forEach((p) => {
      body.innerHTML += `
        <tr>
          <td>${p.amount_paid}</td>
          <td>${p.term}</td>
          <td>${p.session}</td>
          <td>${p.balance_after}</td>
          <td>${new Date(p.timestamp).toLocaleString()}</td>
        </tr>
      `;
    });
  }

  // =========================================================
  // 🟦 INIT
  // =========================================================
  initUser();
});
