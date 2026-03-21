// =====================
// Full Portal JS (Cleaned)
// =====================

// ---------- Sample Students ----------
const students = [
  {
    id: "SS1001",
    password: "123456",
    name: "John Doe",
    class: "SS2",
    email: "johndoe@example.com",
    profilePicture: "images/student1.PNG",
    gallery: ["images/student1.PNG", "images/student1-2.PNG"],
    results: [
      { subject: "Mathematics", score: 85, grade: "A" },
      { subject: "English", score: 78, grade: "B+" },
      { subject: "Biology", score: 92, grade: "A" },
      { subject: "History", score: 70, grade: "B" },
    ],
  },
  {
    id: "SS1002",
    password: "abcdef",
    name: "Mary Jane",
    class: "SS3",
    email: "maryjane@example.com",
    profilePicture: "images/student2.jpg",
    gallery: ["images/student2.jpg", "images/student2-2.jpg"],
    results: [
      { subject: "Mathematics", score: 90, grade: "A+" },
      { subject: "English", score: 82, grade: "A" },
      { subject: "Biology", score: 88, grade: "A" },
      { subject: "History", score: 75, grade: "B+" },
    ],
  },
];

// ---------- LOGIN ----------
const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const studentId = document.getElementById("student-id").value.trim();
    const password = document.getElementById("password").value.trim();
    const student = students.find(
      (s) => s.id === studentId && s.password === password,
    );
    if (student) {
      localStorage.setItem("loggedInStudent", JSON.stringify(student));
      window.location.href = "./student-dashboard.html";
    } else {
      loginMessage.style.color = "red";
      loginMessage.textContent = "Invalid Student ID or Password.";
    }
  });
}

// ---------- DASHBOARD ----------

// ===== STUDENT DASHBOARD LOGIC =====
const studentData = localStorage.getItem("loggedInStudent");
if (studentData) {
  let student = JSON.parse(studentData);

  // Load latest students from localStorage
  const allStudents = JSON.parse(localStorage.getItem("students")) || [];
  const updatedStudent = allStudents.find((s) => s.id === student.id);
  if (updatedStudent) {
    student = updatedStudent;
    localStorage.setItem("loggedInStudent", JSON.stringify(student));
  }

  // ----- HEADER -----
  const nameHeader = document.getElementById("student-name-header");
  if (nameHeader) nameHeader.textContent = `Welcome, ${student.name}`;

  // ----- PROFILE PICTURE -----
  const profilePic = document.getElementById("student-profile");
  if (profilePic)
    profilePic.src = student.profilePicture || "images/default-profile.png";

  // ----- RESULTS TABLE -----
  const resultsTableBody = document.querySelector("#results-table tbody");
  if (resultsTableBody) {
    resultsTableBody.innerHTML = "";
    student.results.forEach((r) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${r.subject}</td><td>${r.score}</td><td>${r.grade}</td>`;
      resultsTableBody.appendChild(row);
    });

    // ----- AVERAGE & PERFORMANCE -----
    const total = student.results.reduce((sum, r) => sum + r.score, 0);
    const avg = student.results.length
      ? (total / student.results.length).toFixed(2)
      : 0;

    const avgDisplay = document.getElementById("average-score");
    if (avgDisplay) avgDisplay.textContent = avg;

    let performance = "Average";
    if (avg >= 85) performance = "Excellent";
    else if (avg >= 70) performance = "Very Good";
    else if (avg >= 50) performance = "Good";
    else performance = "Needs Improvement";

    const perfDisplay = document.getElementById("performance-level");
    if (perfDisplay) perfDisplay.textContent = performance;
  }

  // ----- ID CARD -----
  const idPhoto = document.getElementById("id-card-photo");
  const idName = document.getElementById("id-card-name");
  const idId = document.getElementById("id-card-id");
  const idClass = document.getElementById("id-card-class");
  const idEmail = document.getElementById("id-card-email");
  const idGallery = document.getElementById("id-card-gallery");

  if (idPhoto)
    idPhoto.src = student.profilePicture || "images/default-profile.png";
  if (idName) idName.textContent = student.name;
  if (idId) idId.textContent = student.id;
  if (idClass) idClass.textContent = student.class;
  if (idEmail) idEmail.textContent = student.email || "student@example.com";

  if (idGallery) {
    idGallery.innerHTML = "";
    student.gallery.forEach((img) => {
      const i = document.createElement("img");
      i.src = img;
      idGallery.appendChild(i);
    });
  }
}

// ----- LOGOUT -----
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedInStudent");
    window.location.href = "./login.html";
  });
}

// ----- DASHBOARD PROTECTION -----
if (document.getElementById("results-table") && !studentData) {
  alert("You must login first!");
  window.location.href = "./login.html";
}

// ----- TOGGLE SECTIONS (CLEAN VERSION) -----
const showResultsBtn = document.getElementById("show-results-btn");
const showIdCardBtn = document.getElementById("show-id-card-btn");
const studentResultsSection = document.querySelector(".student-results");
const idCardSection = document.getElementById("id-card-section");
const defaultView = document.getElementById("default-view");

const resultsBackBtn = document.getElementById("results-back-btn");
const idBackBtn = document.getElementById("id-card-back-btn");

const bodyEl = document.body;

if (showResultsBtn && studentResultsSection && defaultView) {
  showResultsBtn.addEventListener("click", () => {
    studentResultsSection.style.display = "block";
    idCardSection.style.display = "none";
    defaultView.style.display = "none";
    bodyEl.classList.add("viewing-section");
  });
}

if (showIdCardBtn && idCardSection && defaultView) {
  showIdCardBtn.addEventListener("click", () => {
    idCardSection.style.display = "block";
    studentResultsSection.style.display = "none";
    defaultView.style.display = "none";
    bodyEl.classList.add("viewing-section");
  });
}

if (resultsBackBtn) {
  resultsBackBtn.addEventListener("click", () => {
    studentResultsSection.style.display = "none";
    defaultView.style.display = "block";
    bodyEl.classList.remove("viewing-section");
  });
}

if (idBackBtn) {
  idBackBtn.addEventListener("click", () => {
    idCardSection.style.display = "none";
    defaultView.style.display = "block";
    bodyEl.classList.remove("viewing-section");
  });
}
