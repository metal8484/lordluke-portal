document.addEventListener("DOMContentLoaded", async function () {
  // =========================================================
  // 🟦 SUPABASE
  // =========================================================
  const supabaseUrl = "https://iupwqyksdntdccnzoxrb.supabase.co";
  const supabaseKey = "sb_publishable_hUYF2MqC5s12fi-3mRoSng_-pwwzK2V";

  window.supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
  const supabaseClient = window.supabaseClient;
  const CENTRAL_ADMIN_USERNAME = "centraladmin";

  function getCurrentAdmin() {
    try {
      return JSON.parse(localStorage.getItem("currentAdmin"));
    } catch (e) {
      return null;
    }
  }

  function isCentralAdmin(admin) {
    return admin && admin.username === CENTRAL_ADMIN_USERNAME;
  }

  window.CURRENT_ADMIN = getCurrentAdmin();
  window.IS_CENTRAL_ADMIN = isCentralAdmin(window.CURRENT_ADMIN);
  // =========================================================
  // 🧠 GLOBAL STATE
  // =========================================================
  const AppState = {
    editStudentId: null,
    editResultId: null,
    editAdminId: null,
  };

  // =========================================================
  // DOM ELEMENTS
  // =========================================================
  const logoutBtn = document.getElementById("logout-btn");

  const studentsTable = document.querySelector("#students-table tbody");
  const resultsTable = document.querySelector("#results-table tbody");
  const resultSearch = document.getElementById("result-search");
  const adminFilterBtn = document.getElementById("admin-filter-btn");
  const averageCard = document.getElementById("average-card");

  const adminsTable = document.querySelector("#admins-table tbody");
  // =========================================================
  // 🔍 ADMIN RESULT FILTER
  // =========================================================
  if (adminFilterBtn) {
    adminFilterBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const term = document
        .getElementById("admin-filter-term")
        .value.toLowerCase()
        .trim();

      const year = document
        .getElementById("admin-filter-year")
        .value.toLowerCase()
        .trim();

      const student = document
        .getElementById("result-search")
        .value.toLowerCase()
        .trim();

      let totalScore = 0;
      let totalSubjects = 0;
      document
        .querySelectorAll("#results-table tbody .result-row")
        .forEach((row) => {
          const rowTerm = (row.dataset.term || "").toLowerCase().trim();
          const rowYear = (row.dataset.year || "").toLowerCase().trim();
          const rowStudent = row.cells[0].textContent.toLowerCase().trim();

          const studentMatch = !student || rowStudent.includes(student);
          const termMatch = !term || rowTerm.includes(term);
          const yearMatch = !year || rowYear.includes(year);

          row.style.display =
            studentMatch && termMatch && yearMatch ? "" : "none";
          if (studentMatch && termMatch && yearMatch) {
            totalScore += Number(row.dataset.score || 0);
            totalSubjects++;
          }
        });
      if (averageCard) {
        if (totalSubjects > 0) {
          averageCard.style.display = "block";
          document.getElementById("average-value").textContent = (
            totalScore / totalSubjects
          ).toFixed(2);
        } else {
          averageCard.style.display = "none";
        }
      }
    });
  }

  // =========================================================
  // LOGIN PROTECTION
  // =========================================================
  const loginForm = document.getElementById("login-form");

  const loggedAdmin = JSON.parse(localStorage.getItem("currentAdmin"));
  const currentAdminRole = loggedAdmin?.role || "Admin";

  if (!loggedAdmin && !loginForm) {
    window.location.href = "admin.html";
  }

  // =========================================================
  // LOGOUT
  // =========================================================
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("currentAdmin");
      window.location.href = "admin.html";
    });
  }

  // =========================================================
  // LOAD STUDENT DROPDOWN (FIXED)
  // =========================================================
  async function loadStudentDropdown() {
    console.log("🔵 Loading students...");

    const resultSelect = document.getElementById("result-student-id");
    const feesSelect = document.getElementById("student_id");
    const paymentSelect = document.getElementById("payment_student_id");

    const { data, error } = await supabaseClient
      .from("students")
      .select("name, auth_user_id");

    if (error) {
      console.log("NEWS INSERT ERROR:", error);
      alert(error.message);
      return;
    }

    const students = data || [];

    // ================= RESULT DROPDOWN =================
    if (resultSelect) {
      resultSelect.innerHTML = `<option value="">Select Student</option>`;
      students.forEach((s) => {
        const option = document.createElement("option");
        option.value = s.auth_user_id;
        option.textContent = s.name;
        resultSelect.appendChild(option);
      });
    }

    // ================= FEES DROPDOWN =================
    if (feesSelect) {
      feesSelect.innerHTML = `<option value="">Select Student</option>`;
      students.forEach((s) => {
        const option = document.createElement("option");
        option.value = s.auth_user_id;
        option.textContent = s.name;
        feesSelect.appendChild(option);
      });
    }

    // ================= PAYMENT DROPDOWN =================
    if (paymentSelect) {
      paymentSelect.innerHTML = `<option value="">Select Student</option>`;
      students.forEach((s) => {
        const option = document.createElement("option");
        option.value = s.auth_user_id;
        option.textContent = s.name;
        paymentSelect.appendChild(option);
      });
    }

    console.log("✅ All dropdowns loaded");
  }
  // =========================================================
  // LOAD ALL DATA
  // =========================================================
  async function loadAll() {
    const { data: students } = await supabaseClient
      .from("students")
      .select("*");
    allStudentsCache = students || [];
    const { data: results } = await supabaseClient.from("results").select("*");
    const { data: admins } = await supabaseClient.from("admins").select("*");

    // STUDENTS
    studentsTable.innerHTML = "";
    (students || []).forEach((s) => {
      studentsTable.innerHTML += `
    <tr class="student-row"
        data-id="${s.auth_user_id}"
        data-name="${s.name}"
        data-class="${s.class}"
        data-phone="${s.phone || ""}">
        
      
       <td>
  <input
    type="checkbox"
    class="promote-student"
    data-id="${s.auth_user_id}"
    data-class="${s.class}"
  >
</td>

<td>${s.name}</td>
<td>${s.auth_user_id}</td>
<td>${s.class}</td>
<td>${s.phone || "No phone"}</td>
      <td>
        <button class="delete-student-btn" data-id="${s.auth_user_id}">
          Delete
        </button>
      </td>
    </tr>
  `;
    });
    resultsTable.innerHTML = "";

    for (const r of results || []) {
      const { data: studentInfo } = await supabaseClient
        .from("students")
        .select("name, phone")
        .eq("auth_user_id", r.student_id)
        .single();

      resultsTable.innerHTML += `
    <tr class="result-row"
        data-id="${r.id}"
        data-student="${r.student_id}"
        data-name="${studentInfo?.name || ""}"
        data-subject="${r.subject}"
        data-score="${r.score}"
        data-term="${r.term || ""}"
        data-year="${r.year || ""}">

      <td>${studentInfo?.name || "Unknown Student"}</td>
      <td>${r.subject}</td>
      <td>${r.score}</td>
      <td>${r.term || ""}</td>
      <td>${r.year || ""}</td>

     <td>
  <button class="edit-result-btn" data-id="${r.id}">
    Edit
  </button>

  <button class="delete-result-btn" data-id="${r.id}">
    Delete
  </button>
</td>

    </tr>
  `;
    }
    // ADMINS
    adminsTable.innerHTML = "";
    (admins || []).forEach((a) => {
      adminsTable.innerHTML += `
        <tr class="admin-row"
            data-id="${a.id}"
            data-username="${a.username}"
            data-email="${a.email}">
          <td>${a.username}</td>
          <td>${a.email}</td>
          <td>
            <button class="delete-admin-btn" data-id="${a.id}">
              Delete
            </button>
          </td>
        </tr>
      `;
    });
  }

  // =========================================================
  // ✏️ STUDENT EDIT (FIXED - NO DUPLICATE LISTENERS)
  // =========================================================
  studentsTable.addEventListener("click", async (e) => {
    const row = e.target.closest(".student-row");
    if (!row) return;

    if (e.target.classList.contains("delete-student-btn")) {
      await supabaseClient
        .from("students")
        .delete()
        .eq("auth_user_id", e.target.dataset.id);

      loadAll();
      loadStudentDropdown();
      return;
    }

    document.getElementById("student-name").value = row.dataset.name;
    document.getElementById("student-class").value = row.dataset.class;

    AppState.editStudentId = row.dataset.id;
  });

  // =========================================================
  // ✏️ RESULT EDIT (FIXED)
  // =========================================================
  resultsTable.addEventListener("click", async (e) => {
    const row = e.target.closest(".result-row");
    if (!row) return;

    // ================= EDIT RESULT =================
    if (e.target.classList.contains("edit-result-btn")) {
      document.getElementById("result-student-id").value = row.dataset.student;

      document.getElementById("result-subject").value = row.dataset.subject;

      document.getElementById("result-score").value = row.dataset.score;

      document.getElementById("result-term").value = row.dataset.term || "";

      document.getElementById("result-year").value = row.dataset.year || "";

      AppState.editResultId = row.dataset.id;

      alert("Result loaded for editing");
      return;
    }

    // ================= DELETE RESULT =================
    if (e.target.classList.contains("delete-result-btn")) {
      await supabaseClient
        .from("results")
        .delete()
        .eq("id", e.target.dataset.id);

      loadAll();
      return;
    }
  });

  // =========================================================
  // ✏️ ADMIN EDIT (FIXED)
  // =========================================================
  adminsTable.addEventListener("click", async (e) => {
    const row = e.target.closest(".admin-row");
    if (!row) return;

    if (e.target.classList.contains("delete-admin-btn")) {
      await supabaseClient
        .from("admins")
        .delete()
        .eq("id", e.target.dataset.id);
      loadAll();
      return;
    }

    document.getElementById("admin-username").value = row.dataset.username;
    document.getElementById("admin-email").value = row.dataset.email;

    AppState.editAdminId = row.dataset.id;
  });

  // =========================================================
  // STUDENT ADD / EDIT
  // =========================================================
  document
    .getElementById("add-student-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("student-name").value.trim();
      const className = document.getElementById("student-class").value.trim();
      const email = document.getElementById("student-email").value.trim();
      const phone = document.getElementById("student-phone").value.trim();
      const password = document.getElementById("student-password").value;

      if (AppState.editStudentId) {
        await supabaseClient
          .from("students")
          .update({
            name,
            class: className,
            email,
            phone, // ✅ MUST MATCH COLUMN NAME IN SUPABASE
          })
          .eq("auth_user_id", AppState.editStudentId);

        AppState.editStudentId = null;
      } else {
        const { data: authData, error: authError } =
          await supabaseClient.auth.signUp({
            email,
            password,
          });

        if (authError) {
          alert(authError.message);
          return;
        }

        const count = Date.now().toString().slice(-3);
        const studentNumber = `STD${count}`;

        const { error: insertError } = await supabaseClient
          .from("students")
          .insert([
            {
              name,
              class: className,
              email,
              phone, // ✅ THIS IS THE IMPORTANT PART
              auth_user_id: authData.user.id,
              student_number: studentNumber,
            },
          ]);

        if (insertError) {
          alert(insertError.message);
          return;
        }
      }

      e.target.reset();
      loadAll();
      loadStudentDropdown();
    });
  // =========================================================
  // RESULT ADD / EDIT
  // =========================================================
  document
    .getElementById("add-result-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const student_id = document.getElementById("result-student-id").value;
      const subject = document.getElementById("result-subject").value;
      const score = document.getElementById("result-score").value;
      const term = document.getElementById("result-term").value;
      const year = document.getElementById("result-year").value.trim();

      if (!year) {
        alert("Year is required");
        return;
      }
      console.log("TERM:", term);
      console.log("YEAR:", year);

      if (AppState.editResultId) {
        await supabaseClient
          .from("results")
          .update({
            student_id,
            subject,
            score,
            term,
            year,
          })
          .eq("id", AppState.editResultId);

        AppState.editResultId = null;
      } else {
        await supabaseClient.from("results").insert([
          {
            student_id,
            subject,
            score,
            term,
            year,
          },
        ]);
      }
      AppState.editResultId = null;
      e.target.reset();
      loadAll();
    });
  // =========================================================
  // ADMIN ADD / EDIT
  // =========================================================
  document
    .getElementById("add-admin-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("admin-username").value;
      const email = document.getElementById("admin-email").value;
      const password = document.getElementById("admin-password").value;
      const role = document.getElementById("admin-role").value;

      if (AppState.editAdminId) {
        await supabaseClient
          .from("admins")
          .update({ username, email })
          .eq("id", AppState.editAdminId);

        AppState.editAdminId = null;
      } else {
        await supabaseClient
          .from("admins")
          .insert([{ username, email, password }]);
      }

      e.target.reset();
      loadAll();
    });

  // =========================================================
  // 💰 FEES SYSTEM (FIXED + STABLE)
  // =========================================================
  async function addFee() {
    // =========================
    // 1. GET INPUT VALUES
    // =========================
    const student_id = document.getElementById("student_id")?.value?.trim();
    const term = document.getElementById("term")?.value?.trim();
    const year = document.getElementById("year")?.value?.trim();
    const amount_due = Number(document.getElementById("amount_due")?.value);
    const total_fee = Number(document.getElementById("total_fee")?.value);

    console.log("🔥 Fee Input:", {
      student_id,
      term,
      year,
      amount_due,
      total_fee,
    });

    // =========================
    // 2. VALIDATION
    // =========================
    if (!student_id || !term || !year || !amount_due) {
      alert("Missing required fields: student, term, year, amount due");
      return;
    }

    if (amount_due <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    // =========================
    // 3. INSERT INTO SUPABASE
    // =========================
    const { data, error } = await supabaseClient
      .from("fees_settings")
      .insert([
        {
          student_id,
          term,
          year,
          total_fee: total_fee || amount_due,
          amount_due,
          amount_paid: 0,
          balance: amount_due,
          status: "Unpaid",
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    // =========================
    // 4. ERROR CHECK
    // =========================
    if (error) {
      console.log("❌ Fee Insert Error:", error);
      alert("Failed to save fee: " + error.message);
      return;
    }

    if (!data || data.length === 0) {
      alert("Fee not saved (unknown issue)");
      return;
    }

    // =========================
    // 5. SUCCESS
    // =========================
    alert("Fee created successfully ✔");

    // refresh table
    loadFees();
  }

  async function loadFees() {
    const { data: fees } = await supabaseClient
      .from("fees_settings")
      .select("*");

    const { data: payments } = await supabaseClient
      .from("fees_payments")
      .select("*");

    const tableBody = document.getElementById("feesBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    (fees || []).forEach((fee) => {
      const studentPayments = (payments || []).filter(
        (p) =>
          p.student_id === fee.student_id &&
          p.term === fee.term &&
          p.year === fee.year,
      );

      const totalPaid = studentPayments.reduce(
        (sum, p) => sum + Number(p.amount_paid || 0),
        0,
      );

      const balance = Number(fee.amount_due || 0) - totalPaid;

      const status =
        balance <= 0 ? "Paid" : totalPaid > 0 ? "Partial" : "Unpaid";

      tableBody.innerHTML += `
      <tr>
        <td>${fee.student_id}</td>
        <td>${fee.term}</td>
        <td>${fee.year}</td>
        <td>${fee.amount_due}</td>
        <td>${totalPaid}</td>
        <td>${balance}</td>
        <td>${status}</td>
      </tr>
    `;
    });
  }
  const addFeeBtn = document.getElementById("addFeeBtn");
  if (addFeeBtn) {
    addFeeBtn.addEventListener("click", addFee);
  }
  async function recordPayment() {
    const student_id = document.getElementById("payment_student_id").value;
    const amount_paid = Number(document.getElementById("payment_amount").value);

    if (!student_id || !amount_paid) {
      alert("Select student and enter amount");
      return;
    }

    // =====================================================
    // FIND STUDENT FEE RECORD
    // =====================================================
    const { data: feeList, error: feeError } = await supabaseClient
      .from("fees_settings")
      .select("*")
      .eq("student_id", student_id)
      .order("created_at", { ascending: false });
    if (!feeList || feeList.length === 0) {
      console.log("No fee record found for:", student_id);
      alert("No fee record found for this student. Please assign fee first.");
      return;
    }

    const feeData = feeList[0];

    if (feeError || !feeData) {
      console.log(feeError);
      alert("Fee record not found");
      return;
    }
    const term = feeData.term || "Current";

    const year = feeData.year || new Date().getFullYear().toString();
    // =====================================================
    // CALCULATIONS
    // =====================================================
    const currentPaid = Number(feeData.amount_paid || 0);
    const currentDue = Number(feeData.amount_due || 0);

    const newPaid = currentPaid + amount_paid;
    const newBalance = currentDue - newPaid;

    let status = "Unpaid";

    if (newBalance <= 0) {
      status = "Paid";
    } else if (newPaid > 0) {
      status = "Partial";
    }

    // =====================================================
    // UPDATE FEES SETTINGS
    // =====================================================
    const { error: updateError } = await supabaseClient
      .from("fees_settings")
      .update({
        amount_paid: newPaid,
        balance: newBalance,
        status: status,
      })
      .eq("id", feeData.id);

    if (updateError) {
      console.log(updateError);
      alert("Payment update failed");
      return;
    }

    // =====================================================
    // SAVE PAYMENT HISTORY
    // =====================================================
    const { error: paymentError } = await supabaseClient
      .from("fees_payments")
      .insert([
        {
          student_id,
          amount_paid,
          term,
          year,
          balance_after: newBalance,
          timestamp: new Date().toISOString(),
        },
      ]);

    if (paymentError) {
      console.log(paymentError);
      alert(paymentError.message);
      return;
    }

    // =====================================================
    // SUCCESS
    // =====================================================
    alert("Payment recorded successfully");

    document.getElementById("payment_amount").value = "";

    loadFees();
    loadPayments();
  }

  const recordPaymentBtn = document.getElementById("recordPaymentBtn");

  if (recordPaymentBtn) {
    recordPaymentBtn.addEventListener("click", recordPayment);
  }
  // =========================================================
  // INIT
  // =========================================================
  async function loadPayments() {
    console.log("🔥 Loading payment history...");

    const { data, error } = await supabaseClient
      .from("fees_payments")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) {
      console.log("❌ Payment load error:", error.message);
      return;
    }

    const tableBody = document.getElementById("paymentsBody");

    if (!tableBody) {
      console.log("❌ paymentsBody not found in HTML");
      return;
    }

    (data || []).forEach((p) => {
      tableBody.innerHTML += `
    <tr>
      <td>${p.id}</td>
      <td>${p.student_id}</td>
      <td>${p.term}</td>
      <td>${p.year}</td>
      <td>${p.amount_paid}</td>
      <td>${new Date(p.timestamp).toLocaleString()}</td>
      <td>${p.balance_after}</td>
      <td>${p.session || "-"}</td>
    </tr>
  `;
    });

    console.log("✅ Payment history loaded:", data?.length || 0);
  }

  setTimeout(() => {
    loadAll();
    loadStudentDropdown();
    loadFees();
    loadPayments();
    loadNews();
    loadResetRequests();
    loadPassportPermissions();
    listenForResetRequests();
  }, 300);
  if (resultSearch) {
    resultSearch.addEventListener("input", () => {
      const keyword = resultSearch.value.toLowerCase().trim();

      document
        .querySelectorAll("#results-table tbody .result-row")
        .forEach((row) => {
          const studentName = row.cells[0].textContent.toLowerCase();

          row.style.display = studentName.includes(keyword) ? "" : "none";
        });
    });
  }
  // =========================================================
  // 🔍 RESULT SEARCH
  // =========================================================

  document.getElementById("result-search")?.addEventListener("keyup", () => {
    const keyword = document
      .getElementById("result-search")
      .value.toLowerCase();

    document.querySelectorAll("#results-table tbody tr").forEach((row) => {
      const text = row.textContent.toLowerCase();

      row.style.display = text.includes(keyword) ? "" : "none";
    });
  });
  // =========================================================
  // 📰 NEWS SYSTEM
  // =========================================================

  const newsForm = document.getElementById("news-form");

  async function loadNews() {
    const { data, error } = await supabaseClient
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("News load error:", error.message);
      return;
    }

    const newsBody = document.getElementById("newsBody");
    if (!newsBody) return;

    newsBody.innerHTML = "";

    (data || []).forEach((n) => {
      newsBody.innerHTML += `
        <tr>
          <td>${n.title}</td>
          <td>${n.message}</td>
        </tr>
      `;
    });
  }

  if (newsForm) {
    newsForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("NEWS FORM CLICKED");
      const title = document.getElementById("news-title").value;
      const message = document.getElementById("news-message").value;

      const { error } = await supabaseClient
        .from("news")
        .insert([{ title, message }]);

      if (error) {
        console.log(error);
        alert("Failed to post news");
        return;
      }

      alert("News posted successfully");

      newsForm.reset();
      loadNews();
    });
  }

  async function loadAdminNews() {
    const { data } = await supabaseClient
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });

    const container = document.getElementById("newsBody");
    container.innerHTML = "";

    data.forEach((n) => {
      container.innerHTML += `
      <div style="border:1px solid #ccc;padding:10px;margin:10px 0;">
        <h3>${n.title}</h3>
        <p>${n.message}</p>

        <button onclick="deleteNews('${n.id}')">Delete</button>
        <button onclick="editNews('${n.id}', '${n.title}', '${n.message}')">Edit</button>
      </div>
    `;
    });
  }

  window.deleteNews = async function (id) {
    const confirmDelete = confirm("Delete this news?");
    if (!confirmDelete) return;

    const { error } = await supabaseClient.from("news").delete().eq("id", id);

    if (error) {
      console.log(error);
      alert("Delete failed");
      return;
    }

    alert("News deleted successfully");

    // refresh news table
    loadNews();
  };

  async function editNews(id, oldTitle, oldMessage) {
    const title = prompt("Edit title:", oldTitle);
    const message = prompt("Edit message:", oldMessage);

    if (!title || !message) return;

    const { error } = await supabaseClient
      .from("news")
      .update({ title, message })
      .eq("id", id);

    if (error) {
      alert("Update failed");
      return;
    }

    alert("News updated");
    loadAdminNews();
  }

  async function loadNews() {
    const { data, error } = await supabaseClient
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("NEWS ERROR:", error);
      return;
    }

    const tbody = document.getElementById("newsBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    data.forEach((n) => {
      tbody.innerHTML += `
      <tr>
        <td>${n.title}</td>
        <td>${n.message}</td>
        <td>
          <button onclick="deleteNews('${n.id}')">Delete</button>
          <button onclick="editNews('${n.id}', '${n.title}', '${n.message}')">Edit</button>
        </td>
      </tr>
    `;
    });
  }
  // =====================================================
  // 🎛 RESULT ACCESS CONTROL
  // =====================================================

  async function loadResultAccessStatus() {
    console.log("window.supabaseClient =", window.supabaseClient);
    console.log("local supabaseClient =", supabaseClient);

    const { data, error } = await supabaseClient
      .from("offon")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    const statusText = document.getElementById("resultStatusText");

    if (!statusText) return;

    statusText.textContent = data.result_access
      ? "✅ Result checking is ENABLED"
      : "❌ Result checking is DISABLED";
  }

  // ENABLE RESULT
  document
    .getElementById("enableResultBtn")
    ?.addEventListener("click", async () => {
      const { error } = await supabaseClient
        .from("offon")
        .update({ result_access: true })
        .eq("id", 1);

      if (error) {
        console.log(error);
        alert("Failed to enable");
        return;
      }

      alert("Result checking enabled");

      loadResultAccessStatus();
    });

  // DISABLE RESULT
  document
    .getElementById("disableResultBtn")
    ?.addEventListener("click", async () => {
      const { error } = await supabaseClient
        .from("offon")
        .update({ result_access: false })
        .eq("id", 1);

      if (error) {
        console.log(error);
        alert("Failed to disable");
        return;
      }

      alert("Result checking disabled");

      loadResultAccessStatus();
    });

  // LOAD STATUS
  loadResultAccessStatus();

  // =====================================================
  // 🎫 SCRATCH CARD SYSTEM (FULL FIXED VERSION)
  // =====================================================

  async function loadScratchCards() {
    const { data, error } = await supabaseClient
      .from("scratch_cards")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("SCRATCH LOAD ERROR:", error);
      return;
    }

    const tbody = document.getElementById("scratchCardsBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    (data || []).forEach((card) => {
      tbody.innerHTML += `
      <tr>
        <td>${card.code}</td>
        <td>${card.used ? "USED" : "UNUSED"}</td>
        <td>${card.student_id || "-"}</td>

        <td>
          <button onclick="deleteScratchCard('${card.id}')">
            Delete
          </button>
        </td>
      </tr>
    `;
    });
  }

  window.deleteScratchCard = async function (id) {
    const confirmDelete = confirm("Delete this scratch card?");

    if (!confirmDelete) return;

    const { error } = await supabaseClient
      .from("scratch_cards")
      .delete()
      .eq("id", id);

    if (error) {
      console.log(error);
      alert("Delete failed");
      return;
    }

    alert("Scratch card deleted");

    loadScratchCards();
  };

  document
    .getElementById("generate-scratch-btn")
    ?.addEventListener("click", async () => {
      const count = parseInt(document.getElementById("scratch-count").value);

      if (!count || count <= 0) {
        alert("Enter valid number");
        return;
      }

      const status = document.getElementById("scratch-status");

      status.innerText = "Generating scratch cards...";

      let cards = [];

      for (let i = 0; i < count; i++) {
        const code =
          "SCR-" + Math.random().toString(36).substring(2, 10).toUpperCase();

        cards.push({
          code: code,
          used: false,
          student_id: null,
        });
      }

      const { error } = await supabaseClient
        .from("scratch_cards")
        .insert(cards);

      if (error) {
        console.log(error);

        status.innerText = "Failed to generate scratch cards";

        return;
      }

      status.innerText = count + " scratch cards generated successfully";

      document.getElementById("scratch-count").value = "";

      loadScratchCards();
    });

  // =====================================================
  // 🚀 LOAD SCRATCH TABLE
  // =====================================================
  setTimeout(() => {
    loadScratchCards();
  }, 500);

  async function loadResetRequests() {
    const { data, error } = await supabaseClient
      .from("password_reset_requests")
      .select("*")
      .order("id", { ascending: false });

    const table = document.getElementById("resetBody");

    if (!table) return;

    table.innerHTML = "";

    if (error) {
      console.log(error);
      table.innerHTML = `<tr><td colspan="3">Error loading requests</td></tr>`;
      return;
    }

    if (!data || data.length === 0) {
      table.innerHTML = `<tr><td colspan="3">No requests found</td></tr>`;
      return;
    }

    data.forEach((req) => {
      const row = document.createElement("tr");

      let statusColor = "🟡";
      if (req.status === "Done") statusColor = "🟢";
      if (req.status === "Cancelled") statusColor = "🔴";

      row.innerHTML = `
  <td>${req.student_email}</td>
  <td>${statusColor} ${req.status}</td>
  <td>
    <button onclick="markResetDone('${req.id}', '${req.auth_user_id}')">Done</button>
    <button onclick="cancelReset('${req.id}')">Cancel</button>
  </td>
`;
      table.appendChild(row);
    });
    loadResetRequests();
  }
  window.markResetDone = async function (id) {
    const newPassword = prompt("Enter new password for student:");
    if (!newPassword) return;

    // 1. Get request
    const { data: req, error } = await supabaseClient
      .from("password_reset_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !req) {
      alert("Request not found");
      return;
    }

    // 2. Call Edge Function
    const res = await fetch(
      "https://iupwqyksdntdccnzoxrb.supabase.co/functions/v1/reset-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request_id: id,
          auth_user_id: req.auth_user_id,
          newPassword: newPassword,
        }),
      },
    );

    const result = await res.json();

    if (!res.ok) {
      alert("Password reset failed: " + (result.error || "unknown error"));
      return;
    }

    // 3. Update student flag
    await supabaseClient
      .from("students")
      .update({
        must_change_password: true,
      })
      .eq("auth_user_id", req.auth_user_id);

    // 4. Mark request as done
    await supabaseClient
      .from("password_reset_requests")
      .update({
        status: "Done",
        message: "Password reset successfully",
      })
      .eq("id", id);

    alert("Password reset completed ✔");

    loadResetRequests();
  };
  // =====================================================
  // 🔐 PASSWORD RESET SYSTEM (FIXED & CLEAN)
  // =====================================================

  async function loadResetRequests() {
    const { data, error } = await supabaseClient
      .from("password_reset_requests")
      .select("*")
      .order("id", { ascending: false });

    const table = document.getElementById("resetBody");
    if (!table) return;

    table.innerHTML = "";

    if (error) {
      console.log(error);
      table.innerHTML = `<tr><td>Error loading requests</td></tr>`;
      return;
    }

    (data || []).forEach((req) => {
      const row = document.createElement("tr");

      let statusColor = "🟡";
      if (req.status === "Done") statusColor = "🟢";
      if (req.status === "Cancelled") statusColor = "🔴";

      row.innerHTML = `
  <td>${req.student_email}</td>
  <td>${req.student_phone || "No phone"}</td>
  <td>${statusColor} ${req.status}</td>
  <td>
    <button onclick="markResetDone('${req.id}')">Done</button>
    <button onclick="cancelReset('${req.id}')">Cancel</button>
  </td>
`;

      table.appendChild(row);
    });
  }
  async function cancelReset(id) {
    const ok = confirm("Cancel this request?");
    if (!ok) return;

    const { error } = await supabaseClient
      .from("password_reset_requests")
      .update({
        status: "Cancelled",
        message: "Cancelled by admin",
      })
      .eq("id", id);

    if (error) {
      alert("Cancel failed: " + error.message);
      return;
    }

    loadResetRequests();
  }
  // =====================================================
  // 📷 PASSPORT CHANGE PERMISSION SYSTEM
  // =====================================================

  async function loadPassportPermissions() {
    const { data, error } = await supabaseClient
      .from("students")
      .select("name,class,auth_user_id,passport_change_allowed")
      .order("name");

    if (error) {
      console.log(error);
      return;
    }

    const tbody = document.getElementById("passportPermissionBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    (data || []).forEach((student) => {
      tbody.innerHTML += `
      <tr>
        <td>${student.name}</td>
        <td>${student.class || "-"}</td>
        <td>
          ${student.passport_change_allowed ? "✅ Allowed" : "❌ Not Allowed"}
        </td>
        <td>
          <button onclick="allowPassportChange('${student.auth_user_id}')">
            Allow Passport Change
          </button>
        </td>
      </tr>
    `;
    });
  }

  window.allowPassportChange = async function (studentId) {
    const ok = confirm("Allow this student to upload/change passport photo?");

    if (!ok) return;

    const { error } = await supabaseClient
      .from("students")
      .update({
        passport_change_allowed: true,
      })
      .eq("auth_user_id", studentId);

    if (error) {
      console.log(error);
      alert("Failed");
      return;
    }

    alert("Passport change permission granted");

    loadPassportPermissions();
  };
  // =====================================================
  // 🎓 PROMOTE SELECTED STUDENTS
  // =====================================================

  document
    .getElementById("promoteSelectedBtn")
    ?.addEventListener("click", async () => {
      const selectedStudents = document.querySelectorAll(
        ".promote-student:checked",
      );

      if (selectedStudents.length === 0) {
        alert("Select at least one student");
        return;
      }
      alert(
        "Promotion started.\n\nPlease wait up to 7 minutes before clicking again.\n\nDo NOT refresh or click Promote twice.",
      );

      for (const student of selectedStudents) {
        const studentId = student.dataset.id;
        const currentClass = student.dataset.class;

        alert("Current Class = " + currentClass);

        let newClass = currentClass;

        if (currentClass === "JSS1") newClass = "JSS2";
        else if (currentClass === "JSS2") newClass = "JSS3";
        else if (currentClass === "JSS3") newClass = "SS1";
        else if (currentClass === "SS1") newClass = "SS2";
        else if (currentClass === "SS2") newClass = "SS3";
        else if (currentClass === "SS3") newClass = "GRADUATED";

        await supabaseClient
          .from("students")
          .update({
            class: newClass,
          })
          .eq("auth_user_id", studentId);
      }
      await loadAll();
      await loadStudentDropdown();

      alert("Selected students promoted successfully");
    });
  document
    .getElementById("demoteSelectedBtn")
    ?.addEventListener("click", async () => {
      const selectedStudents = document.querySelectorAll(
        ".promote-student:checked",
      );

      if (selectedStudents.length === 0) {
        alert("Select at least one student");
        return;
      }
      alert(
        "Demotion started.\n\nPlease wait until it finishes.\n\nDo NOT refresh or click twice.",
      );

      for (const student of selectedStudents) {
        const studentId = student.dataset.id;
        const currentClass = student.dataset.class;

        let newClass = currentClass;
        if (currentClass === "JSS2") newClass = "JSS1";
        else if (currentClass === "JSS3") newClass = "JSS2";
        else if (currentClass === "SS1") newClass = "JSS3";
        else if (currentClass === "SS2") newClass = "SS1";
        else if (currentClass === "SS3") newClass = "SS2";
        else if (currentClass === "GRADUATED") newClass = "SS3";
        await supabaseClient
          .from("students")
          .update({
            class: newClass,
          })
          .eq("auth_user_id", studentId);
      }
      await loadAll();
      await loadStudentDropdown();

      alert("Selected students moved back successfully");
    });
  async function loadSummaryCards() {
    const { data: results } = await supabaseClient
      .from("results")
      .select("score");

    const box = document.getElementById("summaryBox");
    if (!box) return;

    if (!results || results.length === 0) {
      box.innerHTML = "No results yet";
      return;
    }

    let total = 0;
    let count = 0;

    results.forEach((r) => {
      const score = Number(r.score);
      if (!isNaN(score)) {
        total += score;
        count++;
      }
    });

    const avg = count ? (total / count).toFixed(2) : 0;

    box.innerHTML = `
    <div style="padding:12px; border:1px solid #ccc; margin:10px 0;">
      <h3>📊 Results Summary</h3>
      <p><b>Total Results:</b> ${count}</p>
      <p><b>Average Score:</b> ${avg}</p>
    </div>
  `;
  }
});
