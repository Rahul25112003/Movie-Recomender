(() => {
  "use strict";

  /* ───────────── Config & helpers ───────────── */
  const API = (window.API_BASE || "").replace(/\/$/, "");
  const TMDB_IMG = "https://image.tmdb.org/t/p/w500";
  const WL_KEY = "marquee.watchlist.v1";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (sel, root = document) => root.querySelector(sel);

  /** Tiny DOM builder. Text always goes in as text nodes, so API strings can't inject markup. */
  function h(tag, props = {}, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2).toLowerCase(), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
    }
    return el;
  }

  const ICONS = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.6v12.8a1 1 0 0 0 1.52.85l10.2-6.4a1 1 0 0 0 0-1.7L9.52 4.75A1 1 0 0 0 8 5.6z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    similar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path d="M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.8l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.6 6.1 20.8l1.2-6.5L2.5 9.7l6.6-.9z"/></svg>',
    film: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  };
  function icon(name) {
    const s = document.createElement("span");
    s.className = "ico";
    s.setAttribute("aria-hidden", "true");
    s.innerHTML = ICONS[name]; // static strings defined above
    return s;
  }

  const yearOf = (d) => (d && /^\d{4}/.test(d) ? d.slice(0, 4) : null);
  const fmtDate = (d) => {
    if (!d) return null;
    const t = new Date(`${d}T00:00:00`);
    return isNaN(t) ? null : t.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };
  const fmtRuntime = (m) => {
    if (!m) return null;
    const hr = Math.floor(m / 60), mi = m % 60;
    return hr ? `${hr}h${mi ? ` ${mi}m` : ""}` : `${mi}m`;
  };
  const money = (n) =>
    n ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(n) : null;
  const score = (v) => (typeof v === "number" && v > 0 ? v.toFixed(1) : null);
  const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

  async function api(path, signal) {
    let res;
    try {
      res = await fetch(API + path, { signal });
    } catch (err) {
      if (err.name === "AbortError") throw err;
      throw new Error("Can't reach the server. Check your connection and try again.");
    }
    if (!res.ok) {
      let msg = `The server returned an error (${res.status}).`;
      try {
        const body = await res.json();
        if (typeof body.detail === "string") msg = body.detail;
      } catch (_) { /* not JSON */ }
      throw new Error(msg);
    }
    return res.json();
  }

  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  /* ───────────── Watchlist (localStorage) ───────────── */
  const watchlist = (() => {
    let items = [];
    const read = () => {
      try {
        const parsed = JSON.parse(localStorage.getItem(WL_KEY));
        items = Array.isArray(parsed) ? parsed : [];
      } catch (_) { /* storage unavailable: keep in-memory list */ }
    };
    const write = () => {
      try { localStorage.setItem(WL_KEY, JSON.stringify(items)); } catch (_) { /* in-memory only */ }
    };
    read();
    return {
      all: () => items.slice(),
      has: (id) => items.some((m) => m.tmdb_id === id),
      add(m) {
        if (this.has(m.tmdb_id)) return;
        items.unshift({
          tmdb_id: m.tmdb_id, title: m.title, poster_url: m.poster_url || null,
          release_date: m.release_date || null, vote_average: m.vote_average ?? null,
        });
        write();
      },
      remove(id) { items = items.filter((m) => m.tmdb_id !== id); write(); },
      reload: read,
    };
  })();

  /* ───────────── Elements & state ───────────── */
  const app = $("#app");
  const grid = $("#grid");
  const feedMsg = $("#feed-msg");
  const feedTitle = $("#feed-title");
  const feedSub = $("#feed-sub");
  const searchInput = $("#search");
  const tabsEl = $("#tabs");
  const sheet = $("#sheet");
  const scroller = $("#sheet-scroll");
  const backBtn = $("#back-btn");
  const lightbox = $("#lightbox");

  $("#search-ico").innerHTML = ICONS.search;
  $("#back-ico").innerHTML = ICONS.back;
  $("#lb-close").innerHTML = ICONS.x;

  const TABS = [
    { id: "trending", label: "Trending", title: "Trending today" },
    { id: "popular", label: "Popular", title: "Popular right now" },
    { id: "top_rated", label: "Top rated", title: "Top rated of all time" },
    { id: "upcoming", label: "Upcoming", title: "Coming soon" },
    { id: "now_playing", label: "In theaters", title: "In theaters now" },
    { id: "watchlist", label: "Watchlist", title: "Your watchlist" },
  ];

  const state = { tab: "trending", query: "", currentId: null };
  const movieCache = new Map();
  const similarState = new Map(); // tmdb_id -> {status, data, genre}
  let feedCtl = null;
  let loadToken = 0;
  let lastFocus = null;
  const baseTitle = document.title;

  /* ───────────── Poster pieces ───────────── */
  function placeholder(title) {
    return h("div", { class: "ph" }, icon("film"), h("span", { text: title }));
  }
  function posterImg(url, title, eager = false) {
    if (!url) return placeholder(title);
    const img = h("img", { src: url, alt: `${title} poster`, decoding: "async", loading: eager ? "eager" : "lazy" });
    img.addEventListener("error", () => img.replaceWith(placeholder(title)), { once: true });
    return img;
  }

  function tile(m, { onOpen, extra } = {}) {
    const year = yearOf(m.release_date);
    const sc = score(m.vote_average);
    const clickable = typeof onOpen === "function";
    return h(
      clickable ? "button" : "div",
      {
        class: `tile${clickable ? "" : " static"}`,
        type: clickable ? "button" : null,
        "aria-label": clickable ? `${m.title}${year ? `, ${year}` : ""}. Open details` : null,
        onclick: clickable ? () => onOpen(m) : null,
      },
      h("span", { class: "tile-poster" }, posterImg(m.poster_url, m.title)),
      h(
        "span", { class: "tile-meta" },
        h("span", { class: "tile-title", text: m.title }),
        (year || sc) && h("span", { class: "tile-sub" },
          year && h("span", { text: year }),
          sc && h("span", { class: "star" }, icon("star"), sc)),
        extra
      )
    );
  }

  /* ───────────── Discovery feed ───────────── */
  function renderTabs() {
    tabsEl.replaceChildren(
      ...TABS.map((t) => {
        const count = t.id === "watchlist" ? watchlist.all().length : 0;
        return h(
          "button",
          {
            class: "tab", type: "button", "data-tab": t.id,
            "aria-current": !state.query && state.tab === t.id ? "true" : "false",
            onclick: () => selectTab(t.id),
          },
          t.label,
          count > 0 && h("span", { class: "count", text: String(count) })
        );
      })
    );
  }

  function setHead(title, sub = "") {
    feedTitle.textContent = title;
    feedSub.textContent = sub;
  }
  function skeletons(n = 18) {
    grid.replaceChildren(
      ...Array.from({ length: n }, () =>
        h("div", { class: "tile skel", "aria-hidden": "true" }, h("span", { class: "tile-poster" }), h("span", { class: "tile-meta" }, h("span", { class: "tile-title" })))
      )
    );
  }
  function showMessage(title, body, action) {
    grid.replaceChildren();
    feedMsg.replaceChildren(
      h("strong", { text: title }),
      h("p", { text: body }),
      action && h("button", { class: "btn btn-primary", type: "button", onclick: action.run, text: action.label })
    );
    feedMsg.hidden = false;
  }
  function paintGrid(list) {
    feedMsg.hidden = true;
    grid.replaceChildren(...list.map((m) => tile(m, { onOpen: (x) => openMovie(x.tmdb_id) })));
  }

  async function loadFeed() {
    if (feedCtl) feedCtl.abort();
    feedMsg.hidden = true;

    if (state.query) {
      const q = state.query;
      setHead(`Results for “${q}”`);
      skeletons(12);
      feedCtl = new AbortController();
      try {
        const data = await api(`/tmdb/search?query=${encodeURIComponent(q)}`, feedCtl.signal);
        const list = (data.results || []).map((m) => ({
          tmdb_id: m.id, title: m.title || m.name || "Untitled",
          poster_url: m.poster_path ? TMDB_IMG + m.poster_path : null,
          release_date: m.release_date || null, vote_average: m.vote_average ?? null,
        }));
        if (!list.length) {
          setHead(`Results for “${q}”`, "No matches");
          return showMessage("No films match that search", "Check the spelling or try a different title.");
        }
        setHead(`Results for “${q}”`, `${list.length} found`);
        paintGrid(list);
      } catch (err) {
        if (err.name === "AbortError") return;
        setHead(`Results for “${q}”`);
        showMessage("Search didn't load", err.message, { label: "Try again", run: loadFeed });
      }
      return;
    }

    const tab = TABS.find((t) => t.id === state.tab);
    setHead(tab.title);

    if (tab.id === "watchlist") {
      const list = watchlist.all();
      setHead(tab.title, list.length ? `${list.length} saved` : "");
      if (!list.length) {
        return showMessage("Your watchlist is empty", "Open a film and choose Add to Watchlist to save it here.", {
          label: "Browse trending", run: () => selectTab("trending"),
        });
      }
      return paintGrid(list);
    }

    skeletons();
    feedCtl = new AbortController();
    try {
      const list = await api(`/home?category=${tab.id}&limit=30`, feedCtl.signal);
      if (!list.length) return showMessage("Nothing here yet", "No films came back for this list. Try another tab.");
      paintGrid(list);
    } catch (err) {
      if (err.name === "AbortError") return;
      showMessage("This list didn't load", err.message, { label: "Try again", run: loadFeed });
    }
  }

  function selectTab(id) {
    state.tab = id;
    state.query = "";
    searchInput.value = "";
    renderTabs();
    loadFeed();
  }

  let searchTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      const q = searchInput.value.trim();
      state.query = q.length >= 2 ? q : "";
      renderTabs();
      loadFeed();
    }, 350);
  });

  /* ───────────── Routing (#/movie/<id>) ───────────── */
  function openMovie(id) { location.hash = `#/movie/${id}`; }
  function goDiscovery() {
    if (!location.hash) return route();
    history.pushState(null, "", location.pathname + location.search);
    route();
  }
  function route() {
    const m = location.hash.match(/^#\/movie\/(\d+)$/);
    if (m) showMovie(Number(m[1]));
    else hideSheet();
  }
  window.addEventListener("hashchange", route);
  window.addEventListener("popstate", route);
  backBtn.addEventListener("click", goDiscovery);

  /* ───────────── Sheet open / close ───────────── */
  function showSheet() {
    if (!sheet.hidden) return;
    lastFocus = document.activeElement;
    sheet.hidden = false;
    app.inert = true;
    document.body.classList.add("locked");
    requestAnimationFrame(() => requestAnimationFrame(() => {
      sheet.classList.add("open");
      backBtn.focus({ preventScroll: true });
    }));
  }
  function hideSheet() {
    if (sheet.hidden) return;
    sheet.classList.remove("open");
    app.inert = false;
    document.body.classList.remove("locked");
    state.currentId = null;
    loadToken++;
    closeTrailer();
    document.title = baseTitle;
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    // Keep the watchlist tab and its count in sync with changes made inside the sheet.
    renderTabs();
    if (state.tab === "watchlist" && !state.query) loadFeed();
    setTimeout(() => {
      if (!sheet.classList.contains("open")) { sheet.hidden = true; scroller.replaceChildren(); }
    }, reduce ? 0 : 450);
  }

  async function showMovie(id) {
    if (state.currentId === id && !sheet.hidden && scroller.firstElementChild?.classList.contains("hero")) return;
    const token = ++loadToken;
    state.currentId = id;
    closeTrailer();
    showSheet();
    scroller.scrollTo({ top: 0, behavior: "auto" });
    renderSheetSkeleton();
    try {
      let movie = movieCache.get(id);
      if (!movie) {
        movie = await api(`/movie/full/${id}`);
        movieCache.set(id, movie);
      }
      if (token !== loadToken) return;
      renderMovie(movie);
    } catch (err) {
      if (token !== loadToken) return;
      renderSheetError(err, () => showMovie(id));
    }
  }

  function renderSheetSkeleton() {
    scroller.replaceChildren(
      h("div", { class: "sheet-skel", "aria-busy": "true" },
        h("div", { class: "skel-block p" }),
        h("div", {},
          h("div", { class: "skel-block l", style: "width:70%;height:54px" }),
          h("div", { class: "skel-block l", style: "width:45%" }),
          h("div", { class: "skel-block l", style: "width:90%" }),
          h("div", { class: "skel-block l", style: "width:80%" })))
    );
  }
  function renderSheetError(err, retry) {
    scroller.replaceChildren(
      h("div", { class: "sheet-err" },
        h("strong", { text: "This film didn't load" }),
        h("p", { text: err.message }),
        h("button", { class: "btn btn-primary", type: "button", onclick: retry, text: "Try again" }))
    );
  }

  /* ───────────── Movie details ───────────── */
  function ratingRing(value) {
    const C = 2 * Math.PI * 34;
    const wrap = h("div", { class: "ring", role: "img", "aria-label": `Rated ${value.toFixed(1)} out of 10` });
    wrap.innerHTML =
      `<svg viewBox="0 0 80 80" aria-hidden="true"><defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3d9ff"/><stop offset="1" stop-color="#8b6cf0"/></linearGradient></defs>` +
      `<circle class="trk" cx="40" cy="40" r="34" fill="none" stroke-width="6"/>` +
      `<circle class="val" cx="40" cy="40" r="34" fill="none" stroke-width="6" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg>`;
    wrap.append(h("b", { text: value.toFixed(1) }));
    const arc = wrap.querySelector(".val");
    requestAnimationFrame(() => requestAnimationFrame(() => { arc.style.strokeDashoffset = C * (1 - value / 10); }));
    return wrap;
  }

  function hScroller(label, items) {
    const track = h("div", { class: "track", role: "list", "aria-label": label }, items);
    const go = (dir) => track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
    const prev = h("button", { class: "scroll-btn prev", type: "button", "aria-label": "Scroll left", onclick: () => go(-1) }, icon("left"));
    const next = h("button", { class: "scroll-btn next", type: "button", "aria-label": "Scroll right", onclick: () => go(1) }, icon("right"));
    const sync = () => {
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    };
    track.addEventListener("scroll", sync, { passive: true });
    if ("ResizeObserver" in window) new ResizeObserver(sync).observe(track);
    requestAnimationFrame(sync);
    return h("div", { class: "scroller" }, prev, track, next);
  }

  function renderMovie(m) {
    document.title = `${m.title} · Marquee`;
    const year = yearOf(m.release_date);
    const date = fmtDate(m.release_date);
    const runtime = fmtRuntime(m.runtime);
    const rating = score(m.vote_average);
    const genreNames = (m.genres || []).map((g) => g.name).filter(Boolean);

    /* Hero */
    const backdropSrc = m.backdrop_url || m.poster_url;
    const media = h("div", { class: "hero-media" });
    if (backdropSrc) {
      const img = h("img", { src: backdropSrc, alt: "", decoding: "async", class: m.backdrop_url ? "" : "from-poster" });
      img.addEventListener("error", () => img.remove(), { once: true });
      media.append(img);
    }
    media.append(h("div", { class: "hero-scrim" }));

    const poster = h("div", { class: "poster" }, posterImg(m.poster_url, m.title, true));
    if (!reduce && finePointer) {
      poster.addEventListener("pointermove", (e) => {
        const r = poster.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        poster.style.transform = `rotateY(${x * 9}deg) rotateX(${-y * 9}deg) translateZ(0)`;
      });
      poster.addEventListener("pointerleave", () => { poster.style.transform = ""; });
    }

    const facts = [
      date && h("li", { text: date }),
      runtime && h("li", { text: runtime }),
      m.language && h("li", { text: m.language }),
      genreNames.length > 0 && h("li", { text: genreNames.slice(0, 3).join(", ") }),
      rating && h("li", {}, h("span", { class: "rate", title: "Audience score from TMDB" }, icon("star"), rating, h("small", { text: "TMDB" }))),
    ].filter(Boolean);

    const watchBtn = h("button", { class: "btn-glass", type: "button", "aria-pressed": "false" });
    const paintWatch = () => {
      const on = watchlist.has(m.tmdb_id);
      watchBtn.replaceChildren(icon(on ? "check" : "plus"), on ? "Remove from Watchlist" : "Add to Watchlist");
      watchBtn.setAttribute("aria-pressed", String(on));
      watchBtn.classList.toggle("is-on", on);
    };
    watchBtn.addEventListener("click", () => {
      if (watchlist.has(m.tmdb_id)) { watchlist.remove(m.tmdb_id); toast("Removed from your watchlist"); }
      else { watchlist.add(m); toast("Added to your watchlist"); }
      paintWatch();
    });
    paintWatch();

    const similarBtn = h("button", { class: "btn-glass", type: "button", onclick: () => findSimilar(m, true) }, icon("similar"), "Find Similar Movies");
    const trailerBtn = m.trailer_key && h("button", { class: "btn btn-primary", type: "button", onclick: () => openTrailer(m) }, icon("play"), "Watch Trailer");

    const hero = h("section", { class: "hero", "aria-labelledby": "sheet-title" },
      media,
      h("div", { class: "hero-inner" },
        h("div", { class: "poster-wrap" }, poster),
        h("div", { class: "hero-copy" },
          h("h1", { class: "title rise", id: "sheet-title", style: "--i:0", text: m.title }),
          m.tagline && h("p", { class: "tagline rise", style: "--i:1", text: m.tagline }),
          facts.length > 0 && h("ul", { class: "facts rise", style: "--i:2" }, facts),
          h("p", { class: `blurb rise${m.overview ? "" : " is-missing"}`, style: "--i:3", text: m.overview || "TMDB doesn't have a description for this film yet." }),
          h("div", { class: "actions rise", style: "--i:4" }, trailerBtn, watchBtn, similarBtn)
        )
      )
    );

    /* Storyline */
    const story = h("section", { class: "sec sec-story", "aria-labelledby": "h-story" },
      h("h2", { id: "h-story", text: "Storyline" }),
      m.overview ? h("p", { class: "story-text", text: m.overview }) : h("p", { class: "muted", text: "No storyline is available for this film." })
    );

    /* Aside: rating, director, genres */
    const aside = h("aside", { class: "aside", "aria-label": "Rating, director and genres" });
    if (rating) {
      aside.append(
        h("div", {},
          h("h2", { text: "Audience rating" }),
          h("div", { class: "rating-block" },
            ratingRing(m.vote_average),
            h("p", { class: "rating-note" },
              `Out of 10, from ${m.vote_count.toLocaleString("en-US")} TMDB ${m.vote_count === 1 ? "vote" : "votes"}.`,
              h("small", { text: "IMDb scores aren't available through TMDB." }))),
          m.imdb_id && h("a", { class: "imdb-link", href: `https://www.imdb.com/title/${encodeURIComponent(m.imdb_id)}/`, target: "_blank", rel: "noopener noreferrer", text: "See the IMDb rating" })
        )
      );
    }
    aside.append(
      h("div", {},
        h("h2", { text: m.directors.length > 1 ? "Directors" : "Director" }),
        m.directors.length ? h("p", { class: "director-name", text: m.directors.join(", ") }) : h("p", { class: "muted", text: "Not listed." })
      ),
      h("div", {},
        h("h2", { text: "Genres" }),
        genreNames.length ? h("div", { class: "chips" }, genreNames.map((g) => h("span", { class: "chip", text: g }))) : h("p", { class: "muted", text: "Not listed." })
      )
    );

    /* Cast & crew */
    const cast = h("section", { class: "sec sec-cast", "aria-labelledby": "h-cast" }, h("h2", { id: "h-cast", text: "Cast and crew" }));
    if (m.cast.length) {
      cast.append(hScroller("Cast", m.cast.map((p) => {
        const av = h("span", { class: "avatar" }, initials(p.name));
        if (p.profile_url) {
          const img = h("img", { src: p.profile_url, alt: "", loading: "lazy", decoding: "async" });
          img.addEventListener("error", () => img.remove(), { once: true });
          av.append(img);
        }
        return h("div", { class: "person", role: "listitem" }, av, h("b", { text: p.name }), p.character && h("span", { class: "role", text: p.character }));
      })));
    } else {
      cast.append(h("p", { class: "muted", text: "No cast has been listed for this film." }));
    }
    if (m.crew.length) {
      const byJob = new Map();
      m.crew.forEach((c) => byJob.set(c.job, [...(byJob.get(c.job) || []), c.name]));
      cast.append(h("dl", { class: "crew" }, [...byJob].map(([job, names]) => h("div", {}, h("dt", { text: job }), h("dd", { text: names.join(", ") })))));
    }

    /* Production */
    const rows = [
      m.production_companies.length && ["Studios", m.production_companies.map((c) => c.name).join(", ")],
      m.production_countries.length && ["Countries", m.production_countries.join(", ")],
      m.status && ["Status", m.status],
      m.budget && ["Budget", money(m.budget)],
      m.revenue && ["Box office", money(m.revenue)],
      m.homepage && ["Official site", h("a", { href: m.homepage, target: "_blank", rel: "noopener noreferrer", text: m.homepage.replace(/^https?:\/\//, "").replace(/\/$/, "") })],
    ].filter(Boolean);
    const prod = h("section", { class: "sec sec-prod", "aria-labelledby": "h-prod" },
      h("h2", { id: "h-prod", text: "Production information" }),
      rows.length
        ? h("dl", { class: "rows" }, rows.map(([k, v]) => h("div", {}, h("dt", { text: k }), h("dd", {}, v))))
        : h("p", { class: "muted", text: "No production details are available for this film." })
    );

    /* Similar */
    const similar = h("section", { class: "similar", id: "similar", "aria-labelledby": "h-sim" },
      h("h2", { id: "h-sim", text: "Movies You Might Also Love" }),
      h("div", { id: "similar-body" })
    );

    scroller.replaceChildren(hero, h("div", { class: "body" }, story, aside, cast, prod), similar);
    paintSimilar(m);
  }

  /* ───────────── Similar movies ───────────── */
  async function findSimilar(m, scrollTo) {
    const existing = similarState.get(m.tmdb_id);
    if (existing && existing.status === "loading") return;
    if (scrollTo) $("#similar")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    if (existing && existing.status === "done") return;

    similarState.set(m.tmdb_id, { status: "loading" });
    paintSimilar(m);
    try {
      const data = await api(`/recommend/similar?tmdb_id=${m.tmdb_id}&top_n=12`);
      similarState.set(m.tmdb_id, { status: "done", data });
    } catch (err) {
      similarState.set(m.tmdb_id, { status: "error", message: err.message });
    }
    if (state.currentId === m.tmdb_id) paintSimilar(m);
  }

  async function loadGenreFallback(m) {
    const st = similarState.get(m.tmdb_id);
    similarState.set(m.tmdb_id, { ...st, genre: { status: "loading" } });
    paintSimilar(m);
    try {
      const list = await api(`/recommend/genre?tmdb_id=${m.tmdb_id}&limit=12`);
      similarState.set(m.tmdb_id, { ...similarState.get(m.tmdb_id), genre: { status: "done", list } });
    } catch (err) {
      similarState.set(m.tmdb_id, { ...similarState.get(m.tmdb_id), genre: { status: "error", message: err.message } });
    }
    if (state.currentId === m.tmdb_id) paintSimilar(m);
  }

  function simSkeleton() {
    return h("div", { class: "track", "aria-hidden": "true" },
      Array.from({ length: 7 }, () => h("div", { class: "tile skel sim-card" }, h("span", { class: "tile-poster" }), h("span", { class: "tile-meta" }, h("span", { class: "tile-title" })))));
  }

  function simCards(list) {
    return hScroller("Similar movies", list.map(({ card, title, score: s }) => {
      const meter = typeof s === "number" && h("span", { class: "meter sim-bar", title: "Cosine similarity from the recommendation model" },
        h("i", { style: `--w:${Math.max(4, Math.min(100, Math.round(s * 100)))}%` }), `${Math.round(s * 100)}% similar`);
      const data = card || { title, poster_url: null, release_date: null, vote_average: null };
      // The list item wraps the tile so a clickable card keeps its button role.
      return h("div", { class: "sim-card", role: "listitem" }, tile(data, { onOpen: card ? (x) => openMovie(x.tmdb_id) : null, extra: meter }));
    }));
  }

  function paintSimilar(m) {
    const box = $("#similar-body");
    if (!box) return;
    const st = similarState.get(m.tmdb_id) || { status: "idle" };
    box.replaceChildren();

    if (st.status === "idle") {
      box.append(h("div", { class: "sim-empty" },
        h("p", { text: "Find films with a similar story, genres and tagline, picked by the recommendation model." }),
        h("button", { class: "btn btn-primary", type: "button", onclick: () => findSimilar(m, false) }, icon("similar"), "Find Similar Movies")));
    } else if (st.status === "loading") {
      box.append(h("p", { class: "sim-note", text: "Finding similar films…" }), simSkeleton());
    } else if (st.status === "error") {
      box.append(h("div", { class: "sim-msg" },
        h("p", { text: `We couldn't load recommendations. ${st.message}` }),
        h("button", { class: "btn btn-primary", type: "button", onclick: () => { similarState.delete(m.tmdb_id); findSimilar(m, false); }, text: "Try again" })));
    } else if (st.data.in_dataset) {
      box.append(
        h("p", { class: "sim-note", text: `Because you're looking at ${st.data.movie_title}. Ranked by similarity of story, genres and tagline.` }),
        simCards(st.data.recommendations.map((r) => ({ card: r.tmdb, title: r.title, score: r.score })))
      );
    } else {
      // Not in the model's dataset: say so, and offer the genre list as a clearly labelled alternative.
      const g = st.genre;
      box.append(h("div", { class: "sim-msg" },
        h("p", { text: `${st.data.movie_title} isn't in the recommendation model's dataset, so there are no model-based matches for it.` }),
        !g && h("button", { class: "btn btn-primary", type: "button", onclick: () => loadGenreFallback(m), text: "Show popular films in the same genre" }),
        g && g.status === "loading" && h("p", { class: "muted", text: "Loading films from the same genre…" }),
        g && g.status === "error" && h("p", { text: `Genre results didn't load. ${g.message}` })));
      if (g && g.status === "done") {
        box.append(h("p", { class: "sim-label", text: g.list.length ? "Popular in the same genre (not model-based)" : "No films came back for this genre." }));
        if (g.list.length) box.append(simCards(g.list.map((c) => ({ card: c, title: c.title }))));
      }
    }
  }

  /* ───────────── Trailer lightbox ───────────── */
  function openTrailer(m) {
    if (!m.trailer_key) return;
    $("#lb-yt").href = m.trailer_url;
    $("#lb-frame").replaceChildren(h("iframe", {
      src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(m.trailer_key)}?autoplay=1&rel=0`,
      title: `${m.title} trailer`,
      allow: "autoplay; encrypted-media; picture-in-picture; fullscreen",
      allowfullscreen: true,
      referrerpolicy: "strict-origin-when-cross-origin",
    }));
    lightbox.hidden = false;
    sheet.inert = true;
    $("#lb-close").focus();
  }
  function closeTrailer() {
    if (lightbox.hidden) return;
    $("#lb-frame").replaceChildren(); // removing the iframe stops playback
    lightbox.hidden = true;
    sheet.inert = false;
    if (!sheet.hidden) backBtn.focus({ preventScroll: true });
  }
  $("#lb-close").addEventListener("click", closeTrailer);
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeTrailer(); });

  /* ───────────── Global keys & sync ───────────── */
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!lightbox.hidden) closeTrailer();
    else if (!sheet.hidden) goDiscovery();
    else if (document.activeElement === searchInput && searchInput.value) {
      searchInput.value = ""; state.query = ""; renderTabs(); loadFeed();
    }
  });
  window.addEventListener("storage", (e) => {
    if (e.key !== WL_KEY) return;
    watchlist.reload();
    renderTabs();
    if (state.tab === "watchlist" && !state.query) loadFeed();
  });

  /* ───────────── Start ───────────── */
  renderTabs();
  loadFeed();
  route(); // supports deep links like /#/movie/603
})();
