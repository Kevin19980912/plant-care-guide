/* ===== Full-page care sheet renderer ===== */

/* Edit these to match your own shop details */
const SHOP = {
  brand: "Plant Care Guide",
  brandIcon: "🌿",
  tagline: "Healthy · Rooted · Ready to Grow",
  skuPrefix: "PCG350000",
  email: "email@example.com",
  instagram: "@YourShop",
  claimWindow: "48 hours"
};

function esc(s){
  return String(s == null ? "" : s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;");
}

/* The `problems` field is an array on most entries, but a few were stored as one
   joined string containing literal quote marks. Normalise both shapes. */
function normProblems(pr){
  if(!pr) return [];
  const raw = Array.isArray(pr) ? pr : [pr];
  const out = [];
  for(const item of raw){
    String(item).split('","').forEach(part=>{
      const t = part.replace(/^"+|"+$/g,"").trim();
      if(t) out.push(t);
    });
  }
  return out;
}

/* First sentence of a long field, used for the quick-reference strip */
function gist(txt, max){
  if(!txt) return "";
  const s = String(txt).replace(/\s+/g," ").trim();
  let out = s.split(". ")[0];
  if(out.length < s.length) out += ".";
  out = out.replace(/<[^>]+>/g,"").trim();
  const cap = max || 105;
  if(out.length > cap){
    out = out.slice(0, cap).replace(/[,;:]\s*\S*$/,"").trim() + "…";
  }
  return out;
}

function secHead(n, title){
  return `<div class="sh-sec-head"><span class="sh-num">${String(n).padStart(2,"0")}</span><h2>${esc(title)}</h2></div>`;
}

function bullets(items){
  return `<ul class="sh-list">${items.map(i=>`<li>${i}</li>`).join("")}</ul>`;
}

function fixesTable(rows){
  const head = `<div class="sh-fix-row head"><div class="sh-fix-c">Symptom</div><div class="sh-fix-c">Quick Fix</div></div>`;
  const body = rows.map(r=>`<div class="sh-fix-row"><div class="sh-fix-c">${esc(r[0])}</div><div class="sh-fix-c">${esc(r[1])}</div></div>`).join("");
  return `<div class="sh-fix">${head}${body}</div>`;
}

function buildSheet(idx){
  const p = plants[idx];
  const tKey = PLANT_TYPE[p.id] || "tropical";
  const T = CARE_TYPES[tKey] || CARE_TYPES.tropical;
  const sku = SHOP.skuPrefix + String(p.id).padStart(3,"0");
  const moistureTitle = MOISTURE_TITLE[tKey] || "Toothpick Moisture Test — Check Before You Water";
  const notes = normProblems(p.problems);

  const qr = [
    ["Plant Type", T.label],
    ["Light", gist(p.light, 70)],
    ["Watering", gist(p.water, 70)],
    ["Temperature", gist(p.temp, 60)]
  ].filter(r=>r[1]).map(r=>`<div class="sh-qr-item"><div class="sh-qr-k">${esc(r[0])}</div><div class="sh-qr-v">${esc(r[1])}</div></div>`).join("");

  let n = 0;
  const S = (title, inner, sub)=>{
    n++;
    return `<section class="sh-sec">${secHead(n,title)}${sub?`<p class="sh-sub">${esc(sub)}</p>`:""}${inner}</section>`;
  };

  const body = [
    S("After Shipping — What to Expect", bullets(T.shipping), "Read this first. Most 'problems' in week one are normal transit stress."),
    S("Quick Reference", `<div class="sh-qr">${qr}</div>`),
    S("Light & Sun Requirements", `<p class="sh-txt">${esc(p.light)}</p>`),
    S("Temperature & Climate Care", `<p class="sh-txt">${esc(p.temp)}</p>`),
    S("Airflow & Humidity", `<p class="sh-txt">${T.airflow}</p>`),
    S("Watering — The Most Important Care Step", `<p class="sh-txt">${esc(p.water)}</p>`),
    S(moistureTitle, `<p class="sh-txt">${T.toothpick}</p>`),
    S("Soil & Pot Recommendations", p.soil ? `<p class="sh-txt">${esc(p.soil)}</p>` : `<p class="sh-txt">Not specified for this plant.</p>`),
    S("Repotting & Transplanting Tips", p.rep ? `<p class="sh-txt">${esc(p.rep)}</p>` : `<p class="sh-txt">Not specified for this plant.</p>`),
    S("Spots, Corking & Surface Marks", `<p class="sh-txt">${T.spots}</p>`, "How to tell harmless ageing from real rot."),
    S("Growth & Appearance", `<p class="sh-txt">${esc(p.growth)}</p>`),
    S("Natural Aging — What Is Normal", `<p class="sh-txt">${T.aging}</p>`),
    S("Fertilizing — Optional but Helpful", p.fert ? `<p class="sh-txt">${esc(p.fert)}</p>` : `<p class="sh-txt">Not specified for this plant.</p>`),
    S("Propagation", p.prop ? `<p class="sh-txt">${esc(p.prop)}</p>` : `<p class="sh-txt">Not specified for this plant.</p>`),
    S("Common Problems & Quick Fixes", fixesTable(T.fixes)),
    notes.length ? S("Plant-Specific Care Notes", bullets(notes.map(x=>esc(x)))) : "",
    S("Pet Safety & Toxicity", `<p class="sh-txt">${esc(p.tox)}</p>`),
    S("Normal During Shipping", `<div class="sh-callout"><p>${T.shippingNormal}</p></div>`)
  ].filter(Boolean).join("");

  const prev = idx > 0 ? idx-1 : -1;
  const next = idx < plants.length-1 ? idx+1 : -1;

  return `
  <div class="sheet-toolbar">
    <button class="st-btn" onclick="showGallery()">← All Plants</button>
    <span class="st-spacer"></span>
    <button class="st-btn primary" onclick="window.print()">🖨️ Print This Sheet</button>
    <button class="st-navbtn" ${prev<0?"disabled":""} onclick="${prev<0?"":`openDetail(${prev})`}">← ${prev>=0?esc(plants[prev].cn):"None"}</button>
    <button class="st-navbtn" ${next<0?"disabled":""} onclick="${next<0?"":`openDetail(${next})`}">${next>=0?esc(plants[next].cn):"None"} →</button>
  </div>

  <div class="sheet">
    <header class="sheet-head">
      <div class="sh-brand">${SHOP.brandIcon} ${esc(SHOP.brand)} — Plant Care Card</div>
      <div class="sh-tag">${esc(SHOP.tagline)}</div>
      <div class="sh-title-row">
        <div class="sh-title-main">
          <div class="sh-name">${esc(p.cn)}</div>
          <div class="sh-alias">${esc(p.la)}</div>
          <div class="sh-badges">
            <span class="sh-badge">Care Card ${String(p.id).padStart(3,"0")}</span>
            <span class="sh-badge">SKU ${esc(sku)}</span>
            <span class="sh-badge">${esc(T.label)}</span>
          </div>
        </div>
        <div class="sh-photo">
          <img src="images/${p.id}.png" alt="${esc(p.cn)}" onerror="this.parentNode.style.display='none'">
        </div>
      </div>
    </header>

    <div class="sheet-body">${body}</div>

    <footer class="sheet-foot">
      <div class="sf-help">
        <span class="sf-help-ico">💚</span>
        <div class="sf-help-txt">
          <strong>We're here to help.</strong> If your plant arrives damaged or unhealthy,
          please contact us within <strong>${esc(SHOP.claimWindow)}</strong> with clear photos
          so we can make it right: <strong>${esc(SHOP.email)}</strong>
        </div>
      </div>
      <div class="sf-brand">
        <div class="sf-logo">${SHOP.brandIcon} ${esc(SHOP.brand)}</div>
        ${esc(SHOP.tagline)}<br>
        ${esc(SHOP.email)} · Instagram ${esc(SHOP.instagram)}<br>
        © ${new Date().getFullYear()} ${esc(SHOP.brand)}
      </div>
    </footer>
  </div>`;
}

/* Replace the modal-based detail view with a full-page sheet */
const sheetWrap = document.getElementById("sheetWrap");

function openDetail(idx){
  currentIdx = idx;
  sheetWrap.innerHTML = buildSheet(idx);
  document.body.classList.add("sheet-open");
  window.scrollTo({top:0, behavior:"auto"});
  if(history.replaceState) history.replaceState(null,"","#"+String(plants[idx].id).padStart(3,"0"));
}

function closeDetail(){
  document.body.classList.remove("sheet-open");
  sheetWrap.innerHTML = "";
  currentIdx = -1;
  if(history.replaceState) history.replaceState(null,""," ");
}

function showGallery(){
  closeDetail();
  searchInput.value = "";
  filterPlants();
  window.scrollTo({top:0, behavior:"smooth"});
}

document.addEventListener("keydown", e=>{
  if(!document.body.classList.contains("sheet-open")) return;
  if(e.key === "Escape") showGallery();
  if(e.key === "ArrowLeft"  && currentIdx > 0) openDetail(currentIdx-1);
  if(e.key === "ArrowRight" && currentIdx < plants.length-1) openDetail(currentIdx+1);
});

/* Deep link: #011 opens that plant directly */
(function initFromHash(){
  const h = (location.hash || "").replace("#","").trim();
  if(!/^\d{1,3}$/.test(h)) return;
  const num = parseInt(h, 10);
  const idx = plants.findIndex(x => x.id === num);
  if(idx >= 0) openDetail(idx);
})();
