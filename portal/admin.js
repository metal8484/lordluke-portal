const admin = {
  username: "admin",
  password: "admin123",
};

const form = document.getElementById("admin-login-form");
const message = document.getElementById("admin-login-message");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("admin-username").value;
  const password = document.getElementById("admin-password").value;

  if (username === admin.username && password === admin.password) {
    localStorage.setItem("adminLoggedIn", "true");
    window.location.href = "admin-dashboard.html";
  } else {
    message.textContent = "Invalid admin login";
    message.style.color = "red";
  }
});
