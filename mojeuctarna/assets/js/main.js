(() => {
  "use strict";
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [
    ...root.querySelectorAll(selector),
  ];

  const header = $(".site-header");
  if (header) {
    let compact = false;
    const updateHeader = () => {
      const y = Number(window.scrollY) || 0;
      // Hysteresis prevents the height change from toggling back at the same scroll offset.
      if (!compact && y > 72) compact = true;
      else if (compact && y < 12) compact = false;
      header.classList.toggle("is-scrolled", compact);
    };
    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();
  }

  // Navigation remains available if JavaScript is disabled.
  const menu = $(".menu-toggle");
  const navigation = $("#navigation");
  if (menu && navigation) {
    document.documentElement.classList.add("nav-ready");
    const closeMenu = () => {
      menu.setAttribute("aria-expanded", "false");
      navigation.classList.remove("is-open");
    };
    menu.addEventListener("click", () => {
      const open = menu.getAttribute("aria-expanded") !== "true";
      menu.setAttribute("aria-expanded", String(open));
      navigation.classList.toggle("is-open", open);
      if (open) $("a", navigation).focus({ preventScroll: true });
    });
    navigation.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        menu.getAttribute("aria-expanded") === "true"
      ) {
        closeMenu();
        menu.focus();
      }
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".site-header")) closeMenu();
    });
    const wideScreen = window.matchMedia("(min-width: 1051px)");
    wideScreen.addEventListener("change", closeMenu);
    if ("IntersectionObserver" in window) {
      const links = $$("a", navigation);
      const sections = links.map((link) => $(link.hash)).filter(Boolean);
      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries.filter((entry) => entry.isIntersecting);
          if (!visible.length) return;
          const active = visible.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          )[0];
          links.forEach((link) => {
            if (link.hash === `#${active.target.id}`)
              link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        },
        { rootMargin: "-18% 0px -58% 0px" },
      );
      sections.forEach((section) => observer.observe(section));
    }
  }

  // The same thirty SVG pieces form ten paper receipts, then become the logo rows.
  // There is no separate pile to fade away before a replacement logo appears.
  const signature = $("#signature");
  if (signature) {
    const strips = $$(".bowl-strip", signature);
    const line = $(".growth-line", signature);
    const segments = $$(".line-segment", signature);
    const arrow = $(".arrow-head", signature);
    const note = $(".sorted-note", signature);
    const replay = $(".replay", signature);
    let animations = [];
    let finishTimer;
    let generation = 0;
    const cancel = () => {
      generation += 1;
      window.clearTimeout(finishTimer);
      animations.forEach((animation) => animation.cancel());
      animations = [];
    };
    const finalState = () => {
      cancel();
      strips.forEach((strip) => {
        strip.style.transform = "none";
        $(".strip-paper", strip).style.opacity = "0";
        $(".strip-color", strip).style.opacity = "1";
      });
      segments.forEach((segment) => {
        segment.style.transform = "scaleX(1)";
      });
      [line, arrow, note].forEach((element) => {
        element.style.opacity = "1";
      });
      replay.disabled = false;
    };
    const sourceMatrix = (strip) => {
      const d = strip.dataset;
      const x = Number(d.x),
        y = Number(d.y),
        width = Number(d.width);
      const part = Number(d.part),
        angle = (Number(d.angle) * Math.PI) / 180;
      const sx = Number(d.sourceX),
        sy = Number(d.sourceY) - part * 68;
      const cos = Math.cos(angle),
        sin = Math.sin(angle);
      const a = (cos * 160) / width,
        b = (sin * 160) / width;
      const c = (-sin * 68) / 17.16,
        eY = (cos * 68) / 17.16;
      return [
        a,
        b,
        c,
        eY,
        sx - sin * part * 68 - a * x - c * y,
        sy + cos * part * 68 - b * x - eY * y,
      ];
    };
    const matrix = (values) => `matrix(${values.join(",")})`;
    const initialState = () => {
      strips.forEach((strip) => {
        strip.style.transform = matrix(sourceMatrix(strip));
        $(".strip-paper", strip).style.opacity = "1";
        $(".strip-color", strip).style.opacity = "0";
      });
      [line, arrow, note].forEach((element) => {
        element.style.opacity = "0";
      });
    };
    const animate = (element, frames, options) => {
      animations.push(element.animate(frames, { fill: "both", ...options }));
    };
    const play = () => {
      if (motion.matches || !Element.prototype.animate) {
        finalState();
        return;
      }
      cancel();
      initialState();
      replay.disabled = true;
      const currentGeneration = generation;
      strips.forEach((strip) => {
        const start = sourceMatrix(strip);
        const arrival = [...start];
        arrival[5] -= 24;
        const cut = [...start];
        const part = Number(strip.dataset.part);
        cut[4] += (part - 1) * 20;
        cut[5] += (part - 1) * 18;
        const delay = Number(strip.dataset.receipt) * 20;
        const timing = {
          duration: 3400,
          delay,
          easing: "cubic-bezier(.35,0,.2,1)",
        };
        animate(
          strip,
          [
            { transform: matrix(arrival), offset: 0 },
            { transform: matrix(start), offset: 0.12 },
            { transform: matrix(start), offset: 0.36 },
            { transform: matrix(cut), offset: 0.49 },
            { transform: "matrix(1,0,0,1,0,0)", offset: 1 },
          ],
          timing,
        );
        // Both layers live inside this one moving strip. Paper stays opaque while
        // its branded color is introduced; at no point do they both disappear.
        animate(
          $(".strip-paper", strip),
          [
            { opacity: 1, offset: 0 },
            { opacity: 1, offset: 0.55 },
            { opacity: 0, offset: 0.93 },
            { opacity: 0, offset: 1 },
          ],
          timing,
        );
        animate(
          $(".strip-color", strip),
          [
            { opacity: 0, offset: 0 },
            { opacity: 0, offset: 0.42 },
            { opacity: 1, offset: 0.7 },
            { opacity: 1, offset: 1 },
          ],
          timing,
        );
      });
      animate(line, [{ opacity: 0 }, { opacity: 1 }], {
        duration: 150,
        delay: 3430,
      });
      segments.forEach((segment, i) => {
        animate(
          segment,
          [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
          {
            duration: 250,
            delay: 3440 + i * 115,
            easing: "ease-out",
          },
        );
      });
      animate(arrow, [{ opacity: 0 }, { opacity: 1 }], {
        duration: 160,
        delay: 4060,
      });
      animate(
        note,
        [
          { opacity: 0, transform: "translateY(8px) rotate(-3deg)" },
          { opacity: 1, transform: "translateY(0) rotate(-3deg)" },
        ],
        { duration: 350, delay: 4100, easing: "ease-out" },
      );
      finishTimer = window.setTimeout(() => {
        if (generation === currentGeneration) finalState();
      }, 4500);
    };
    replay.addEventListener("click", play);
    motion.addEventListener("change", () => {
      if (motion.matches) finalState();
    });
    if (motion.matches || !Element.prototype.animate) finalState();
    else {
      initialState();
      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              observer.disconnect();
              play();
            }
          },
          { threshold: 0.25 },
        );
        observer.observe(signature);
      } else play();
    }
  }

  // Rychlý kontakt na telefonu: lišta Zavolat / Napsat nám se ukáže, až je úvod
  // pryč z obrazovky, a schová se, když je vidět kontakt nebo patička.
  const quick = $(".mobile-cta");
  const phoneWidth = window.matchMedia("(max-width: 560px)");
  if (quick && "IntersectionObserver" in window) {
    const watched = [$(".hero"), $("#kontakt"), $(".site-footer")].filter(Boolean);
    const inView = new Set();
    const update = () => {
      const show = phoneWidth.matches && watched.length === 3 && inView.size === 0;
      quick.classList.toggle("is-visible", show);
    };
    const quickObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) inView.add(entry.target);
        else inView.delete(entry.target);
      });
      update();
    });
    watched.forEach((section) => quickObserver.observe(section));
    phoneWidth.addEventListener("change", update);
  }

  const steps = $$(".workflow-step");
  if (steps.length) {
    let step = 0;
    let captureTimer;
    const panels = $$(".demo-panel");
    const captions = [
      "01 / Vyfotíte doklad",
      "02 / Najdete ho v přehledu",
      "03 / Zaplatíte pomocí QR",
    ];
    const setStep = (next) => {
      clearTimeout(captureTimer);
      const shutter = $(".shutter");
      shutter.disabled = false;
      step = (next + steps.length) % steps.length;
      steps.forEach((button, i) =>
        button.setAttribute("aria-pressed", String(i === step)),
      );
      panels.forEach((panel, i) => {
        panel.hidden = i !== step;
      });
      $("#demo-caption").textContent = captions[step];
      $(".demo-next").firstChild.textContent =
        step === 2 ? "Zpět na začátek " : "Další krok ";
      if (!motion.matches && Element.prototype.animate) {
        panels[step].animate(
          [
            { opacity: 0, transform: "translateY(8px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 250, easing: "ease-out" },
        );
      }
    };
    steps.forEach((button, i) =>
      button.addEventListener("click", () => setStep(i)),
    );
    $(".demo-next").addEventListener("click", () => setStep(step + 1));
    $(".shutter").addEventListener("click", () => {
      $(".shutter").disabled = true;
      if (!motion.matches && Element.prototype.animate) {
        $(".capture-flash").animate(
          [{ opacity: 0 }, { opacity: 0.85, offset: 0.2 }, { opacity: 0 }],
          { duration: 260 },
        );
      }
      captureTimer = window.setTimeout(
        () => {
          setStep(1);
          $("#demo-caption").textContent =
            "Doklad je v přehledu. Zkuste ho vyhledat.";
          // Keep the keyboard focus on a visible control after the shutter disappears.
          $(".demo-next").focus({ preventScroll: true });
        },
        motion.matches ? 0 : 320,
      );
    });
    $("#demo-search").addEventListener("input", (event) => {
      const normalize = (value) =>
        value
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLocaleLowerCase("cs");
      const term = normalize(event.target.value.trim());
      const rows = $$(".doc-row");
      rows.forEach((row) => {
        row.hidden = !normalize(row.dataset.document).includes(term);
      });
      $("#demo-empty").hidden = rows.some((row) => !row.hidden);
    });
    $(".demo-pay").addEventListener("click", (event) => {
      const explanation = $(".payment-explanation");
      explanation.hidden = !explanation.hidden;
      event.currentTarget.setAttribute(
        "aria-expanded",
        String(!explanation.hidden),
      );
    });
    // A deliberately nonfunctional illustration: no encoded bank details or payment.
    const svg = $(".demo-qr");
    const ns = "http://www.w3.org/2000/svg";
    const addPixel = (x, y, width = 1, height = 1, fill = "#1e1e1e") => {
      const rect = document.createElementNS(ns, "rect");
      Object.entries({ x, y, width, height, fill }).forEach(([key, value]) =>
        rect.setAttribute(key, value),
      );
      svg.append(rect);
    };
    [
      [1, 1],
      [21, 1],
      [1, 21],
    ].forEach(([x, y]) => {
      addPixel(x, y, 7, 7);
      addPixel(x + 1, y + 1, 5, 5, "#fff");
      addPixel(x + 2, y + 2, 3, 3);
    });
    for (let y = 1; y < 28; y++) {
      for (let x = 1; x < 28; x++) {
        const finder =
          (x < 9 && y < 9) || (x > 19 && y < 9) || (x < 9 && y > 19);
        if (!finder && (x * 13 + y * 7 + x * y) % 5 < 2) addPixel(x, y);
      }
    }
  }

  // Native details stay usable without JS. One open answer per group reduces clutter.
  [".faq-list", ".connections > div"].forEach((selector) => {
    const group = $(selector);
    if (!group) return;
    $$("details", group).forEach((detail) =>
      detail.addEventListener("toggle", () => {
        if (detail.open)
          $$("details", group).forEach((other) => {
            if (other !== detail) other.open = false;
          });
      }),
    );
  });

  const form = $("#contact-form");
  if (form) {
    const phone = $("#phone");
    const email = $("#email");
    const status = $("#form-status");
    const fallback = $("#form-fallback");
    const submit = $(".form-submit", form);
    let sending = false;
    const validateContact = () => {
      const valid = phone.value.trim() || email.value.trim();
      email.setCustomValidity(
        valid
          ? ""
          : "Vyplňte prosím telefon nebo e-mail, abychom se vám mohli ozvat.",
      );
    };
    [phone, email].forEach((input) =>
      input.addEventListener("input", validateContact),
    );
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (sending) return;
      validateContact();
      if (!form.reportValidity()) return;
      status.textContent = "Odesíláme váš vzkaz…";
      fallback.hidden = true;
      submit.disabled = true;
      submit.setAttribute("aria-busy", "true");
      sending = true;
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 15000);
      try {
        if (!/^https?:$/.test(window.location.protocol))
          throw new Error("preview");
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
          signal: controller.signal,
          credentials: "same-origin",
        });
        if (
          !(response.headers.get("content-type") || "").includes(
            "application/json",
          )
        )
          throw new Error("preview");
        const data = await response.json();
        if (!response.ok || !data.ok) {
          const safeMessages = {
            invalid_name: "Doplňte prosím své jméno (nejvýše 100 znaků).",
            invalid_contact:
              "Zkontrolujte prosím telefon nebo e-mail. Stačí jeden z nich.",
            invalid_message: "Zpráva může mít nejvýše 3 000 znaků.",
            too_large: "Vzkaz je příliš dlouhý. Zkraťte ho prosím.",
          };
          status.textContent =
            safeMessages[data.code] ||
            "Vzkaz se nepodařilo odeslat. Vaše údaje zůstaly ve formuláři.";
          fallback.hidden = false;
          return;
        }
        status.textContent = "Děkujeme, vzkaz dorazil. Ozveme se vám.";
        form.reset();
        email.setCustomValidity("");
      } catch {
        const localPreview =
          ["localhost", "127.0.0.1", "[::1]"].includes(
            window.location.hostname,
          ) || window.location.protocol === "file:";
        status.textContent = localPreview
          ? "V tomto náhledu se zprávy neodesílají. Napište nám prosím přímo e-mailem nebo zavolejte."
          : "Spojení se nepodařilo. Vaše údaje zůstaly vyplněné. Zkuste to znovu nebo nás kontaktujte přímo.";
        fallback.hidden = false;
      } finally {
        window.clearTimeout(timeout);
        sending = false;
        submit.disabled = false;
        submit.removeAttribute("aria-busy");
      }
    });
  }
})();
