chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== "CROP_IMAGE") return;

  const img = new Image();

  img.onload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const box = msg.box;

    const dpr = msg.devicePixelRatio || 1;

    // 🔥 KEY FIX: subtract scroll BEFORE scaling
    const sx = (box.x - msg.scrollX) * dpr;
    const sy = (box.y - msg.scrollY) * dpr;

    const sw = box.width * dpr;
    const sh = box.height * dpr;

    canvas.width = sw;
    canvas.height = sh;

    ctx.drawImage(
      img,
      sx,
      sy,
      sw,
      sh,
      0,
      0,
      sw,
      sh
    );

    sendResponse({
      cropped: canvas.toDataURL("image/png")
    });
  };

  img.src = msg.image;

  return true;
});