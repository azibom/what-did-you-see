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
  exposure: 83,
  occlusion: 0.48,
};

const objects = ["Fish", "Cup", "Key", "Umbrella", "Plane", "Chair"];

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
  const calibration = shuffle(objects).map((object) => ({
    object,
    masked: true,
    occluded: true,
    calibration: true,
    seed: Math.random(),
  }));
  const measured = [];
  for (let repetition = 0; repetition < 3; repetition += 1) {
    objects.forEach((object, objectIndex) => measured.push({
      object,
      masked: (objectIndex + repetition) % 2 === 0,
      occluded: true,
      calibration: false,
      seed: Math.random(),
    }));
  }
  return [...calibration, ...shuffle(measured)];
}

function clearStage(color = "#fbfaf6") {
  context.fillStyle = color;
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawObject(ctx, name, width, height, options = {}) {
  const { occluded = false, completion = 0, occlusionLevel = 0.48, seed = 0.42 } = options;
  const scale = Math.min(width / 720, height / 480);
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.scale(scale, scale);
  ctx.strokeStyle = "#171714";
  ctx.fillStyle = "#171714";
  ctx.lineWidth = 13;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (name === "Fish") {
    ctx.beginPath(); ctx.ellipse(-20, 0, 150, 82, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-165, 0); ctx.lineTo(-260, -82); ctx.lineTo(-245, 75); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(72, -20, 9, 0, Math.PI * 2); ctx.fill();
  } else if (name === "Cup") {
    ctx.strokeRect(-145, -105, 220, 210);
    ctx.beginPath(); ctx.arc(80, -10, 72, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-175, 123); ctx.lineTo(125, 123); ctx.stroke();
  } else if (name === "Key") {
    ctx.beginPath(); ctx.arc(-120, 0, 72, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-47, 0); ctx.lineTo(220, 0); ctx.lineTo(220, 62); ctx.moveTo(140, 0); ctx.lineTo(140, 52); ctx.stroke();
  } else if (name === "Umbrella") {
    ctx.beginPath(); ctx.arc(0, 20, 190, Math.PI, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-190, 20); ctx.quadraticCurveTo(-130, -15, -75, 20); ctx.quadraticCurveTo(0, -25, 75, 20); ctx.quadraticCurveTo(130, -15, 190, 20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -170); ctx.lineTo(0, 145); ctx.quadraticCurveTo(0, 220, 70, 190); ctx.stroke();
  } else if (name === "Plane") {
    ctx.beginPath(); ctx.moveTo(-265, 15); ctx.lineTo(-55, -20); ctx.lineTo(52, -140); ctx.lineTo(105, -130); ctx.lineTo(58, -22); ctx.lineTo(245, 4); ctx.lineTo(245, 35); ctx.lineTo(55, 48); ctx.lineTo(105, 145); ctx.lineTo(50, 148); ctx.lineTo(-58, 55); ctx.lineTo(-265, 42); ctx.closePath(); ctx.stroke();
  } else if (name === "Chair") {
    ctx.beginPath(); ctx.moveTo(-130, -165); ctx.lineTo(-130, 38); ctx.lineTo(120, 38); ctx.lineTo(120, -40); ctx.moveTo(-130, -40); ctx.lineTo(120, -40); ctx.moveTo(-95, 40); ctx.lineTo(-120, 180); ctx.moveTo(86, 40); ctx.lineTo(120, 180); ctx.stroke();
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
    let randomState = Math.floor(seed * 2147483647) || 1;
    const random = () => {
      randomState = (randomState * 16807) % 2147483647;
      return (randomState - 1) / 2147483646;
    };
    const count = Math.round(6 + occlusionLevel * 8);
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
  return shuffle([correct, ...shuffle(objects.filter((name) => name !== correct)).slice(0, 3)]);
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
      state.exposure = Math.max(33, state.exposure - 17);
      state.occlusion = Math.min(0.7, state.occlusion + 0.045);
    } else {
      state.exposure = Math.min(133, state.exposure + 17);
      state.occlusion = Math.max(0.38, state.occlusion - 0.03);
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
  state.exposure = 83;
  state.occlusion = 0.48;
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
