async function ensureOffscreen() {
  const exists = await chrome.offscreen.hasDocument();

  if (!exists) {
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["DOM_PARSER"],
      justification: "Crop screenshots"
    });
  }
}

function captureTab() {
  return new Promise((resolve, reject) => {
    chrome.tabs.captureVisibleTab(
      null,
      { format: "png" },
      (dataUrl) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(dataUrl);
        }
      }
    );
  });
}

// -----------------------------
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== "CAPTURE_AND_CROP") return;

  (async () => {
    try {
      const dataUrl = await captureTab();

      await ensureOffscreen();

      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          type: "CROP_IMAGE",
          image: dataUrl,
          box: msg.box,
          scrollX: msg.scrollX,
          scrollY: msg.scrollY,
          devicePixelRatio: msg.devicePixelRatio
        },
          (res) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(res);
            }
          }
        );
      });

      sendResponse({ croppedImage: response.cropped });
    } catch (err) {
      console.error("CAPTURE_AND_CROP failed:", err);
      sendResponse({ error: err.message });
    }
  })();

  return true;
});