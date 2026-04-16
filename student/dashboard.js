document.addEventListener("DOMContentLoaded", () => {
  // ================= SUPABASE INIT =================
  const supabaseUrl = "https://iupwqyksdntdccnzoxrb.supabase.co";
  const supabaseKey = "sb_publishable_hUYF2MqC5s12fi-3mRoSng_-pwwzK2V";
  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

  // ================= GET STUDENT =================
  const student = JSON.parse(localStorage.getItem("currentStudent"));

  if (!student) {
    window.location.href = "login.html";
    return;
  }

  console.log("STUDENT:", student);

  // ================= HEADER =================
  document.getElementById("student-name-header").textContent =
    "Welcome, " + student.name;

  document.getElementById("student-id-display").textContent =
    "ID: " + student.student_id;

  document.getElementById("student-class").textContent =
    "Class: " + student.class;

  document.getElementById("student-profile").src = "images/image.png";

  // ================= LOGOUT =================
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("currentStudent");
    window.location.href = "login.html";
  });

  // ================= NAVIGATION =================
  const main = document.getElementById("main-dashboard");
  const results = document.getElementById("results-page");
  const idCard = document.getElementById("id-card-page");

  document.getElementById("go-results").addEventListener("click", () => {
    main.style.display = "none";
    results.style.display = "block";
    loadResults();
  });

  document.getElementById("go-id-card").addEventListener("click", () => {
    main.style.display = "none";
    idCard.style.display = "block";

    document.getElementById("id-card-name").textContent = student.name;
    document.getElementById("id-card-id").textContent =
      "ID: " + student.student_id;
    document.getElementById("id-card-class").textContent =
      "Class: " + student.class;
  });

  document.getElementById("results-back-btn").addEventListener("click", () => {
    results.style.display = "none";
    main.style.display = "block";
  });

  document.getElementById("id-card-back-btn").addEventListener("click", () => {
    idCard.style.display = "none";
    main.style.display = "block";
  });

  // ================= LOAD RESULTS (FIXED SUPABASE) =================
  async function loadResults() {
    const tableBody = document.querySelector("tbody");
    const avgEl = document.getElementById("average-score");
    const perfEl = document.getElementById("performance-level");

    if (!tableBody) return;

    tableBody.innerHTML = "";

    const { data, error } = await supabaseClient
      .from("results")
      .select("*")
      .eq("student_id", student.student_id);

    console.log("RESULTS FROM SUPABASE:", data);
    console.log("ERROR:", error);

    if (error) {
      console.log("Supabase error:", error.message);
      return;
    }

    const resultsData = data || [];

    let total = 0;

    resultsData.forEach((r) => {
      total += Number(r.score);

      const grade =
        r.score >= 70
          ? "A"
          : r.score >= 60
            ? "B"
            : r.score >= 50
              ? "C"
              : r.score >= 40
                ? "D"
                : "F";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${r.subject}</td>
        <td>${r.score}</td>
        <td>${grade}</td>
      `;
      tableBody.appendChild(row);
    });

    const avg = resultsData.length
      ? (total / resultsData.length).toFixed(2)
      : 0;

    if (avgEl) avgEl.textContent = avg;

    const perf =
      avg >= 70
        ? "Excellent"
        : avg >= 60
          ? "Very Good"
          : avg >= 50
            ? "Good"
            : avg >= 40
              ? "Pass"
              : "Fail";

    if (perfEl) perfEl.textContent = perf;
  }

  // ================= START =================
  loadResults();
});
