import { animate, inView, scroll, stagger } from "https://cdn.jsdelivr.net/npm/motion@12.23.24/+esm";

const config = window.BUFFET_CONFIG || {};
const number = String(config.WHATSAPP_NUMBER || "").replace(/\D/g, "");
const message = encodeURIComponent(
  config.WHATSAPP_MESSAGE ||
    "Olá! Gostaria de solicitar um orçamento com o Buffet Karla Rios."
);
const waUrl = number ? `https://wa.me/${number}?text=${message}` : "#contato";

document.querySelectorAll("[data-whatsapp]").forEach((el) => {
  el.setAttribute("href", waUrl);
});

document.querySelectorAll("[data-whatsapp-display]").forEach((el) => {
  el.textContent = config.WHATSAPP_DISPLAY || el.textContent;
});

const igUrl =
  config.INSTAGRAM_URL || "https://www.instagram.com/karla.cintia.almeida";
const igHandle = config.INSTAGRAM_HANDLE || "@karla.cintia.almeida";
["instagram-link", "instagram-link-footer"].forEach((id) => {
  const link = document.getElementById(id);
  if (!link) return;
  link.href = igUrl;
  if (id === "instagram-link") link.textContent = igHandle;
});

const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

const header = document.querySelector(".site-header");
const onScrollHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};
onScrollHeader();
window.addEventListener("scroll", onScrollHeader, { passive: true });

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setupMotion() {
  if (reduceMotion) {
    document
      .querySelectorAll(
        ".hero-animate, .motion-reveal, .photo-strip__item, .fab-whatsapp"
      )
      .forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
    return;
  }

  const heroItems = document.querySelectorAll(".hero-animate");
  animate(
    heroItems,
    { opacity: [0, 1], y: [28, 0], filter: ["blur(6px)", "blur(0px)"] },
    {
      delay: stagger(0.12, { startDelay: 0.15 }),
      duration: 0.9,
      easing: [0.22, 1, 0.36, 1],
    }
  );

  const heroImg = document.querySelector(".hero__img");
  if (heroImg) {
    animate(heroImg, { scale: [1.1, 1] }, { duration: 1.6, easing: [0.22, 1, 0.36, 1] });
    scroll(
      animate(heroImg, { y: [0, 80] }, { easing: "linear" }),
      { target: document.querySelector(".hero"), offset: ["start start", "end start"] }
    );
  }

  const ctaImg = document.querySelector(".cta-final__img");
  if (ctaImg) {
    scroll(
      animate(ctaImg, { scale: [1.08, 1] }, { easing: "linear" }),
      {
        target: document.querySelector(".cta-final"),
        offset: ["start end", "end start"],
      }
    );
  }

  document.querySelectorAll(".motion-reveal").forEach((el) => {
    inView(
      el,
      () => {
        animate(
          el,
          { opacity: [0, 1], y: [36, 0] },
          { duration: 0.85, easing: [0.22, 1, 0.36, 1] }
        );
      },
      { amount: 0.2, margin: "0px 0px -8% 0px" }
    );
  });

  const strip = document.querySelector(".photo-strip");
  if (strip) {
    const items = strip.querySelectorAll(".photo-strip__item");
    inView(
      strip,
      () => {
        animate(
          items,
          { opacity: [0, 1], y: [40, 0], scale: [0.96, 1] },
          {
            delay: stagger(0.14),
            duration: 0.9,
            easing: [0.22, 1, 0.36, 1],
          }
        );
      },
      { amount: 0.25 }
    );
  }

  const fab = document.querySelector(".fab-whatsapp");
  if (fab) {
    animate(
      fab,
      { opacity: [0, 1], scale: [0.7, 1], y: [20, 0] },
      { delay: 1.1, duration: 0.55, easing: [0.34, 1.4, 0.64, 1] }
    );
  }
}

setupMotion();
