// =============================
// BUTTON TOGGLE MESSAGE
// =============================

let toggled = false;
let btn = document.getElementById("perfom");
let msg = document.getElementById("msg");

btn.addEventListener("click", function () {
  if (!toggled) {
    msg.textContent = "I Luke loves coding very much, so help me God";
    msg.style.color = "rgb(248, 246, 244)";
    msg.style.backgroundColor = "transparent";
    msg.style.fontSize = "15px";
    toggled = true;
  } else {
    msg.textContent = "of mode";
    msg.style.color = "black";
    msg.style.backgroundColor = "transparent";
    msg.style.fontSize = "14px";
    toggled = false;
  }
});

// =============================
// NAVIGATION CONTENT MESSAGES
// =============================

let home = document.getElementById("homeLink");
let about = document.getElementById("aboutLink");
let project = document.getElementById("projectsLink");
let contact = document.getElementById("contactLink");

let contentMsg = document.getElementById("contentmsg");
contentMsg.style.position = "absolute";
contentMsg.style.top = "225px";
contentMsg.style.right = "50px";
contentMsg.style.borderRadius = "1rem";

// Function to change content message
function changeContent(text, color = "rgb(10,10,10)", bg = "rgb(235,235,235)") {
  contentMsg.textContent = text;
  contentMsg.style.color = color;
  contentMsg.style.backgroundColor = bg;
  contentMsg.style.fontSize = "16px";
}

// Attach click events
home.addEventListener("click", function (e) {
  e.preventDefault();
  changeContent(
    "Welcome to my home page, relax — we are prepared to equip you brother",
    "rgb(11,12,12)",
    "rgb(252,251,253)",
  );
});

about.addEventListener("click", function (e) {
  e.preventDefault();
  changeContent(
    "About me, I am Lord Luke",
    "rgb(11,12,12)",
    "rgb(252,251,253)",
  );
});

project.addEventListener("click", function (e) {
  e.preventDefault();
  changeContent(
    "We are building the most powerful AI platform — the future is here.",
    "rgb(12,14,13)",
    "rgb(252,253,255)",
  );
});

contact.addEventListener("click", function (e) {
  e.preventDefault();
  changeContent(
    "You really troubled me, I swear",
    "rgb(10,10,10)",
    "rgb(235,235,235)",
  );
});

// =============================
// PROFESSIONAL SLIDER (LIMITED FOR LIVE SERVER)
// =============================

// Limit to 5 images for smooth Live Server loading
const totalImages = 5;
let sliderImages = [];

// Generate image paths
for (let i = 1; i <= totalImages; i++) {
  sliderImages.push(`images/imag${i}.png`); // prefer PNG
}

// Preload images safely
let validImages = [];
let loadedCount = 0;

sliderImages.forEach((src) => {
  const img = new Image();
  img.src = src;
  img.onload = () => {
    validImages.push(src);
    loadedCount++;
    if (loadedCount === sliderImages.length) {
      startSlider();
      buildGallery();
    }
  };
  img.onerror = () => {
    loadedCount++;
    if (loadedCount === sliderImages.length) {
      startSlider();
      buildGallery();
    }
  };
});

// Start the slider
function startSlider() {
  if (validImages.length === 0) return;

  const slideImage = document.getElementById("slide-image");
  let index = 0;

  slideImage.src = validImages[0];

  setInterval(() => {
    index++;
    if (index >= validImages.length) index = 0;

    slideImage.style.opacity = 0;

    setTimeout(() => {
      slideImage.src = validImages[index];
      slideImage.style.opacity = 1;
    }, 400);
  }, 3500);
}

// =============================
// LIGHTBOX AND GALLERY
// =============================

let currentIndex = 0;

function buildGallery() {
  const grid = document.getElementById("gallery-grid");
  if (!grid) return;
  grid.innerHTML = "";

  validImages.forEach((src, index) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = "gallery image";

    img.onclick = () => openLightbox(index);

    grid.appendChild(img);
  });
}

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxClose = document.getElementById("lightbox-close");

function openLightbox(index) {
  currentIndex = index;
  lightbox.style.display = "block";
  lightboxImg.src = validImages[currentIndex];
  addHistory("Viewed image: " + validImages[currentIndex]);
}

document.getElementById("lightbox-next").onclick = () => {
  currentIndex++;
  if (currentIndex >= validImages.length) currentIndex = 0;
  lightboxImg.src = validImages[currentIndex];
};

document.getElementById("lightbox-prev").onclick = () => {
  currentIndex--;
  if (currentIndex < 0) currentIndex = validImages.length - 1;
  lightboxImg.src = validImages[currentIndex];
};

lightboxClose.onclick = () => {
  lightbox.style.display = "none";
};

lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) lightbox.style.display = "none";
});

// =============================
// HISTORY SYSTEM (LOCAL STORAGE)
// =============================

let historyList = document.getElementById("history-list");
let clearBtn = document.getElementById("clear-history");

function loadHistory() {
  let saved = localStorage.getItem("history");
  if (!saved) return;

  let items = JSON.parse(saved);
  items.forEach((text) => addHistory(text, false));
}

function addHistory(text, save = true) {
  if (!historyList) return;

  let li = document.createElement("li");
  li.textContent = text;
  historyList.prepend(li);

  if (save) saveHistory();
}

function saveHistory() {
  let items = [];
  historyList.querySelectorAll("li").forEach((li) => {
    items.push(li.textContent);
  });

  localStorage.setItem("history", JSON.stringify(items));
}

// Clear history button
if (clearBtn) {
  clearBtn.onclick = () => {
    localStorage.removeItem("history");
    historyList.innerHTML = "";
  };
}

// Load history on start
loadHistory();
