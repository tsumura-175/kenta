const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navigation = document.querySelector("[data-navigation]");
const meter = document.querySelector(".scroll-meter span");
const navLinks = [...document.querySelectorAll(".main-nav a")];
const revealItems = document.querySelectorAll(".reveal");
const parallaxItems = document.querySelectorAll("[data-parallax]");
const authGate = document.querySelector("[data-auth-gate]");
const authForm = document.querySelector("[data-auth-form]");
const authStatus = document.querySelector("[data-auth-status]");
const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");
const backToTop = document.querySelector("[data-back-to-top]");
const hero = document.querySelector(".hero");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const heroSlides = [...document.querySelectorAll(".hero-slide")];
const heroPagination = document.querySelector("[data-hero-pagination] span");
const isGitHubPages = window.location.hostname.endsWith(".github.io");
const previewAuth = {
  enabled: isGitHubPages,
  id: "test",
  password: "test",
  storageKey: "swim-preview-authenticated",
};

const unlockPreview = () => {
  document.body.classList.remove("auth-locked");
  authGate?.setAttribute("aria-hidden", "true");
};

if (!previewAuth.enabled) {
  unlockPreview();
} else if (sessionStorage.getItem(previewAuth.storageKey) === "true") {
  unlockPreview();
}

if (authForm && authStatus && previewAuth.enabled) {
  authForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(authForm);
    const id = String(formData.get("id") || "").trim();
    const password = String(formData.get("password") || "").trim();

    if (id === previewAuth.id && password === previewAuth.password) {
      sessionStorage.setItem(previewAuth.storageKey, "true");
      unlockPreview();
      return;
    }

    authStatus.textContent = "IDまたはパスワードが違います。";
  });

  authForm.addEventListener("input", () => {
    authStatus.textContent = "";
  });
}

const closeMenu = () => {
  header.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
};

menuToggle.addEventListener("click", () => {
  const isOpen = header.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formStatus.textContent = "送信先は仮設定のため、現在この内容は送信されません。";
  });

  contactForm.addEventListener("input", () => {
    formStatus.textContent = "";
  });
}

if (heroSlides.length > 1 && !reducedMotion) {
  let activeHeroSlide = 0;

  window.setInterval(() => {
    heroSlides[activeHeroSlide].classList.remove("is-active");
    activeHeroSlide = (activeHeroSlide + 1) % heroSlides.length;
    heroSlides[activeHeroSlide].classList.add("is-active");

    if (heroPagination) {
      heroPagination.textContent = String(activeHeroSlide + 1).padStart(2, "0");
    }
  }, 6000);
}

if (backToTop && hero) {
  const backToTopObserver = new IntersectionObserver(
    ([entry]) => {
      backToTop.classList.toggle("is-visible", !entry.isIntersecting);
    },
    { threshold: 0 },
  );

  backToTopObserver.observe(hero);

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -7% 0px" },
);

revealItems.forEach((item) => revealObserver.observe(item));

const navSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const updateActiveNavigation = () => {
  if (!navSections.length) return;

  const firstSectionTop = navSections[0].offsetTop - header.offsetHeight;

  if (window.scrollY < firstSectionTop) {
    navLinks.forEach((link) => link.classList.remove("is-active"));
    return;
  }

  const activationPoint = window.scrollY + window.innerHeight * 0.32;
  let activeSection = navSections[0];

  navSections.forEach((section) => {
    if (section.offsetTop <= activationPoint) activeSection = section;
  });

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${activeSection.id}`);
  });
};

const updateScrollState = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;

  meter.style.transform = `scaleX(${progress})`;
  header.classList.toggle("is-scrolled", window.scrollY > 20);
  updateActiveNavigation();

  if (!reducedMotion) {
    parallaxItems.forEach((item) => {
      const speed = Number(item.dataset.parallax || 0);
      const bounds = item.getBoundingClientRect();
      const viewportOffset = bounds.top + bounds.height / 2 - window.innerHeight / 2;
      const shift = Math.max(-28, Math.min(28, viewportOffset * speed * -0.12));
      item.style.setProperty("--parallax-shift", `${shift}px`);
    });
  }
};

let isTicking = false;

window.addEventListener(
  "scroll",
  () => {
    if (isTicking) return;

    window.requestAnimationFrame(() => {
      updateScrollState();
      isTicking = false;
    });
    isTicking = true;
  },
  { passive: true },
);

window.addEventListener("resize", updateScrollState);
window.addEventListener("load", () => {
  document.body.classList.add("is-ready");
  updateScrollState();
});
