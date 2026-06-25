/* SoVi Living Lab — rendering and interactions.
   Builds the scorecard grid, dashboard donut and matrix, the
   college drawer, the path-to-gold toggle, and the hero animation.
   Loads AFTER data.js. */

// build grid
const grid = document.getElementById("grid");
credits.forEach((c,i)=>{
  const pct = Math.round((c.earned/c.max)*100);
  const el = document.createElement("button");
  el.className="credit";
  el.dataset.code=c.code;
  el.setAttribute("aria-haspopup","dialog");
  el.innerHTML = `
    <div class="ct">
      <span class="code">${c.code}</span>
      <span class="pts"><b>${c.earned}</b> / ${c.max} pts</span>
    </div>
    <h4>${c.name}</h4>
    <div class="ptbar"><i style="width:${pct}%"></i></div>
    <div class="tags">${c.tags.map(t=>`<span class="tag">${t}</span>`).join("")}</div>
    <span class="more">open lesson →</span>`;
  el.addEventListener("click",()=>openDrawer(i));
  grid.appendChild(el);
});

// build colleges
const discGrid = document.getElementById("discGrid");
colleges.forEach((p,i)=>{
  const el = document.createElement("button");
  el.className="prog";
  el.dataset.idx=i;
  el.setAttribute("aria-haspopup","dialog");
  el.innerHTML = `
    <div class="pn"><span class="dot" style="background:${p.color}"></span>${p.name}</div>
    <div class="maj">${p.majors}</div>
    <div class="pcodes">${p.codes.map(c=>`<span class="pcode">${c}</span>`).join("")}</div>
    <p>${p.text}</p>
    <span class="pmore">a way in →</span>`;
  el.addEventListener("click",()=>openCollege(i));
  discGrid.appendChild(el);
});

// dashboard: leed donut + college matrix
(function(){
  const palette=["#004685","#0a5e92","#1f8fb0","#0f8f8a","#009366","#3a9d57","#74a64a","#b5852f","#cc7a22"];
  const R=66, SW=22, CX=90, CY=90, total=110, C=2*Math.PI*R;
  let off=0, svg=`<circle r="${R}" cx="${CX}" cy="${CY}" fill="none" stroke="#E2E7DD" stroke-width="${SW}"/>`;
  credits.forEach((c,i)=>{
    const len=(c.earned/total)*C;
    svg+=`<circle r="${R}" cx="${CX}" cy="${CY}" fill="none" stroke="${palette[i]}" stroke-width="${SW}" stroke-dasharray="${len.toFixed(2)} ${(C-len).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 ${CX} ${CY})"><title>${c.code} ${c.name}: ${c.earned} pts</title></circle>`;
    off+=len;
  });
  svg+=`<g class="donut-center" text-anchor="middle"><text class="dc-num" x="${CX}" y="${CY-1}">54</text><text class="dc-sub" x="${CX}" y="${CY+15}">/ 110 · Silver</text></g>`;
  document.getElementById("leedDonut").innerHTML=svg;
  document.getElementById("donutLegend").innerHTML=credits.map((c,i)=>
    `<div class="leg"><span class="sw" style="background:${palette[i]}"></span><span class="lc">${c.code}</span><span class="ln">${c.name}</span><span class="lp">${c.earned}</span></div>`).join("");

  const shorts=["Engineering","Water School","Business","Entrepreneurship","Health","Arts & Sciences","Education"];
  const codes=credits.map(c=>c.code);
  let head=`<thead><tr><th></th>${codes.map(c=>`<th scope="col">${c}</th>`).join("")}<th scope="col">·</th></tr></thead>`;
  let body="<tbody>";
  colleges.forEach((p,i)=>{
    let rt=0;
    const cells=codes.map(code=>{
      const on=p.codes.includes(code); if(on) rt++;
      return `<td>${on?`<span class="on" title="${shorts[i]} · ${leedNames[code]}"></span>`:`<span class="off"></span>`}</td>`;
    }).join("");
    body+=`<tr><th scope="row">${shorts[i]}</th>${cells}<td class="rt">${rt}</td></tr>`;
  });
  body+="</tbody>";
  const colTotals=codes.map(code=>colleges.filter(p=>p.codes.includes(code)).length);
  let foot=`<tfoot><tr><th>colleges</th>${colTotals.map(n=>`<td>${n}</td>`).join("")}<td></td></tr></tfoot>`;
  document.getElementById("leedMatrix").innerHTML=head+body+foot;
})();

// path to gold
const goldPath={WE:2,EA:2,MR:1,EQ:1};
let goldOn=false;
const goldToggle=document.getElementById("goldToggle");
const goldPanel=document.getElementById("goldPanel");
const totalNum=document.querySelector(".total-strip .num");
const totalFill=document.querySelector(".total-strip .track i");
function setGold(on){
  goldOn=on;
  document.querySelectorAll(".credit").forEach(card=>{
    const code=card.dataset.code;
    const has=card.querySelector(".goldbadge");
    if(on && goldPath[code]){
      card.classList.add("gold");
      if(!has){
        const b=document.createElement("span");
        b.className="goldbadge";
        b.textContent="+"+goldPath[code]+" → Gold";
        card.appendChild(b);
      }
    }else{
      card.classList.remove("gold");
      if(has) has.remove();
    }
  });
  totalNum.textContent=on?"60":"54";
  totalFill.style.width=on?"55%":"49%";
  totalFill.style.background=on?"linear-gradient(90deg,var(--canopy),var(--solar))":"";
  goldPanel.classList.toggle("open",on);
  goldToggle.setAttribute("aria-pressed",on?"true":"false");
  goldToggle.textContent=on?"Back to the Silver target":"Show the path to Gold →";
}
goldToggle.addEventListener("click",()=>setGold(!goldOn));

// drawer
const scrim=document.getElementById("scrim");
const drawer=document.getElementById("drawer");
let lastFocus=null;
function openDrawer(i){
  const c=credits[i];
  lastFocus=document.activeElement;
  document.getElementById("dCode").textContent = c.code + " · LEED category";
  document.getElementById("drawerTitle").textContent = c.name;
  document.getElementById("dPts").textContent = `${c.earned} of ${c.max} points · illustrative target`;
  document.getElementById("dLabel1").textContent = "The question";
  document.getElementById("dHook").textContent = c.hook;
  document.getElementById("dLabel2").textContent = "A sample lesson";
  document.getElementById("dLesson").textContent = c.lesson;
  document.getElementById("dLabel3").textContent = "Programs that plug in";
  document.getElementById("dTags").innerHTML = c.tags.map(t=>`<span class="dtag">${t}</span>`).join("");
  scrim.classList.add("open");
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden","false");
  document.getElementById("dclose").focus();
}
function closeDrawer(){
  scrim.classList.remove("open");
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden","true");
  if(lastFocus) lastFocus.focus();
}
function openCollege(i){
  const p=colleges[i];
  lastFocus=document.activeElement;
  document.getElementById("dCode").textContent = "College · a way in";
  document.getElementById("drawerTitle").textContent = p.name;
  document.getElementById("dPts").textContent = p.majors;
  document.getElementById("dLabel1").textContent = "The way in";
  document.getElementById("dHook").textContent = p.wayin;
  document.getElementById("dLabel2").textContent = "Starter projects";
  document.getElementById("dLesson").innerHTML = `<ul class="dlist">${p.projects.map(t=>`<li>${t}</li>`).join("")}</ul>`;
  document.getElementById("dLabel3").textContent = "LEED categories it connects to";
  document.getElementById("dTags").innerHTML = p.codes.map(c=>`<span class="dtag">${c} · ${leedNames[c]}</span>`).join("");
  scrim.classList.add("open");
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden","false");
  document.getElementById("dclose").focus();
}
document.getElementById("dclose").addEventListener("click",closeDrawer);
scrim.addEventListener("click",closeDrawer);
document.addEventListener("keydown",e=>{ if(e.key==="Escape") closeDrawer(); });

// animate hero band fill to Silver (54/110 ≈ 49%)
window.addEventListener("load",()=>{
  setTimeout(()=>{ document.getElementById("bandFill").style.width="49%"; },250);
});