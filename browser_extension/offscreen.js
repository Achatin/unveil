chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "CROP_IMAGE") {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const box = msg.box;

      canvas.width = box.width;
      canvas.height = box.height;

      ctx.drawImage(
        img,
        box.x,
        box.y,
        box.width,
        box.height,
        0,
        0,
        box.width,
        box.height
      );

      const cropped = canvas.toDataURL("image/png");

      sendResponse({ cropped });
    };

    img.src = msg.image;

    return true;
  }
});