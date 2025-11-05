const canvas = document.getElementById("lineCanvas");
const ctx = canvas.getContext("2d");

function updateCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = document.body.scrollHeight;
}

// Randomly position boxes
function randomizeBoxPositions() {
  const redBoxes = document.querySelectorAll(".photo:not(.fixed)");
  const greenBoxes = document.querySelectorAll(".green:not(.fixed)");
  const margin = 150;

  // Randomize red boxes (except the fixed one)
  redBoxes.forEach((box, i) => {
    const x = Math.random() * (window.innerWidth - margin * 2) + margin;
    const y = i * 400 + Math.random() * 200 + 400;
    box.style.position = "absolute";
    box.style.left = `${x}px`;
    box.style.top = `${y}px`;
  });

  // Randomize green boxes (except the fixed one)
  greenBoxes.forEach((box, i) => {
    const x = Math.random() * (window.innerWidth - margin * 2) + margin;
    const y = i * 400 + Math.random() * 200 + 600;
    box.style.position = "absolute";
    box.style.left = `${x}px`;
    box.style.top = `${y}px`;
    makeDraggable(box);
  });

  // Keep the first red box and green box fixed at the top
  const firstRed = document.querySelector(".photo.fixed");
  const firstGreen = document.querySelector(".green.fixed");
  if (firstRed && firstGreen) {
    firstRed.style.position = "fixed";
    firstRed.style.top = "120px";
    firstRed.style.left = "50%";
    firstRed.style.transform = "translateX(-50%)";

    firstGreen.style.position = "fixed";
    firstGreen.style.top = "340px"; // below the red box
    firstGreen.style.left = "50%";
    firstGreen.style.transform = "translateX(-50%)";
  }
}

function getCenters() {
  return [...document.querySelectorAll(".photo")].map((el) => {
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + window.scrollY + rect.height / 2,
    };
  });
}

// Draw smoother, slightly organic line
function drawOrganicLine(points, progress = 1) {
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];

    // Smaller jitter for smoother, slower wobble
    const midX = (prev.x + curr.x) / 2 + (Math.random() - 0.5) * 10;
    const midY = (prev.y + curr.y) / 2 + (Math.random() - 0.5) * 10;

    ctx.quadraticCurveTo(midX, midY, curr.x, curr.y);
  }

  ctx.lineWidth = 6;
  ctx.strokeStyle = "#0088d1";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const totalLength = points.reduce((acc, curr, i) => {
    if (i === 0) return 0;
    const prev = points[i - 1];
    const dist = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    return acc + dist;
  }, 0);

  ctx.setLineDash([totalLength]);
  ctx.lineDashOffset = totalLength * (1 - progress);
  ctx.stroke();
}

function drawLine(progress = 1) {
  updateCanvasSize();
  const centers = getCenters();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawOrganicLine(centers, progress);
}

function getScrollProgress() {
  const scrollY = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  return Math.min(1, Math.max(0, scrollY / maxScroll));
}

// Simple drag logic for green boxes
function makeDraggable(el) {
  let offsetX,
    offsetY,
    isDragging = false;

  el.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;
    el.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    el.style.left = `${e.clientX - offsetX}px`;
    el.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    el.style.cursor = "grab";
  });
}

// Animation loop
function animate() {
  const progress = getScrollProgress();
  drawLine(progress);
  requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
  randomizeBoxPositions();
  drawLine(getScrollProgress());
});

window.addEventListener("load", () => {
  // Add a fixed class to the first red and green elements
  const firstRed = document.querySelector(".photo");
  const firstGreen = document.querySelector(".green");
  if (firstRed) firstRed.classList.add("fixed");
  if (firstGreen) firstGreen.classList.add("fixed");

  randomizeBoxPositions();
  animate();
});
