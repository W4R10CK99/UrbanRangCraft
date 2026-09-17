const slides = [...document.querySelectorAll(".photo-slide")];
const dots = document.getElementById("dots");
const count = document.getElementById("slide-count");
let current = 0;
let timer;

slides.forEach((_, i) => {
  const button = document.createElement("button");
  button.setAttribute("aria-label", `Go to project ${i + 1}`);
  button.addEventListener("click", () => showSlide(i));
  dots.appendChild(button);
});

function showSlide(index) {
  current = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => slide.classList.toggle("active", i === current));
  [...dots.children].forEach((dot, i) => dot.classList.toggle("active", i === current));
  count.textContent = `${String(current + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
}
function next(){showSlide(current + 1)}
function prev(){showSlide(current - 1)}
document.querySelector(".next").addEventListener("click", next);
document.querySelector(".prev").addEventListener("click", prev);
document.addEventListener("keydown", e => {
  if (e.key === "ArrowRight") next();
  if (e.key === "ArrowLeft") prev();
});
function startAutoplay(){timer=setInterval(next,5000)}
function stopAutoplay(){clearInterval(timer)}
const carousel=document.querySelector(".photo-carousel");
carousel.addEventListener("mouseenter",stopAutoplay);
carousel.addEventListener("mouseleave",startAutoplay);
showSlide(0);
startAutoplay();

const themeToggle=document.querySelector(".theme-toggle");
const themeIcon=document.querySelector(".theme-icon");
const themeLabel=document.querySelector(".theme-label");

function applyTheme(theme){
  document.documentElement.dataset.theme=theme;
  const dark=theme==="dark";
  themeToggle.setAttribute("aria-pressed",String(dark));
  themeToggle.setAttribute("aria-label",dark ? "Switch to light mode" : "Switch to dark mode");
  themeIcon.textContent=dark ? "☀" : "☾";
  themeLabel.textContent=dark ? "Light" : "Dark";
}

const savedTheme=localStorage.getItem("urbanrang-theme");
applyTheme(savedTheme==="dark" ? "dark" : "light");

themeToggle.addEventListener("click",()=>{
  const nextTheme=document.documentElement.dataset.theme==="dark" ? "light" : "dark";
  localStorage.setItem("urbanrang-theme",nextTheme);
  applyTheme(nextTheme);
});

document.getElementById("year").textContent=new Date().getFullYear();
