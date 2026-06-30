/* SoVi Living Lab — condensed Gantt schedule renderer.
   Reads SCHEDULE from schedule-data.js (must load first).
   Contained card, sortable, zoomable (+/-/fit), click-for-detail,
   adaptive time header (quarters when zoomed out, months when zoomed in).
   Responsive. No libraries. */

(function () {
  if (typeof SCHEDULE === "undefined") return;
  const inner = document.getElementById("ginner");
  const gchart = document.getElementById("gchart");
  if (!inner || !gchart) return;

  const DAY = 86400000;
  const MINDAY = 0.42; // floor so the fit view stays legible on small screens
  const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  function pd(s){ const [y,m,d] = s.split("-").map(Number); return new Date(y, m-1, d); }
  function fmt(d){ return String(d.getDate()).padStart(2,"0") + " " + MON[d.getMonth()] + " " + String(d.getFullYear()).slice(2); }
  function days(a,b){ return Math.round((b - a) / DAY); }
  function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

  const P = SCHEDULE.project;
  const TL0 = pd(P.rangeStart), TL1 = pd(P.rangeEnd);
  const TOTAL = days(TL0, TL1);

  const GROUPS = SCHEDULE.groups.map(g => ({
    name: g.name,
    items: g.tasks.map(t => {
      const start = pd(t.start);
      const isM = (t.type === "milestone");
      const end = isM ? start : pd(t.end);
      return { name: t.name, start, end, isM, key: !!t.key, crit: !!t.critical, dur: isM ? 0 : days(start, end) + 1 };
    })
  }));

  // ---- view state ----
  let sortMode = "start";
  let zoom = 1;                 // 1 = fit the whole project to the card width
  const ZSTEP = 1.4, ZMAX = 8;

  // ---- layout (recomputed every render) ----
  let DAYW, FITW, TLPX, labelW, TICKS, YEARS, tickMode;
  function xOf(d){ return (d - TL0) / DAY * DAYW; }
  function layout(){
    const w = window.innerWidth;
    labelW = w <= 620 ? 150 : (w <= 1024 ? 240 : 480);
    gchart.style.setProperty("--label-w", labelW + "px");
    const cw = gchart.clientWidth || document.documentElement.clientWidth || w;
    const avail = Math.max(220, cw - labelW - 2);
    FITW = avail / TOTAL;
    DAYW = Math.max(FITW, MINDAY) * zoom;
    TLPX = Math.round(DAYW * TOTAL);

    tickMode = (DAYW * 30.4 >= 38) ? "month" : "quarter";
    TICKS = []; YEARS = {};
    const stepMonths = (tickMode === "month") ? 1 : 3;
    let cur = new Date(TL0.getFullYear(), (tickMode === "month") ? TL0.getMonth() : Math.floor(TL0.getMonth()/3)*3, 1);
    while (+cur < +TL1){
      const next = new Date(cur.getFullYear(), cur.getMonth() + stepMonths, 1);
      const s = Math.max(+cur, +TL0), e = Math.min(+next, +TL1);
      if (e > s){
        const x = xOf(new Date(s)), wd = (e - s) / DAY * DAYW;
        const label = (tickMode === "month") ? MON[cur.getMonth()] : ("Q" + (Math.floor(cur.getMonth()/3) + 1));
        TICKS.push({ x, w: wd, label, isYear: cur.getMonth() === 0 });
        const y = cur.getFullYear();
        if (!YEARS[y]) YEARS[y] = { x: Infinity, e: -Infinity };
        YEARS[y].x = Math.min(YEARS[y].x, x);
        YEARS[y].e = Math.max(YEARS[y].e, x + wd);
      }
      cur = next;
    }
  }

  function sortItems(items){
    const a = items.slice();
    if (sortMode === "duration")    a.sort((x,y) => y.dur - x.dur || x.start - y.start);
    else if (sortMode === "finish") a.sort((x,y) => x.end - y.end || x.start - y.start);
    else                            a.sort((x,y) => x.start - y.start || y.dur - x.dur);
    return a;
  }

  // ---- HTML builders ----
  function headerHTML(){
    let yh = "";
    Object.keys(YEARS).forEach(y => {
      const o = YEARS[y];
      yh += `<div class="gyear" style="left:${o.x.toFixed(1)}px;width:${(o.e-o.x).toFixed(1)}px">${y}</div>`;
    });
    const minLabel = (tickMode === "month") ? 20 : 30;
    let th = "";
    TICKS.forEach(t => {
      th += `<div class="gtick" style="left:${t.x.toFixed(1)}px;width:${t.w.toFixed(1)}px">${t.w > minLabel ? t.label : ""}</div>`;
    });
    return `<div class="ghead"><div class="gcorner">` +
      `<span class="c-name">Work stream</span><span class="c-num">Dur</span>` +
      `<span class="c-start">Start</span><span class="c-finish">Finish</span></div>` +
      `<div class="gtime" style="width:${TLPX}px">${yh}${th}</div></div>`;
  }

  function gridHTML(){
    let g = "";
    TICKS.forEach(t => {
      if (t.x <= 0.5) return;
      g += `<div class="gv${t.isYear ? " yr" : ""}" style="left:calc(var(--label-w) + ${t.x.toFixed(1)}px)"></div>`;
    });
    const dd = xOf(pd(P.dataDate));
    g += `<div class="gdd" style="left:calc(var(--label-w) + ${dd.toFixed(1)}px)"></div>`;
    return `<div class="ggrid">${g}</div>`;
  }

  let FLAT = [];
  function rowsHTML(){
    FLAT = [];
    let h = "";
    GROUPS.forEach(g => {
      let mn = Infinity, mx = -Infinity;
      g.items.forEach(it => { mn = Math.min(mn, +it.start); mx = Math.max(mx, +it.end); });
      const gx = xOf(new Date(mn));
      const gw = Math.max(xOf(new Date(mx + DAY)) - gx, 3);
      const gDur = days(new Date(mn), new Date(mx)) + 1;
      const gMeta = gDur + "d \u00b7 " + fmt(new Date(mn)) + " \u2192 " + fmt(new Date(mx));

      h += `<div class="grow gband"><div class="glbl">` +
        `<span class="g-name">${esc(g.name)}</span>` +
        `<span class="t-dur">${gDur}d</span>` +
        `<span class="t-start">${fmt(new Date(mn))}</span>` +
        `<span class="t-finish">${fmt(new Date(mx))}</span>` +
        `<span class="t-meta">${gMeta}</span></div>` +
        `<div class="gtrk" style="width:${TLPX}px">` +
        `<div class="gbar2" style="left:${gx.toFixed(1)}px;width:${gw.toFixed(1)}px"></div></div></div>`;

      sortItems(g.items).forEach(it => {
        const idx = FLAT.length;
        FLAT.push({ ...it, group: g.name });
        const durtxt = it.isM ? "0d" : it.dur + "d";
        const starttxt = it.isM ? "" : fmt(it.start);
        const fintxt = fmt(it.isM ? it.start : it.end);
        const meta = it.isM ? ("0d \u00b7 " + fmt(it.start)) : (it.dur + "d \u00b7 " + fmt(it.start) + " \u2192 " + fmt(it.end));
        let bar;
        if (it.isM){
          bar = `<div class="ms2${it.key ? " key" : ""}${it.crit ? " crit" : ""}" style="left:${xOf(it.start).toFixed(1)}px"></div>`;
        } else {
          const x = xOf(it.start);
          const wd = Math.max(xOf(new Date(+it.end + DAY)) - x, 3);
          bar = `<div class="bar2${it.crit ? " crit" : ""}" style="left:${x.toFixed(1)}px;width:${wd.toFixed(1)}px"></div>`;
        }
        h += `<div class="grow gtask" data-idx="${idx}"><div class="glbl">` +
          `<span class="t-name">${esc(it.name)}</span>` +
          `<span class="t-dur">${durtxt}</span>` +
          `<span class="t-start">${starttxt}</span>` +
          `<span class="t-finish">${fintxt}</span>` +
          `<span class="t-meta">${meta}</span></div>` +
          `<div class="gtrk" style="width:${TLPX}px">${bar}</div></div>`;
      });
    });
    return `<div class="grows">${h}</div>`;
  }

  function render(){
    layout();
    inner.innerHTML = headerHTML() + gridHTML() + rowsHTML();
    updateZoomUI();
  }

  // ---- controls ----
  const sortset = document.getElementById("sortset");
  if (sortset){
    sortset.addEventListener("click", e => {
      const b = e.target.closest(".sortbtn");
      if (!b) return;
      sortMode = b.dataset.sort;
      sortset.querySelectorAll(".sortbtn").forEach(x => x.classList.toggle("active", x === b));
      render();
    });
  }

  const zoomset = document.getElementById("zoomset");
  function updateZoomUI(){
    if (!zoomset) return;
    const out = zoomset.querySelector('[data-zoom="out"]');
    const fit = zoomset.querySelector('[data-zoom="fit"]');
    if (out) out.disabled = (zoom <= 1.001);
    if (fit) fit.classList.toggle("active", Math.abs(zoom - 1) < 0.001);
  }
  if (zoomset){
    zoomset.addEventListener("click", e => {
      const b = e.target.closest(".sortbtn");
      if (!b) return;
      const z = b.dataset.zoom;
      if (z === "in")        zoom = Math.min(ZMAX, zoom * ZSTEP);
      else if (z === "out")  zoom = Math.max(1, zoom / ZSTEP);
      else                   zoom = 1;
      render();
    });
  }

  render();

  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(render, 150); });

  // ---- detail panel ----
  const wrap = document.createElement("div");
  wrap.innerHTML =
    `<div class="gd-scrim" id="gdScrim"></div>` +
    `<aside class="gd-panel" id="gdPanel" role="dialog" aria-modal="true" aria-labelledby="gdName">` +
      `<button class="gd-close" id="gdClose" aria-label="Close">\u00d7</button>` +
      `<div class="gd-eyebrow" id="gdPhase"></div>` +
      `<h3 class="gd-title" id="gdName"></h3>` +
      `<div class="gd-grid">` +
        `<div class="gd-cell"><span>Start</span><b id="gdStart"></b></div>` +
        `<div class="gd-cell"><span>Finish</span><b id="gdFinish"></b></div>` +
        `<div class="gd-cell"><span>Duration</span><b id="gdDur"></b></div>` +
        `<div class="gd-cell"><span>Type</span><b id="gdType"></b></div>` +
      `</div>` +
      `<div class="gd-status" id="gdStatus"></div>` +
      `<p class="gd-note" id="gdNote"></p>` +
    `</aside>`;
  document.body.appendChild(wrap);
  const gdScrim = document.getElementById("gdScrim");
  const gdPanel = document.getElementById("gdPanel");
  let lastFocus = null;

  function setText(id, v){ document.getElementById(id).textContent = v; }
  function openDetail(it){
    lastFocus = document.activeElement;
    setText("gdPhase", it.group);
    setText("gdName", it.name);
    setText("gdStart", it.isM ? "\u2014" : fmt(it.start));
    setText("gdFinish", fmt(it.isM ? it.start : it.end));
    setText("gdDur", it.isM ? "0 days" : it.dur + " days");
    setText("gdType", it.isM ? "Milestone" : "Work stream");
    const st = document.getElementById("gdStatus");
    if (it.crit){
      st.innerHTML = `<span class="gd-chip is-crit"><i class="dotc"></i>On the critical path</span>`;
      setText("gdNote", "A slip here pushes the project finish. These are the items the schedule watches most closely.");
    } else {
      st.innerHTML = `<span class="gd-chip"><i class="dotc"></i>Has float \u00b7 not on the critical path</span>`;
      setText("gdNote", "This work has schedule float, so it can move within its window without moving the project finish.");
    }
    gdScrim.classList.add("open");
    gdPanel.classList.add("open");
    document.getElementById("gdClose").focus();
  }
  function closeDetail(){
    gdScrim.classList.remove("open");
    gdPanel.classList.remove("open");
    if (lastFocus) lastFocus.focus();
  }
  document.getElementById("gdClose").addEventListener("click", closeDetail);
  gdScrim.addEventListener("click", closeDetail);
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeDetail(); });

  inner.addEventListener("click", e => {
    const row = e.target.closest(".grow.gtask");
    if (!row) return;
    const it = FLAT[+row.dataset.idx];
    if (it) openDetail(it);
  });
})();