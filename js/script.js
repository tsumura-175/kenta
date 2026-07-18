const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navigation = document.querySelector("[data-navigation]");
const meter = document.querySelector(".scroll-meter span");
const navLinks = [...document.querySelectorAll(".main-nav a")];
const revealItems = document.querySelectorAll(".reveal");
const parallaxItems = document.querySelectorAll("[data-parallax]");
const featuresStage = document.querySelector("[data-features-stage]");
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
const featuresIntro = document.querySelector(".features-intro");
const featureMotionItems = [...document.querySelectorAll("[data-feature-motion]")];
const SCROLL_OFFSET = 8;
const HERO_SLIDE_INTERVAL_MS = 6000;
let smoothScroll = null;
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

const initPreviewAuth = () => {
  if (!previewAuth.enabled) {
    unlockPreview();
    return;
  }

  if (sessionStorage.getItem(previewAuth.storageKey) === "true") {
    unlockPreview();
    return;
  }

  if (!authForm || !authStatus) return;

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
};

const closeMenu = () => {
  header?.classList.remove("is-open");
  menuToggle?.setAttribute("aria-expanded", "false");
};

const scrollToTarget = (target) => {
  if (!target || reducedMotion) return false;

  const offset = -((header?.offsetHeight || 0) + SCROLL_OFFSET);

  if (smoothScroll) {
    smoothScroll.scrollTo(target, { offset, duration: 1.15 });
    return true;
  }

  if (window.gsap && window.ScrollToPlugin) {
    gsap.to(window, {
      duration: 0.95,
      scrollTo: { y: target, offsetY: -offset },
      ease: "power3.out",
    });
    return true;
  }

  return false;
};

const initNavigation = () => {
  if (!header || !menuToggle || !navigation) return;

  menuToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navigation.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;

    const target = document.querySelector(link.getAttribute("href"));
    if (scrollToTarget(target)) event.preventDefault();
    closeMenu();
  });
};

const initContactForm = () => {
  if (!contactForm || !formStatus) return;

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formStatus.textContent = "送信先は仮設定のため、現在この内容は送信されません。";
  });

  contactForm.addEventListener("input", () => {
    formStatus.textContent = "";
  });
};

const initHeroCarousel = () => {
  if (heroSlides.length < 2 || reducedMotion) return;

  let activeHeroSlide = 0;

  window.setInterval(() => {
    heroSlides[activeHeroSlide].classList.remove("is-active");
    activeHeroSlide = (activeHeroSlide + 1) % heroSlides.length;
    heroSlides[activeHeroSlide].classList.add("is-active");

    if (heroPagination) {
      heroPagination.textContent = String(activeHeroSlide + 1).padStart(2, "0");
    }
  }, HERO_SLIDE_INTERVAL_MS);
};

const initBackToTop = () => {
  if (!backToTop) return;

  backToTop.addEventListener("click", () => {
    if (!reducedMotion && smoothScroll) {
      smoothScroll.scrollTo(0, { duration: 1.15 });
      return;
    }

    if (!reducedMotion && window.gsap && window.ScrollToPlugin) {
      gsap.to(window, { duration: 0.9, scrollTo: 0, ease: "power3.out" });
      return;
    }

    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });
};

const setupFeatureMotion = () => {
  if (!featureMotionItems.length || !featuresStage) return;

  if (reducedMotion || !window.gsap || !window.ScrollTrigger) {
    featureMotionItems.forEach((item) => {
      item.style.setProperty("--feature-opacity", "1");
      item.style.setProperty("--feature-blur", "0px");
      item.style.setProperty("--feature-photo-y", "0px");
      item.style.setProperty("--feature-copy-y", "0px");
      item.style.setProperty("--feature-stack-y", "0vh");
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  featuresStage.classList.add("is-motion-ready");

  featureMotionItems.forEach((item, index) => {
    gsap.set(item, {
      zIndex: featureMotionItems.length - index,
      "--feature-opacity": index === 0 ? 1 : 0,
      "--feature-blur": index === 0 ? "0px" : "16px",
      "--feature-photo-y": index === 0 ? "0px" : "92px",
      "--feature-copy-y": index === 0 ? "0px" : "72px",
      "--feature-stack-y": index === 0 ? "0vh" : "22vh",
    });
  });

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: featuresStage,
      start: "top top",
      end: () => `+=${window.innerHeight * (featureMotionItems.length * 0.78)}`,
      scrub: 1.15,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  featureMotionItems.forEach((item, index) => {
    if (index === 0) {
      timeline.to(
        item,
        {
          zIndex: featureMotionItems.length + 1,
          "--feature-opacity": 1,
          "--feature-blur": "0px",
          "--feature-photo-y": "0px",
          "--feature-copy-y": "0px",
          "--feature-stack-y": "0vh",
          duration: 0.45,
          ease: "none",
        },
        0,
      );
    } else {
      timeline.to(
        item,
        {
          zIndex: featureMotionItems.length + 1,
          "--feature-opacity": 1,
          "--feature-blur": "0px",
          "--feature-photo-y": "0px",
          "--feature-copy-y": "0px",
          "--feature-stack-y": "0vh",
          duration: 0.62,
          ease: "power2.out",
        },
        index - 0.34,
      );
    }

    if (index < featureMotionItems.length - 1) {
      timeline.to(
        item,
        {
          "--feature-opacity": 0,
          "--feature-blur": "14px",
          "--feature-photo-y": "-56px",
          "--feature-copy-y": "-44px",
          "--feature-stack-y": "-9vh",
          duration: 0.48,
          ease: "power1.in",
        },
        index + 0.5,
      );
    }
  });
};

const setupGsapScroll = () => {
  if (!window.gsap || !window.ScrollTrigger) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    featureMotionItems.forEach((item) => {
      item.style.setProperty("--feature-opacity", "1");
      item.style.setProperty("--feature-blur", "0px");
      item.style.setProperty("--feature-photo-y", "0px");
      item.style.setProperty("--feature-copy-y", "0px");
      item.style.setProperty("--feature-stack-y", "0vh");
    });
    updateActiveNavigation();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (window.ScrollToPlugin) gsap.registerPlugin(ScrollToPlugin);

  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      if (meter) meter.style.transform = `scaleX(${self.progress})`;
      header?.classList.toggle("is-scrolled", self.scroll() > 20);
      backToTop?.classList.toggle("is-visible", hero ? self.scroll() > hero.offsetHeight * 0.82 : self.scroll() > 500);
      updateActiveNavigation();
    },
  });

  revealItems.forEach((item) => {
    ScrollTrigger.create({
      trigger: item,
      start: "top 88%",
      once: true,
      onEnter: () => item.classList.add("is-visible"),
    });
  });

  if (!reducedMotion) {
    parallaxItems.forEach((item) => {
      const speed = Number(item.dataset.parallax || 0);
      gsap.to(item, {
        "--parallax-shift": `${Math.max(8, speed * 240)}px`,
        ease: "none",
        scrollTrigger: {
          trigger: item,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });
  }

  setupFeatureMotion();
};

const setupSmoothScroll = () => {
  if (reducedMotion || !window.Lenis) return;

  smoothScroll = new Lenis({
    duration: 1.05,
    easing: (progress) => Math.min(1, 1.001 - 2 ** (-10 * progress)),
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1,
  });

  if (window.gsap && window.ScrollTrigger) {
    smoothScroll.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => smoothScroll.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    return;
  }

  const raf = (time) => {
    smoothScroll.raf(time);
    window.requestAnimationFrame(raf);
  };

  window.requestAnimationFrame(raf);
};

const navSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const updateActiveNavigation = () => {
  if (!navSections.length || !header) return;

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

initPreviewAuth();
initNavigation();
initContactForm();
initHeroCarousel();
initBackToTop();
setupGsapScroll();
setupSmoothScroll();

window.addEventListener("load", () => {
  document.body.classList.add("is-ready");
  window.ScrollTrigger?.refresh();
});
