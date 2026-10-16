(() => {
  "use strict";
  const data = window.GALLERY_DATA;
  const $ = (id) => document.getElementById(id);
  const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const domainById = new Map(data.domains.map((domain) => [domain.id, domain]));
  const classIds = new Set(data.classes);
  const classOptions = data.classes.map((name) => ({ id: name, name }));
  const state = { domain: "all", class: "all", q: "" };
  let filtered = [];
  let returnFocus = null;
  const icons = () => window.lucide.createIcons();
  const link = (url, text, className = "") => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer" class="${className}">${text}</a>`;
  const permissionLabel = (record, className = "", linked = true) => {
    const label = `<i data-lucide="${record.licenseUrl ? "badge-check" : "clipboard-check"}" aria-hidden="true"></i>${escape(record.license)}`;
    return record.licenseUrl && linked
      ? link(record.licenseUrl, label, className)
      : `<span class="${className}"${record.licenseUrl ? "" : ' title="Unchanged, noncommercial sharing based on manual confirmation"'}>${label}</span>`;
  };

  function readHash() {
    const params = new URLSearchParams(location.hash.slice(1));
    state.domain = domainById.has(params.get("domain")) ? params.get("domain") : "all";
    state.class = classIds.has(params.get("class")) ? params.get("class") : "all";
    state.q = params.get("q") || "";
    $("search").value = state.q;
  }

  function syncHash() {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(state)) {
      if (value && value !== "all") params.set(key, value);
    }
    const hash = params.size ? `#${params}` : "";
    if (location.hash !== hash) history.replaceState(null, "", `${location.pathname}${location.search}${hash}`);
  }

  function matches(record, ignoredKey) {
    const searchText = `${record.id} ${record.title} ${record.authors} ${record.venue || ""} ${record.caption} ${record.condition} ${record.class} ${domainById.get(record.domain).name}`.toLocaleLowerCase();
    return (ignoredKey === "domain" || state.domain === "all" || record.domain === state.domain)
      && (ignoredKey === "class" || state.class === "all" || record.class === state.class)
      && state.q.trim().toLocaleLowerCase().split(/\s+/).every((term) => searchText.includes(term));
  }

  function renderFilters(key, options) {
    const group = $(`${key}-filters`);
    const eligible = data.diagrams.filter((record) => matches(record, key));
    const all = [{ id: "all", name: "All" }, ...options];
    const previousScroll = group.scrollLeft;
    group.innerHTML = all.map((option) => {
      const count = eligible.filter((record) => option.id === "all" || record[key] === option.id).length;
      const active = state[key] === option.id;
      return `<button class="filter-button${active ? " active" : ""}" data-value="${escape(option.id)}" aria-pressed="${active}" title="${escape(option.name)}"><span>${escape(option.name)}</span>${option.id === "all" ? "" : `<span class="filter-count">${count}</span>`}</button>`;
    }).join("");
    group.scrollLeft = previousScroll;
  }

  function render() {
    filtered = data.diagrams.filter((record) => matches(record)).sort((a, b) => {
      const aScore = a.scores?.total;
      const bScore = b.scores?.total;
      const aHasScore = Number.isFinite(aScore);
      const bHasScore = Number.isFinite(bScore);
      if (aHasScore && bHasScore) return bScore - aScore;
      return Number(bHasScore) - Number(aHasScore);
    });
    renderFilters("domain", data.domains);
    renderFilters("class", classOptions);
    const titleParts = [];
    if (state.domain !== "all") titleParts.push(domainById.get(state.domain).name);
    if (state.class !== "all") titleParts.push(state.class);
    $("result-title").textContent = titleParts.join(" · ") || "All diagrams";
    $("result-count").textContent = `${filtered.length} / ${data.diagrams.length} diagrams`;
    $("total-count").textContent = data.diagrams.length;
    $("empty-state").hidden = filtered.length > 0;
    $("gallery").innerHTML = filtered.map((record, index) => `<article class="diagram-card" data-id="${record.id}" role="button" tabindex="0" aria-haspopup="dialog" aria-label="View ${escape(record.title)} · ${escape(record.figure)}">
      <div class="preview"><img src="${escape(record.diagram)}" alt="${escape(record.title)} · ${escape(record.figure)}" loading="${index < 6 ? "eager" : "lazy"}" decoding="async"></div>
      <div class="card-body"><div class="card-type"><span title="${escape(record.class)}">${escape(record.class)}</span>${record.venue ? `<span class="card-venue" aria-label="Publication venue: ${escape(record.venue)}">${escape(record.venue)}</span>` : ""}</div>
      <p class="card-domain">${escape(domainById.get(record.domain).name)}</p>
      <div class="card-title" title="${escape(record.title)}">${escape(record.title)}</div>
      <div class="card-footer"><span class="card-figure">${escape(record.figure)}</span>${permissionLabel(record, `license-tag${record.license.includes("NC") || !record.licenseUrl ? " nc" : ""}`, false)}</div></div></article>`).join("");
    $("gallery").querySelectorAll("img").forEach((img) => img.addEventListener("error", () => {
      img.hidden = true;
      const error = document.createElement("span");
      error.className = "diagram-error";
      error.textContent = "Diagram could not be loaded";
      img.after(error);
    }));
    icons();
    syncHash();
  }

  function reset() {
    Object.assign(state, { domain: "all", class: "all", q: "" });
    $("search").value = "";
    render();
  }

  function renderScores(scores) {
    if (!scores) return "";
    const dimensions = [["structure", "Structure"], ["content", "Content"], ["aesthetics", "Aesthetics"]];
    return `<section class="diagram-scores" aria-label="Diagram scores">
      <h3>Scores</h3>
      <dl class="score-list">${dimensions.map(([key, label]) => `<div class="score-row"><dt>${label}</dt><dd>${scores[key].toFixed(2)}</dd></div>`).join("")}
        <div class="score-row score-total"><dt>Overall</dt><dd>${scores.total.toFixed(2)}</dd></div>
      </dl>
    </section>`;
  }

  function show(record) {
    $("viewer-diagram").src = record.diagram;
    $("viewer-diagram").alt = `${record.title} — ${record.figure}`;
    $("original-link").href = record.diagram;
    $("diagram-viewport").scrollTo(0, 0);
    $("viewer-publication").textContent = record.venue || "";
    $("viewer-publication").hidden = !record.venue;
    $("viewer-title").innerHTML = link(record.sourceUrl, `<span class="paper-title">${escape(record.title)}</span> <span class="source-hint">Open original<i data-lucide="arrow-up-right" aria-hidden="true"></i></span>`, "paper-link");
    $("viewer-details").innerHTML = `<p class="authors">${escape(record.authors)}</p>
      ${record.caption ? `<div class="diagram-caption"><p>${escape(record.caption)}</p></div>` : ""}
      ${renderScores(record.scores)}
      <details class="sharing-details"><summary>Sharing conditions and attribution</summary><p>${escape(record.condition)}</p>${record.copyright ? record.copyright.map((notice) => `<p>${escape(notice)}</p>`).join("") : ""}</details>
      <div class="detail-footer">${permissionLabel(record, "license-tag")}<button class="command" id="download-credit"><i data-lucide="file-text" aria-hidden="true"></i>Attribution</button></div>
      <p id="attribution-status" class="authors" role="status" aria-live="polite" hidden></p>`;
    $("download-credit").addEventListener("click", (event) => downloadCredit(record, event.currentTarget));
    $("viewer-details").scrollTop = 0;
    icons();
  }

  async function imageBase64(record) {
    const response = await fetch(record.diagram);
    if (!response.ok) throw new Error(`Image request failed: ${response.status}`);
    const bytes = await response.arrayBuffer();
    const extension = record.diagram.split(".").pop().toLowerCase();
    const mime = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg" }[extension];
    if (!mime) throw new Error("Unsupported image format");
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(new Blob([bytes], { type: mime }));
    });
  }

  async function downloadCredit(record, button) {
    if (button.disabled) return;
    const status = $("attribution-status");
    if (location.protocol === "file:") {
      status.textContent = "To download attribution with the image, open Scientific Diagram Explorer through a local server or its website URL.";
      status.hidden = false;
      return;
    }
    const label = button.innerHTML;
    status.hidden = true;
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    button.textContent = "Preparing...";
    try {
      const encoded = await imageBase64(record);
      const metadata = { ...record, domainName: domainById.get(record.domain).name, imageBase64: encoded };
      for (const key of ["id", "diagram", "domain"]) delete metadata[key];
      const blob = new Blob([JSON.stringify(metadata, null, 2) + "\n"], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${record.id}-attribution.json`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      status.textContent = "Could not prepare attribution. Please try again.";
      status.hidden = false;
    } finally {
      button.disabled = false;
      button.removeAttribute("aria-busy");
      button.innerHTML = label;
    }
  }

  for (const key of ["domain", "class"]) {
    $(`${key}-filters`).addEventListener("click", (event) => {
      const button = event.target.closest("button[data-value]");
      if (!button) return;
      const value = button.dataset.value;
      state[key] = value;
      render();
      const replacement = [...$(`${key}-filters`).querySelectorAll("button")].find((candidate) => candidate.dataset.value === value);
      replacement.focus({ preventScroll: true });
    });
  }
  $("search").addEventListener("input", () => { state.q = $("search").value; render(); });
  $("empty-reset").addEventListener("click", reset);
  $("gallery").addEventListener("click", (event) => {
    const card = event.target.closest(".diagram-card[data-id]");
    if (!card) return;
    returnFocus = card;
    show(filtered.find((record) => record.id === card.dataset.id));
    $("viewer").showModal();
    $("close").focus();
  });
  $("gallery").addEventListener("keydown", (event) => {
    const card = event.target.closest(".diagram-card[data-id]");
    if (!card || !["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    card.click();
  });
  $("close").addEventListener("click", () => $("viewer").close());
  $("viewer").addEventListener("close", () => returnFocus?.focus({ preventScroll: true }));
  $("viewer").addEventListener("click", (event) => {
    if (event.target !== $("viewer")) return;
    const rect = $("viewer").getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) $("viewer").close();
  });
  window.addEventListener("hashchange", () => { readHash(); render(); });
  readHash();
  render();
})();
