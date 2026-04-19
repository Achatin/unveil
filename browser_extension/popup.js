chrome.storage.local.get(["annotations"], (res) => {
  const list = document.getElementById("list");

  (res.annotations || []).forEach((a) => {
    const div = document.createElement("div");
    div.style.marginBottom = "10px";
    div.innerText = `${a.selector} — ${a.text}`;
    list.appendChild(div);
  });
});