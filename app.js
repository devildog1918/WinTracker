const defaultActivities = [
  "Got out of bed",
  "Took a shower",
  "Brushed my teeth",
  "Took medication",
  "Drank water",
  "Ate something decent",
  "Let the dog out or walked the dog",
  "Took out the trash",
  "Did one small chore",
  "Moved my body for a few minutes",
  "Went outside",
  "Talked to another person",
  "Read after doing one task",
  "Got ready for bed"
];

const defaultMovements = [
  { name: "Foot Up, Foot Down", details: "Sit or lie comfortably. Pull your toes up toward your face, then point them away like gently pressing a gas pedal. Repeat 10-20 times." },
  { name: "Seated March", details: "Sit on the bed or in a sturdy chair. Lift one knee a few inches, lower it, then lift the other. Go slowly for 30 seconds to 2 minutes." },
  { name: "Arm Raises", details: "Raise both arms in front of you or overhead as far as comfortable. Lower slowly. Try 5-10 times." },
  { name: "Seated Punches", details: "Sit tall if you can. Slowly punch straight ahead, alternating arms. Try 30 seconds." },
  { name: "Shoulder Rolls", details: "Roll your shoulders forward 10 times, then backward 10 times. Keep it slow and comfortable." },
  { name: "Leg Extensions", details: "While sitting, straighten one leg as much as comfortable, hold for 2 seconds, then lower it. Switch legs. Try 5 times each." },
  { name: "Deep Breathing", details: "Breathe in through your nose for 4 seconds. Breathe out through your mouth for 6 seconds. Repeat 5 times." },
  { name: "Reach and Stretch", details: "Reach both hands toward the ceiling or out to the sides. Hold for 10 seconds. Stretch gently, not painfully." }
];

const milestones = [25, 50, 100, 250, 500, 1000];

let trackerData = {
  version: 3,
  activities: defaultActivities,
  movements: defaultMovements,
  entries: []
};

function loadFromSession() {
  const saved = sessionStorage.getItem("trackerData");
  if (saved) {
    trackerData = JSON.parse(saved);
    if (!trackerData.movements) trackerData.movements = defaultMovements;
    if (!trackerData.activities) trackerData.activities = defaultActivities;
    if (!trackerData.entries) trackerData.entries = [];
  }
}

function saveToSession() {
  sessionStorage.setItem("trackerData", JSON.stringify(trackerData));
}

function movementsToText(movements) {
  return movements.map(m => `${m.name} | ${m.details}`).join("\n");
}

function textToMovements(text) {
  return text.split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const parts = line.split("|");
      return {
        name: (parts[0] || "").trim(),
        details: (parts.slice(1).join("|") || "No instructions added yet.").trim()
      };
    })
    .filter(m => m.name);
}

function renderActivities() {
  const list = document.getElementById("activityList");
  list.innerHTML = "";
  trackerData.activities.forEach((activity, index) => {
    const div = document.createElement("div");
    div.className = "activity";
    div.innerHTML = `
      <input type="checkbox" id="act${index}" data-name="${activity}">
      <label for="act${index}">${activity}</label>
    `;
    list.appendChild(div);
  });
}

function renderMovement() {
  const list = document.getElementById("movementList");
  list.innerHTML = "";
  trackerData.movements.forEach(item => {
    const div = document.createElement("div");
    div.className = "move";
    div.innerHTML = `<h3>${item.name}</h3><p>${item.details}</p>`;
    list.appendChild(div);
  });
}

function updateTotals() {
  const total = trackerData.entries.reduce((sum, e) => sum + e.wins.length, 0);
  document.getElementById("totalWins").textContent = total;
  const next = milestones.find(m => m > total);
  document.getElementById("nextMilestone").textContent = next
    ? `${next - total} wins until ${next}.`
    : "All current milestones reached.";
}

function renderHistory() {
  const list = document.getElementById("historyList");
  const entries = trackerData.entries.slice().reverse();
  list.innerHTML = entries.length ? "" : "<p>No saved progress loaded yet.</p>";
  entries.forEach(entry => {
    const div = document.createElement("div");
    div.className = "entry";
    div.innerHTML = `
      <strong>${entry.date}</strong><br>
      Wins: ${entry.wins.length}<br>
      ${entry.wins.join(", ")}<br>
      Mood: ${entry.mood || "Not entered"}<br>
      Proud of: ${entry.proud || "Not entered"}
    `;
    list.appendChild(div);
  });
}

function saveCurrentWins() {
  const checked = [...document.querySelectorAll("#activityList input:checked")]
    .map(cb => cb.dataset.name);

  const entry = {
    date: new Date().toLocaleString(),
    wins: checked,
    mood: document.getElementById("mood").value,
    proud: document.getElementById("proud").value.trim()
  };

  if (checked.length === 0 && !entry.mood && !entry.proud) {
    document.getElementById("saveMsg").textContent = "Nothing added yet. Check one item or add a note.";
    return;
  }

  trackerData.entries.push(entry);
  saveToSession();

  document.querySelectorAll("#activityList input").forEach(cb => cb.checked = false);
  document.getElementById("mood").value = "";
  document.getElementById("proud").value = "";
  document.getElementById("saveMsg").textContent = "Added. Use Save JSON File to keep it permanently.";

  updateTotals();
  renderHistory();
}

function downloadJsonFile() {
  const blob = new Blob([JSON.stringify(trackerData, null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date().toISOString().slice(0,10);
  a.href = url;
  a.download = `mikey-wins-tracker-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function loadJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const loaded = JSON.parse(e.target.result);
      if (!loaded.entries || !Array.isArray(loaded.entries)) throw new Error("Invalid tracker file.");
      trackerData = {
        version: loaded.version || 3,
        activities: Array.isArray(loaded.activities) ? loaded.activities : defaultActivities,
        movements: Array.isArray(loaded.movements) ? loaded.movements : defaultMovements,
        entries: loaded.entries
      };
      saveToSession();
      document.getElementById("customActivities").value = trackerData.activities.join("\n");
      document.getElementById("customMovements").value = movementsToText(trackerData.movements);
      renderActivities();
      renderMovement();
      renderHistory();
      updateTotals();
      alert("Progress file loaded.");
    } catch (err) {
      alert("Could not load that JSON file.");
    }
  };
  reader.readAsText(file);
}

function setupTabs() {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");
    });
  });
}

function setupSettings() {
  const activityBox = document.getElementById("customActivities");
  const movementBox = document.getElementById("customMovements");
  activityBox.value = trackerData.activities.join("\n");
  movementBox.value = movementsToText(trackerData.movements);

  document.getElementById("saveActivitiesBtn").addEventListener("click", () => {
    const items = activityBox.value.split("\n").map(x => x.trim()).filter(Boolean);
    trackerData.activities = items;
    saveToSession();
    renderActivities();
    alert("Win list updated. Use Save JSON File to keep the change.");
  });

  document.getElementById("resetActivitiesBtn").addEventListener("click", () => {
    trackerData.activities = defaultActivities;
    activityBox.value = defaultActivities.join("\n");
    saveToSession();
    renderActivities();
    alert("Win defaults restored. Use Save JSON File to keep the change.");
  });

  document.getElementById("saveMovementsBtn").addEventListener("click", () => {
    const items = textToMovements(movementBox.value);
    trackerData.movements = items.length ? items : defaultMovements;
    movementBox.value = movementsToText(trackerData.movements);
    saveToSession();
    renderMovement();
    alert("Movement list updated. Use Save JSON File to keep the change.");
  });

  document.getElementById("resetMovementsBtn").addEventListener("click", () => {
    trackerData.movements = defaultMovements;
    movementBox.value = movementsToText(defaultMovements);
    saveToSession();
    renderMovement();
    alert("Movement defaults restored. Use Save JSON File to keep the change.");
  });
}

function clearCurrentScreenData() {
  if (confirm("Clear current loaded data from this screen? This does not delete any JSON file already saved on the tablet.")) {
    trackerData = { version: 3, activities: defaultActivities, movements: defaultMovements, entries: [] };
    saveToSession();
    document.getElementById("customActivities").value = defaultActivities.join("\n");
    document.getElementById("customMovements").value = movementsToText(defaultMovements);
    renderActivities();
    renderMovement();
    renderHistory();
    updateTotals();
  }
}

document.getElementById("saveBtn").addEventListener("click", saveCurrentWins);
document.getElementById("downloadBtn").addEventListener("click", downloadJsonFile);
document.getElementById("loadFile").addEventListener("change", loadJsonFile);
document.getElementById("clearBtn").addEventListener("click", clearCurrentScreenData);

loadFromSession();
setupTabs();
renderActivities();
renderMovement();
renderHistory();
updateTotals();
setupSettings();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
