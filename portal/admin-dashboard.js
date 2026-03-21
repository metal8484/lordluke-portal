document.addEventListener("DOMContentLoaded", function () {
  // ---------- Admin Login Check ----------
  if (!localStorage.getItem("adminLoggedIn")) {
    alert("Access denied! Please login as admin.");
    window.location.href = "admin.html";
  }

  // ---------- Logout ----------
  function logout() {
    localStorage.removeItem("adminLoggedIn");
    window.location.href = "admin.html";
  }
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  // ---------- Load Students ----------
  let students = JSON.parse(localStorage.getItem("students")) || [
    {
      id: "SS1001",
      password: "123456",
      name: "John Doe",
      class: "SS2",
      email: "johndoe@example.com",
      profilePicture: "images/student1.PNG",
      gallery: ["images/student1.PNG"],
      results: [],
    },
    {
      id: "SS1002",
      password: "abcdef",
      name: "Mary Jane",
      class: "SS3",
      email: "maryjane@example.com",
      profilePicture: "images/student2.jpg",
      gallery: ["images/student2.jpg"],
      results: [],
    },
  ];

  // ---------- Add Student Result ----------
  const addResultForm = document.getElementById("add-result-form");
  const addResultMessage = document.getElementById("add-result-message");

  if (addResultForm) {
    addResultForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const studentId = document
        .getElementById("student-id-input")
        .value.trim();
      const subject = document.getElementById("subject-input").value.trim();
      const score = parseFloat(document.getElementById("score-input").value);

      if (!studentId || !subject || isNaN(score)) {
        addResultMessage.textContent = "Please fill all fields correctly.";
        addResultMessage.style.color = "red";
        return;
      }

      const student = students.find((s) => s.id === studentId);
      if (!student) {
        addResultMessage.textContent = "Student not found!";
        addResultMessage.style.color = "red";
        return;
      }

      // Calculate grade
      let grade = "";
      if (score >= 90) grade = "A+";
      else if (score >= 85) grade = "A";
      else if (score >= 70) grade = "B";
      else if (score >= 50) grade = "C";
      else grade = "F";

      student.results.push({ subject, score, grade });
      localStorage.setItem("students", JSON.stringify(students));

      addResultMessage.textContent = `Result added for ${student.name} (${subject})!`;
      addResultMessage.style.color = "green";
      addResultForm.reset();
      updateStudentsTable();
    });
  }

  // ---------- Students Table ----------
  const studentsTable = document.getElementById("students-table");

  // ---------- Modal Elements ----------
  const editModal = document.getElementById("edit-modal");
  const modalStudentName = document.getElementById("modal-student-name");
  const modalSubjects = document.getElementById("modal-subjects");
  const modalNewScore = document.getElementById("modal-new-score");
  const modalSaveBtn = document.getElementById("modal-save-btn");
  const modalCancelBtn = document.getElementById("modal-cancel-btn");
  let currentEditingStudent = null;
  let currentEditingSubjectIndex = null;

  function updateStudentsTable() {
    if (!studentsTable) return;
    studentsTable.innerHTML = `<tr>
            <th>ID</th><th>Name</th><th>Class</th><th>Email</th><th>Results Count</th><th>Action</th>
        </tr>`;
    students.forEach((s, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${s.id}</td><td>${s.name}</td><td>${s.class}</td>
            <td>${s.email}</td><td>${s.results.length}</td>
            <td><button class="edit-btn" data-index="${index}">Edit</button></td>`;
      studentsTable.appendChild(row);
    });

    const editButtons = document.querySelectorAll(".edit-btn");
    editButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const studentIndex = e.target.getAttribute("data-index");
        const student = students[studentIndex];
        if (!student.results.length) {
          alert(`${student.name} has no results to edit.`);
          return;
        }
        const lastSubjectIndex = student.results.length - 1;
        openEditModal(studentIndex, lastSubjectIndex);
      });
    });
  }

  // ---------- Open Modal ----------
  function openEditModal(studentIndex, subjectIndex) {
    currentEditingStudent = students[studentIndex];
    currentEditingSubjectIndex = subjectIndex;

    modalStudentName.textContent = `Edit ${currentEditingStudent.name}'s Score`;
    const subject = currentEditingStudent.results[subjectIndex];
    modalSubjects.textContent = `${subject.subject} (current: ${subject.score})`;
    modalNewScore.value = subject.score;

    editModal.style.display = "flex";
  }

  // ---------- Close Modal ----------
  function closeEditModal() {
    editModal.style.display = "none";
    currentEditingStudent = null;
    currentEditingSubjectIndex = null;
  }

  modalSaveBtn.addEventListener("click", function () {
    const newScore = parseFloat(modalNewScore.value);
    if (isNaN(newScore) || newScore < 0 || newScore > 100) {
      alert("Score must be 0-100");
      return;
    }

    let grade = "";
    if (newScore >= 90) grade = "A+";
    else if (newScore >= 85) grade = "A";
    else if (newScore >= 70) grade = "B";
    else if (newScore >= 50) grade = "C";
    else grade = "F";

    currentEditingStudent.results[currentEditingSubjectIndex].score = newScore;
    currentEditingStudent.results[currentEditingSubjectIndex].grade = grade;

    localStorage.setItem("students", JSON.stringify(students));
    updateStudentsTable();
    closeEditModal();
  });

  modalCancelBtn.addEventListener("click", closeEditModal);

  // ---------- Initial Table Load ----------
  updateStudentsTable();
});
