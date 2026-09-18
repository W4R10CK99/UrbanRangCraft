const carousel = document.querySelector(".photo-carousel");
const dots = document.getElementById("dots");
const count = document.getElementById("slide-count");
const previousButton = document.querySelector(".prev");
const nextButton = document.querySelector(".next");
let slides = [];
let current = 0;
let timer;

function showSlide(index) {
  if (!slides.length) return;
  current = (index + slides.length) % slides.length;
  slides.forEach((slide, slideIndex) => slide.classList.toggle("active", slideIndex === current));
  [...dots.children].forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === current));
  count.textContent = `${String(current + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
}

function stopAutoplay() {
  window.clearInterval(timer);
  timer = undefined;
}

function startAutoplay() {
  stopAutoplay();
  if (slides.length > 1) timer = window.setInterval(() => showSlide(current + 1), 5000);
}

function setupCarousel() {
  slides = [...carousel.querySelectorAll(".photo-slide")];
  current = 0;
  dots.replaceChildren();
  slides.forEach((_, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `Go to project ${index + 1}`);
    button.addEventListener("click", () => {
      showSlide(index);
      startAutoplay();
    });
    dots.append(button);
  });
  showSlide(0);
  startAutoplay();
}

function resolveAsset(path, contentUrl) {
  return new URL(path, contentUrl).href;
}

function renderProjects(projects, contentUrl) {
  carousel.querySelectorAll(".photo-slide").forEach((slide) => slide.remove());
  projects.forEach((project, index) => {
    if (!project || typeof project.src !== "string") return;
    const slide = document.createElement("div");
    slide.className = "photo-slide";
    const image = document.createElement("img");
    image.src = resolveAsset(project.src, contentUrl);
    image.alt = project.alt || `Urbanrang Craft project ${index + 1}`;
    image.loading = "lazy";
    image.decoding = "async";
    const label = document.createElement("span");
    label.textContent = project.title || `PROJECT ${String(index + 1).padStart(2, "0")}`;
    slide.append(image, label);
    carousel.insertBefore(slide, previousButton);
  });
  setupCarousel();
}

function renderReels(reels, contentUrl) {
  const reelTrack = document.getElementById("reel-track");
  const reelsSection = reelTrack.closest(".reels-section");
  reelsSection.hidden = !reels.length;
  if (!reels.length) return;
  reelTrack.replaceChildren();
  reels.forEach((reel, index) => {
    if (!reel || typeof reel.src !== "string") return;
    const card = document.createElement("article");
    card.className = "reel-card";
    const video = document.createElement("video");
    video.src = resolveAsset(reel.src, contentUrl);
    video.poster = reel.poster ? resolveAsset(reel.poster, contentUrl) : "";
    video.controls = true;
    video.preload = "none";
    video.playsInline = true;
    video.setAttribute("aria-label", reel.title || `Urbanrang Craft reel ${index + 1}`);
    const label = document.createElement("span");
    label.textContent = reel.title || `REEL ${String(index + 1).padStart(2, "0")}`;
    card.append(video, label);
    reelTrack.append(card);
  });
}

async function loadPortfolioContent() {
  const hero = document.querySelector(".hero");
  const contentUrl = hero.dataset.contentUrl;
  try {
    const response = await fetch(contentUrl, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Content request failed: ${response.status}`);
    const content = await response.json();
    if (content.hero?.src) {
      const heroImage = document.getElementById("hero-image");
      heroImage.src = resolveAsset(content.hero.src, contentUrl);
      heroImage.alt = content.hero.alt || heroImage.alt;
    }
    if (Array.isArray(content.projects) && content.projects.length) renderProjects(content.projects, contentUrl);
    if (Array.isArray(content.reels)) renderReels(content.reels, contentUrl);
  } catch (error) {
    console.warn("Portfolio content could not be loaded. Showing built-in fallback content.", error);
  }
}

previousButton.addEventListener("click", () => { showSlide(current - 1); startAutoplay(); });
nextButton.addEventListener("click", () => { showSlide(current + 1); startAutoplay(); });
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") showSlide(current + 1);
  if (event.key === "ArrowLeft") showSlide(current - 1);
});
carousel.addEventListener("mouseenter", stopAutoplay);
carousel.addEventListener("mouseleave", startAutoplay);
setupCarousel();
loadPortfolioContent();

const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = document.querySelector(".theme-icon");
const themeLabel = document.querySelector(".theme-label");
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const dark = theme === "dark";
  themeToggle.setAttribute("aria-pressed", String(dark));
  themeToggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  themeIcon.textContent = dark ? "☀" : "☾";
  themeLabel.textContent = dark ? "Light" : "Dark";
}
const savedTheme = localStorage.getItem("urbanrang-theme");
applyTheme(savedTheme === "dark" ? "dark" : "light");
themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("urbanrang-theme", nextTheme);
  applyTheme(nextTheme);
});
document.getElementById("year").textContent = new Date().getFullYear();
