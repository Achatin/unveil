// content.js
const API_URL = "http://localhost:3000/api";

let annotationMode = false;
let projectId = null;
let selectedElement = null;

let LABELS = [];
let LOCATIONS = [];

fetch(chrome.runtime.getURL("labels.json"))
  .then(res => res.json())
  .then(data => {
    LABELS = data.labels || [];
    LOCATIONS = data.locations || [];
  })
  .catch(err => {
    console.error("Failed to load labels.json:", err);
  });

// -----------------------------
// INIT
// -----------------------------
chrome.storage.local.get(["annotationMode", "projectId"], (res) => {
  annotationMode = res.annotationMode ?? false;
  projectId = res.projectId ?? null;

  loadAnnotations();
});

// -----------------------------
// LISTENER
// -----------------------------
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "SET_MODE") {
    annotationMode = msg.value;
  }

  if (msg.type === "SET_PROJECT") {
    projectId = msg.projectId;

    clearRenderedAnnotations();
    loadAnnotations();
  }
});

// -----------------------------
// HOVER
// -----------------------------
document.addEventListener("mouseover", (e) => {
  if (!annotationMode || selectedElement) return;
  if (e.target.closest("#ux-panel")) return;

  e.target.style.outline = "2px solid red";
});

document.addEventListener("mouseout", (e) => {
  if (!annotationMode || selectedElement) return;
  if (e.target.closest("#ux-panel")) return;

  e.target.style.outline = "";
});

// -----------------------------
// CLICK
// -----------------------------
document.addEventListener("click", (e) => {
  if (!annotationMode) return;
  if (!e.altKey) return;
  if (e.target.closest("#ux-panel")) return;

  e.preventDefault();
  e.stopPropagation();

  selectedElement = e.target;
  showPanel(e.pageX, e.pageY, selectedElement);
});

// -----------------------------
// PANEL
// -----------------------------
function showPanel(x, y, element) {
  removePanel();

  const panel = document.createElement("div");
  panel.id = "ux-panel";

  panel.style = `
    position:absolute;
    left:${x}px;
    top:${y}px;
    z-index:999999;
    background:#fff;
    border:1px solid #ccc;
    padding:10px;
    width:260px;
    box-shadow:0 4px 12px rgba(0,0,0,0.2);
    font-family:sans-serif;
  `;

  panel.innerHTML = `
    <div><b>Annotate</b></div>

    <select id="cat" style="width:100%;margin-top:6px;"></select>

    <div id="suggestions" style="margin-top:6px;"></div>

    <select id="location" style="width:100%;margin-top:6px;"></select>

    <textarea id="desc" style="width:100%;height:60px;margin-top:6px;"></textarea>

    <button id="save">Save</button>
    <button id="cancel">Cancel</button>
  `;

  document.body.appendChild(panel);

  const cat = panel.querySelector("#cat");
  const desc = panel.querySelector("#desc");
  const suggestionBox = panel.querySelector("#suggestions");

  // -----------------------------
  // BUILD LABELS
  // -----------------------------
  cat.innerHTML = LABELS.map(l =>
    `<option value="${l.name}">${l.name}</option>`
  ).join("");

  function updateSuggestions() {
    const label = LABELS.find(l => l.id === cat.value);
    suggestionBox.innerHTML = "";

    if (!label?.suggested_descriptions?.length) return;

    const title = document.createElement("div");
    title.textContent = "Suggested:";
    title.style = "font-size:12px;margin-top:6px;font-weight:bold;";
    suggestionBox.appendChild(title);

    label.suggested_descriptions.forEach(descText => {
      const btn = document.createElement("button");

      btn.textContent = descText;
      btn.style = `
        display:block;
        width:100%;
        margin-top:4px;
        font-size:11px;
        cursor:pointer;
      `;

      btn.onclick = () => {
        desc.value = descText;
      };

      suggestionBox.appendChild(btn);
    });
  }

  cat.addEventListener("change", updateSuggestions);
  updateSuggestions();

  // -----------------------------
  // LOCATION
  // -----------------------------
  const loc = panel.querySelector("#location");
  loc.innerHTML = LOCATIONS.map(l =>
    `<option value="${l}">${l}</option>`
  ).join("");

  loc.value = detectPageLocation(element);

  // -----------------------------
  // SAVE
  // -----------------------------
  panel.querySelector("#save").onclick = () => {
    saveAnnotation(
      element,
      cat.value,
      loc.value,
      desc.value
    );

    panel.remove();
    selectedElement = null;
  };

  panel.querySelector("#cancel").onclick = () => {
    panel.remove();
    selectedElement = null;
  };
}

function removePanel() {
  const p = document.getElementById("ux-panel");
  if (p) p.remove();
}

// -----------------------------
// SAVE
// -----------------------------
function saveAnnotation(element, category, location, description) {
  if (!projectId) {
    alert("Please select a project first");
    return;
  }

  const box = getBox(element);

  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  const dpr = window.devicePixelRatio;

  chrome.runtime.sendMessage({
    type: "CAPTURE_AND_CROP",
    box,
    scrollX,
    scrollY,
    devicePixelRatio: dpr
  },
    (res) => {
      const annotation = {
        projectId,
        url: window.location.href,
        title: document.title,
        label: category,
        location,
        description,
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        selector: getSelector(element),
        text: normalizeText(element.innerText?.slice(0, 120)),
        screenshot: res.croppedImage || res.cropped
      };

      fetch(`${API_URL}/annotation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(annotation)
      });

      renderAnnotations([annotation]);
    }
  );
}

// -----------------------------
// LOAD
// -----------------------------
function loadAnnotations() {
  if (!projectId) return;

  fetch(`${API_URL}/annotation`)
    .then(res => res.json())
    .then(data => {
      if (data.find(a => a.url === window.location.href)) {
        setTimeout(() => waitForDomThenRender(data), 300);
      }
    });
}

// -----------------------------
// RENDER
// -----------------------------
function renderAnnotations(list) {
  list.forEach(a => {
    const candidates = document.querySelectorAll(a.selector);

    let el = Array.from(candidates).find(e =>
      normalizeText(e.innerText) === normalizeText(a.text)
    );

    if (!el) el = candidates[0];

    if (el) {
      el.style.border = "2px solid orange";
      el.style.background = "rgba(255,165,0,0.2)";
    } else {
      drawFallbackBox(a);
    }
  });
}

// -----------------------------
// FALLBACK
// -----------------------------
function drawFallbackBox(a) {
  const box = document.createElement("div");
  box.className = "ux-fallback";

  box.style = `
    position:absolute;
    left:${a.x}px;
    top:${a.y}px;
    width:${a.width}px;
    height:${a.height}px;
    border:2px dashed blue;
    z-index:999998;
  `;

  document.body.appendChild(box);
}

// -----------------------------
// HELPERS
// -----------------------------
function getBox(el) {
  const r = el.getBoundingClientRect();
  return {
    x: r.left + window.scrollX,
    y: r.top + window.scrollY,
    width: r.width,
    height: r.height
  };
}

function getSelector(el) {
  if (!el) return null;

  if (el.id) return `#${CSS.escape(el.id)}`;

  let path = [];

  while (el && el.nodeType === 1 && el !== document.body) {
    let part = el.tagName.toLowerCase();

    const parent = el.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        child => child.tagName === el.tagName
      );

      if (siblings.length > 1) {
        part += `:nth-of-type(${siblings.indexOf(el) + 1})`;
      }
    }

    path.unshift(part);
    el = el.parentElement;
  }

  return path.join(" > ");
}

function detectPageLocation(element) {
  if (!element) return "Unknown";

  if (element.closest("nav, header")) return "Header";
  if (element.closest("footer")) return "Footer";

  const path = window.location.pathname.toLowerCase();

  if (path.includes("cart")) return "Cart";
  if (path.includes("checkout")) return "Checkout page";
  if (path.includes("product")) return "Product page";
  if (path.includes("shop")) return "Shop-All page";

  if (path === "/" || path === "") return "Home page";

  return "Unknown";
}

function waitForDomThenRender(list, retries = 10) {
  const tryRender = () => {
    const ready = list.filter(a =>
      document.querySelectorAll(a.selector).length > 0
    ).length;

    if (ready === list.length || retries <= 0) {
      renderAnnotations(list);
    } else {
      setTimeout(() => waitForDomThenRender(list, retries - 1), 300);
    }
  };

  tryRender();
}

function normalizeText(str) {
  return (str || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// -----------------------------
// ESC
// -----------------------------
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    selectedElement = null;
    removePanel();
  }
});