// =========================================================
// GitHub API Storage Module for iRacing Hub
//
// Reads and writes JSON files directly to a GitHub repo
// so the data persists across devices without a backend.
//
// Setup:
//   1. Create a GitHub Personal Access Token with `repo` scope
//   2. Enter it in the app's Settings panel
//   3. The token is saved to localStorage (stays in your browser only)
// =========================================================

const GitHubAPI = (() => {

  const BASE = "https://api.github.com";

  // ---- Config: stored in localStorage --------------------

  function getConfig() {
    try {
      return JSON.parse(localStorage.getItem("iracing_hub_config") || "{}");
    } catch {
      return {};
    }
  }

  function saveConfig(cfg) {
    localStorage.setItem("iracing_hub_config", JSON.stringify(cfg));
  }

  function isConfigured() {
    const cfg = getConfig();
    return !!(cfg.token && cfg.owner && cfg.repo);
  }

  // ---- Low-level GitHub REST helpers ---------------------

  async function ghFetch(path, options = {}) {
    const cfg = getConfig();
    if (!cfg.token) throw new Error("GitHub token not configured.");

    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        "Authorization": `Bearer ${cfg.token}`,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`GitHub API error ${res.status}: ${err.message || res.statusText}`);
    }

    return res.json();
  }

  // ---- Read a JSON file from the repo --------------------

  async function readFile(filePath) {
    const cfg = getConfig();
    try {
      const data = await ghFetch(`/repos/${cfg.owner}/${cfg.repo}/contents/${filePath}`);
      // Content is base64-encoded
      const decoded = atob(data.content.replace(/\n/g, ""));
      return {
        content: JSON.parse(decoded),
        sha: data.sha
      };
    } catch (err) {
      // 404 means file doesn't exist yet — return empty defaults
      if (err.message.includes("404")) {
        return { content: null, sha: null };
      }
      throw err;
    }
  }

  // ---- Write a JSON file to the repo ---------------------

  async function writeFile(filePath, content, sha = null) {
    const cfg = getConfig();
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2))));

    const body = {
      message: `iRacing Hub: update ${filePath}`,
      content: encoded,
      ...(sha ? { sha } : {})
    };

    return ghFetch(`/repos/${cfg.owner}/${cfg.repo}/contents/${filePath}`, {
      method: "PUT",
      body: JSON.stringify(body)
    });
  }

  // ---- High-level data operations -----------------------

  // Load all saved setups
  async function loadSetups() {
    const result = await readFile("data/setups.json");
    return result.content || [];
  }

  // Save a new setup (appends to array)
  async function saveSetup(setup) {
    let { content: setups, sha } = await readFile("data/setups.json");
    if (!setups) setups = [];

    // Add unique ID and timestamp
    const newSetup = {
      ...setup,
      id: Date.now().toString(),
      savedAt: new Date().toISOString()
    };
    setups.push(newSetup);

    await writeFile("data/setups.json", setups, sha);
    return newSetup;
  }

  // Delete a setup by id
  async function deleteSetup(id) {
    let { content: setups, sha } = await readFile("data/setups.json");
    if (!setups) return;
    setups = setups.filter(s => s.id !== id);
    await writeFile("data/setups.json", setups, sha);
  }

  // Load league schedule
  async function loadSchedule() {
    const result = await readFile("data/schedule.json");
    return result.content || [];
  }

  // Save a new race event
  async function saveRace(race) {
    let { content: schedule, sha } = await readFile("data/schedule.json");
    if (!schedule) schedule = [];

    const newRace = {
      ...race,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    schedule.push(newRace);
    // Sort by race date ascending
    schedule.sort((a, b) => new Date(a.raceDate) - new Date(b.raceDate));

    await writeFile("data/schedule.json", schedule, sha);
    return newRace;
  }

  // Delete a race event by id
  async function deleteRace(id) {
    let { content: schedule, sha } = await readFile("data/schedule.json");
    if (!schedule) return;
    schedule = schedule.filter(r => r.id !== id);
    await writeFile("data/schedule.json", schedule, sha);
  }

  // Update an existing race
  async function updateRace(id, updates) {
    let { content: schedule, sha } = await readFile("data/schedule.json");
    if (!schedule) return;
    const idx = schedule.findIndex(r => r.id === id);
    if (idx === -1) throw new Error("Race not found");
    schedule[idx] = { ...schedule[idx], ...updates };
    schedule.sort((a, b) => new Date(a.raceDate) - new Date(b.raceDate));
    await writeFile("data/schedule.json", schedule, sha);
  }

  // Test the connection (tries to list the repo)
  async function testConnection() {
    const cfg = getConfig();
    const result = await ghFetch(`/repos/${cfg.owner}/${cfg.repo}`);
    return { success: true, repo: result.full_name, private: result.private };
  }

  // ---- Expose public API ---------------------------------

  return {
    getConfig,
    saveConfig,
    isConfigured,
    testConnection,
    loadSetups,
    saveSetup,
    deleteSetup,
    loadSchedule,
    saveRace,
    deleteRace,
    updateRace
  };

})();
