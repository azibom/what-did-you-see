const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const screens = {
  intro: $("#introScreen"),
  experiment: $("#experimentScreen"),
  results: $("#resultsScreen"),
};

const canvas = $("#stimulusCanvas");
const context = canvas.getContext("2d", { alpha: false });
const completionCanvas = $("#completionCanvas");
const completionContext = completionCanvas.getContext("2d", { alpha: false });

const state = {
  trials: [],
  index: 0,
  responses: [],
  acceptingResponse: false,
  slide: 0,
  exposure: 50,
  occlusion: 0.42,
};

const stimulusFamilies = [
  ["Fish", "Bird", "Rabbit", "Butterfly"],
  ["Cup", "Teapot", "Bottle", "Kettle"],
  ["Key", "Scissors", "Hammer", "Wrench"],
  ["Umbrella", "Bicycle", "Sailboat", "Airplane"],
  ["Chair", "Lamp", "Clock", "Fan"],
  ["Tree", "Flower", "Mushroom", "Cactus"],
];
const objects = stimulusFamilies.flat();

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

function switchScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove("is-active"));
  $("#deck").hidden = name !== "deck";
  if (screens[name]) screens[name].classList.add("is-active");
  $("#phaseLabel").textContent = name === "deck" ? "Paper presentation" : name === "results" ? "Your result" : "Field experiment";
}

function buildTrials() {
  // One unique item from each family calibrates the display. The remaining
  // eighteen items are each shown exactly once in the measured experiment.
  const calibrationObjects = stimulusFamilies.map((family) => shuffle(family)[0]);
  const measuredObjects = shuffle(objects.filter((object) => !calibrationObjects.includes(object)));
  const calibration = shuffle(calibrationObjects).map((object) => ({
    object,
    masked: true,
    occluded: true,
    calibration: true,
    seed: Math.random(),
  }));
  const measured = measuredObjects.map((object, objectIndex) => ({
      object,
      masked: objectIndex % 2 === 0,
      occluded: true,
      calibration: false,
      seed: Math.random(),
    }));
  return [...calibration, ...measured];
}

function clearStage(color = "#fbfaf6") {
  context.fillStyle = color;
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawObject(ctx, name, width, height, options = {}) {
  const { occluded = false, completion = 0, occlusionLevel = 0.42, seed = 0.42 } = options;
  const scale = Math.min(width / 720, height / 480);
  let randomState = Math.floor(seed * 2147483647) || 1;
  const random = () => {
    randomState = (randomState * 16807) % 2147483647;
    return (randomState - 1) / 2147483646;
  };
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.scale(scale, scale);
  ctx.strokeStyle = "#d8d2c8";
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.58;
  for (let index = 0; index < 11; index += 1) {
    const x = -315 + random() * 630;
    const y = -205 + random() * 410;
    const length = 20 + random() * 68;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (random() - 0.5) * length, y + (random() - 0.5) * length);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.translate((random() - 0.5) * 34, (random() - 0.5) * 24);
  ctx.rotate((random() - 0.5) * 0.09);
  const objectScale = 0.92 + random() * 0.12;
  ctx.scale(objectScale, objectScale);
  ctx.strokeStyle = "#171714";
  ctx.fillStyle = "#171714";
  ctx.lineWidth = 11;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (name === "Fish") {
    ctx.beginPath(); ctx.ellipse(-20, 0, 150, 82, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-165, 0); ctx.lineTo(-260, -82); ctx.lineTo(-245, 75); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(72, -20, 9, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-30, -75); ctx.quadraticCurveTo(15, -135, 58, -72); ctx.moveTo(-35, 78); ctx.quadraticCurveTo(8, 134, 48, 75); ctx.moveTo(108, 20); ctx.quadraticCurveTo(82, 43, 56, 24); ctx.stroke();
  } else if (name === "Bird") {
    ctx.beginPath(); ctx.ellipse(-10, 20, 132, 88, -0.16, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(103, -43, 58, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(157, -45); ctx.lineTo(230, -17); ctx.lineTo(160, 4); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-130, 5); ctx.lineTo(-220, -50); ctx.lineTo(-172, 52); ctx.moveTo(-45, 5); ctx.quadraticCurveTo(15, -55, 75, 22); ctx.moveTo(-20, 102); ctx.lineTo(-38, 155); ctx.moveTo(35, 105); ctx.lineTo(28, 158); ctx.stroke();
    ctx.beginPath(); ctx.arc(119, -58, 7, 0, Math.PI * 2); ctx.fill();
  } else if (name === "Rabbit") {
    ctx.beginPath(); ctx.ellipse(-25, 48, 142, 92, -0.08, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(105, -35, 67, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(76, -135, 28, 90, -0.2, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(128, -140, 27, 94, 0.18, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(-168, 18, 35, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(123, -48, 7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(155, -18); ctx.lineTo(205, -4); ctx.moveTo(152, -7); ctx.lineTo(205, 20); ctx.moveTo(-80, 118); ctx.lineTo(-98, 158); ctx.moveTo(65, 117); ctx.lineTo(92, 157); ctx.stroke();
  } else if (name === "Butterfly") {
    ctx.beginPath(); ctx.ellipse(0, 10, 24, 145, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-20, -65); ctx.bezierCurveTo(-80, -190, -235, -165, -192, -22); ctx.bezierCurveTo(-245, 55, -145, 145, -24, 68); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(20, -65); ctx.bezierCurveTo(80, -190, 235, -165, 192, -22); ctx.bezierCurveTo(245, 55, 145, 145, 24, 68); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-10, -132); ctx.quadraticCurveTo(-55, -195, -88, -170); ctx.moveTo(10, -132); ctx.quadraticCurveTo(55, -195, 88, -170); ctx.stroke();
    [-120, 120].forEach((x) => { ctx.beginPath(); ctx.arc(x, -52, 25, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(x * 1.18, 60, 18, 0, Math.PI * 2); ctx.stroke(); });
  } else if (name === "Cup") {
    ctx.strokeRect(-145, -105, 220, 210);
    ctx.beginPath(); ctx.arc(80, -10, 72, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-175, 123); ctx.lineTo(125, 123); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-85, -135); ctx.bezierCurveTo(-120, -185, -42, -188, -78, -225); ctx.moveTo(-5, -135); ctx.bezierCurveTo(-38, -180, 35, -190, 5, -230); ctx.stroke();
  } else if (name === "Teapot") {
    ctx.beginPath(); ctx.ellipse(0, 30, 145, 112, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-88, -60); ctx.lineTo(-60, -118); ctx.lineTo(62, -118); ctx.lineTo(88, -60); ctx.moveTo(-32, -120); ctx.quadraticCurveTo(0, -170, 34, -120); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(132, -5); ctx.quadraticCurveTo(225, -62, 265, -8); ctx.lineTo(145, 52); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-135, -30); ctx.bezierCurveTo(-245, -75, -245, 120, -120, 92); ctx.stroke();
  } else if (name === "Bottle") {
    ctx.beginPath(); ctx.moveTo(-58, -190); ctx.lineTo(58, -190); ctx.lineTo(58, -105); ctx.quadraticCurveTo(118, -62, 118, 15); ctx.lineTo(118, 170); ctx.quadraticCurveTo(0, 198, -118, 170); ctx.lineTo(-118, 15); ctx.quadraticCurveTo(-118, -62, -58, -105); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-55, -130); ctx.lineTo(55, -130); ctx.moveTo(-115, 60); ctx.quadraticCurveTo(0, 28, 115, 60); ctx.moveTo(-115, 125); ctx.quadraticCurveTo(0, 95, 115, 125); ctx.stroke();
  } else if (name === "Kettle") {
    ctx.beginPath(); ctx.moveTo(-145, -60); ctx.quadraticCurveTo(-175, 70, -112, 145); ctx.quadraticCurveTo(0, 185, 112, 145); ctx.quadraticCurveTo(175, 70, 145, -60); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-65, -63); ctx.lineTo(-45, -125); ctx.lineTo(48, -125); ctx.lineTo(68, -63); ctx.moveTo(145, -42); ctx.lineTo(245, 22); ctx.lineTo(150, 55); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -12, 145, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  } else if (name === "Key") {
    ctx.beginPath(); ctx.arc(-120, 0, 72, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-47, 0); ctx.lineTo(220, 0); ctx.lineTo(220, 62); ctx.moveTo(140, 0); ctx.lineTo(140, 52); ctx.stroke();
    ctx.beginPath(); ctx.arc(-120, 0, 28, 0, Math.PI * 2); ctx.stroke();
  } else if (name === "Scissors") {
    ctx.beginPath(); ctx.arc(-105, 76, 63, 0, Math.PI * 2); ctx.arc(40, 105, 63, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-58, 33); ctx.lineTo(225, -155); ctx.moveTo(84, 61); ctx.lineTo(242, 5); ctx.moveTo(-25, 40); ctx.lineTo(63, 54); ctx.stroke();
    ctx.beginPath(); ctx.arc(42, 34, 12, 0, Math.PI * 2); ctx.fill();
  } else if (name === "Hammer") {
    ctx.save(); ctx.rotate(-0.45); ctx.strokeRect(-34, -55, 68, 260); ctx.strokeRect(-145, -155, 290, 105); ctx.beginPath(); ctx.moveTo(145, -145); ctx.lineTo(225, -90); ctx.lineTo(145, -52); ctx.closePath(); ctx.stroke(); ctx.restore();
    ctx.beginPath(); ctx.moveTo(-70, 145); ctx.lineTo(38, 145); ctx.stroke();
  } else if (name === "Wrench") {
    ctx.save(); ctx.rotate(0.55); ctx.beginPath(); ctx.moveTo(-38, 155); ctx.lineTo(-38, -62); ctx.quadraticCurveTo(-125, -125, -70, -205); ctx.lineTo(-5, -125); ctx.lineTo(62, -205); ctx.quadraticCurveTo(120, -125, 38, -62); ctx.lineTo(38, 155); ctx.closePath(); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 142, 23, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  } else if (name === "Umbrella") {
    ctx.beginPath(); ctx.arc(0, 20, 190, Math.PI, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-190, 20); ctx.quadraticCurveTo(-130, -15, -75, 20); ctx.quadraticCurveTo(0, -25, 75, 20); ctx.quadraticCurveTo(130, -15, 190, 20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -170); ctx.lineTo(0, 145); ctx.quadraticCurveTo(0, 220, 70, 190); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-125, -28); ctx.lineTo(-125, 18); ctx.moveTo(-62, -78); ctx.lineTo(-62, 18); ctx.moveTo(62, -78); ctx.lineTo(62, 18); ctx.moveTo(125, -28); ctx.lineTo(125, 18); ctx.stroke();
  } else if (name === "Bicycle") {
    ctx.beginPath(); ctx.arc(-150, 72, 88, 0, Math.PI * 2); ctx.arc(150, 72, 88, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-150, 72); ctx.lineTo(-52, -58); ctx.lineTo(25, 72); ctx.closePath(); ctx.lineTo(105, -55); ctx.lineTo(150, 72); ctx.moveTo(-52, -58); ctx.lineTo(84, -58); ctx.moveTo(105, -55); ctx.lineTo(80, -112); ctx.lineTo(126, -112); ctx.moveTo(-78, -73); ctx.lineTo(-28, -73); ctx.stroke();
    ctx.beginPath(); ctx.arc(25, 72, 24, 0, Math.PI * 2); ctx.stroke();
  } else if (name === "Sailboat") {
    ctx.beginPath(); ctx.moveTo(-220, 85); ctx.quadraticCurveTo(0, 175, 220, 85); ctx.lineTo(170, 155); ctx.quadraticCurveTo(0, 220, -170, 155); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 85); ctx.lineTo(0, -190); ctx.lineTo(-170, 45); ctx.closePath(); ctx.moveTo(18, -155); ctx.lineTo(165, 52); ctx.lineTo(18, 40); ctx.closePath(); ctx.stroke();
  } else if (name === "Airplane") {
    ctx.beginPath(); ctx.moveTo(-265, 15); ctx.lineTo(-55, -20); ctx.lineTo(52, -140); ctx.lineTo(105, -130); ctx.lineTo(58, -22); ctx.lineTo(245, 4); ctx.lineTo(245, 35); ctx.lineTo(55, 48); ctx.lineTo(105, 145); ctx.lineTo(50, 148); ctx.lineTo(-58, 55); ctx.lineTo(-265, 42); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-165, 0); ctx.lineTo(-210, -58); ctx.moveTo(-100, -10); ctx.lineTo(-125, -78); ctx.stroke();
  } else if (name === "Chair") {
    ctx.beginPath(); ctx.moveTo(-130, -165); ctx.lineTo(-130, 38); ctx.lineTo(120, 38); ctx.lineTo(120, -40); ctx.moveTo(-130, -40); ctx.lineTo(120, -40); ctx.moveTo(-95, 40); ctx.lineTo(-120, 180); ctx.moveTo(86, 40); ctx.lineTo(120, 180); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-92, -128); ctx.lineTo(82, -128); ctx.moveTo(-92, -83); ctx.lineTo(82, -83); ctx.stroke();
  } else if (name === "Lamp") {
    ctx.beginPath(); ctx.moveTo(-145, -35); ctx.lineTo(-82, -170); ctx.lineTo(82, -170); ctx.lineTo(145, -35); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -35); ctx.lineTo(0, 145); ctx.moveTo(-105, 168); ctx.quadraticCurveTo(0, 118, 105, 168); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -55, 28, 0, Math.PI * 2); ctx.stroke();
  } else if (name === "Clock") {
    ctx.beginPath(); ctx.arc(0, 0, 170, 0, Math.PI * 2); ctx.stroke();
    for (let index = 0; index < 12; index += 1) { const angle = index * Math.PI / 6; ctx.beginPath(); ctx.moveTo(Math.sin(angle) * 135, -Math.cos(angle) * 135); ctx.lineTo(Math.sin(angle) * 153, -Math.cos(angle) * 153); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-58, -82); ctx.moveTo(0, 0); ctx.lineTo(92, 38); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
  } else if (name === "Fan") {
    ctx.beginPath(); ctx.arc(0, -25, 160, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -25, 25, 0, Math.PI * 2); ctx.fill();
    for (let index = 0; index < 4; index += 1) { ctx.save(); ctx.translate(0, -25); ctx.rotate(index * Math.PI / 2); ctx.beginPath(); ctx.moveTo(20, 0); ctx.bezierCurveTo(65, -22, 145, -12, 132, 48); ctx.bezierCurveTo(92, 75, 43, 38, 20, 0); ctx.stroke(); ctx.restore(); }
    ctx.beginPath(); ctx.moveTo(0, 135); ctx.lineTo(0, 180); ctx.moveTo(-100, 185); ctx.quadraticCurveTo(0, 145, 100, 185); ctx.stroke();
  } else if (name === "Tree") {
    ctx.beginPath(); ctx.moveTo(-46, 168); ctx.quadraticCurveTo(-25, 55, -52, -18); ctx.moveTo(46, 168); ctx.quadraticCurveTo(25, 55, 52, -18); ctx.moveTo(-110, 168); ctx.lineTo(108, 168); ctx.stroke();
    [[-105,-75,72],[0,-132,88],[110,-68,74],[-32,-35,98]].forEach(([x,y,r]) => { ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.stroke(); });
  } else if (name === "Flower") {
    ctx.beginPath(); ctx.moveTo(0, 25); ctx.quadraticCurveTo(-18, 100, 0, 185); ctx.moveTo(-5, 105); ctx.quadraticCurveTo(-95, 48, -112, 120); ctx.quadraticCurveTo(-58, 145, -5, 105); ctx.moveTo(0, 130); ctx.quadraticCurveTo(85, 70, 108, 142); ctx.quadraticCurveTo(48, 165, 0, 130); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -38, 38, 0, Math.PI * 2); ctx.stroke();
    for (let index = 0; index < 8; index += 1) { ctx.save(); ctx.rotate(index * Math.PI / 4); ctx.beginPath(); ctx.ellipse(0, -105, 35, 68, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  } else if (name === "Mushroom") {
    ctx.beginPath(); ctx.moveTo(-68, 30); ctx.quadraticCurveTo(-55, 105, -92, 175); ctx.quadraticCurveTo(0, 205, 92, 175); ctx.quadraticCurveTo(55, 105, 68, 30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-210, 28); ctx.bezierCurveTo(-170, -170, 170, -170, 210, 28); ctx.quadraticCurveTo(0, 78, -210, 28); ctx.stroke();
    [[-95,-30,17],[0,-85,24],[95,-25,19]].forEach(([x,y,r]) => { ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.stroke(); });
  } else if (name === "Cactus") {
    ctx.beginPath(); ctx.moveTo(-55, 175); ctx.lineTo(-55, -135); ctx.quadraticCurveTo(0, -190, 55, -135); ctx.lineTo(55, 175); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-55, 30); ctx.lineTo(-130, 30); ctx.quadraticCurveTo(-175, 20, -165, -32); ctx.lineTo(-150, -100); ctx.moveTo(55, -18); ctx.lineTo(130, -18); ctx.quadraticCurveTo(175, -25, 165, -78); ctx.lineTo(150, -125); ctx.stroke();
    for (let y = -100; y <= 120; y += 55) { ctx.beginPath(); ctx.moveTo(-22, y); ctx.lineTo(22, y); ctx.stroke(); }
  }

  if (completion > 0) {
    ctx.globalAlpha = completion;
    ctx.strokeStyle = "#f05a2a";
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 8]);
    ctx.beginPath(); ctx.arc(0, 0, 220, 0, Math.PI * 2); ctx.stroke();
  }

  if (occluded) {
    const background = ctx === completionContext ? "#f2eee5" : "#fbfaf6";
    ctx.globalAlpha = 1;
    ctx.fillStyle = background;
    const count = Math.round(5 + occlusionLevel * 8);
    for (let index = 0; index < count; index += 1) {
      const x = -275 + random() * 510;
      const y = -180 + random() * 300;
      const blockWidth = 48 + random() * (55 + occlusionLevel * 65);
      const blockHeight = 42 + random() * (45 + occlusionLevel * 85);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((random() - 0.5) * 0.5);
      ctx.fillRect(0, 0, blockWidth, blockHeight);
      ctx.restore();
    }
  }
  ctx.restore();
}

function drawNoise() {
  const image = context.createImageData(canvas.width, canvas.height);
  const pixels = new Uint32Array(image.data.buffer);
  for (let index = 0; index < pixels.length; index += 1) {
    const shade = Math.random() > .5 ? 0xffece9e3 : 0xff252521;
    pixels[index] = shade;
  }
  context.putImageData(image, 0, 0);
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function showForFrames(duration) {
  const start = performance.now();
  let elapsed = 0;
  while (elapsed < duration) {
    await nextFrame();
    elapsed = performance.now() - start;
  }
  return elapsed;
}

function makeAnswers(correct) {
  const family = stimulusFamilies.find((items) => items.includes(correct));
  return shuffle(family);
}

async function runTrial() {
  state.acceptingResponse = false;
  const trial = state.trials[state.index];
  $("#responsePanel").hidden = true;
  $("#interstitial").hidden = true;
  $("#fixation").style.display = "block";
  clearStage();
  await wait(450 + Math.random() * 200);
  $("#fixation").style.display = "none";
  trial.duration = state.exposure;
  trial.occlusionLevel = state.occlusion;
  drawObject(context, trial.object, canvas.width, canvas.height, {
    occluded: trial.occluded,
    occlusionLevel: trial.occlusionLevel,
    seed: trial.seed,
  });
  const measuredDuration = await showForFrames(trial.duration);
  if (trial.masked) drawNoise(); else clearStage();
  await wait(150);
  clearStage();
  trial.measuredDuration = measuredDuration;
  showResponse(trial);
}

function showResponse(trial) {
  const answerGrid = $("#answerGrid");
  answerGrid.innerHTML = "";
  const answers = makeAnswers(trial.object);
  answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-button";
    button.innerHTML = `<span>${index + 1}</span>${answer}`;
    button.addEventListener("click", () => submitResponse(answer));
    answerGrid.append(button);
  });
  $("#responsePanel").hidden = false;
  state.acceptingResponse = true;
  state.currentAnswers = answers;
}

async function submitResponse(answer) {
  if (!state.acceptingResponse) return;
  state.acceptingResponse = false;
  const trial = state.trials[state.index];
  state.responses.push({ ...trial, answer, correct: answer === trial.object });
  $("#responsePanel").hidden = true;
  if (trial.calibration) {
    if (answer === trial.object) {
      state.exposure = Math.max(25, state.exposure - 8);
      state.occlusion = Math.min(0.62, state.occlusion + 0.035);
    } else {
      state.exposure = Math.min(92, state.exposure + 12);
      state.occlusion = Math.max(0.30, state.occlusion - 0.035);
    }
  }
  state.index += 1;
  if (state.index >= state.trials.length) {
    await showInterstitial("Calculating what survived the mask…", 850);
    showResults();
    return;
  }
  if (state.index === 6) {
    $("#experimentPhase").textContent = "Measured experiment";
    $("#trialCurrent").textContent = "1";
    $("#trialTotal").textContent = "18";
    $("#trialProgress").style.width = "0";
    await showInterstitial("Calibrated. Now the measured experiment begins.", 1300);
  } else if (state.index < 6) {
    $("#trialCurrent").textContent = state.index + 1;
    $("#trialProgress").style.width = `${(state.index / 6) * 100}%`;
  } else {
    const measuredIndex = state.index - 6;
    $("#trialCurrent").textContent = measuredIndex + 1;
    $("#trialProgress").style.width = `${(measuredIndex / 18) * 100}%`;
  }
  if (state.index === 15) {
    await showInterstitial("The object is gone. Your visual system is not finished.", 1100);
  }
  runTrial();
}

async function showInterstitial(message, duration) {
  $("#interstitialText").textContent = message;
  $("#interstitial").hidden = false;
  await wait(duration);
  $("#interstitial").hidden = true;
}

function summarize(condition) {
  const subset = state.responses.filter((response) => !response.calibration && condition(response));
  if (!subset.length) return 0;
  return Math.round((subset.filter((response) => response.correct).length / subset.length) * 100);
}

function showResults() {
  const blank = summarize((response) => !response.masked);
  const mask = summarize((response) => response.masked);
  const cost = blank - mask;
  $("#blankScore").textContent = `${blank}%`;
  $("#maskScore").textContent = `${mask}%`;
  $("#maskCost").textContent = `${cost > 0 ? "+" : ""}${cost}`;
  $("#blankBarLabel").textContent = `${blank}%`;
  $("#maskBarLabel").textContent = `${mask}%`;
  const ceiling = blank >= 95 && mask >= 95;
  $("#resultNarrative").textContent = ceiling
    ? "This run reached the ceiling even after calibration. That is a task limitation—not evidence that masking has no effect."
    : cost > 5
      ? `Your accuracy fell by ${cost} percentage points when visual noise followed the object.`
      : cost < -5
        ? `Your short run did not show a masking cost. Individual demonstrations are noisy—and that is part of the scientific lesson.`
        : `Your masked and unmasked scores were similar in this short run. A personal demonstration is not a group experiment.`;
  $("#slidePersonalResult").textContent = cost > 5
    ? `In your run, accuracy was ${blank}% without a mask and ${mask}% with one—a ${cost}-point difference.`
      : `Your run produced ${blank}% accuracy without a mask and ${mask}% with one. One participant is an experience, not a conclusion.`;
  $("#difficultySummary").textContent = `Calibrated exposure: ~${Math.round(state.exposure)} ms · occlusion: ${Math.round(state.occlusion * 100)}% · Responses stayed in this browser.`;
  switchScreen("results");
  requestAnimationFrame(() => {
    $("#blankBar").style.width = `${blank}%`;
    $("#maskBar").style.width = `${mask}%`;
  });
}

function startExperiment() {
  state.trials = buildTrials();
  state.responses = [];
  state.index = 0;
  state.exposure = 50;
  state.occlusion = 0.42;
  $("#experimentPhase").textContent = "Before you begin";
  $("#trialCurrent").textContent = "0";
  $("#trialTotal").textContent = "6";
  $("#trialProgress").style.width = "0";
  $("#readyPanel").hidden = false;
  $("#responsePanel").hidden = true;
  clearStage();
  switchScreen("experiment");
}

function beginTrials() {
  $("#readyPanel").hidden = true;
  $("#experimentPhase").textContent = "Calibration";
  $("#trialCurrent").textContent = "1";
  runTrial();
}

function drawCompletionFrame(progress = 0) {
  completionContext.fillStyle = "#f2eee5";
  completionContext.fillRect(0, 0, completionCanvas.width, completionCanvas.height);
  drawObject(completionContext, "Fish", completionCanvas.width, completionCanvas.height, { occluded: progress < .88, completion: progress });
}

function animateCompletion(time = 0) {
  const progress = (Math.sin(time / 1100) + 1) / 2;
  drawCompletionFrame(progress);
  requestAnimationFrame(animateCompletion);
}

function showSlide(index) {
  const slides = $$(".slide");
  state.slide = Math.max(0, Math.min(slides.length - 1, index));
  slides.forEach((slide, slideIndex) => slide.classList.toggle("is-current", slideIndex === state.slide));
  const current = slides[state.slide];
  $("#currentSlideNumber").textContent = state.slide + 1;
  $("#currentSlideLabel").textContent = current.dataset.label;
  $("#deckProgress").style.width = `${((state.slide + 1) / slides.length) * 100}%`;
  $("#previousSlide").disabled = state.slide === 0;
  $("#nextSlide").disabled = state.slide === slides.length - 1;
}

function enterStory() {
  if (!state.responses.length) {
    $("#slidePersonalResult").textContent = "This presentation usually begins with a visitor’s own masked and unmasked result. Start the experiment to generate yours.";
  }
  switchScreen("deck");
  window.history.replaceState(null, "", "#presentation");
  window.scrollTo(0, 0);
  showSlide(0);
}

function handleKeydown(event) {
  if (state.acceptingResponse && /^[1-4]$/.test(event.key)) {
    submitResponse(state.currentAnswers[Number(event.key) - 1]);
    return;
  }
  if (!$("#deck").hidden) {
    if (["ArrowRight", "PageDown", " "].includes(event.key)) { event.preventDefault(); showSlide(state.slide + 1); }
    if (["ArrowLeft", "PageUp"].includes(event.key)) { event.preventDefault(); showSlide(state.slide - 1); }
  }
}

$("#startButton").addEventListener("click", startExperiment);
$("#readyButton").addEventListener("click", beginTrials);
$("#retryButton").addEventListener("click", startExperiment);
$("#enterStoryButton").addEventListener("click", enterStory);
$("#presentationLink").addEventListener("click", (event) => {
  event.preventDefault();
  state.slide = 0;
  enterStory();
});
$("#exitExperiment").addEventListener("click", () => switchScreen("intro"));
$("#previousSlide").addEventListener("click", () => showSlide(state.slide - 1));
$("#nextSlide").addEventListener("click", () => showSlide(state.slide + 1));
$("#fullscreenButton").addEventListener("click", () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());
$("#aboutButton").addEventListener("click", () => $("#aboutDialog").showModal());
$("#closeAbout").addEventListener("click", () => $("#aboutDialog").close());
$("#aboutDialog").addEventListener("click", (event) => { if (event.target === $("#aboutDialog")) $("#aboutDialog").close(); });
$(".wordmark").addEventListener("click", (event) => {
  event.preventDefault();
  window.history.replaceState(null, "", window.location.pathname);
  switchScreen("intro");
});
document.addEventListener("keydown", handleKeydown);

clearStage();
drawCompletionFrame();
requestAnimationFrame(animateCompletion);
if (window.location.hash === "#presentation") enterStory();
