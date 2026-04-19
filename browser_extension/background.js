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

// -----------------------------
// MAIN MESSAGE HANDLER
// -----------------------------
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "CAPTURE_AND_CROP") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, async (dataUrl) => {
      await ensureOffscreen();

      chrome.runtime.sendMessage(
        {
          type: "CROP_IMAGE",
          image: dataUrl,
          box: msg.box
        },
        (res) => {
          sendResponse({ croppedImage: res.cropped });
        }
      );
    });

    return true;
  }
});