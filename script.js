const root = document.documentElement;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (prefersReducedMotion.matches) {
  document.body.classList.add("no-scroll-smooth");
}

try {
  const storedTheme = localStorage.getItem("portfolio-theme");
  if (storedTheme) {
    root.dataset.theme = storedTheme;
  }
} catch {
  // Local storage can be blocked in some browser privacy modes.
}

function updateThemeColor() {
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (!themeColor) return;
  themeColor.setAttribute("content", root.dataset.theme === "dark" ? "#151126" : "#fff4d6");
}

updateThemeColor();

document.getElementById("themeToggle")?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = nextTheme;
  updateThemeColor();

  try {
    localStorage.setItem("portfolio-theme", nextTheme);
  } catch {
    // Ignore storage errors; the toggle still works for the current session.
  }
});

const revealElements = [...document.querySelectorAll(".reveal")];

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const navLinks = [...document.querySelectorAll(".site-nav a")];
const navSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = navLinks.find((item) => item.getAttribute("href") === `#${entry.target.id}`);
        if (entry.isIntersecting && link) {
          navLinks.forEach((item) => item.classList.remove("is-active"));
          link.classList.add("is-active");
        }
      });
    },
    { rootMargin: "-35% 0px -55% 0px" }
  );

  navSections.forEach((section) => navObserver.observe(section));
}

const counters = [...document.querySelectorAll("[data-count]")];

counters.forEach((metric) => {
  const runCounter = () => {
    const target = Number(metric.dataset.count);
    let current = 0;
    const increment = Math.max(1, Math.ceil(target / 28));

    const step = () => {
      current += increment;
      metric.textContent = String(Math.min(current, target));
      if (current < target) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window) {
    const metricObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        runCounter();
        metricObserver.disconnect();
      },
      { threshold: 0.8 }
    );

    metricObserver.observe(metric);
  } else {
    runCounter();
  }
});

const skillTabs = [...document.querySelectorAll("[data-skill-group]")];
const skillPanels = [...document.querySelectorAll("[data-skill-panel]")];

skillTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const group = tab.dataset.skillGroup;

    skillTabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });

    skillPanels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.skillPanel === group);
    });
  });
});

const impactNote = document.getElementById("impactNote");
const impactCards = [...document.querySelectorAll("[data-impact]")];

impactCards.forEach((card) => {
  card.addEventListener("click", () => {
    impactCards.forEach((item) => item.classList.remove("is-selected"));
    card.classList.add("is-selected");
    if (impactNote) impactNote.textContent = card.dataset.impact;
  });

  card.addEventListener("pointermove", (event) => {
    if (prefersReducedMotion.matches) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (event.clientY - rect.top - rect.height / 2) / rect.height;
    card.style.transform = `translateY(-5px) rotateX(${y * -4}deg) rotateY(${x * 4}deg)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

document.querySelector("[data-focus-project]")?.addEventListener("click", () => {
  const firstCard = impactCards[0];
  firstCard?.focus();
  firstCard?.click();
});

document.querySelector("[data-copy-email]")?.addEventListener("click", async (event) => {
  const button = event.currentTarget;
  const status = button.querySelector("strong");

  try {
    await navigator.clipboard.writeText("bsbhavana.04@gmail.com");
    if (status) status.textContent = "Copied";
  } catch {
    if (status) status.textContent = "bsbhavana.04@gmail.com";
  }

  window.setTimeout(() => {
    if (status) status.textContent = "Ready";
  }, 2200);
});

function setupInteractiveBoard() {
  const stage = document.querySelector(".mood-stage");
  if (!stage) return;

  const note = document.getElementById("consoleNote");
  const draggables = [...stage.querySelectorAll("[data-draggable]")];
  const resetButton = document.querySelector("[data-reset-stage]");
  const sparkButton = document.querySelector("[data-spark]");
  const defaultNote = note?.textContent?.trim() || "Drag the characters or memory orbs.";
  let activeDrag = null;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const setNote = (message) => {
    if (!note || !message) return;
    note.textContent = message;
  };

  const placeElementAtCurrentPosition = (element) => {
    const stageRect = stage.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    element.style.left = `${rect.left - stageRect.left}px`;
    element.style.top = `${rect.top - stageRect.top}px`;
    element.style.right = "auto";
    element.style.bottom = "auto";
    return { stageRect, rect };
  };

  draggables.forEach((element) => {
    element.addEventListener("pointerdown", (event) => {
      if (event.button !== undefined && event.button !== 0) return;

      const { stageRect, rect } = placeElementAtCurrentPosition(element);
      const pointerStart = { x: event.clientX, y: event.clientY };

      activeDrag = {
        element,
        stageRect,
        width: rect.width,
        height: rect.height,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
        pointerStart,
        moved: false
      };

      element.classList.add("is-dragging");
      element.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    });

    element.addEventListener("pointermove", (event) => {
      if (!activeDrag || activeDrag.element !== element) return;

      const distance = Math.hypot(
        event.clientX - activeDrag.pointerStart.x,
        event.clientY - activeDrag.pointerStart.y
      );
      activeDrag.moved = activeDrag.moved || distance > 4;

      const x = clamp(
        event.clientX - activeDrag.stageRect.left - activeDrag.offsetX,
        6,
        activeDrag.stageRect.width - activeDrag.width - 6
      );
      const y = clamp(
        event.clientY - activeDrag.stageRect.top - activeDrag.offsetY,
        6,
        activeDrag.stageRect.height - activeDrag.height - 6
      );

      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
    });

    const endDrag = (event) => {
      if (!activeDrag || activeDrag.element !== element) return;
      element.classList.remove("is-dragging");
      element.releasePointerCapture?.(event.pointerId);

      if (activeDrag.moved) {
        element.dataset.dragged = "true";
        setNote(element.dataset.message);
        window.setTimeout(() => {
          element.dataset.dragged = "false";
        }, 120);
      }

      activeDrag = null;
    };

    element.addEventListener("pointerup", endDrag);
    element.addEventListener("pointercancel", endDrag);

    element.addEventListener("click", (event) => {
      if (element.dataset.dragged === "true") {
        event.preventDefault();
        return;
      }
      setNote(element.dataset.message);
    });

    element.addEventListener("keydown", (event) => {
      const keyMap = {
        ArrowUp: [0, -14],
        ArrowDown: [0, 14],
        ArrowLeft: [-14, 0],
        ArrowRight: [14, 0]
      };

      if (!keyMap[event.key]) return;
      event.preventDefault();

      const { stageRect, rect } = placeElementAtCurrentPosition(element);
      const [dx, dy] = keyMap[event.key];
      const x = clamp(rect.left - stageRect.left + dx, 6, stageRect.width - rect.width - 6);
      const y = clamp(rect.top - stageRect.top + dy, 6, stageRect.height - rect.height - 6);
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
      setNote(element.dataset.message);
    });
  });

  resetButton?.addEventListener("click", () => {
    draggables.forEach((element) => {
      element.classList.remove("is-dragging");
      element.style.left = "";
      element.style.top = "";
      element.style.right = "";
      element.style.bottom = "";
      element.dataset.dragged = "false";
    });
    setNote(defaultNote);
  });

  sparkButton?.addEventListener("click", () => {
    if (prefersReducedMotion.matches) {
      setNote("Sparkles are paused because reduced motion is enabled.");
      return;
    }

    const stageRect = stage.getBoundingClientRect();
    const count = stageRect.width < 520 ? 18 : 30;

    for (let index = 0; index < count; index += 1) {
      const sparkle = document.createElement("span");
      sparkle.className = "sparkle";
      const startX = stageRect.width * (0.35 + Math.random() * 0.3);
      const startY = stageRect.height * (0.38 + Math.random() * 0.22);
      const endX = `${(Math.random() - 0.5) * stageRect.width * 0.85}px`;
      const endY = `${(Math.random() - 0.5) * stageRect.height * 0.68}px`;
      sparkle.style.left = `${startX}px`;
      sparkle.style.top = `${startY}px`;
      sparkle.style.setProperty("--spark-x", endX);
      sparkle.style.setProperty("--spark-y", endY);
      sparkle.style.animationDelay = `${Math.random() * 140}ms`;
      stage.appendChild(sparkle);
      window.setTimeout(() => sparkle.remove(), 1100);
    }

    setNote("Sparkles released. The board is ready for another delivery memory.");
  });
}

function createHeroScene() {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  const pointer = { x: 0, y: 0, active: false };
  let width = 0;
  let height = 0;
  let memories = [];
  let streams = [];
  let animationFrame = 0;

  const getPalette = () => {
    const style = getComputedStyle(root);
    return ["--joy", "--spark", "--calm", "--focus", "--growth", "--warm"].map((token) =>
      style.getPropertyValue(token).trim()
    );
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(rect.width, 320);
    height = Math.max(rect.height, 480);
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const palette = getPalette();
    const count = width < 720 ? 36 : 68;

    memories = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.24,
      vy: (Math.random() - 0.5) * 0.24,
      radius: 4 + Math.random() * 10,
      color: palette[index % palette.length],
      phase: Math.random() * Math.PI * 2
    }));

    streams = Array.from({ length: 5 }, (_, index) => ({
      y: height * (0.12 + index * 0.18),
      speed: 0.18 + index * 0.03,
      color: palette[index % palette.length],
      phase: Math.random() * Math.PI * 2
    }));
  };

  const drawMemory = (memory, time) => {
    const shimmer = Math.sin(time + memory.phase) * 0.18 + 0.82;
    const gradient = context.createRadialGradient(
      memory.x - memory.radius * 0.35,
      memory.y - memory.radius * 0.45,
      memory.radius * 0.12,
      memory.x,
      memory.y,
      memory.radius
    );
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.88)");
    gradient.addColorStop(0.24, memory.color);
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    context.globalAlpha = 0.16 + shimmer * 0.42;
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(memory.x, memory.y, memory.radius * (1.6 + shimmer * 0.2), 0, Math.PI * 2);
    context.fill();
    context.globalAlpha = 1;
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);
    const time = performance.now() * 0.001;

    streams.forEach((stream, index) => {
      context.globalAlpha = 0.18;
      context.strokeStyle = stream.color;
      context.lineWidth = 1.3;
      context.beginPath();

      for (let x = -20; x <= width + 20; x += 20) {
        const y = stream.y + Math.sin(x * 0.012 + time * stream.speed + stream.phase) * (18 + index * 4);
        if (x === -20) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      }

      context.stroke();
      context.globalAlpha = 1;
    });

    memories.forEach((memory, index) => {
      if (!prefersReducedMotion.matches) {
        memory.x += memory.vx + Math.sin(time + memory.phase) * 0.05;
        memory.y += memory.vy + Math.cos(time + memory.phase) * 0.05;

        if (memory.x < -30) memory.x = width + 30;
        if (memory.x > width + 30) memory.x = -30;
        if (memory.y < -30) memory.y = height + 30;
        if (memory.y > height + 30) memory.y = -30;

        if (pointer.active) {
          const dx = memory.x - pointer.x;
          const dy = memory.y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 150 && distance > 0) {
            memory.x += (dx / distance) * 0.55;
            memory.y += (dy / distance) * 0.55;
          }
        }
      }

      for (let nextIndex = index + 1; nextIndex < memories.length; nextIndex += 1) {
        const next = memories[nextIndex];
        const distance = Math.hypot(memory.x - next.x, memory.y - next.y);
        if (distance < 126) {
          context.strokeStyle = `rgba(123, 97, 255, ${0.12 - distance / 1200})`;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(memory.x, memory.y);
          context.lineTo(next.x, next.y);
          context.stroke();
        }
      }

      drawMemory(memory, time);
    });

    animationFrame = requestAnimationFrame(draw);
  };

  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = true;
  });

  canvas.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  window.addEventListener("resize", resize);
  resize();
  animationFrame = requestAnimationFrame(draw);

  const restart = () => {
    cancelAnimationFrame(animationFrame);
    resize();
    animationFrame = requestAnimationFrame(draw);
    document.body.classList.toggle("no-scroll-smooth", prefersReducedMotion.matches);
  };

  if (typeof prefersReducedMotion.addEventListener === "function") {
    prefersReducedMotion.addEventListener("change", restart);
  } else if (typeof prefersReducedMotion.addListener === "function") {
    prefersReducedMotion.addListener(restart);
  }
}

setupInteractiveBoard();
createHeroScene();
