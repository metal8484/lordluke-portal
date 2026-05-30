document.addEventListener("DOMContentLoaded", async () => {
  // =========================================================
  // 🟦 SUPABASE INIT
  // =========================================================
  const supabaseUrl = "https://iupwqyksdntdccnzoxrb.supabase.co";
  const supabaseKey = "sb_publishable_hUYF2MqC5s12fi-3mRoSng_-pwwzK2V";
  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

  let user = null;
  let student = null;
  let allResults = [];

  let resultAccessState = false;

  // =========================================================
  // 🟦 RESULT CONTROL (FIXED)
  // =========================================================
  async function syncResultAccess() {
    try {
      const { data } = await supabaseClient
        .from("offon")
        .select("result_access")
        .eq("id", 1)
        .single();

      resultAccessState = data?.result_access === true;
    } catch (err) {
      console.log("RESULT ACCESS ERROR:", err);
      resultAccessState = false;
    }
  }

  // =========================================================
  // 🟦 AUTH
  // =========================================================
  async function initUser() {
    const { data } = await supabaseClient.auth.getUser();

    if (!data?.user) {
      window.location.href = "login.html";
      return;
    }

    user = data.user;

    await syncResultAccess();

    const { data: studentData } = await supabaseClient
      .from("students")
      .select("*")
      .eq("auth_user_id", user.id)
      .single();

    student = studentData;

    loadUI();
    loadNews();
    loadFees();
    loadPayments();
    initPassportUpload();
    initIDCard();
    initScratch();
    loadResults();
  }

  // =========================================================
  // 🟦 UI
  // =========================================================
  function loadUI() {
    document.getElementById("student-name-header").textContent =
      "Welcome, " + (student?.name || user.email);

<<<<<<< HEAD
    document.getElementById("student-id-display").textContent =
      "ID: " + student?.auth_user_id;

    document.getElementById("student-class").textContent = student?.class || "";
=======
    document.getElementById("student-id-display").innerHTML = `
    <b>Name:</b> ${student?.name || "N/A"}<br>
    <b>Class:</b> ${student?.class || "N/A"}<br>
    <b>ID:</b> ${student?.student_number || student?.auth_user_id}
  `;

    // 🔥 FIX FRONT ID CARD (THIS IS WHAT YOU ARE MISSING)
    const idName = document.getElementById("id-card-name");
    const idNumber = document.getElementById("id-card-id");
    const idClass = document.getElementById("id-card-class");

    if (idName) idName.textContent = student?.name || "";
    if (idNumber)
      idNumber.textContent = student?.student_number || student?.auth_user_id;
    if (idClass) idClass.textContent = student?.class || "";
>>>>>>> 06f9614 (message)

    if (student?.passport_url) {
      document.getElementById("student-profile").src = student.passport_url;

      document.getElementById("id-card-img").src = student.passport_url;
    }
    document.getElementById("id-card-img").src =
      student?.passport_url || "images/image.png";
  }
  // =========================================================
  // 🟦 NEWS
  // =========================================================
  async function loadNews() {
<<<<<<< HEAD
    const { data } = await supabaseClient
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });

    const container = document.getElementById("studentNewsContainer");
    if (!container) return;

    container.innerHTML = "";

    (data || []).forEach((n) => {
      container.innerHTML += `
        <div style="padding:10px;border:1px solid #ddd;margin-bottom:10px;">
          <h3>${n.title}</h3>
          <p>${n.message}</p>
        </div>
      `;
    });
  }

  // =========================================================
  // 🟦 FEES
  // =========================================================
  async function loadFees() {
    const { data } = await supabaseClient
      .from("fees_settings")
      .select("*")
      .eq("student_id", student.auth_user_id);

    const fee = data?.[0];
    if (!fee) return;

    document.getElementById("student-balance").textContent = fee.balance;
    document.getElementById("student-term").textContent = fee.term;
    document.getElementById("student-session").textContent = fee.session;
    document.getElementById("student-amount-due").textContent =
      fee.amount_due || 0;
  }

  // =========================================================
  // 🟦 PAYMENTS
  // =========================================================
  async function loadPayments() {
    const { data } = await supabaseClient
      .from("fees_payments")
      .select("*")
      .eq("student_id", student.auth_user_id)
      .order("timestamp", { ascending: false });

    const body = document.getElementById("paymentHistoryBody");
    if (!body) return;

    body.innerHTML = "";

    (data || []).forEach((p) => {
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
  // 🟦 SCRATCH CARD (FIXED)
  // =========================================================
  function initScratch() {
    document
      .getElementById("scratch-submit-btn")
      ?.addEventListener("click", async () => {
        const code = document.getElementById("scratch-code-input").value.trim();

        if (!code) return alert("Enter scratch code");

        const { data: card } = await supabaseClient
          .from("scratch_cards")
          .select("*")
          .eq("code", code)
          .single();

        if (!card) return alert("Invalid code");
        if (card.used) return alert("Already used");

        await supabaseClient
          .from("scratch_cards")
          .update({
            used: true,
            student_id: student.auth_user_id,
          })
          .eq("code", code);

        localStorage.setItem("scratch_used", "true");

        document.getElementById("main-dashboard").style.display = "none";
        document.getElementById("results-page").style.display = "block";

        loadResults();
      });
  }

  // =========================================================
  // 🟦 RESULTS (FIXED FILTER + LOAD)
  // =========================================================
  async function loadResults() {
    if (!resultAccessState && !localStorage.getItem("scratch_used")) {
      console.log("RESULTS BLOCKED");
      return;
    }

=======
>>>>>>> 06f9614 (message)
    const { data } = await supabaseClient
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });

    const container = document.getElementById("studentNewsContainer");
    if (!container) return;

    container.innerHTML = "";

    (data || []).forEach((n) => {
      container.innerHTML += `
        <div style="padding:10px;border:1px solid #ddd;margin-bottom:10px;">
          <h3>${n.title}</h3>
          <p>${n.message}</p>
        </div>
      `;
    });
  }

  // =========================================================
  // 🟦 FEES
  // =========================================================
  async function loadFees() {
    if (!student?.auth_user_id) return;

    const { data: fees, error } = await supabaseClient
      .from("fees_settings")
      .select("*")
      .eq("student_id", student.auth_user_id);

    if (error) {
      console.log(error);
      return;
    }

    const tbody = document.getElementById("paymentHistoryBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    fees.forEach((fee) => {
      tbody.innerHTML += `
    <tr>
      <td>₦${fee.amount_due || 0}</td>
      <td>₦${fee.amount_paid || 0}</td>
      <td>₦${fee.balance || 0}</td>
      <td>${fee.term || ""}</td>
      <td>${fee.year || ""}</td>
      <td>${fee.created_at ? new Date(fee.created_at).toLocaleString() : ""}</td>
    </tr>
  `;
    });

    const latest = fees[0];

    document.getElementById("student-amount-due").textContent =
      latest?.amount_due || 0;

    document.getElementById("student-amount-paid").textContent =
      latest?.amount_paid || 0;

    document.getElementById("student-balance").textContent =
      latest?.balance || 0;

    document.getElementById("student-term").textContent = latest?.term || "N/A";

    // YEAR ONLY
    document.getElementById("student-session").textContent =
      latest?.year || "N/A";
  }
  // =========================================================
  // 🟦 PAYMENTS
  // =========================================================
  async function loadPayments() {
    const { data } = await supabaseClient
      .from("fees_payments")
      .select("*")
      .eq("student_id", student.auth_user_id)
      .order("timestamp", { ascending: false });

    const body = document.getElementById("paymentHistoryBody");

    if (!body) return;

    body.innerHTML = "";

    let currentGroup = "";

    (data || []).forEach((p) => {
      const groupKey = `${p.term}-${p.year}`;

      // Group Header
      if (groupKey !== currentGroup) {
        currentGroup = groupKey;

        body.innerHTML += `
        <tr style="background:#eee;font-weight:bold;">
          <td colspan="5">
            TERM: ${p.term} | YEAR: ${p.year}
          </td>
        </tr>
      `;
      }

      body.innerHTML += `
      <tr>
        <td>${p.amount_paid}</td>
        <td>${p.term}</td>
        <td>${p.year || ""}</td>
        <td>${p.balance_after || ""}</td>
        <td>${new Date(p.timestamp).toLocaleString()}</td>
      </tr>
    `;
    });
    console.log("Student ID:", student.id);
    console.log("Payments data:", data);
  }

  // =========================================================
  // 🟦 SCRATCH CARD (FIXED)
  // =========================================================
  function initScratch() {
    document
      .getElementById("scratch-submit-btn")
      ?.addEventListener("click", async () => {
        const code = document.getElementById("scratch-code-input").value.trim();

        if (!code) return alert("Enter scratch code");

        const { data: card } = await supabaseClient
          .from("scratch_cards")
          .select("*")
          .eq("code", code)
          .single();

        if (!card) return alert("Invalid code");
        if (card.used) return alert("Already used");

        await supabaseClient
          .from("scratch_cards")
          .update({
            used: true,
            student_id: student.auth_user_id,
          })
          .eq("code", code);

        localStorage.setItem("scratch_used", "true");

        document.getElementById("main-dashboard").style.display = "none";
        document.getElementById("results-page").style.display = "block";

        loadResults();
      });
  }

  // =========================================================
  // 🟦 RESULTS (FIXED FILTER + LOAD)
  // =========================================================
  async function loadResults() {
    if (!resultAccessState && !localStorage.getItem("scratch_used")) {
      console.log("RESULTS BLOCKED");
      return;
    }

    const { data } = await supabaseClient
      .from("results")
      .select("*")
      .eq("student_id", student.auth_user_id);

    allResults = data || [];

    renderResults(allResults);
    loadSessions();
  }

  function renderResults(results) {
    const tbody = document.querySelector("#results-page tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    let total = 0;

    results.forEach((r) => {
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
          <td>${r.term || ""}</td>
          <td>${r.session || ""}</td>
        </tr>
      `;
    });

    const avg = results.length ? (total / results.length).toFixed(2) : 0;

    document.getElementById("average-score").textContent = avg;

    document.getElementById("performance-level").textContent =
      avg >= 70
        ? "Excellent"
        : avg >= 60
          ? "Very Good"
          : avg >= 50
            ? "Good"
            : "Pass";
  }

  // =========================================================
  // 🟦 FILTER (FIXED)
  // =========================================================
  document.getElementById("apply-filter")?.addEventListener("click", () => {
    const term = document
      .getElementById("filter-term")
      .value.toLowerCase()
      .trim();

<<<<<<< HEAD
    const session = document
=======
    const year = document
>>>>>>> 06f9614 (message)
      .getElementById("filter-session")
      .value.toLowerCase()
      .trim();

    let filtered = [...allResults];

    if (term) {
      filtered = filtered.filter((r) =>
        (r.term || "").toLowerCase().includes(term),
      );
    }
    if (year) {
      filtered = filtered.filter((r) =>
        (r.year || "").toLowerCase().includes(year),
      );
    }

    renderResults(filtered);
  });

  function loadSessions() {
    const select = document.getElementById("filter-session");
    if (!select) return;

    select.innerHTML = `<option value="">All Sessions</option>`;

    const years = [...new Set(allResults.map((r) => r.year))];

    years.forEach((y) => {
      if (!s) return;
      const opt = document.createElement("option");
<<<<<<< HEAD
      opt.value = s;
      opt.textContent = s;
=======
      opt.value = y;
      opt.textContent = y;
>>>>>>> 06f9614 (message)
      select.appendChild(opt);
    });
  }

  // =========================================================
  // 🟦 BACK BUTTON (FIXED)
  // =========================================================
  document.getElementById("results-back-btn")?.addEventListener("click", () => {
    document.getElementById("results-page").style.display = "none";
    document.getElementById("main-dashboard").style.display = "block";
  });

  // =========================================================
  // 🟦 ID CARD
  // =========================================================
  function initIDCard() {
    document.getElementById("go-id-card")?.addEventListener("click", () => {
      document.getElementById("main-dashboard").style.display = "none";
      document.getElementById("id-card-page").style.display = "block";
    });

    document
      .getElementById("id-card-back-btn")
      ?.addEventListener("click", () => {
        document.getElementById("id-card-page").style.display = "none";
        document.getElementById("main-dashboard").style.display = "block";
      });
  }

  // =========================================================
  // 🟦 PASSPORT UPLOAD (FIXED)
  // =========================================================
  function initPassportUpload() {
    document
      .getElementById("upload-passport-btn")
      ?.addEventListener("click", async () => {
        const file = document.getElementById("passport-upload").files[0];
        if (!file) return alert("Select image");

        const path = `${user.id}_${Date.now()}_${file.name}`;

        await supabaseClient.storage
          .from("student-passports")
          .upload(path, file);

        const { data } = supabaseClient.storage
          .from("student-passports")
          .getPublicUrl(path);

        await supabaseClient
          .from("students")
          .update({ passport_url: data.publicUrl })
          .eq("auth_user_id", user.id);

        document.getElementById("student-profile").src = data.publicUrl;
        document.getElementById("id-card-img").src = data.publicUrl;
      });
  }

  // =========================================================
  // 🟦 LOGOUT
  // =========================================================
  document.getElementById("logout-btn")?.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    window.location.href = "login.html";
  });
  document.getElementById("print-result-btn")?.addEventListener("click", () => {
    const term = document.getElementById("filter-term")?.value || "All Terms";
    const year =
      document.getElementById("filter-session")?.value || "All Years";

    const rows = document.querySelector("#results-page tbody")?.innerHTML;

    if (!rows) {
      alert("No results to print");
      return;
    }

    const printWindow = window.open("", "_blank", "width=900,height=1000");

    printWindow.document.write(`
    <html>
    <head>
      <title>Result Sheet</title>
      <style>
        body { font-family: Arial; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: center; }

        .header { text-align: center; margin-bottom: 20px; }

        .signature {
          margin-top: 60px;
          display: flex;
          justify-content: space-between;
        }

        .signature div {
          text-align: center;
          width: 200px;
        }

        .line {
          border-top: 1px solid #000;
          margin-top: 40px;
          padding-top: 5px;
        }

        img {
          width: 120px;
          height: 70px;
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
      <p><b>Year:</b> ${year}</p>
       <table>
  <thead>
    <tr>
      <th>Subject</th>
      <th>Score</th>
      <th>Grade</th>
      <th>Term</th>
      <th>Year</th>
    </tr>
  </thead>

  <tbody>
    ${rows}
  </tbody>
</table>s
      <div class="signature">
        <div>
          <img src="./images/teacher-sign.png" />
          <div class="line">Class Teacher</div>
        </div>

        <div>
          <img src="./images/principal-sign.png" />
          <div class="line">Principal</div>
        </div>
      </div>

      <script>
        window.onload = () => window.print();
      </script>

    </body>
    </html>
  `);

    printWindow.document.close();
  });

  // =========================================================
  // 🟦 START
  // =========================================================
  // 🖨️ PRINT ID CARD
  document
    .getElementById("print-id-card-btn")
    ?.addEventListener("click", () => {
      const card = document.querySelector(".id-card-wrapper");

      if (!card) {
        alert("ID Card not found");
        return;
      }

      const printWindow = window.open("", "", "width=900,height=700");

      printWindow.document.write(`
    <html>
    <head>
      <title>ID Card</title>

      <style>
        body{
          display:flex;
          justify-content:center;
          align-items:center;
          height:100vh;
          font-family:Arial;
        }

        .id-card-wrapper{
          width:350px;
        }

        .id-card{
          border:1px solid #000;
          border-radius:10px;
          padding:20px;
          text-align:center;
        }

        .id-card img{
          width:100px;
          height:100px;
          border-radius:50%;
          object-fit:cover;
        }
      </style>
    </head>

    <body>
      ${card.outerHTML}

      <script>
        window.onload = () => window.print();
      <\/script>

    </body>
    </html>
  `);

      printWindow.document.close();
    });
  initUser();
});
