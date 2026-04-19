let annotationMode = true;
let selectedElement = null;

const API_URL = "http://localhost:3000/api";

// -----------------------------
// HOVER HIGHLIGHT
// -----------------------------
document.addEventListener("mouseover", (e) => {
  if (!annotationMode || selectedElement) return;
  e.target.style.outline = "2px solid red";
});

document.addEventListener("mouseout", (e) => {
  if (!annotationMode || selectedElement) return;
  e.target.style.outline = "";
});

// -----------------------------
// CLICK ELEMENT
// -----------------------------
document.addEventListener("click", (e) => {
  if (!annotationMode) return;
  if (e.target.closest("#ux-panel")) return;

  e.preventDefault();
  e.stopPropagation();

  selectedElement = e.target;

  showPanel(e.pageX, e.pageY, selectedElement);
});

// -----------------------------
// UI PANEL
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
    width:240px;
    box-shadow:0 4px 12px rgba(0,0,0,0.2);
    font-family:sans-serif;
  `;

  panel.innerHTML = `
    <div><b>Annotate</b></div>

    <select id="cat" style="width:100%;margin-top:6px;">
      <option value="hidden-cost">Hidden cost</option>
      <option value="forced-continuity">Forced continuity</option>
      <option value="misdirection">Misdirection</option>
      <option value="roach-motel">Roach motel</option>
      <option value="visual-interference">Visual interference</option>
    </select>

    <textarea id="desc" style="width:100%;height:60px;margin-top:6px;"></textarea>

    <button id="save">Save</button>
    <button id="cancel">Cancel</button>
  `;

  document.body.appendChild(panel);

  panel.querySelector("#save").onclick = () => {
    const category = panel.querySelector("#cat").value;
    const description = panel.querySelector("#desc").value;

    saveAnnotation(element, category, description);

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
// SAVE + SCREENSHOT REQUEST
// -----------------------------
function saveAnnotation(element, category, description) {
  const box = getBox(element);

  chrome.runtime.sendMessage(
    {
      type: "CAPTURE_AND_CROP",
      box
    },
    (res) => {
      const annotation = {
        projectId: "cmo5zq35t00005ist9cceonr0",
        url: window.location.href,
        title: document.title,
        label: category,
        description,
        location: "Header",
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        selector: getSelector(element),
        text: element.innerText?.slice(0, 120) || "",
        screenshot: res.croppedImage || res.cropped
      };

      chrome.storage.local.get(["annotations"], (data) => {
        const arr = data.annotations || [];
        arr.push(annotation);
        chrome.storage.local.set({ annotations: arr });
      });

      console.log("Saved:", annotation);

      fetch(`${API_URL}/annotation`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(annotation)
        })
        .then(res => res.json())
        .then(data => {
            console.log("Sent to API:", data);
        })
        .catch(err => {
            console.error("API error:", err);
        });
    }
  );
}

// -----------------------------
// ELEMENT BOX (NO SCROLL OFFSET)
// -----------------------------
function getBox(el) {
  const r = el.getBoundingClientRect();

  return {
    x: r.left,
    y: r.top,
    width: r.width,
    height: r.height
  };
}

// -----------------------------
// SIMPLE SELECTOR
// -----------------------------
function getSelector(el) {
  if (!el) return null;
  if (el.id) return `#${el.id}`;

  let path = [];

  while (el && el.nodeType === 1) {
    let s = el.nodeName.toLowerCase();

    if (el.className && typeof el.className === "string") {
      const cls = el.className.trim().split(/\s+/).slice(0, 2).join(".");
      if (cls) s += "." + cls;
    }

    path.unshift(s);
    el = el.parentElement;
  }

  return path.join(" > ");
}

// -----------------------------
// TOGGLE MODE
// -----------------------------
document.addEventListener("keydown", (e) => {
  if (e.key === "a") {
    annotationMode = !annotationMode;
    console.log("Annotation mode:", annotationMode);
  }

  if (e.key === "Escape") {
    selectedElement = null;
    removePanel();
  }
});