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
  const adminsTable = document.querySelector("#admins-table tbody");

  // =========================================================
  // LOGIN PROTECTION
  // =========================================================
  const loginForm = document.getElementById("login-form");

  const loggedAdmin = JSON.parse(localStorage.getItem("currentAdmin"));

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
    const { data: results } = await supabaseClient.from("results").select("*");
    const { data: admins } = await supabaseClient.from("admins").select("*");

    // STUDENTS
    studentsTable.innerHTML = "";
    (students || []).forEach((s) => {
      studentsTable.innerHTML += `
        <tr class="student-row"
            data-id="${s.auth_user_id}"
            data-name="${s.name}"
            data-class="${s.class}">
          <td>${s.name}</td>
          <td>${s.auth_user_id}</td>
          <td>${s.class}</td>
          <td>
            <button class="delete-student-btn" data-id="${s.auth_user_id}">
              Delete
            </button>
          </td>
        </tr>
      `;
    });
    resultsTable.innerHTML = "";
    (results || []).forEach((r) => {
      resultsTable.innerHTML += `
    <tr class="result-row"
        data-id="${r.id}"
        data-student="${r.student_id}"
        data-subject="${r.subject}"
        data-score="${r.score}"
        data-term="${r.term}"
        data-year="${r.year}"

      <td>${r.student_name || r.student_id}</td>
      <td>${r.subject}</td>
      <td>${r.score}</td>
      <td>${r.term || "N/A"}</td>
       <td>${r.year || "N/A"}</td>

      <td>
        <button class="delete-result-btn" data-id="${r.id}">
          Delete
        </button>
      </td>

    </tr>
  `;
    });
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

    if (e.target.classList.contains("delete-result-btn")) {
      await supabaseClient
        .from("results")
        .delete()
        .eq("id", e.target.dataset.id);
      loadAll();
      return;
    }

    document.getElementById("result-student-id").value = row.dataset.student;
    document.getElementById("result-subject").value = row.dataset.subject;
    document.getElementById("result-score").value = row.dataset.score;

    AppState.editResultId = row.dataset.id;
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
      const password = document.getElementById("student-password").value;

      // safer email format
      const safeName = name.toLowerCase().replace(/\s+/g, "");
      const email = document.getElementById("student-email").value.trim();

      if (AppState.editStudentId) {
        await supabaseClient
          .from("students")
          .update({ name, class: className })
          .eq("auth_user_id", AppState.editStudentId);

        AppState.editStudentId = null;
      } else {
        const { data: authData, error: authError } =
          await supabaseClient.auth.signUp({
            email,
            password,
          });
        console.log("AUTH RESULT:", authData);
        console.log("AUTH ERROR:", authError);
        if (authError) {
          console.log(authError);
          alert(authError.message);
          return;
        }

        if (!authData?.user?.id) {
          alert("Auth failed: no user created");
          return;
        }
        const studentNumber = `LUKE/2026/${String(Date.now()).slice(-3)}`;

        const { error: insertError } = await supabaseClient
          .from("students")
          .insert([
            {
              name,
              class: className,
              auth_user_id: authData.user.id,
              student_number: studentNumber,
            },
          ]);
        if (insertError) {
          console.log(insertError);
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
        const selectedStudent = document.querySelector("#result-student-id");
        const studentName =
          selectedStudent.options[selectedStudent.selectedIndex]?.text || "";

        await supabaseClient.from("results").insert([
          {
            student_id,
            student_name: studentName,
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
    // 3. CLEAN INITIAL VALUES (IMPORTANT FIX)
    // =========================
    const amount_paid = 0;
    const balance = amount_due - amount_paid;
    const status = "Unpaid";

    // =========================
    // 4. INSERT INTO SUPABASE
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
          amount_paid,
          balance,
          status,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    // =========================
    // 5. ERROR CHECK
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
    // 6. SUCCESS
    // =========================
    alert("Fee created successfully ✔");

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

    const term = document.getElementById("term")?.value || "Current";
    if (!student_id || !amount_paid) {
      alert("Select student and enter amount");
      return;
    }

    // =====================================================
    // FIND STUDENT FEE RECORD
    // =====================================================
    const year = document.getElementById("year")?.value;

    const { data: feeList, error: feeError } = await supabaseClient
      .from("fees_settings")
      .select("*")
      .eq("student_id", student_id)
      .eq("term", term)
      .eq("year", year)
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

    // =====================================================
    // CALCULATIONS
    // =====================================================
    // =====================================================
    // CALCULATIONS (FIXED: uses payment history as source of truth)
    // =====================================================

    // get all previous payments
    const { data: paymentList } = await supabaseClient
      .from("fees_payments")
      .select("amount_paid")
      .eq("student_id", student_id);

    const previousPaid = (paymentList || []).reduce(
      (sum, p) => sum + Number(p.amount_paid || 0),
      0,
    );

    const newPaid = previousPaid + amount_paid;

    const currentDue = Number(feeData.amount_due || 0);
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

    const { data: payments, error } = await supabaseClient
      .from("fees_payments")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) {
      console.log("❌ Payment load error:", error.message);
      return;
    }

    const { data: fees } = await supabaseClient
      .from("fees_settings")
      .select("*");

    const tableBody = document.getElementById("paymentsBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    (payments || []).forEach((p) => {
      // match fee record
      const fee = (fees || []).find(
        (f) =>
          f.student_id === p.student_id &&
          f.term === p.term &&
          f.year === p.year,
      );

      const amount_due = fee?.amount_due || 0;

      // safest balance logic
      const balance_after =
        p.balance_after ?? amount_due - Number(p.amount_paid || 0);

      tableBody.innerHTML += `
  <tr>
    <td>${p.student_id}</td>

    <td>${p.amount_paid ?? 0}</td>

    <td>${p.term || "-"}</td>

    <td>${p.year || "-"}</td>

    <td>${p.timestamp ? new Date(p.timestamp).toLocaleString() : "-"}</td>
  </tr>
`;
    });

    console.log("✅ Payment history loaded:", payments?.length || 0);
  }

  setTimeout(() => {
    loadAll();
    loadStudentDropdown();
    loadFees();
    loadPayments();
    loadNews();
  }, 300);
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

async function deleteNews(id) {
  const confirmDelete = confirm("Delete this news?");
  if (!confirmDelete) return;

  const { error } = await supabaseClient.from("news").delete().eq("id", id);

  if (error) {
    alert("Delete failed");
    return;
  }

  alert("News deleted");
  loadAdminNews();
}

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
document.addEventListener("DOMContentLoaded", () => {
  loadAdminNews();
});
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

    const { error } = await supabaseClient.from("scratch_cards").insert(cards);

    if (error) {
      console.log(error);

      status.innerText = "Failed to generate scratch cards";

      return;
    }

    status.innerText = count + " scratch cards generated successfully";

    document.getElementById("scratch-count").value = "";

    loadScratchCards();
    function enableYearFilterClickFix() {
      const yearSelect = document.getElementById("year");

      if (!yearSelect) {
        console.log("Year filter not found");
        return;
      }

      // force enable clicking
      yearSelect.style.pointerEvents = "auto";
      yearSelect.disabled = false;

      // if options are empty, re-enable interaction
      yearSelect.addEventListener("click", () => {
        console.log("Year dropdown clicked");
      });

      // ensure it reacts even if styled as blocked
      yearSelect.addEventListener("mousedown", (e) => {
        e.stopPropagation();
      });

      console.log("Year filter fix applied");
    }

    // run it AFTER page load
    window.addEventListener("load", () => {
      setTimeout(enableYearFilterClickFix, 500);
    });
  });

// =====================================================
// 🚀 LOAD SCRATCH TABLE
// =====================================================
setTimeout(() => {
  loadScratchCards();
}, 500);
