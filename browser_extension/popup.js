const API_URL = "http://localhost:3000/api";

// Elements
const select = document.getElementById("projectSelect");
const link = document.getElementById("projectLink");
const toggle = document.getElementById("toggle");

// Load saved state
chrome.storage.local.get(["annotationMode", "projectId"], (res) => {
  toggle.checked = res.annotationMode ?? false;
  loadProjects(res.projectId);
});

// -----------------------------
// LOAD PROJECTS
// -----------------------------
function loadProjects(savedId) {
  fetch(`${API_URL}/project`)
    .then((res) => {
      if (!res.ok) throw new Error("API not reachable");
      return res.json();
    })
    .then((projects) => {
      if (!projects || projects.length === 0) {
        showStatus("No projects found. Create one in your app.");
        return;
      }

      showProjects();

      select.innerHTML = `<option value="">Select project</option>`;

      projects.forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.name;
        select.appendChild(opt);
      });

      if (savedId) {
        select.value = savedId;
        updateLink(savedId);
      }

      hideStatus();
    })
    .catch(() => {
      showStatus(null, true);
    });
}

// -----------------------------
// PROJECT SELECT CHANGE
// -----------------------------
select.addEventListener("change", () => {
  const projectId = select.value;

  chrome.storage.local.set({ projectId });

  updateLink(projectId);

  sendToTab({
    type: "SET_PROJECT",
    projectId
  });
});

// -----------------------------
// UPDATE LINK
// -----------------------------
function updateLink(projectId) {
  if (!projectId) {
    link.style.display = "none";
    return;
  }

  link.href = `http://localhost:3000/project/${projectId}`;
  link.style.display = "block";
}

// -----------------------------
// TOGGLE MODE
// -----------------------------
toggle.addEventListener("change", (e) => {
  const value = e.target.checked;

  chrome.storage.local.set({ annotationMode: value });

  sendToTab({
    type: "SET_MODE",
    value
  });
});

// -----------------------------
// SEND MESSAGE
// -----------------------------
function sendToTab(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    chrome.tabs.sendMessage(tabs[0].id, message);
  });
}


// Helpers
function showStatus(msg, withLink = false) {
  const el = document.getElementById("status");
  el.style.display = "block";
  hideProjects();

  if (withLink) {
    el.innerHTML = `
      ⚠️ Backend not running.<br/>
      <a href="http://localhost:3000" target="_blank">
        Open localhost:3000
      </a>
    `;
  } else {
    el.innerText = msg;
  }
}

function hideStatus() {
  const el = document.getElementById("status");
  el.style.display = "none";
}

function showProjects() {
  const el = document.getElementById("project");
  el.style.display = "block";
}

function hideProjects() {
  const el = document.getElementById("project");
  el.style.display = "none";
}