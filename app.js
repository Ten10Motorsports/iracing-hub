// =========================================================
// iRacing Hub — Main App
// =========================================================

// ---- State ----------------------------------------------
let state = {
  carType:  "oval",
  balance:  null,
  zone:     null,
  severity: "moderate",
  lastResult: null,
  setups:   [],
  schedule: []
};

// ---- DOM Helpers ----------------------------------------
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

function toast(msg, type = "") {
  const el = $("toast");
  el.textContent = msg;
  el.className = `toast show${type ? " " + type : ""}`;
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.className = "toast"; }, 3000);
}

// ---- Tab Navigation -------------------------------------
function initTabs() {
  $$(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".nav-btn").forEach(b => b.classList.remove("active"));
      $$(".tab-pane").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      $(`tab-${btn.dataset.tab}`).classList.add("active");

      // Lazy-load data for library and schedule
      if (btn.dataset.tab === "library") loadLibrary();
      if (btn.dataset.tab === "schedule") loadSchedule();
    });
  });
}

// ---- Settings Panel -------------------------------------
function initSettings() {
  const panel   = $("settingsPanel");
  const overlay = $("settingsOverlay");

  function openSettings() {
    const cfg = GitHubAPI.getConfig();
    $("ghOwner").value = cfg.owner || "";
    $("ghRepo").value  = cfg.repo  || "";
    $("ghToken").value = cfg.token || "";
    panel.classList.add("open");
    overlay.classList.add("open");
  }

  function closeSettings() {
    panel.classList.remove("open");
    overlay.classList.remove("open");
    $("settingsStatus").textContent = "";
    $("settingsStatus").className = "settings-status";
  }

  $("settingsToggle").addEventListener("click", openSettings);
  $("closeSettings").addEventListener("click", closeSettings);
  overlay.addEventListener("click", closeSettings);

  $("saveSettings").addEventListener("click", async () => {
    const owner = $("ghOwner").value.trim();
    const repo  = $("ghRepo").value.trim();
    const token = $("ghToken").value.trim();

    if (!owner || !repo || !token) {
      showSettingsStatus("Please fill in all three fields.", "error");
      return;
    }

    GitHubAPI.saveConfig({ owner, repo, token });
    showSettingsStatus("Testing connection…", "loading");

    try {
      const result = await GitHubAPI.testConnection();
      showSettingsStatus(`✓ Connected to ${result.repo}`, "success");
      toast("GitHub connected!", "success");
    } catch (err) {
      showSettingsStatus(`✗ ${err.message}`, "error");
    }
  });
}

function showSettingsStatus(msg, type) {
  const el = $("settingsStatus");
  el.textContent = msg;
  el.className = `settings-status ${type}`;
}

// ---- Setup Builder --------------------------------------
function initBuilder() {
  // Car type toggle
  $$("[data-value]", "#carTypeToggle").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".toggle-btn", "#carTypeToggle").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.carType = btn.dataset.value;
      state.balance = null;
      state.zone = null;
      renderBalanceButtons();
      renderZoneButtons();
      populateCarSuggestions();
    });
  });

  // Severity toggle
  $$(".toggle-btn", "#severityToggle").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".toggle-btn", "#severityToggle").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.severity = btn.dataset.value;
    });
  });

  // Generate button
  $("generateBtn").addEventListener("click", generate);

  // Init balance & zones for default car type
  renderBalanceButtons();
  renderZoneButtons();
  populateCarSuggestions();
}

function $$sel(selector, parentSel) {
  if (parentSel) {
    const parent = typeof parentSel === "string" ? document.querySelector(parentSel) : parentSel;
    return parent ? parent.querySelectorAll(selector) : [];
  }
  return document.querySelectorAll(selector);
}

function renderBalanceButtons() {
  const container = $("balanceToggle");

  const options = state.carType === "oval"
    ? [{ value: "loose", label: "Loose (Oversteer)" }, { value: "tight", label: "Tight (Understeer)" }]
    : [{ value: "oversteer", label: "Oversteer" }, { value: "understeer", label: "Understeer" }];

  container.innerHTML = options.map(o =>
    `<button class="toggle-btn${state.balance === o.value ? " active" : ""}" data-value="${o.value}">${o.label}</button>`
  ).join("");

  container.querySelectorAll(".toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".toggle-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.balance = btn.dataset.value;
    });
  });
}

function renderZoneButtons() {
  const container = $("zoneButtons");

  const zones = state.carType === "oval"
    ? [{ value: "entry", label: "Entry" }, { value: "center", label: "Center" }, { value: "exit", label: "Exit" }]
    : [{ value: "entry", label: "Entry" }, { value: "midcorner", label: "Mid-Corner" }, { value: "exit", label: "Exit" }];

  container.innerHTML = zones.map(z =>
    `<button class="zone-btn${state.zone === z.value ? " active" : ""}" data-zone="${z.value}">${z.label}</button>`
  ).join("");

  container.querySelectorAll(".zone-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".zone-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.zone = btn.dataset.value;
    });
  });
}

function populateCarSuggestions() {
  const dl = $("carSuggestions");
  const options = carOptions[state.carType] || [];
  dl.innerHTML = options.map(c => `<option value="${c}">`).join("");
}

function generate() {
  if (!state.balance) { toast("Pick a balance problem first."); return; }
  if (!state.zone)    { toast("Pick a track zone first."); return; }

  const result = generateRecommendations({
    carType:   state.carType,
    balance:   state.balance,
    zone:      state.zone,
    severity:  state.severity,
    carName:   $("carName").value.trim(),
    trackName: $("trackName").value.trim(),
    notes:     $("driverNotes").value.trim()
  });

  if (result.error) {
    toast(result.error, "error");
    return;
  }

  state.lastResult = result;
  renderResults(result);
}

function renderResults(rec) {
  const balanceBadgeClass = {
    loose: "badge-loose", tight: "badge-tight",
    oversteer: "badge-oversteer", understeer: "badge-understeer"
  }[rec.balance] || "badge-severity";

  const zoneLabel = {
    entry: "Corner Entry", center: "Mid-Corner (Oval)", midcorner: "Mid-Corner", exit: "Corner Exit"
  }[rec.zone] || rec.zone;

  const fixesHTML = rec.fixes.map((fix, i) => `
    <div class="fix-item">
      <div class="fix-header">
        <div class="fix-priority">${i + 1}</div>
        <div class="fix-category">${fix.category}</div>
      </div>
      <div class="fix-adjustment">${fix.adjustment}</div>
      <div class="fix-why">${fix.why}</div>
    </div>
  `).join("");

  const notesHTML = rec.notes
    ? `<div class="rec-notes">📝 ${rec.notes}</div>`
    : "";

  const carTrackHTML = (rec.carName !== "Unknown Car" || rec.trackName !== "Unknown Track")
    ? `<div class="rec-car-track">${rec.carName !== "Unknown Car" ? `🚗 ${rec.carName}` : ""} ${rec.trackName !== "Unknown Track" ? `· 📍 ${rec.trackName}` : ""}</div>`
    : "";

  $("builderResults").innerHTML = `
    <div class="rec-card">
      <div class="rec-header">
        <div class="rec-meta">
          <span class="badge badge-${rec.carType}">${rec.carType === "oval" ? "Oval" : "GT / Sports Car"}</span>
          <span class="badge ${balanceBadgeClass}">${rec.balance}</span>
          <span class="badge badge-zone">${zoneLabel}</span>
          <span class="badge badge-severity">${rec.severity}</span>
        </div>
        <div class="rec-title">Setup Recommendations</div>
        <div class="rec-desc">"${rec.description}"</div>
        ${carTrackHTML}
      </div>
      <div class="fixes-list">
        ${fixesHTML}
      </div>
      <div class="rec-footer">
        ${notesHTML}
        <button class="btn btn-primary btn-sm" id="saveThisSetup">
          Save Setup
        </button>
      </div>
    </div>
  `;

  $("saveThisSetup").addEventListener("click", openSaveModal);
}

// ---- Save Setup Modal -----------------------------------
let pendingResult = null;

function openSaveModal() {
  if (!GitHubAPI.isConfigured()) {
    toast("Configure GitHub first (click GitHub in the header).", "error");
    return;
  }
  pendingResult = state.lastResult;

  // Pre-fill a name
  const parts = [pendingResult.carName !== "Unknown Car" ? pendingResult.carName : "",
                 pendingResult.trackName !== "Unknown Track" ? pendingResult.trackName : "",
                 pendingResult.balance].filter(Boolean);
  $("setupTitle").value = parts.join(" — ");

  $("saveSetupStatus").textContent = "";
  $("saveSetupStatus").className = "settings-status";
  $("saveSetupOverlay").classList.add("open");
}

function initSaveModal() {
  $$(".modal-close").forEach(btn => {
    btn.addEventListener("click", () => {
      $(`${btn.dataset.modal}`).classList.remove("open");
    });
  });

  $("confirmSaveSetup").addEventListener("click", async () => {
    const title = $("setupTitle").value.trim();
    if (!title) { $("saveSetupStatus").textContent = "Please enter a name."; return; }

    const setup = { ...pendingResult, title };

    $("confirmSaveSetup").disabled = true;
    $("saveSetupStatus").textContent = "Saving…";
    $("saveSetupStatus").className = "settings-status loading";

    try {
      await GitHubAPI.saveSetup(setup);
      $("saveSetupOverlay").classList.remove("open");
      toast("Setup saved to GitHub! ✓", "success");
    } catch (err) {
      $("saveSetupStatus").textContent = `Error: ${err.message}`;
      $("saveSetupStatus").className = "settings-status error";
    } finally {
      $("confirmSaveSetup").disabled = false;
    }
  });
}

// ---- Library Tab ----------------------------------------
async function loadLibrary() {
  if (!GitHubAPI.isConfigured()) {
    renderConfigBanner("setupGrid");
    $("libraryCount").textContent = "";
    return;
  }

  $("setupGrid").innerHTML = `<div class="loading-state"><div class="spinner"></div><span>Loading from GitHub…</span></div>`;

  try {
    state.setups = await GitHubAPI.loadSetups();
    renderLibrary(state.setups);
  } catch (err) {
    $("setupGrid").innerHTML = `<div class="empty-state"><p>Error loading setups: ${err.message}</p></div>`;
  }
}

function renderLibrary(setups) {
  $("libraryCount").textContent = `${setups.length} saved setup${setups.length !== 1 ? "s" : ""}`;

  if (!setups.length) {
    $("setupGrid").innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1">
        <svg width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="6 4"/><path d="M16 24 Q24 12 32 24 Q24 36 16 24Z" fill="currentColor" opacity="0.3"/></svg>
        <p>No setups saved yet. Use the <strong>Setup Builder</strong> to generate and save your first one.</p>
      </div>`;
    return;
  }

  $("setupGrid").innerHTML = setups.map(s => setupCard(s)).join("");

  // Bind delete buttons
  $$(".delete-setup-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this setup?")) return;
      try {
        await GitHubAPI.deleteSetup(btn.dataset.id);
        toast("Setup deleted.", "success");
        loadLibrary();
      } catch (err) {
        toast(`Error: ${err.message}`, "error");
      }
    });
  });
}

function setupCard(s) {
  const balanceBadgeClass = {
    loose: "badge-loose", tight: "badge-tight",
    oversteer: "badge-oversteer", understeer: "badge-understeer"
  }[s.balance] || "badge-severity";

  const fixSummary = s.fixes ? s.fixes.slice(0, 2).map(f => `${f.category}: ${f.adjustment}`).join(" · ") : "";
  const dateStr = s.savedAt ? new Date(s.savedAt).toLocaleDateString() : "";
  const carTrack = [s.carName !== "Unknown Car" && s.carName, s.trackName !== "Unknown Track" && s.trackName].filter(Boolean).join(" · ");

  return `
    <div class="setup-card">
      <div class="setup-card-header">
        <div class="setup-card-title">${escHtml(s.title || "Untitled Setup")}</div>
        <span class="badge badge-${s.carType}">${s.carType === "oval" ? "Oval" : "GT"}</span>
      </div>
      <div class="setup-card-meta">
        <span class="badge ${balanceBadgeClass}">${s.balance}</span>
        <span class="badge badge-zone">${s.zone}</span>
        <span class="badge badge-severity">${s.severity}</span>
      </div>
      ${carTrack ? `<div class="setup-card-info">${escHtml(carTrack)}</div>` : ""}
      ${fixSummary ? `<div class="setup-card-fixes">${escHtml(fixSummary)}</div>` : ""}
      ${s.notes ? `<div class="setup-card-fixes" style="color: var(--text2); font-style: italic">${escHtml(s.notes)}</div>` : ""}
      <div class="setup-card-actions">
        <button class="btn btn-danger btn-sm delete-setup-btn" data-id="${s.id}">Delete</button>
        ${dateStr ? `<span style="font-size:0.75rem;color:var(--text3);margin-left:auto;align-self:center">Saved ${dateStr}</span>` : ""}
      </div>
    </div>
  `;
}

// ---- Schedule Tab ---------------------------------------
async function loadSchedule() {
  if (!GitHubAPI.isConfigured()) {
    renderConfigBanner("scheduleList");
    return;
  }

  $("scheduleList").innerHTML = `<div class="loading-state"><div class="spinner"></div><span>Loading from GitHub…</span></div>`;

  try {
    state.schedule = await GitHubAPI.loadSchedule();
    renderSchedule(state.schedule);
  } catch (err) {
    $("scheduleList").innerHTML = `<div class="empty-state"><p>Error loading schedule: ${err.message}</p></div>`;
  }
}

function renderSchedule(races) {
  if (!races.length) {
    $("scheduleList").innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 48 48"><rect x="6" y="10" width="36" height="32" rx="4" stroke="currentColor" stroke-width="2" fill="none"/><line x1="6" y1="18" x2="42" y2="18" stroke="currentColor" stroke-width="2"/><line x1="16" y1="6" x2="16" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="32" y1="6" x2="32" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <p>No races scheduled yet. Click <strong>+ Add Race</strong> to get started.</p>
      </div>`;
    return;
  }

  const now = Date.now();

  $("scheduleList").innerHTML = races.map(race => {
    const raceTime = new Date(race.raceDate).getTime();
    const isPast = raceTime < now;
    const { display, label } = formatCountdown(raceTime, now);
    const dateStr = new Date(race.raceDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    const timeStr = new Date(race.raceDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    return `
      <div class="race-card${isPast ? " past" : ""}" data-id="${race.id}">
        <div class="race-countdown">
          <div class="countdown-time" data-racetime="${raceTime}">${display}</div>
          <div class="countdown-label">${isPast ? "Finished" : label}</div>
          <div class="countdown-date">${dateStr}<br>${timeStr}</div>
        </div>
        <div class="race-info">
          <div class="race-league">${escHtml(race.league || "League")}</div>
          <div class="race-name">${escHtml(race.track || "Unknown Track")}</div>
          <div class="race-details">
            ${race.series ? `<span>🏎 ${escHtml(race.series)}</span>` : ""}
            ${race.laps  ? `<span>🔁 ${escHtml(race.laps)}</span>` : ""}
          </div>
          ${race.notes ? `<div class="race-notes">📝 ${escHtml(race.notes)}</div>` : ""}
        </div>
        <div class="race-actions">
          <button class="btn btn-danger btn-sm delete-race-btn" data-id="${race.id}">Delete</button>
        </div>
      </div>
    `;
  }).join("");

  // Bind delete buttons
  $$(".delete-race-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!confirm("Remove this race from your schedule?")) return;
      try {
        await GitHubAPI.deleteRace(btn.dataset.id);
        toast("Race removed.", "success");
        loadSchedule();
      } catch (err) {
        toast(`Error: ${err.message}`, "error");
      }
    });
  });

  // Start countdown ticker
  startCountdownTicker();
}

function formatCountdown(raceTime, now) {
  const diff = raceTime - now;
  if (diff <= 0) return { display: "Done", label: "Race complete" };

  const totalSec = Math.floor(diff / 1000);
  const days  = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins  = Math.floor((totalSec % 3600) / 60);
  const secs  = totalSec % 60;

  if (days > 0)  return { display: `${days}d ${hours}h`, label: "Until race start" };
  if (hours > 0) return { display: `${hours}h ${mins}m`, label: "Until race start" };
  if (mins > 0)  return { display: `${mins}m ${pad(secs)}s`, label: "Until race start" };
  return { display: `${pad(secs)}s`, label: "Race starting!" };
}

function pad(n) { return String(n).padStart(2, "0"); }

let tickerInterval = null;

function startCountdownTicker() {
  clearInterval(tickerInterval);
  tickerInterval = setInterval(() => {
    const now = Date.now();
    $$(".countdown-time[data-racetime]").forEach(el => {
      const raceTime = parseInt(el.dataset.racetime);
      const { display } = formatCountdown(raceTime, now);
      el.textContent = display;
    });
  }, 1000);
}

// ---- Add Race Modal -------------------------------------
function initAddRaceModal() {
  $("addRaceBtn").addEventListener("click", () => {
    if (!GitHubAPI.isConfigured()) {
      toast("Configure GitHub first (click GitHub in the header).", "error");
      return;
    }
    $("addRaceStatus").textContent = "";
    $("addRaceStatus").className = "settings-status";
    // Reset fields
    ["raceLeague","raceSeries","raceTrack","raceLaps","raceNotes"].forEach(id => { $(id).value = ""; });
    $("raceDate").value = "";
    $("addRaceOverlay").classList.add("open");
  });

  $("confirmAddRace").addEventListener("click", async () => {
    const league = $("raceLeague").value.trim();
    const track  = $("raceTrack").value.trim();
    const date   = $("raceDate").value;

    if (!track || !date) {
      $("addRaceStatus").textContent = "Track and date/time are required.";
      $("addRaceStatus").className = "settings-status error";
      return;
    }

    const race = {
      league,
      series:   $("raceSeries").value.trim(),
      track,
      raceDate: new Date(date).toISOString(),
      laps:     $("raceLaps").value.trim(),
      notes:    $("raceNotes").value.trim()
    };

    $("confirmAddRace").disabled = true;
    $("addRaceStatus").textContent = "Saving…";
    $("addRaceStatus").className = "settings-status loading";

    try {
      await GitHubAPI.saveRace(race);
      $("addRaceOverlay").classList.remove("open");
      toast("Race added to schedule! ✓", "success");
      loadSchedule();
    } catch (err) {
      $("addRaceStatus").textContent = `Error: ${err.message}`;
      $("addRaceStatus").className = "settings-status error";
    } finally {
      $("confirmAddRace").disabled = false;
    }
  });
}

// ---- Library Search -------------------------------------
function initLibrarySearch() {
  $("librarySearch").addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = state.setups.filter(s =>
      [s.title, s.carName, s.trackName, s.notes, s.balance, s.zone]
        .filter(Boolean)
        .some(v => v.toLowerCase().includes(q))
    );
    renderLibrary(filtered);
  });
}

// ---- Config Banner (when GitHub not set up) -----------
function renderConfigBanner(containerId) {
  $(`${containerId}`).innerHTML = `
    <div class="config-banner">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>GitHub storage isn't configured yet. <a href="#" id="openSettingsLink">Click here to set it up</a> — it only takes a minute.</span>
    </div>
  `;
  $("openSettingsLink")?.addEventListener("click", e => {
    e.preventDefault();
    $("settingsToggle").click();
  });
}

// ---- Utilities ------------------------------------------
function escHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---- Modal click-outside to close ----------------------
function initModalOverlayClose() {
  [$("saveSetupOverlay"), $("addRaceOverlay")].forEach(overlay => {
    overlay.addEventListener("click", e => {
      if (e.target === overlay) overlay.classList.remove("open");
    });
  });
}

// ---- Boot -----------------------------------------------
function init() {
  initTabs();
  initSettings();
  initBuilder();
  initSaveModal();
  initAddRaceModal();
  initLibrarySearch();
  initModalOverlayClose();

  // If GitHub is already configured, load the first tab's data (setup builder = no data needed)
  // Library and Schedule load on tab switch.

  // Check if configured and show a subtle hint in the header
  if (!GitHubAPI.isConfigured()) {
    $("settingsToggle").style.borderColor = "var(--accent)";
    $("settingsToggle").style.color = "var(--accent)";
  }
}

document.addEventListener("DOMContentLoaded", init);
