document.addEventListener("DOMContentLoaded", async function () {
  // ================= SUPABASE INIT =================
  const supabaseUrl = "https://iupwqyksdntdccnzoxrb.supabase.co";
  const supabaseKey = "sb_publishable_hUYF2MqC5s12fi-3mRoSng_-pwwzK2V";

  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

  // ================= ELEMENTS =================
  const logoutBtn = document.getElementById("logout-btn");
  const studentsTable = document.querySelector("#students-table tbody");
  const resultsTable = document.querySelector("#results-table tbody");
  const adminsTable = document.querySelector("#admins-table tbody");

  // ================= PROTECTION =================
  const loggedAdmin = JSON.parse(localStorage.getItem("currentAdmin"));
  if (!loggedAdmin) {
    window.location.href = "admin.html";
  }

  // ================= LOGOUT =================
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentAdmin");
    window.location.href = "admin.html";
  });

  // ================= LOAD ALL =================
  async function loadAll() {
    const { data: students } = await supabaseClient
      .from("students")
      .select("*");
    const { data: results } = await supabaseClient.from("results").select("*");
    const { data: admins } = await supabaseClient.from("admins").select("*");

    renderStudents(students || []);
    renderResults(results || []);
    renderAdmins(admins || []);
  }

  // ================= RENDER STUDENTS =================
  function renderStudents(data) {
    studentsTable.innerHTML = "";
    data.forEach((s) => {
      studentsTable.innerHTML += `
        <tr>
          <td>${s.name}</td>
          <td>${s.student_id}</td>
          <td>${s.class}</td>
          <td>${s.email}</td>
          <td>${s.password}</td>
          <td>
            <button class="edit-student-btn" data-id="${s.id}">Edit</button>
            <button class="delete-student-btn" data-id="${s.id}">Delete</button>
          </td>
        </tr>
      `;
    });
  }

  // ================= RENDER RESULTS =================
  function renderResults(data) {
    resultsTable.innerHTML = "";
    data.forEach((r) => {
      resultsTable.innerHTML += `
        <tr>
          <td>${r.student_id}</td>
          <td>${r.subject}</td>
          <td>${r.score}</td>
          <td>
            <button class="edit-result-btn" data-id="${r.id}">Edit</button>
            <button class="delete-result-btn" data-id="${r.id}">Delete</button>
          </td>
        </tr>
      `;
    });
  }

  // ================= RENDER ADMINS =================
  function renderAdmins(data) {
    adminsTable.innerHTML = "";
    data.forEach((a) => {
      adminsTable.innerHTML += `
        <tr>
          <td>${a.username}</td>
          <td>${a.email}</td>
          <td>
            <button class="edit-admin-btn" data-id="${a.id}">Edit</button>
            <button class="delete-admin-btn" data-id="${a.id}">Delete</button>
          </td>
        </tr>
      `;
    });
  }

  // ================= ADD STUDENT =================
  document
    .getElementById("add-student-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("student-name").value.trim();
      const student_id = document.getElementById("student-id").value.trim();
      const cls = document.getElementById("student-class").value.trim();
      const email = document.getElementById("student-email").value.trim();
      const password = document.getElementById("student-password").value.trim();

      await supabaseClient
        .from("students")
        .insert([{ name, student_id, class: cls, email, password }]);

      e.target.reset();
      loadAll();
    });

  // ================= ADD RESULT =================
  document
    .getElementById("add-result-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const student_id = document
        .getElementById("result-student-id")
        .value.trim();
      const subject = document.getElementById("result-subject").value.trim();
      const score = document.getElementById("result-score").value.trim();

      await supabaseClient
        .from("results")
        .insert([{ student_id, subject, score }]);

      e.target.reset();
      loadAll();
    });

  // ================= ADD ADMIN =================
  document
    .getElementById("add-admin-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("admin-username").value.trim();
      const email = document.getElementById("admin-email").value.trim();
      const password = document.getElementById("admin-password").value.trim();

      await supabaseClient
        .from("admins")
        .insert([{ username, email, password }]);

      e.target.reset();
      loadAll();
    });

  // ================= DELETE STUDENT =================
  studentsTable.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-student-btn")) {
      await supabaseClient
        .from("students")
        .delete()
        .eq("id", e.target.dataset.id);
      loadAll();
    }
  });

  // ================= DELETE RESULT =================
  resultsTable.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-result-btn")) {
      await supabaseClient
        .from("results")
        .delete()
        .eq("id", e.target.dataset.id);
      loadAll();
    }
  });

  // ================= DELETE ADMIN (FIXED) =================
  adminsTable.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("delete-admin-btn")) return;

    const id = e.target.dataset.id;
    const row = e.target.closest("tr");

    const email = row.children[1].textContent;

    // ✅ ONLY CENTRAL ADMIN PROTECTION
    if (email === "central@school.com") {
      alert("Central admin cannot be deleted");
      return;
    }

    await supabaseClient.from("admins").delete().eq("id", id);

    loadAll();
  });

  // ================= EDIT STUDENT =================
  studentsTable.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("edit-student-btn")) return;

    const row = e.target.closest("tr");

    const oldStudentId = row.children[1].textContent;

    const name = prompt("Edit Name", row.children[0].textContent);
    const student_id = prompt("Edit Student ID", row.children[1].textContent);
    const cls = prompt("Edit Class", row.children[2].textContent);
    const email = prompt("Edit Email", row.children[3].textContent);
    const password = prompt("Edit Password", row.children[4].textContent);

    if (!name || !student_id || !cls || !email || !password) return;

    const { data, error } = await supabaseClient
      .from("students")
      .update({
        name,
        student_id,
        class: cls,
        email,
        password,
      })
      .eq("student_id", oldStudentId); // 🔥 IMPORTANT FIX

    console.log("UPDATE RESULT:", data, error);

    if (error) {
      alert("Update failed: " + error.message);
      return;
    }

    loadAll();
  });
  // ================= EDIT RESULT =================
  resultsTable.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("edit-result-btn")) return;

    const row = e.target.closest("tr");
    const id = e.target.dataset.id;

    const subject = prompt("Subject", row.children[1].textContent);
    const score = prompt("Score", row.children[2].textContent);

    if (!subject || !score) return;

    await supabaseClient
      .from("results")
      .update({ subject, score })
      .eq("id", id);

    loadAll();
  });

  // ================= EDIT ADMIN (FIXED) =================
  adminsTable.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("edit-admin-btn")) return;

    const row = e.target.closest("tr");
    const id = e.target.dataset.id;

    const email = row.children[1].textContent;

    // ✅ ONLY CENTRAL ADMIN PROTECTION FIXED
    if (email === "central@school.com") {
      alert("Central admin cannot be edited");
      return;
    }

    const username = prompt("Username", row.children[0].textContent);
    const newEmail = prompt("Email", row.children[1].textContent);
    const password = prompt("Password", "");

    if (!username || !newEmail || !password) return;

    await supabaseClient
      .from("admins")
      .update({ username, email: newEmail, password })
      .eq("id", id);

    loadAll();
  });

  // ================= START =================
  loadAll();
});
