// Mobile menu
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
menuBtn.addEventListener("click", () => navLinks.classList.toggle("open"));
navLinks.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => navLinks.classList.remove("open"))
);

// Countdown to 2026-08-15 16:00
const target = new Date("2026-08-15T16:00:00").getTime();
function updateCountdown() {
  const now = Date.now();
  let diff = target - now;
  if (diff < 0) diff = 0;
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);
  document.getElementById("d").textContent = String(d).padStart(2, "0");
  document.getElementById("h").textContent = String(h).padStart(2, "0");
  document.getElementById("m").textContent = String(m).padStart(2, "0");
  document.getElementById("s").textContent = String(s).padStart(2, "0");
}
updateCountdown();
setInterval(updateCountdown, 1000);

// Reveal on scroll
const reveals = document.querySelectorAll(".reveal");
const obs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("visible");
    });
  },
  { threshold: 0.15 }
);
reveals.forEach((el) => obs.observe(el));

// Contact form -> Supabase
const SUPABASE_URL = "https://hemvjkcnygxmxeetrwoi.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_gnImXdkgp-uBWMXZYMLvlQ_cu8DMyyW";
const sb = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nameInput = contactForm.querySelector('input[type="text"]');
    const emailInput = contactForm.querySelector('input[type="email"]');
    const msgInput = contactForm.querySelector("textarea");
    if (!sb) {
      alert("Supabase 클라이언트를 불러오지 못했습니다.");
      return;
    }
    const { error } = await sb.from("contacts").insert({
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      message: msgInput.value.trim(),
    });
    if (error) {
      alert("문의 접수 실패: " + error.message);
      return;
    }
    alert("문의가 접수되었습니다. 감사합니다!");
    contactForm.reset();
  });
}
