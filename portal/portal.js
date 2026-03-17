// =====================
// portal.js – Full Upgraded Version
// =====================

// ---------- Sample Students Data ----------
const students = [
  {
    id: "SS1001",
    password: "123456",
    name: "John Doe",
    class: "SS2",
    profilePicture: "images/student1.PNG", // can be PNG, JPG, JPEG, GIF
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
    profilePicture: "images/student2.jpg",
    results: [
      { subject: "Mathematics", score: 90, grade: "A+" },
      { subject: "English", score: 82, grade: "A" },
      { subject: "Biology", score: 88, grade: "A" },
      { subject: "History", score: 75, grade: "B+" },
    ],
  },
  {
    id: "SS1003",
    password: "qwerty",
    name: "Peter Obi",
    class: "SS2",
    profilePicture: "images/student3.jpeg",
    results: [
      { subject: "Mathematics", score: 80, grade: "B+" },
      { subject: "English", score: 77, grade: "B+" },
      { subject: "Biology", score: 85, grade: "A" },
      { subject: "History", score: 72, grade: "B" },
    ],
  },
  {
    id: "SS1004",
    password: "abc123",
    name: "Jane Doe",
    class: "SS3",
    profilePicture: "images/student4.gif",
    results: [
      { subject: "Mathematics", score: 95, grade: "A+" },
      { subject: "English", score: 88, grade: "A" },
      { subject: "Biology", score: 91, grade: "A" },
      { subject: "History", score: 80, grade: "A-" },
    ],
  },
];

// =====================
// LOGIN PAGE LOGIC
// =====================
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

// =====================
// DASHBOARD PAGE LOGIC
// =====================
const studentData = localStorage.getItem("loggedInStudent");

if (studentData) {
  const student = JSON.parse(studentData);

  // Welcome header
  const nameHeader = document.getElementById("student-name-header");
  if (nameHeader) nameHeader.textContent = `Welcome, ${student.name}`;

  // Student profile picture
  const profilePic = document.getElementById("student-profile");
  if (profilePic)
    profilePic.src = student.profilePicture || "images/default-profile.png";

  // Student info
  const idDisplay = document.getElementById("student-id-display");
  const nameDisplay = document.getElementById("student-name");
  const classDisplay = document.getElementById("student-class");
  if (idDisplay) idDisplay.textContent = student.id;
  if (nameDisplay) nameDisplay.textContent = student.name;
  if (classDisplay) classDisplay.textContent = student.class;

  // Student results
  const resultsTableBody = document.querySelector("#results-table tbody");
  if (resultsTableBody) {
    resultsTableBody.innerHTML = "";
    student.results.forEach((r) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${r.subject}</td><td>${r.score}</td><td>${r.grade}</td>`;
      resultsTableBody.appendChild(row);

      // Calculate Average Score
      let total = 0;

      student.results.forEach((r) => {
        total += r.score;
      });

      const average = (total / student.results.length).toFixed(2);

      const avgDisplay = document.getElementById("average-score");
      if (avgDisplay) avgDisplay.textContent = average;

      // Performance Level
      let performance = "Average";

      if (average >= 85) performance = "Excellent";
      else if (average >= 70) performance = "Very Good";
      else if (average >= 50) performance = "Good";
      else performance = "Needs Improvement";

      const performanceDisplay = document.getElementById("performance-level");
      if (performanceDisplay) performanceDisplay.textContent = performance;
    });
  }
}

// =====================
// LOGOUT
// =====================
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedInStudent");
    window.location.href = "./login.html";
  });
}

// =====================
// DASHBOARD PROTECTION
// =====================
if (document.getElementById("results-table") && !studentData) {
  alert("You must login first!");
  window.location.href = "./login.html";
}

// Toggle Sections
const showResultsBtn = document.getElementById("show-results-btn");
const showIdCardBtn = document.getElementById("show-id-card-btn");
const studentResultsSection = document.querySelector(".student-results");
const idCardSection = document.getElementById("id-card-section");

if (showResultsBtn && showIdCardBtn && studentResultsSection && idCardSection) {
  // Initially: show Results, hide ID Card
  studentResultsSection.style.display = "block";
  idCardSection.style.display = "none";

  // Show Results button
  showResultsBtn.addEventListener("click", () => {
    studentResultsSection.style.display = "block";
    idCardSection.style.display = "none";
  });

  // Show ID Card button
  showIdCardBtn.addEventListener("click", () => {
    studentResultsSection.style.display = "none";
    idCardSection.style.display = "block";
    idCardSection.scrollIntoView({ behavior: "smooth" });
  });
}
