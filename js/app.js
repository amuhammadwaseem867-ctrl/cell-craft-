(() => {
  "use strict";

  const { whatsapp, currency } = window.CELLCRAFT;
  const PRODUCTS = window.PRODUCTS;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const money = (n) => `${currency} ${n.toLocaleString("en-ZA")}`;
  const waLink = (msg) => `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`;
  const label = (p) => (p.badge ? `${p.name} (${p.badge})` : p.name);
  const orderMsg = (p) =>
    `Hi CellCraft! I'm interested in the ${label(p)} listed at ${money(p.price)}. Is it available?`;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* Device render: used where no product photo is available.
     A clean back-of-device illustration in the right style. */
  function deviceSVG(p) {
    const uid = `d${p.id}`;
    const apple = p.brand === "Apple";
    const pro = p.id === "ipxr18";
    const body = apple ? (pro ? ["#3b3a3f", "#1d1c20"] : ["#2a2a2d", "#111113"]) : ["#3a4150", "#1c2029"];
    const lens = (cx, cy, r) => `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#0b0b0c" stroke="#55545a" stroke-width="2"/>
      <circle cx="${cx}" cy="${cy}" r="${r * 0.55}" fill="url(#${uid}l)"/>
      <circle cx="${cx - r * 0.25}" cy="${cy - r * 0.25}" r="${r * 0.16}" fill="#fff" opacity=".35"/>`;
    let camera;
    if (pro) {
      camera = `<rect x="22" y="22" width="78" height="78" rx="20" fill="#2b2a2f" stroke="#4a4950" stroke-width="1.5"/>
        ${lens(44, 44, 14)}${lens(44, 78, 14)}${lens(78, 61, 14)}
        <circle cx="80" cy="34" r="4" fill="#d9cfb8" opacity=".7"/>`;
    } else if (apple) {
      camera = `${lens(38, 38, 15)}<circle cx="62" cy="34" r="4" fill="#d9cfb8" opacity=".7"/>`;
    } else {
      camera = `${lens(34, 36, 12)}${lens(34, 66, 12)}${lens(34, 96, 12)}<circle cx="56" cy="36" r="3.5" fill="#d9cfb8" opacity=".7"/>`;
    }
    const mark = apple
      ? ""
      : `<text x="110" y="330" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" letter-spacing="3" fill="#f4efe6" opacity=".45">SAMSUNG</text>`;
    return `<svg viewBox="0 0 220 420" role="img" aria-label="${esc(p.name)}">
      <defs>
        <linearGradient id="${uid}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${body[0]}"/><stop offset="1" stop-color="${body[1]}"/></linearGradient>
        <linearGradient id="${uid}s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".3" stop-color="#fff" stop-opacity="0"/></linearGradient>
        <radialGradient id="${uid}l"><stop offset="0" stop-color="#3a4d7a"/><stop offset="1" stop-color="#05060a"/></radialGradient>
      </defs>
      <g>
        <rect x="6" y="6" width="208" height="408" rx="${apple && !pro ? 34 : 30}" fill="url(#${uid}b)"/>
        <rect x="6" y="6" width="208" height="408" rx="${apple && !pro ? 34 : 30}" fill="url(#${uid}s)"/>
        <rect x="6.5" y="6.5" width="207" height="407" rx="${apple && !pro ? 33.5 : 29.5}" fill="none" stroke="#fff" stroke-opacity=".12"/>
        ${apple && !pro ? '<path d="M6 60h208M6 360h208" stroke="#fff" stroke-opacity=".07" stroke-width="3"/>' : ""}
        ${camera}
        ${mark}
      </g>
    </svg>`;
  }

  const media = (p, cls = "") =>
    p.img
      ? `<img class="${cls}" src="assets/phones/${p.img}.jpg" alt="${esc(p.name)}" loading="lazy" decoding="async">`
      : deviceSVG(p);

  /* Flagships */
  function renderFlagships() {
    const picks = PRODUCTS.filter((p) => p.flagship);
    $("#flagshipGrid").innerHTML = picks
      .map(
        (p) => `
      <article class="flag reveal">
        <div class="flag__img">${media(p)}</div>
        <div>
          <span class="flag__brand">${p.brand === "Apple" ? "Apple iPhone" : "Samsung Galaxy"} · ${p.year}</span>
          <h3>${esc(p.name)}</h3>
          <ul>
            <li>${esc(p.specs.Display)}</li>
            <li>${esc(p.specs.Processor)}</li>
            <li>${esc(p.specs["Rear camera"])}</li>
          </ul>
          <div class="flag__price"><small>From</small>${money(p.price)}</div>
          <div class="flag__actions">
            <a class="btn btn--gold btn--sm" href="${waLink(orderMsg(p))}" target="_blank" rel="noopener">Order on WhatsApp</a>
            <button class="btn btn--ghost btn--sm" data-open="${p.id}">Full specs</button>
          </div>
        </div>
      </article>`
      )
      .join("");
  }

  /* Collection */
  const state = { brand: "all", q: "", sort: "featured", min: 0, max: Infinity };

  function filtered() {
    const q = state.q.trim().toLowerCase();
    let list = PRODUCTS.filter((p) => {
      if (state.brand !== "all" && p.brand !== state.brand) return false;
      if (p.price < state.min || p.price >= state.max) return false;
      if (q) {
        const hay = `${p.brand} ${p.name} ${p.series} ${p.badge || ""} ${Object.values(p.specs).join(" ")}`.toLowerCase();
        return q.split(/\s+/).every((t) => hay.includes(t));
      }
      return true;
    });
    const by = {
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      newest: (a, b) => b.year - a.year || b.price - a.price,
    }[state.sort];
    if (by) list = [...list].sort(by);
    return list;
  }

  function card(p, i) {
    const isNew = p.year >= 2025;
    return `
    <article class="card" style="animation-delay:${Math.min(i, 12) * 40}ms">
      <div class="card__stage" data-open="${p.id}" role="button" tabindex="0" aria-label="View ${esc(label(p))} specs">
        ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}
        ${isNew ? `<span class="badge badge--new">New</span>` : ""}
        ${media(p)}
      </div>
      <div class="card__body">
        <div class="card__meta"><b>${p.brand === "Apple" ? "iPhone" : "Galaxy"}</b><span>${p.year}</span></div>
        <h3>${esc(p.name)}</h3>
        <div class="card__tags">${p.highlights.map((h) => `<span>${esc(h)}</span>`).join("")}</div>
        <div class="card__foot">
          <div class="price"><small>From</small>${money(p.price)}</div>
          <div class="card__btns">
            <button class="round" data-open="${p.id}" aria-label="Specs for ${esc(label(p))}">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 6h16M4 12h10M4 18h7"/></svg>
            </button>
            <a class="round round--gold" href="${waLink(orderMsg(p))}" target="_blank" rel="noopener" aria-label="Order ${esc(label(p))} on WhatsApp">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </a>
          </div>
        </div>
      </div>
    </article>`;
  }

  function renderGrid() {
    const list = filtered();
    $("#results").textContent = `Showing ${list.length} of ${PRODUCTS.length} phones`;
    $("#grid").innerHTML = list.length
      ? list.map(card).join("")
      : `<div class="empty"><h3>No phones match.</h3><p>Try another search, or <a class="gold-text" href="${waLink("Hi CellCraft! I'm looking for a phone that isn't on the site.")}" target="_blank" rel="noopener">ask us on WhatsApp</a>. We may be able to source it.</p></div>`;
  }

  /* Modal */
  const modal = $("#modal");
  function openModal(id) {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) return;
    $("#modalBody").innerHTML = `
      <div class="modal__stage">${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}${media(p)}</div>
      <div class="modal__info">
        <p class="eyebrow" style="margin:0">${p.brand === "Apple" ? "Apple iPhone" : "Samsung Galaxy"} · ${p.year}</p>
        <h2 id="mTitle">${esc(p.name)}</h2>
        ${p.note ? `<p class="modal__note">${esc(p.note)}</p>` : ""}
        <div class="modal__price"><strong>${money(p.price)}</strong><span>Starting price</span></div>
        <table class="specs"><tbody>
          ${Object.entries(p.specs).map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}
          ${p.badge ? `<tr><th scope="row">Condition</th><td>${esc(p.badge)}</td></tr>` : ""}
        </tbody></table>
        <div class="modal__actions">
          <a class="btn btn--gold btn--block" href="${waLink(orderMsg(p))}" target="_blank" rel="noopener">Order on WhatsApp</a>
          <a class="btn btn--ghost btn--block" href="${waLink(`Hi CellCraft! What storage and colours do you have for the ${label(p)}?`)}" target="_blank" rel="noopener">Ask about colours &amp; storage</a>
        </div>
      </div>`;
    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
  }
  const closeModal = () => (modal.close ? modal.close() : modal.removeAttribute("open"));

  /* Wiring */
  function bind() {
    // WhatsApp links throughout the static markup
    $$(".js-wa").forEach((a) => {
      a.href = waLink(a.dataset.msg || "Hi CellCraft!");
      a.target = "_blank";
      a.rel = "noopener";
    });

    // Brand tabs
    const setBrand = (b) => {
      state.brand = b;
      $$(".tab").forEach((t) => t.classList.toggle("is-active", t.dataset.brand === b));
      renderGrid();
    };
    $$(".tab").forEach((t) => t.addEventListener("click", () => setBrand(t.dataset.brand)));
    $$("[data-jump]").forEach((a) => a.addEventListener("click", () => { setBrand(a.dataset.jump); closeMenu(); }));

    // Budget chips
    $$(".budget").forEach((b) =>
      b.addEventListener("click", () => {
        state.min = Number(b.dataset.min);
        state.max = b.dataset.max === "Infinity" ? Infinity : Number(b.dataset.max);
        $$(".budget").forEach((x) => x.classList.toggle("is-active", x === b));
        renderGrid();
      })
    );

    // Search + sort
    let t;
    $("#q").addEventListener("input", (e) => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value; renderGrid(); }, 120); });
    $("#sort").addEventListener("change", (e) => { state.sort = e.target.value; renderGrid(); });
    $("#openSearch").addEventListener("click", () => {
      $("#collection").scrollIntoView({ behavior: "smooth" });
      setTimeout(() => $("#q").focus({ preventScroll: true }), 500);
    });

    // Modal open (delegated) + close
    document.addEventListener("click", (e) => {
      const o = e.target.closest("[data-open]");
      if (o) openModal(o.dataset.open);
    });
    document.addEventListener("keydown", (e) => {
      const o = e.target.closest && e.target.closest(".card__stage[data-open]");
      if (o && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openModal(o.dataset.open); }
    });
    $("#modalClose").addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

    // Mobile menu
    const burger = $("#burger"), menu = $("#mobileMenu");
    function closeMenu() { menu.hidden = true; burger.setAttribute("aria-expanded", "false"); }
    burger.addEventListener("click", () => {
      const open = menu.hidden;
      menu.hidden = !open;
      burger.setAttribute("aria-expanded", String(open));
    });
    $$("a", menu).forEach((a) => a.addEventListener("click", closeMenu));
  }

  function reveal() {
    const els = $$(".reveal");
    if (!("IntersectionObserver" in window)) return els.forEach((el) => el.classList.add("is-in"));
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
  }

  /* Effects */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function countUp(el, to, fmt = (n) => n) {
    if (reduceMotion) { el.textContent = fmt(to); return; }
    const dur = 1600, t0 = performance.now();
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = fmt(Math.round(to * e));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function scrollProgress() {
    const bar = $("#progress");
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    };
    addEventListener("scroll", update, { passive: true });
    update();
  }

  function cardFx() {
    if (!finePointer || reduceMotion) return;
    const grid = $("#grid");
    grid.addEventListener("pointermove", (e) => {
      const c = e.target.closest(".card");
      if (!c) return;
      const r = c.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.setProperty("--mx", `${x * 100}%`);
      c.style.setProperty("--my", `${y * 100}%`);
      c.style.setProperty("--rx", `${(0.5 - y) * 6}deg`);
      c.style.setProperty("--ry", `${(x - 0.5) * 8}deg`);
    });
    grid.addEventListener("pointerout", (e) => {
      const c = e.target.closest(".card");
      if (c && !c.contains(e.relatedTarget)) { c.style.removeProperty("--rx"); c.style.removeProperty("--ry"); }
    });
  }

  function heroParallax() {
    if (!finePointer || reduceMotion) return;
    const stage = $(".hero__stage"), phones = $("#heroPhones");
    $(".hero").addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / r.width;
      const y = (e.clientY - (r.top + r.height / 2)) / r.height;
      phones.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 10}deg)`;
    });
    $(".hero").addEventListener("pointerleave", () => (phones.style.transform = ""));
  }

  /* Preloader */
  function preloader(onDone) {
    const el = $("#preloader"), bar = $("#plBar"), pct = $("#plPct");
    if (!el) return onDone();
    const t0 = performance.now();
    const MIN = reduceMotion ? 200 : 2300;   // let the logo animation play
    const MAX = 7000;                         // never trap the visitor
    let loaded = document.readyState === "complete", shown = 0, finished = false;
    addEventListener("load", () => (loaded = true), { once: true });

    const step = () => {
      const elapsed = performance.now() - t0;
      const target = loaded && elapsed >= MIN ? 100 : Math.min(92, (elapsed / MIN) * 92);
      shown += (target - shown) * 0.12;
      if (target === 100 && shown > 99.4) shown = 100;
      bar.style.transform = `scaleX(${shown / 100})`;
      pct.textContent = Math.floor(shown);
      if (shown >= 100 || elapsed > MAX) return finish();
      requestAnimationFrame(step);
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      bar.style.transform = "scaleX(1)";
      pct.textContent = "100";
      setTimeout(() => {
        el.classList.add("is-done");                       // gold + dark curtains rise
        setTimeout(() => {
          document.body.classList.remove("is-loading");
          el.classList.add("is-leaving");                  // wipe preloader away
          onDone();
          setTimeout(() => el.remove(), 1100);
        }, reduceMotion ? 0 : 1150);
      }, 250);
    };
    requestAnimationFrame(step);
  }

  /* Boot */
  const minPrice = Math.min(...PRODUCTS.map((p) => p.price));
  $("#statModels").textContent = "0";
  $("#statFrom").textContent = money(0);
  $("#year").textContent = new Date().getFullYear();

  renderFlagships();
  renderGrid();
  bind();
  scrollProgress();
  cardFx();
  heroParallax();

  preloader(() => {
    document.body.classList.add("is-ready");
    reveal();
    countUp($("#statModels"), PRODUCTS.length);
    countUp($("#statFrom"), minPrice, money);
  });
})();
