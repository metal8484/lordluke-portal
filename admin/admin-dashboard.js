document.addEventListener("DOMContentLoaded", async function () {
  // =========================================================
  // 🟦 SUPABASE
  // =========================================================
  const supabaseUrl = "https://iupwqyksdntdccnzoxrb.supabase.co";
  const supabaseKey = "sb_publishable_hUYF2MqC5s12fi-3mRoSng_-pwwzK2V";
  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

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
      console.log("❌ Supabase error:", error.message);
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

    // RESULTS
    resultsTable.innerHTML = "";
    (results || []).forEach((r) => {
      resultsTable.innerHTML += `
        <tr class="result-row"
            data-id="${r.id}"
            data-student="${r.student_id}"
            data-subject="${r.subject}"
            data-score="${r.score}">
          <td>${r.student_id}</td>
          <td>${r.subject}</td>
          <td>${r.score}</td>
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

        const { error: insertError } = await supabaseClient
          .from("students")
          .insert([
            {
              name,
              class: className,
              auth_user_id: authData.user.id,
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

      if (AppState.editResultId) {
        await supabaseClient
          .from("results")
          .update({ student_id, subject, score })
          .eq("id", AppState.editResultId);

        AppState.editResultId = null;
      } else {
        await supabaseClient
          .from("results")
          .insert([{ student_id, subject, score }]);
      }

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
    const student_id = document.getElementById("student_id").value;
    const term = document.getElementById("term").value;
    const session = document.getElementById("session").value;
    const amount_due = Number(document.getElementById("amount_due").value);

    const { error } = await supabaseClient.from("fees_settings").insert([
      {
        student_id,
        term,
        session,
        amount_due,
        amount_paid: 0,
        balance: amount_due,
        status: "Unpaid",
      },
    ]);

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    loadFees();
  }

  async function loadFees() {
    const { data } = await supabaseClient.from("fees_settings").select("*");

    const tableBody = document.getElementById("feesBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    (data || []).forEach((fee) => {
      tableBody.innerHTML += `
        <tr>
          <td>${fee.student_id}</td>
          <td>${fee.term}</td>
          <td>${fee.session}</td>
          <td>${fee.amount_due}</td>
          <td>${fee.amount_paid}</td>
          <td>${fee.balance}</td>
          <td>${fee.status}</td>
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
    const session = document.getElementById("session")?.value || "Current";

    if (!student_id || !amount_paid) {
      alert("Select student and enter amount");
      return;
    }

    // =====================================================
    // FIND STUDENT FEE RECORD
    // =====================================================
    const { data: feeData, error: feeError } = await supabaseClient
      .from("fees_settings")
      .select("*")
      .eq("student_id", student_id)
      .order("id", { ascending: false })
      .limit(1)
      .single();

    if (feeError || !feeData) {
      console.log(feeError);
      alert("Fee record not found");
      return;
    }

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
          session,
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

    tableBody.innerHTML = "";

    (data || []).forEach((p) => {
      tableBody.innerHTML += `
      <tr>
        <td>${p.student_id}</td>
        <td>${p.amount_paid}</td>
        <td>${p.term}</td>
        <td>${p.session}</td>
        <td>${p.balance_after}</td>
        <td>${new Date(p.timestamp).toLocaleString()}</td>
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
  }, 300);
});
