document.addEventListener("DOMContentLoaded", () => {

  /* ===== SCROLL REVEAL (Intersection Observer) ===== */
  const revealElements = document.querySelectorAll("[data-reveal]");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  /* ===== ANIMATED COUNTERS ===== */
  const statNumbers = document.querySelectorAll("[data-count]");

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute("data-count"), 10);
          animateCounter(el, target);
          counterObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.3 }
  );

  statNumbers.forEach((el) => counterObserver.observe(el));

  function animateCounter(el, target) {
    const duration = 1800;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current + "+";

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  /* ===== HEADER SCROLL EFFECT ===== */
  const header = document.getElementById("site-header");
  let lastScroll = 0;

  function handleHeaderScroll() {
    const scrollY = window.scrollY;

    if (scrollY > 60) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    lastScroll = scrollY;
  }

  window.addEventListener("scroll", handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  /* ===== ACTIVE NAV LINK HIGHLIGHTING ===== */
  const navLinks = document.querySelectorAll(".site-nav a, .mobile-menu-overlay a");
  const sections = document.querySelectorAll("section[id]");

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          navLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
          });
        }
      });
    },
    { threshold: 0.3, rootMargin: "-80px 0px -40% 0px" }
  );

  sections.forEach((section) => navObserver.observe(section));

  /* ===== MOBILE HAMBURGER MENU ===== */
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll("a") : [];

   if (menuToggle && mobileMenu) {
    const closeBtn = document.getElementById("mobile-menu-close");

    const toggleMenu = (shouldOpen) => {
      menuToggle.classList.toggle("active", shouldOpen);
      mobileMenu.classList.toggle("open", shouldOpen);
      document.body.style.overflow = shouldOpen ? "hidden" : "";
    };

    menuToggle.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.contains("open");
      toggleMenu(!isOpen);
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        toggleMenu(false);
      });
    }

    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        toggleMenu(false);
      });
    });

    // Close on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileMenu.classList.contains("open")) {
        toggleMenu(false);
      }
    });
  }



  /* ===== DETAILS TOGGLE ===== */
  const detailButtons = document.querySelectorAll(".details-toggle");

  detailButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-target");
      const panel = document.getElementById(targetId);
      if (!panel) return;
      const isOpen = panel.classList.toggle("active");
      button.textContent = isOpen ? "Hide details" : "View more details";
    });
  });

  /* ===== CONTACT FORM ===== */
  const contactForm = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");

  if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!formStatus) return;

      formStatus.textContent = "Sending message...";
      formStatus.style.color = "var(--text-secondary)";

      const formData = new FormData(contactForm);
      const payload = {
        name: formData.get("name")?.toString().trim(),
        email: formData.get("email")?.toString().trim(),
        message: formData.get("message")?.toString().trim(),
      };

      let backendUrl = 'https://weblance-backend.onrender.com';
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        backendUrl = window.location.port === '3000' ? '' : 'http://localhost:3000';
      } else if (window.location.protocol === 'file:') {
        backendUrl = 'http://localhost:3000';
      }

      const fetchWithTimeout = (url, options = {}) => {
        const controller = new AbortController();
        const timeout = options.timeout || 15000;
        const timer = setTimeout(() => controller.abort(), timeout);

        return fetch(url, { ...options, signal: controller.signal })
          .finally(() => clearTimeout(timer));
      };

      try {
        const response = await fetchWithTimeout(`${backendUrl}/api/contact`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          timeout: 15000,
        });

        const result = await response.json().catch(() => ({ error: 'Unexpected server response.' }));

        if (response.ok) {
          formStatus.textContent = "Message sent successfully. I will contact you soon.";
          formStatus.style.color = "#8b5cf6";
          contactForm.reset();
        } else {
          formStatus.textContent = result.error || "Unable to send your message right now.";
          formStatus.style.color = "#f97316";
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          formStatus.textContent = "Request timed out. Please try again.";
        } else {
          formStatus.textContent = "Network error. Please try again later.";
        }
        formStatus.style.color = "#f97316";
      }
    });
  }

  /* ===== SMOOTH SCROLL FOR ANCHOR LINKS ===== */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const headerHeight = header ? header.offsetHeight + 24 : 80;

      window.scrollTo({
        top: target.offsetTop - headerHeight,
        behavior: "smooth",
      });
    });
  });

});
