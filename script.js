// =========================================================
// Portfolio interactions
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.getElementById("navbar");
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  const navLinks = document.querySelectorAll(".nav-link");
  const backToTop = document.getElementById("backToTop");

  // ---------- Mobile menu ----------
  const setMenu = (open) => {
    navMenu.classList.toggle("open", open);
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  navToggle.addEventListener("click", () => {
    setMenu(!navMenu.classList.contains("open"));
  });

  // Close the menu after choosing a link
  navLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));

  // Close the menu when clicking outside it or pressing Escape
  document.addEventListener("click", (e) => {
    if (navMenu.classList.contains("open") && !navbar.contains(e.target)) setMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });

  // Reset the menu if the window is resized to desktop width
  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) setMenu(false);
  });

  // ---------- Navbar shadow + back-to-top button ----------
  const onScroll = () => {
    const y = window.scrollY;
    navbar.classList.toggle("scrolled", y > 10);
    backToTop.classList.toggle("show", y > 500);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ---------- Highlight the nav link of the section in view ----------
  const sections = document.querySelectorAll("main section[id]");

  // After a nav click, keep the clicked link highlighted while the page scrolls
  let lockUntil = 0;
  navLinks.forEach((link) =>
    link.addEventListener("click", () => {
      setActiveLink(link.getAttribute("href").slice(1), true);
      lockUntil = Date.now() + 1000;
    })
  );

  function setActiveLink(id, force = false) {
    if (!force && Date.now() < lockUntil) return;
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
    });
  }

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveLink(entry.target.id);
      });
    },
    // A section counts as "active" when it crosses the middle of the screen
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((section) => sectionObserver.observe(section));

  // The last section may be too short to reach the middle of the screen
  window.addEventListener("scroll", () => {
    const atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 4;
    if (atBottom) setActiveLink(sections[sections.length - 1].id);
  }, { passive: true });

  // ---------- Reveal elements on scroll ----------
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  // ---------- Profile photo fallback ----------
  // Shows the placeholder until assets/profile.jpg exists
  const profileImg = document.getElementById("profileImg");
  const showPlaceholder = () => profileImg.parentElement.classList.add("no-photo");
  profileImg.addEventListener("error", showPlaceholder);
  if (profileImg.complete && profileImg.naturalWidth === 0) showPlaceholder();

  // ---------- Resume file check ----------
  // If assets/resume.pdf hasn't been added yet, show a hint instead of a broken link.
  // (Only works when served over http, e.g. with Live Server.)
  const resumeLinks = document.querySelectorAll(".resume-link");
  const resumeNotice = document.getElementById("resumeNotice");

  if (location.protocol.startsWith("http") && resumeLinks.length) {
    fetch(resumeLinks[0].getAttribute("href"), { method: "HEAD" })
      .then((res) => {
        if (res.ok) return;
        resumeNotice.hidden = false;
        resumeLinks.forEach((link) =>
          link.addEventListener("click", (e) => {
            e.preventDefault();
            resumeNotice.scrollIntoView({ behavior: "smooth", block: "center" });
          })
        );
      })
      .catch(() => {});
  }

  // ---------- Project cards: click to show / hide the description ----------
  document.querySelectorAll(".project-card").forEach((card) => {
    const toggle = card.querySelector(".project-toggle");
    if (!toggle) return;
    const label = toggle.querySelector(".toggle-label");

    card.addEventListener("click", (e) => {
      if (e.target.closest("a")) return; // let links inside the card work normally
      const open = card.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      label.textContent = open ? "Hide details" : "View details";
    });
  });

  // ---------- Footer year ----------
  document.getElementById("year").textContent = new Date().getFullYear();
});
