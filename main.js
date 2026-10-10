(function () {
  "use strict";

  // ═══════════════ UTIL ═══════════════
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function cleanDomain(raw) {
    return String(raw)
      .toLowerCase()
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .split("/")[0]
      .split("?")[0]
      .trim();
  }

  // ═══════════════ OS DETECT ═══════════════
  const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
  const modKey = isMac ? "⌘" : "Ctrl";
  const enterKey = isMac ? "↵" : "Enter";

  function applyOSLabels() {
    document.querySelectorAll(".nb-shortcut").forEach((el) => {
      if (isMac) return;
      el.textContent = el.textContent.replace("⌘", modKey + "+");
    });
    document.querySelectorAll(".btn-kbd").forEach((el) => {
      let t = el.textContent;
      t = t.replace("⌘", isMac ? "⌘" : "Ctrl+");
      t = t.replace("↵", isMac ? "↵" : "Enter");
      el.textContent = t;
    });
    document.querySelectorAll(".navbar-footer-hint").forEach((el) => {
      if (isMac) return;
      el.innerHTML = el.innerHTML
        .replace(/⌘K/g, "Ctrl+K")
        .replace(/⌘1-5/g, "Ctrl+1-5");
    });
    document.querySelectorAll(".cmd-footer kbd").forEach((el) => {
      if (el.textContent === "⌘") el.textContent = isMac ? "⌘" : "Ctrl";
    });
    document.querySelectorAll("#tab-content-help kbd").forEach((el) => {
      const t = el.textContent.trim();
      if (t === "⌘") el.textContent = isMac ? "⌘" : "Ctrl";
      if (t === "↵") el.textContent = isMac ? "↵" : "Enter";
    });
  }

  // ═══════════════ CLOCK & UPTIME ═══════════════
  const clockEl = document.getElementById("systemClock");
  const uptimeEl = document.getElementById("uptime");
  const bootTime = Date.now();

  function tick() {
    const now = new Date();
    if (clockEl) clockEl.textContent = now.toLocaleTimeString("id-ID", { hour12: false });
    if (uptimeEl) {
      const sec = Math.floor((Date.now() - bootTime) / 1000);
      const h = String(Math.floor(sec / 3600)).padStart(2, "0");
      const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
      const s = String(sec % 60).padStart(2, "0");
      uptimeEl.textContent = `${h}:${m}:${s}`;
    }
  }
  tick();
  setInterval(tick, 1000);

  // ═══════════════ CONSOLE LOG ═══════════════
  const consoleBody = document.getElementById("consoleBody");
  const consoleCount = document.getElementById("consoleCount");
  const consoleClearBtn = document.getElementById("consoleClearBtn");
  const consoleToggleBtn = document.getElementById("consoleToggleBtn");
  const consoleLog = document.getElementById("consoleLog");
  let logCount = 0;

  function log(message, type = "info") {
    if (!consoleBody) return;
    const now = new Date();
    const time = now.toLocaleTimeString("id-ID", { hour12: false });
    const line = document.createElement("div");
    line.className = "console-line";
    line.innerHTML = `<span class="console-time">${time}</span><span class="console-msg ${type}">${escapeHtml(message)}</span>`;
    consoleBody.appendChild(line);
    consoleBody.scrollTop = consoleBody.scrollHeight;
    logCount++;
    if (consoleCount) consoleCount.textContent = String(logCount);
    const excess = consoleBody.children.length - 200;
    for (let i = 0; i < excess; i++) consoleBody.removeChild(consoleBody.firstChild);
  }

  consoleClearBtn?.addEventListener("click", () => {
    if (!consoleBody) return;
    consoleBody.innerHTML = "";
    logCount = 0;
    if (consoleCount) consoleCount.textContent = "0";
    log("Console cleared.", "info");
  });

  consoleToggleBtn?.addEventListener("click", () => {
    if (!consoleLog) return;
    consoleLog.classList.toggle("collapsed");
    consoleToggleBtn.textContent = consoleLog.classList.contains("collapsed") ? "+" : "−";
  });

  log("Console ready.", "info");
  log(`OS: ${isMac ? "macOS" : "Windows/Linux"} — shortcut: ${isMac ? "⌘" : "Ctrl"}`, "info");

  // ═══════════════ TOAST ═══════════════
  const feedback = document.getElementById("copyFeedback");
  function showFeedback(msg) {
    if (!feedback) return;
    feedback.textContent = msg;
    feedback.classList.add("show");
    clearTimeout(feedback._timeout);
    feedback._timeout = setTimeout(() => feedback.classList.remove("show"), 2200);
  }

  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); showFeedback("✅ Disalin (fallback)"); }
    catch { showFeedback("❌ Gagal menyalin"); }
    document.body.removeChild(ta);
  }

  // ═══════════════ TAB NAVIGATION ═══════════════
  const navButtons = Array.from(document.querySelectorAll(".navbar-button"));
  const tabContents = {
    "tab-home":     document.getElementById("tab-content-home"),
    "tab-profile":  document.getElementById("tab-content-profile"),
    "tab-dns":      document.getElementById("tab-content-dns"),
    "tab-redirect": document.getElementById("tab-content-redirect"),
    "tab-server":   document.getElementById("tab-content-server"),
    "tab-about":    document.getElementById("tab-content-about"),
    "tab-help":     document.getElementById("tab-content-help"),
  };
  const tabNames = {
    "tab-home": "Filter", "tab-profile": "Filter Domain", "tab-dns": "DNS Parser",
    "tab-redirect": "Redirect", "tab-server": "Server Map",
    "tab-about": "Tentang", "tab-help": "Panduan",
  };

  function switchTab(activeBtn) {
    if (!activeBtn) return;
    const targetId = activeBtn.id;
    navButtons.forEach((btn) => {
      btn.classList.remove("active");
      btn.setAttribute("aria-selected", "false");
      btn.setAttribute("tabindex", "-1");
    });
    Object.values(tabContents).forEach((c) => c && c.classList.remove("active"));
    activeBtn.classList.add("active");
    activeBtn.setAttribute("aria-selected", "true");
    activeBtn.setAttribute("tabindex", "0");
    const targetContent = tabContents[targetId];
    if (targetContent) {
      targetContent.classList.add("active");
      const mainContent = document.querySelector(".content");
      if (mainContent) mainContent.scrollTop = 0;
      if (consoleLog && consoleLog.classList.contains("collapsed")) {
        consoleLog.classList.remove("collapsed");
        if (consoleToggleBtn) consoleToggleBtn.textContent = "−";
      }
      log(`Switched to: ${tabNames[targetId] || targetId}`, "info");
    }
  }

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn));
    btn.addEventListener("keydown", (event) => {
      let nextIndex = navButtons.indexOf(btn);
      if (event.key === "ArrowDown" || event.key === "ArrowRight") nextIndex = (nextIndex + 1) % navButtons.length;
      else if (event.key === "ArrowUp" || event.key === "ArrowLeft") nextIndex = (nextIndex - 1 + navButtons.length) % navButtons.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = navButtons.length - 1;
      else return;
      event.preventDefault();
      const nextButton = navButtons[nextIndex];
      switchTab(nextButton);
      nextButton.focus();
    });
  });

  // ═══════════════ SIDEBAR SEARCH ═══════════════
  const navSearch = document.getElementById("navSearch");
  navSearch?.addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    let visible = 0;
    navButtons.forEach((btn) => {
      const label = btn.querySelector(".nb-label")?.textContent.toLowerCase() || "";
      const kw = btn.dataset.keywords?.toLowerCase() || "";
      const matches = !q || label.includes(q) || kw.includes(q);
      btn.classList.toggle("hidden", !matches);
      btn.tabIndex = matches ? 0 : -1;
      if (matches) visible++;
    });
  });

  // ═══════════════ COMMAND PALETTE ═══════════════
  const cmdPalette = document.getElementById("cmdPalette");
  const cmdInput = document.getElementById("cmdInput");
  const cmdList = document.getElementById("cmdList");
  let cmdItems = [];
  let cmdSelected = 0;
  let previouslyFocused = null;

  function buildCommandItems() {
    const s = isMac ? "⌘" : "Ctrl+";
    return [
      { icon: "⟐", label: "Filter — Cek pergantian domain", hint: s + "1", action: () => switchTab(document.getElementById("tab-home")) },
      { icon: "⊞", label: "Filter Domain — Kelompokkan by brand", hint: s + "2", action: () => switchTab(document.getElementById("tab-profile")) },
      { icon: "◫", label: "DNS Parser — Pisahkan domain & NS", hint: s + "3", action: () => switchTab(document.getElementById("tab-dns")) },
      { icon: "⇗", label: "Redirect — Pratinjau link", hint: s + "4", action: () => switchTab(document.getElementById("tab-redirect")) },
      { icon: "◫", label: "Server Map — Mapping brand ke server", hint: s + "5", action: () => switchTab(document.getElementById("tab-server")) },
      { icon: "ⓘ", label: "Tentang aplikasi", hint: "", action: () => switchTab(document.getElementById("tab-about")) },
      { icon: "?", label: "Panduan penggunaan", hint: "", action: () => switchTab(document.getElementById("tab-help")) },
      { icon: "▸", label: "Jalankan cek pergantian domain", hint: isMac ? "⌘↵" : "Ctrl+Enter", action: () => { switchTab(document.getElementById("tab-home")); setTimeout(performCheck, 100); } },
      { icon: "⎘", label: "Copy hasil grouping domain", hint: "", action: () => { switchTab(document.getElementById("tab-profile")); setTimeout(() => document.getElementById("btn-copy-output")?.click(), 100); } },
      { icon: "◇", label: "Clear console log", hint: "", action: () => consoleClearBtn?.click() },
      { icon: "▸", label: "Jalankan server mapping", hint: s + "5", action: () => { switchTab(document.getElementById("tab-server")); setTimeout(() => window.processServerMapping?.(), 100); } },
      { icon: "↻", label: "Reset checker", hint: "", action: () => { switchTab(document.getElementById("tab-home")); setTimeout(resetChecker, 100); } },
    ];
  }

  function renderCmdList(items) {
    cmdList.replaceChildren();
    if (items.length === 0) {
      const div = document.createElement("div");
      div.className = "cmd-item";
      div.textContent = "Tidak ada perintah cocok.";
      cmdList.appendChild(div);
      return;
    }
    items.forEach((item, i) => {
      const el = document.createElement("div");
      el.className = "cmd-item" + (i === cmdSelected ? " selected" : "");
      el.innerHTML = `<span class="cmd-item-icon">${item.icon}</span><span class="cmd-item-label">${escapeHtml(item.label)}</span><span class="cmd-item-hint">${item.hint || ""}</span>`;
      el.addEventListener("click", () => { item.action(); closeCommandPalette(); });
      el.addEventListener("mouseenter", () => { cmdSelected = i; updateCmdSelection(); });
      cmdList.appendChild(el);
    });
  }

  function updateCmdSelection() {
    Array.from(cmdList.children).forEach((el, i) => el.classList.toggle("selected", i === cmdSelected));
    const sel = cmdList.children[cmdSelected];
    if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: "nearest" });
  }

  function openCommandPalette() {
    if (!cmdPalette) return;
    previouslyFocused = document.activeElement;
    cmdPalette.hidden = false;
    cmdItems = buildCommandItems();
    cmdSelected = 0;
    renderCmdList(cmdItems);
    if (cmdInput) { cmdInput.value = ""; setTimeout(() => cmdInput.focus(), 20); }
  }

  function closeCommandPalette() {
    if (cmdPalette) cmdPalette.hidden = true;
    if (previouslyFocused && previouslyFocused.focus) {
      try { previouslyFocused.focus(); } catch (_) {}
    }
  }

  cmdInput?.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = buildCommandItems().filter((item) => item.label.toLowerCase().includes(q));
    cmdItems = filtered;
    cmdSelected = 0;
    renderCmdList(filtered);
  });

  cmdInput?.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); cmdSelected = Math.min(cmdSelected + 1, cmdItems.length - 1); updateCmdSelection(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); cmdSelected = Math.max(cmdSelected - 1, 0); updateCmdSelection(); }
    else if (e.key === "Enter") { e.preventDefault(); if (cmdItems[cmdSelected]) { cmdItems[cmdSelected].action(); closeCommandPalette(); } }
    else if (e.key === "Escape") { closeCommandPalette(); }
  });

  document.querySelectorAll("[data-close-palette]").forEach((el) => {
    el.addEventListener("click", closeCommandPalette);
  });

  // ═══════════════ KEYBOARD SHORTCUTS ═══════════════
  document.addEventListener("keydown", (e) => {
    const meta = e.metaKey || e.ctrlKey;
    if (meta && /^[1-5]$/.test(e.key)) {
      e.preventDefault();
      const idx = parseInt(e.key) - 1;
      const map = ["tab-home", "tab-profile", "tab-dns", "tab-redirect", "tab-server"];
      const target = document.getElementById(map[idx]);
      if (target) switchTab(target);
      return;
    }
    if (meta && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (cmdPalette && !cmdPalette.hidden) closeCommandPalette();
      else openCommandPalette();
      return;
    }
    if (meta && e.key === "Enter") {
      const activeTab = document.querySelector(".tabs-content.active")?.id;
      if (activeTab === "tab-content-home") { e.preventDefault(); performCheck(); }
      else if (activeTab === "tab-content-redirect") { e.preventDefault(); processRedirectLinks(); }
      else if (activeTab === "tab-content-server") {
        e.preventDefault();
        if (typeof window.processServerMapping === "function") window.processServerMapping();
      }
    }
    if (e.key === "Escape" && cmdPalette && !cmdPalette.hidden) closeCommandPalette();
  });

  // ═══════════════ REDIRECT MODULE ═══════════════
  const redirectInput = document.getElementById("redirectUrlInput");
  const redirectProcessButton = document.getElementById("redirectProcessButton");
  const redirectCopyAllButton = document.getElementById("redirectCopyAllButton");
  const redirectExportButton = document.getElementById("redirectExportButton");
  const redirectTableBody = document.getElementById("redirectTableBody");
  const redirectProgress = document.getElementById("redirectProgress");
  const redirectPreviewPlaceholder = document.getElementById("redirectPreviewPlaceholder");
  const redirectPreviewLoading = document.getElementById("redirectPreviewLoading");
  const redirectPreviewError = document.getElementById("redirectPreviewError");
  const redirectPreviewWebViewNotice = document.getElementById("redirectPreviewWebViewNotice");
  const redirectLoadingDomain = document.getElementById("redirectLoadingDomain");
  const redirectErrorDesc = document.getElementById("redirectErrorDesc");
  const redirectOpenFromError = document.getElementById("redirectOpenFromError");
  const redirectReloadButton = document.getElementById("redirectReloadButton");
  const redirectOpenExternalButton = document.getElementById("redirectOpenExternalButton");
  const redirectActiveDomain = document.getElementById("redirectActiveDomain");
  const redirectActiveUrl = document.getElementById("redirectActiveUrl");
  const redirectCount = document.getElementById("redirectCount");
  let redirectLinks = [];
  let activeRedirectPreview = null;
  let currentPreviewLink = null;
  let previewLoadTimer = null;
  const PREVIEW_TIMEOUT_MS = 12000;
  const desktopWebView = window.chrome?.webview;
  let previewStatusHandlerAttached = false;

  function normalizeRedirectUrl(rawUrl) {
    const withProtocol = /^[a-z][a-z\d+.-]*:/i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    const u = new URL(withProtocol);
    if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("Hanya HTTP/HTTPS yang didukung.");
    return u.href;
  }

  function setPreviewState(state, extras = {}) {
    if (redirectPreviewPlaceholder) redirectPreviewPlaceholder.hidden = state !== "placeholder";
    if (redirectPreviewLoading) redirectPreviewLoading.hidden = state !== "loading";
    if (redirectPreviewError) redirectPreviewError.hidden = state !== "error";
    if (redirectPreviewWebViewNotice) redirectPreviewWebViewNotice.hidden = state !== "webview";
    const hasUrl = state === "webview" || state === "loading" || state === "error";
    if (redirectReloadButton) redirectReloadButton.disabled = !hasUrl;
    if (redirectOpenExternalButton) redirectOpenExternalButton.disabled = !hasUrl;
    if (extras.loadingDomain && redirectLoadingDomain) redirectLoadingDomain.textContent = extras.loadingDomain;
    if (extras.errorDesc && redirectErrorDesc) redirectErrorDesc.textContent = extras.errorDesc;
  }

  function requestDesktopPreview(link) {
    if (!link?.url) return false;
    if (!desktopWebView) {
      setPreviewState("error", {
        errorDesc: "WebView2 hanya tersedia saat dashboard dijalankan melalui aplikasi desktop Domain Ops Console.",
      });
      return false;
    }
    try {
      if (!previewStatusHandlerAttached) {
        desktopWebView.addEventListener("message", (event) => {
          const message = event.data;
          if (message?.type !== "preview-status" || !currentPreviewLink || message.url !== currentPreviewLink.url) return;
          if (previewLoadTimer) { clearTimeout(previewLoadTimer); previewLoadTimer = null; }
          if (message.success) {
            setPreviewState("webview");
            log(`WebView opened: ${currentPreviewLink.domain}`, "success");
          } else {
            setPreviewState("error", {
              errorDesc: `Halaman tidak berhasil dimuat di WebView (${message.error || "kesalahan navigasi"}).`,
            });
            log(`WebView navigation failed: ${currentPreviewLink.domain}`, "error");
          }
        });
        previewStatusHandlerAttached = true;
      }
      desktopWebView.postMessage({ type: "open-preview", url: link.url });
      return true;
    } catch (error) {
      setPreviewState("error", {
        errorDesc: `Tidak dapat membuka jendela WebView: ${error.message || "kesalahan tidak diketahui"}`,
      });
      log(`WebView request failed: ${link.domain}`, "error");
      return false;
    }
  }

  function renderRedirectLinks() {
    if (!redirectTableBody) return;
    redirectTableBody.replaceChildren();
    if (redirectCount) redirectCount.textContent = `${redirectLinks.length} LINK${redirectLinks.length === 1 ? "" : "S"}`;

    if (activeRedirectPreview && !redirectLinks.includes(activeRedirectPreview)) {
      activeRedirectPreview = null;
      currentPreviewLink = null;
      if (previewLoadTimer) { clearTimeout(previewLoadTimer); previewLoadTimer = null; }
      setPreviewState("placeholder");
      if (redirectActiveUrl) { redirectActiveUrl.textContent = "Pilih domain dari daftar"; redirectActiveUrl.title = "-"; }
      if (redirectActiveDomain) redirectActiveDomain.textContent = "Belum dipilih";
    }

    if (redirectLinks.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 3;
      td.className = "redirect-empty";
      td.innerHTML = `<div class="empty-state"><div class="empty-state-icon">◌</div><div class="empty-state-title">Belum ada link</div><div class="empty-state-desc">Masukkan link lalu pilih Proses Link.</div></div>`;
      tr.appendChild(td);
      redirectTableBody.appendChild(tr);
      return;
    }

    redirectLinks.forEach((link, index) => {
      const row = document.createElement("tr");
      row.dataset.redirectIndex = String(index);

      const numCell = document.createElement("td");
      numCell.className = "redirect-row-number";
      numCell.textContent = String(index + 1);

      const urlCell = document.createElement("td");
      urlCell.className = "redirect-url-cell";
      if (link.url && link.domain) {
        const src = document.createElement("span");
        src.className = "redirect-url-source";
        src.textContent = link.source;
        src.title = link.source;
        const dom = document.createElement("span");
        dom.className = "redirect-domain-cell";
        dom.setAttribute("role", "button");
        dom.setAttribute("tabindex", "0");
        dom.setAttribute("aria-label", `Pratinjau ${link.domain}`);
        dom.dataset.domain = link.domain;
        dom.textContent = link.domain;
        urlCell.append(src, dom);
      } else {
        urlCell.textContent = link.source;
      }
      if (link.error) { urlCell.title = link.error; urlCell.classList.add("redirect-invalid-url"); }

      const actionsCell = document.createElement("td");
      actionsCell.className = "redirect-actions";
      if (link.url) {
        const openLink = document.createElement("a");
        openLink.className = "redirect-open-button";
        openLink.href = link.url;
        openLink.target = "_blank";
        openLink.rel = "noopener noreferrer";
        openLink.title = "Buka di tab baru";
        openLink.setAttribute("aria-label", `Buka ${link.source} di tab baru`);
        openLink.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3h7v7"/><path d="M10 14 21 3"/><path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6"/></svg>';
        actionsCell.appendChild(openLink);
      } else {
        const err = document.createElement("span");
        err.className = "redirect-error-label";
        err.textContent = "invalid";
        actionsCell.appendChild(err);
      }

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "redirect-delete-button";
      delBtn.title = "Hapus";
      delBtn.setAttribute("aria-label", `Hapus baris ${index + 1}`);
      delBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m19 6-1 14H6L5 6"/><path d="M10 11v5M14 11v5"/></svg>';
      delBtn.addEventListener("click", () => {
        redirectLinks.splice(index, 1);
        renderRedirectLinks();
        log(`Link #${index + 1} dihapus.`, "warn");
      });
      actionsCell.appendChild(delBtn);

      row.append(numCell, urlCell, actionsCell);
      if (activeRedirectPreview === link) row.classList.add("redirect-row-active");
      redirectTableBody.appendChild(row);
    });
  }

  function processRedirectLinks() {
    if (!redirectInput || !redirectProgress) return;
    const rawUrls = redirectInput.value.split(/\r?\n/).map((u) => u.trim()).filter(Boolean);
    if (rawUrls.length === 0) {
      redirectProgress.textContent = "Masukkan minimal satu link.";
      log("Proses link dibatalkan: input kosong.", "warn");
      return;
    }
    let invalid = 0;
    redirectLinks = rawUrls.map((source) => {
      try {
        const url = normalizeRedirectUrl(source);
        return { source, url, domain: new URL(url).hostname, error: "" };
      } catch (error) {
        invalid++;
        return { source, url: "", domain: "", error: error.message || "URL tidak valid." };
      }
    });
    renderRedirectLinks();
    redirectProgress.textContent = invalid
      ? `${redirectLinks.length} link dimuat, ${invalid} tidak valid.`
      : `Berhasil memuat ${redirectLinks.length} link.`;
    log(`Redirect: ${redirectLinks.length} diproses${invalid ? `, ${invalid} invalid` : ""}.`, invalid ? "warn" : "success");
  }

  function showRedirectPreview(link, activeRow) {
    if (!link?.url) return;
    activeRedirectPreview = link;
    currentPreviewLink = link;

    if (previewLoadTimer) { clearTimeout(previewLoadTimer); previewLoadTimer = null; }

    redirectTableBody?.querySelectorAll("tr").forEach((r) => r.classList.remove("redirect-row-active"));
    redirectTableBody?.querySelectorAll(".redirect-domain-cell").forEach((d) => d.classList.remove("is-previewing"));
    activeRow?.classList.add("redirect-row-active");
    const activeDomain = activeRow?.querySelector(".redirect-domain-cell");
    if (activeDomain) {
      activeDomain.classList.remove("is-previewing");
      void activeDomain.offsetWidth;
      activeDomain.classList.add("is-previewing");
    }

    if (redirectActiveDomain) redirectActiveDomain.textContent = link.domain;
    if (redirectActiveUrl) {
      redirectActiveUrl.textContent = link.url;
      redirectActiveUrl.title = link.url;
    }

    if (window.matchMedia("(max-width: 1024px)").matches) {
      const previewPanel = document.querySelector(".redirect-preview-panel");
      if (previewPanel) {
        setTimeout(() => previewPanel.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      }
    }

    setPreviewState("loading", { loadingDomain: link.domain });
    if (!requestDesktopPreview(link)) return;

    if (previewLoadTimer) clearTimeout(previewLoadTimer);
    previewLoadTimer = setTimeout(() => {
      if (currentPreviewLink === link) {
        setPreviewState("error", {
          errorDesc: "Host WebView2 tidak merespons. Tutup lalu jalankan ulang aplikasi desktop.",
        });
        previewLoadTimer = null;
      }
    }, PREVIEW_TIMEOUT_MS);

    log(`Preview: ${link.domain}`, "info");
  }

  function reloadPreview() {
    if (!currentPreviewLink) return;
    log(`Reload preview: ${currentPreviewLink.domain}`, "info");
    const link = currentPreviewLink;
    const idx = redirectLinks.indexOf(link);
    const row = redirectTableBody?.querySelector(`tr[data-redirect-index="${idx}"]`);
    showRedirectPreview(link, row);
  }

  function openPreviewExternal() {
    if (!currentPreviewLink?.url) return;
    if (requestDesktopPreview(currentPreviewLink)) {
      setPreviewState("loading", { loadingDomain: currentPreviewLink.domain });
      log(`Open in WebView: ${currentPreviewLink.domain}`, "info");
    }
  }

  redirectReloadButton?.addEventListener("click", reloadPreview);
  redirectOpenExternalButton?.addEventListener("click", openPreviewExternal);
  redirectOpenFromError?.addEventListener("click", openPreviewExternal);

  function previewFocusedRedirectDomain(domainEl) {
    const row = domainEl.closest("tr");
    const link = redirectLinks[Number(row?.dataset.redirectIndex)];
    if (link) showRedirectPreview(link, row);
  }

  function exportRedirectLinks() {
    const valid = redirectLinks.filter((l) => l.url);
    if (valid.length === 0) { if (redirectProgress) redirectProgress.textContent = "Tidak ada link valid untuk diekspor."; return; }
    const esc = (v) => `"${v.replace(/"/g, '""')}"`;
    const csv = [["URL Asal", "Domain"].map(esc).join(","), ...valid.map((l) => [l.source, l.domain].map(esc).join(","))].join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "daftar-link.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    log(`Ekspor CSV: ${valid.length} link`, "success");
  }

  async function copyAllRedirectLinks() {
    const domains = redirectLinks.filter((l) => l.domain).map((l) => l.domain);
    if (!redirectProgress || domains.length === 0) { if (redirectProgress) redirectProgress.textContent = "Belum ada domain untuk disalin."; return; }
    const text = domains.join("\n");
    try {
      if (!navigator.clipboard?.writeText) throw new Error("no clipboard");
      await navigator.clipboard.writeText(text);
      redirectProgress.textContent = `Berhasil menyalin ${domains.length} domain.`;
      showFeedback(`✅ ${domains.length} domain disalin`);
      log(`Redirect copy: ${domains.length} domain`, "success");
    } catch { fallbackCopy(text); redirectProgress.textContent = `Berhasil menyalin ${domains.length} domain.`; }
  }

  redirectCopyAllButton?.addEventListener("click", copyAllRedirectLinks);
  redirectProcessButton?.addEventListener("click", processRedirectLinks);
  redirectExportButton?.addEventListener("click", exportRedirectLinks);

  // ═══════════════ BRAND RULES ═══════════════
  const rules = [
    { brand: "WDBOS", keywords: ["wdbos", "wdb"] },
    { brand: "BOSJOKO", keywords: ["bosjoko", "bosjo"] },
    { brand: "ZEUSSLOT", keywords: ["zeusslot", "zeus"] },
    { brand: "JUTAWANBET", keywords: ["jutawanbet", "jutawan"] },
    { brand: "LATOTO", keywords: ["latoto", "la"] },
    { brand: "TOPANBOS88", keywords: ["topanbos", "topan"] },
    { brand: "HOKBENTOTO", keywords: ["hokben"] },
    { brand: "DEPOBOS", keywords: ["depobos", "depo"] },
    { brand: "ANGKABET", keywords: ["angkabet", "angka"] },
    { brand: "TVTOTO", keywords: ["tvtoto", "tv"] },
    { brand: "PULITOTO", keywords: ["pulitoto", "puli"] },
    { brand: "WATITOTO", keywords: ["watitoto", "wati"] },
    { brand: "FATCAI99", keywords: ["fatcai"] },
    { brand: "RUANGWD", keywords: ["ruangwd", "ruang"] },
    { brand: "TOPWD", keywords: ["topwd"] },
    { brand: "PESONA805", keywords: ["pesona"] },
    { brand: "Bandar80", keywords: ["bandar", "baandar", "banda", "band"] },
    { brand: "HOKIJITU", keywords: ["hokijitu", "hoki"] },
    { brand: "INDOJP", keywords: ["indojp"] },
    { brand: "LIGABANDOT", keywords: ["ligabandot"] },
    { brand: "LAPAK", keywords: ["lapak"] },
    { brand: "WDMAHJONG", keywords: ["wdmahjong"] },
    { brand: "SEJATIWIN", keywords: ["sejatiwin", "sejati"] },
    { brand: "CITAWIN", keywords: ["citawin"] },
    { brand: "MANCINGDUIT", keywords: ["mancingduit", "mancing"] },
    { brand: "ARENA303", keywords: ["arena"] },
    { brand: "MARKASWD", keywords: ["markaswd", "markas"] },
    { brand: "JUARA88", keywords: ["juara88", "juara"] },
    { brand: "LINETOGEL", keywords: ["linetogel", "line"] },
    { brand: "GENGTOTO", keywords: ["gengtoto", "geng"] },
    { brand: "GOLTOGEL", keywords: ["goltogel", "gol"] },
    { brand: "TOGELUP", keywords: ["togelup", "togel"] },
    { brand: "DINGDONGTOGEL", keywords: ["dingdong"] },
    { brand: "HOMETOGEL", keywords: ["hometogel", "home"] },
    { brand: "UDINTOGEL", keywords: ["udintogel", "udin"] },
    { brand: "JONITOGEL", keywords: ["jonitogel", "joni"] },
    { brand: "INDRATOGEL", keywords: ["indratogel", "indra"] },
    { brand: "FIATOGEL", keywords: ["fiatogel", "fia"] },
    { brand: "PATIHTOTO", keywords: ["patihtoto", "patih"] },
    { brand: "LUNATOGEL", keywords: ["lunatogel", "luna"] },
    { brand: "PWVIP4D", keywords: ["pwvip", "pwvip4d", "pwvid"] },
    { brand: "TOGELON", keywords: ["togelon", "on"] },
    { brand: "OPPATOTO", keywords: ["oppatoto", "oppa"] },
    { brand: "YOKTOGEL", keywords: ["yoktogel", "yok"] },
    { brand: "YOWESTOGEL", keywords: ["yowestogel", "yowes"] },
    { brand: "PROTOGEL", keywords: ["protogel", "pro"] },
    { brand: "MARIATOGEL", keywords: ["mari", "maria"] },
    { brand: "ZIATOGEL", keywords: ["ziatogel", "zia"] },
    { brand: "DANATOTO", keywords: ["danatoto", "dana"] },
    { brand: "PARTAITOGEL", keywords: ["partaitogel", "partai"] },
    { brand: "SITUSTOTO", keywords: ["situstoto", "situs"] },
    { brand: "NANASTOTO", keywords: ["nanastoto", "nanas"] },
  ];

  const domainInputEl = document.getElementById("domainInput");
  const outputEl = document.getElementById("output");
  const groupCount = document.getElementById("groupCount");
  const domainInputCount = document.getElementById("domainInputCount");

  domainInputEl?.addEventListener("input", () => {
    const rawdomains = domainInputEl.value
      .split(/[\n,\s]+/)
      .map((d) => cleanDomain(d))
      .filter((d) => d.length > 0 && d.includes("."));

    if (domainInputCount) domainInputCount.textContent = `${rawdomains.length} domain${rawdomains.length === 1 ? "" : "s"}`;

    const grouped = {};
    rules.forEach((r) => (grouped[r.brand] = []));

    rawdomains.forEach((domain) => {
      const domainLower = domain.toLowerCase();
      let matched = null, longest = "";
      for (const rule of rules) {
        for (const kw of rule.keywords || []) {
          const keyword = String(kw).toLowerCase().trim();
          if (keyword && domainLower.includes(keyword) && keyword.length > longest.length) {
            longest = keyword; matched = rule;
          }
        }
      }
      if (matched) grouped[matched.brand].push(domain);
    });

    outputEl.innerHTML = "";
    let brandCount = 0;
    let totalGrouped = 0;
    for (const [brand, domains] of Object.entries(grouped)) {
      if (domains.length > 0) {
        brandCount++;
        totalGrouped += domains.length;
        let html = `<div class="brand-group"><div class="brand-header">${escapeHtml(brand)}</div>`;
        domains.forEach((d) => { html += `<div class="domain-item">${escapeHtml(d)}</div>`; });
        html += `</div>`;
        outputEl.innerHTML += html;
      }
    }
    if (brandCount === 0) {
      outputEl.innerHTML = `<div class="empty-state"><div class="empty-state-icon">◌</div><div class="empty-state-title">Belum ada data</div><div class="empty-state-desc">Domain akan muncul otomatis di sini.</div></div>`;
    }
    if (groupCount) groupCount.textContent = `${brandCount} BRAND${brandCount === 1 ? "" : "S"} · ${totalGrouped} DOMAIN${totalGrouped === 1 ? "" : "S"}`;
  });

  function copyToClipboard(text, btn) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = "✓ Copied";
        setTimeout(() => { btn.innerHTML = orig; }, 1800);
      }
      showFeedback("✅ Disalin ke clipboard");
      log("Copy successful.", "success");
    }).catch(() => fallbackCopy(text));
  }

  document.getElementById("btn-copy-output")?.addEventListener("click", () => {
    if (!outputEl) return;
    const groups = outputEl.querySelectorAll(".brand-group");
    if (groups.length === 0) return;
    let text = "";
    groups.forEach((g) => {
      const brand = g.querySelector(".brand-header")?.textContent.trim() || "BRAND";
      const domains = Array.from(g.querySelectorAll(".domain-item")).map((el) => el.textContent.trim());
      if (brand && domains.length) { text += `[${brand}]\n${domains.join("\n")}\n\n`; }
    });
    copyToClipboard(text.trim(), document.getElementById("btn-copy-output"));
  });

  // ═══════════════ CHECKER ═══════════════
  function parseDataByBrand(text) {
    if (!text || typeof text !== "string") return new Map();
    const lines = text.split("\n");
    const map = new Map();
    let current = " UMUM";
    map.set(current, []);
    const aliases = { "DDT": "DINGDONGTOGEL" };

    for (let raw of lines) {
      let line = raw.trim();
      if (!line) continue;
      const attached = line.match(/^([A-Z0-9\s]+?)([a-z0-9\-]+\.[a-z]{2,})$/);
      if (attached && !line.startsWith("[")) {
        const brand = attached[1].trim().toUpperCase();
        const domain = cleanDomain(attached[2]);
        if (brand && brand.length <= 15) {
          current = aliases[brand] || brand;
          if (!map.has(current)) map.set(current, []);
          map.get(current).push(domain);
          continue;
        }
      }
      const isBracket = line.startsWith("[") && line.endsWith("]");
      const noDot = !line.includes(".");
      if (isBracket || noDot) {
        const clean = line.replace(/[\[\]]/g, "").trim().toUpperCase();
        current = aliases[clean] || clean;
        if (!map.has(current)) map.set(current, []);
        continue;
      }
      const cleanDomainValue = cleanDomain(line);
      if (cleanDomainValue && cleanDomainValue.includes(".")) {
        if (!map.has(current)) map.set(current, []);
        const list = map.get(current);
        if (!list.includes(cleanDomainValue)) list.push(cleanDomainValue);
      }
    }
    if (map.has(" UMUM") && map.get(" UMUM").length === 0) map.delete(" UMUM");
    return map;
  }

  function compareData(oldText, newText) {
    const oldMap = parseDataByBrand(oldText);
    const newMap = parseDataByBrand(newText);
    let totalOld = 0, totalNew = 0;
    oldMap.forEach((l) => totalOld += l.length);
    newMap.forEach((l) => totalNew += l.length);
    let valid = true;
    const reports = [];
    let mismatchCount = 0;
    const getType = (d) => {
      const x = d.toLowerCase();
      if (x.includes("rtp")) return "RTP";
      if (x.includes("-amp") || x.includes("amp")) return "AMP";
      if (x.includes("-blog") || x.includes("blog")) return "BLOG";
      return "NORMAL / ANGKA";
    };
    const allBrands = new Set([...oldMap.keys(), ...newMap.keys()]);
    allBrands.forEach((brand) => {
      const oldD = oldMap.get(brand) || [];
      const newD = newMap.get(brand) || [];
      const oldT = { AMP: 0, BLOG: 0, RTP: 0, "NORMAL / ANGKA": 0 };
      const newT = { AMP: 0, BLOG: 0, RTP: 0, "NORMAL / ANGKA": 0 };
      oldD.forEach((d) => oldT[getType(d)]++);
      newD.forEach((d) => newT[getType(d)]++);
      let match = oldD.length === newD.length;
      if (match) {
        if (oldT.AMP !== newT.AMP || oldT.BLOG !== newT.BLOG || oldT.RTP !== newT.RTP || oldT["NORMAL / ANGKA"] !== newT["NORMAL / ANGKA"]) match = false;
      }
      if (!match) { valid = false; mismatchCount++; }
      reports.push({ brand, match, oldT, newT, oldCount: oldD.length, newCount: newD.length });
    });
    reports.sort((a, b) => a.brand.localeCompare(b.brand));
    return { valid, totalOld, totalNew, reports, mismatchCount };
  }

  function renderResult(result) {
    const statusDiv = document.getElementById("statusContainer");
    const reportDiv = document.getElementById("reportContainer");
    const subtitle = document.getElementById("resultSubtitle");
    const kpiStatus = document.getElementById("kpiStatus");
    const kpiStatusSub = document.getElementById("kpiStatusSub");
    const kpiStatusDot = document.getElementById("kpiStatusDot");
    const kpiOld = document.getElementById("kpiOld");
    const kpiNew = document.getElementById("kpiNew");
    const kpiBrands = document.getElementById("kpiBrands");
    const kpiBrandsSub = document.getElementById("kpiBrandsSub");
    if (!statusDiv || !reportDiv) return;

    if (!result) {
      statusDiv.replaceChildren();
      reportDiv.innerHTML = `<div class="empty-state"><div class="empty-state-icon">◌</div><div class="empty-state-title">Siap menerima data</div><div class="empty-state-desc">Masukkan data lama dan baru, lalu jalankan cek.</div></div>`;
      if (subtitle) subtitle.textContent = "Belum ada hasil";
      if (kpiStatus) { kpiStatus.textContent = "IDLE"; kpiStatus.classList.remove("valid", "invalid"); }
      if (kpiStatusSub) kpiStatusSub.textContent = "Menunggu data";
      if (kpiStatusDot) kpiStatusDot.className = "kpi-dot";
      if (kpiOld) kpiOld.textContent = "0";
      if (kpiNew) kpiNew.textContent = "0";
      if (kpiBrands) kpiBrands.textContent = "0";
      if (kpiBrandsSub) kpiBrandsSub.textContent = "brand terdeteksi";
      return;
    }

    if (result.valid) {
      statusDiv.innerHTML = '<span class="status-badge valid">✓ SEMUA JENIS & JUMLAH DOMAIN SESUAI</span>';
      if (kpiStatus) { kpiStatus.textContent = "VALID"; kpiStatus.classList.add("valid"); kpiStatus.classList.remove("invalid"); }
      if (kpiStatusSub) kpiStatusSub.textContent = "Semua brand cocok";
      if (kpiStatusDot) kpiStatusDot.className = "kpi-dot valid";
    } else {
      statusDiv.innerHTML = '<span class="status-badge invalid">✗ ADA JUMLAH ATAU JENIS LINK YANG MELENCENG</span>';
      if (kpiStatus) { kpiStatus.textContent = "FAIL"; kpiStatus.classList.add("invalid"); kpiStatus.classList.remove("valid"); }
      if (kpiStatusSub) kpiStatusSub.textContent = `${result.mismatchCount} brand mismatch`;
      if (kpiStatusDot) kpiStatusDot.className = "kpi-dot invalid";
    }
    if (subtitle) subtitle.textContent = `${result.reports.length} brand dianalisis`;
    if (kpiOld) kpiOld.textContent = String(result.totalOld);
    if (kpiNew) kpiNew.textContent = String(result.totalNew);
    if (kpiBrands) kpiBrands.textContent = String(result.reports.length - result.mismatchCount);
    if (kpiBrandsSub) kpiBrandsSub.textContent = `dari ${result.reports.length} brand cocok`;

    let html = `<div class="total-domain"><span>Total Lama: <strong>${result.totalOld}</strong></span><span>Total Baru: <strong>${result.totalNew}</strong></span></div><div class="detail-grid">`;
    result.reports.forEach((b) => {
      const cls = b.match ? "match" : "mismatch";
      const icon = b.match ? "✓" : "✗";
      const color = b.match ? "var(--c-green)" : "var(--c-red)";
      html += `<div class="brand-report ${cls}">
        <div style="display:flex;justify-content:space-between;align-items:center;font-family:var(--font-mono);font-size:12.5px;margin-bottom:6px;">
          <span>${icon} <strong style="color:var(--t-bright);">${escapeHtml(b.brand)}</strong></span>
          <span style="color:${color};font-weight:600;">${b.oldCount} → ${b.newCount}</span>
        </div>
        <div style="font-size:10.5px;color:${b.match ? 'var(--t-muted)' : color};font-family:var(--font-mono);">
          AMP: ${b.oldT.AMP}→${b.newT.AMP} · Blog: ${b.oldT.BLOG}→${b.newT.BLOG} · RTP: ${b.oldT.RTP}→${b.newT.RTP} · Normal: ${b.oldT["NORMAL / ANGKA"]}→${b.newT["NORMAL / ANGKA"]}
        </div>
      </div>`;
    });
    html += `</div>`;
    reportDiv.innerHTML = html;

    log(`Verify: ${result.valid ? "PASS" : "FAIL"} — ${result.totalOld}→${result.totalNew} domain, ${result.mismatchCount} mismatch`, result.valid ? "success" : "error");
  }

  function performCheck() {
    const oldText = document.getElementById("oldData")?.value || "";
    const newText = document.getElementById("newData")?.value || "";
    if (!oldText.trim() && !newText.trim()) { alert("Harap isi data lama dan baru!"); return; }
    const result = compareData(oldText, newText);
    renderResult(result);
  }

  function resetChecker() {
    const o = document.getElementById("oldData"), n = document.getElementById("newData");
    if (o) o.value = ""; if (n) n.value = "";
    renderResult(null);
    log("Checker direset.", "warn");
  }

  document.getElementById("checkBtn")?.addEventListener("click", performCheck);
  document.getElementById("resetBtn")?.addEventListener("click", resetChecker);
  renderResult(null);

  // ═══════════════ DNS PARSER ═══════════════
  const inputData = document.getElementById("inputData");
  const resultTable = document.getElementById("resultTable");
  const rowCount = document.getElementById("rowCount");
  const inputLineCount = document.getElementById("inputLineCount");
  const bulkCount = document.getElementById("bulkCount");

  let processedDomains = [];
  let processedNS = [];
  let lastFocusedCell = null;
  let renderTimeout = null;

  function processData() {
    if (!inputData) return;
    const text = inputData.value;
    const lines = text.split("\n");
    const nonEmpty = lines.filter((l) => l.trim()).length;
    if (inputLineCount) inputLineCount.textContent = `${nonEmpty} lines`;

    if (renderTimeout) clearTimeout(renderTimeout);
    renderTimeout = setTimeout(() => {
      const clean = lines.map((l) => l.trim()).filter(Boolean);
      let tempDomains = [], tempNS = [], rawPairs = [];
      for (const line of clean) {
        const ll = line.toLowerCase();
        const isNS = ll.includes(".ns.") || ll.includes("ns.cloudflare") || (ll.includes("ns") && ll.split(".").length > 2);
        const isDomain = !isNS && line.includes(".") && !ll.includes("http") && line.split(" ").length === 1;
        if (isDomain) {
          if (tempNS.length > 0 && tempDomains.length > 0) {
            tempDomains.forEach((d) => rawPairs.push({ domain: d, ns: tempNS.join(",") }));
            tempDomains = []; tempNS = [];
          }
          tempDomains.push(line);
        } else if (isNS) { tempNS.push(line); }
      }
      if (tempDomains.length > 0) {
        const joined = tempNS.length > 0 ? tempNS.join(",") : "";
        tempDomains.forEach((d) => rawPairs.push({ domain: d, ns: joined }));
      }

      const groups = {};
      rawPairs.forEach((p) => {
        const k = p.ns.trim().toLowerCase();
        if (!k) return;
        if (!groups[k]) groups[k] = { originalNS: p.ns, domains: [] };
        if (!groups[k].domains.includes(p.domain)) groups[k].domains.push(p.domain);
      });

      const bulk = [], normal = [];
      Object.keys(groups).forEach((k) => {
        const g = groups[k];
        if (g.domains.length > 1) bulk.push(g);
        else normal.push({ domain: g.domains[0], ns: g.originalNS });
      });

      processedDomains = normal.map((p) => p.domain);
      processedNS = normal.map((p) => p.ns);
      renderTable();
      renderBulk(bulk);
      if (bulkCount) bulkCount.textContent = `${bulk.length} GROUP${bulk.length === 1 ? "" : "S"}`;
    }, 200);
  }

  function renderBulk(groups) {
    const container = document.getElementById("bulkResultContainer");
    if (!container) return;
    if (groups.length === 0) {
      container.innerHTML = `<div class="empty-state empty-state-inline"><div class="empty-state-icon">◌</div><div class="empty-state-title">Belum ada grup massal</div><div class="empty-state-desc">Domain dengan NS yang sama (≥2) akan muncul di sini.</div></div>`;
      return;
    }
    let html = "";
    groups.forEach((g, i) => {
      html += `<div class="dynamic-bulk-card">
        <div class="dynamic-bulk-header">🖥 NS: ${escapeHtml(g.originalNS)}</div>
        <div class="dynamic-bulk-domains">${g.domains.map((d) => `<div>${escapeHtml(d)}</div>`).join("")}</div>
        <div class="dynamic-bulk-actions">
          <button class="btn-bulk-action" data-copy-domains="${i}">⎘ Copy ${g.domains.length} Domain</button>
          <button class="btn-bulk-action" data-copy-ns="${escapeHtml(g.originalNS)}">⎘ Copy NS</button>
        </div>
      </div>`;
    });
    container.innerHTML = html;
    container.querySelectorAll("[data-copy-domains]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const g = groups[Number(btn.dataset.copyDomains)];
        navigator.clipboard.writeText(g.domains.join("\n")).then(() => {
          showFeedback(`✅ ${g.domains.length} domain disalin`);
          log(`Bulk copy: ${g.domains.length} domains`, "success");
        });
      });
    });
    container.querySelectorAll("[data-copy-ns]").forEach((btn) => {
      btn.addEventListener("click", () => {
        navigator.clipboard.writeText(btn.dataset.copyNs).then(() => {
          showFeedback("✅ NS disalin");
          log("NS copied.", "success");
        });
      });
    });
  }

  function renderTable() {
    const count = processedDomains.length;
    if (rowCount) rowCount.textContent = count;
    if (count === 0) {
      resultTable.innerHTML = `<tr><td class="empty-msg" colspan="3"><div class="empty-state"><div class="empty-state-icon">◌</div><div class="empty-state-title">Belum ada data</div><div class="empty-state-desc">Tempel data di kolom sebelah kiri.</div></div></td></tr>`;
      lastFocusedCell = null;
      return;
    }
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const tr = document.createElement("tr");
      const td1 = document.createElement("td");
      td1.className = "row-number"; td1.textContent = i + 1;
      const td2 = document.createElement("td");
      td2.className = "domain-cell"; td2.setAttribute("tabindex", "0");
      td2.dataset.row = i; td2.dataset.col = "domain";
      td2.textContent = processedDomains[i] || "";
      const td3 = document.createElement("td");
      td3.className = "ns-cell"; td3.setAttribute("tabindex", "0");
      td3.dataset.row = i; td3.dataset.col = "ns";
      td3.textContent = processedNS[i] || "";
      tr.append(td1, td2, td3);
      frag.appendChild(tr);
    }
    resultTable.innerHTML = "";
    resultTable.appendChild(frag);

    if (lastFocusedCell) {
      const cell = resultTable.querySelector(`td[data-row="${lastFocusedCell.row}"][data-col="${lastFocusedCell.col}"]`);
      if (cell) { setTimeout(() => cell.focus(), 40); return; }
    }
    const first = resultTable.querySelector("td[tabindex]");
    if (first) setTimeout(() => first.focus(), 40);
  }

  function saveFocusedCell(cell) {
    if (!cell || cell.tagName !== "TD") return;
    const r = cell.getAttribute("data-row"), c = cell.getAttribute("data-col");
    if (r !== null && c !== null) lastFocusedCell = { row: parseInt(r), col: c };
  }

  document.addEventListener("copy", (e) => {
    const active = document.activeElement;
    const isDns = active?.tagName === "TD" && active.hasAttribute("tabindex");
    const isServer = active?.classList?.contains("server-domain-cell");
    const isRedirect = active?.classList?.contains("redirect-domain-cell");
    if (!isDns && !isServer && !isRedirect) return;
    e.preventDefault();
    const text = (isServer || isRedirect) ? active.dataset.domain : active.textContent.trim();
    if (!text) { showFeedback("⚠ Sel kosong"); return; }
    e.clipboardData.setData("text/plain", text);
    if (isRedirect && redirectProgress) redirectProgress.textContent = `Disalin: ${text}`;
    else if (isServer) showServerDomainCopied(active);
    else showFeedback(`✅ Disalin: "${text}"`);
    log(`Copied: ${text}`, "info");
    if (isDns) setTimeout(() => active.focus(), 40);
  });

  document.addEventListener("keydown", (e) => {
    const active = document.activeElement;
    if (!active || active.tagName !== "TD" || !active.hasAttribute("tabindex")) return;
    const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const row = active.parentElement, tbody = row.parentElement;
    const rows = Array.from(tbody.children);
    const rIdx = rows.indexOf(row);
    const cells = Array.from(row.querySelectorAll("td[tabindex]"));
    const cIdx = cells.indexOf(active);
    let nR = rIdx, nC = cIdx;
    if (e.key === "Enter") nR = e.shiftKey ? Math.max(rIdx - 1, 0) : Math.min(rIdx + 1, rows.length - 1);
    else if (e.key === "ArrowDown") nR = Math.min(rIdx + 1, rows.length - 1);
    else if (e.key === "ArrowUp") nR = Math.max(rIdx - 1, 0);
    else if (e.key === "ArrowRight") nC = Math.min(cIdx + 1, cells.length - 1);
    else if (e.key === "ArrowLeft") nC = Math.max(cIdx - 1, 0);
    if (nR !== rIdx || nC !== cIdx) {
      const newRow = rows[nR];
      if (newRow) {
        const nc = newRow.querySelectorAll("td[tabindex]");
        const t = nc[nC] || nc[0];
        if (t) { t.focus(); saveFocusedCell(t); t.scrollIntoView({ block: "nearest", behavior: "smooth" }); }
      }
    }
  });

  document.addEventListener("click", (e) => {
    const t = e.target;
    const rd = t.closest?.(".redirect-domain-cell");
    if (rd) { rd.focus(); previewFocusedRedirectDomain(rd); return; }
    const sd = t.closest?.(".server-domain-cell");
    if (sd) { sd.focus(); return; }
    if (t.tagName === "TD" && t.closest(".data-table") && t.hasAttribute("tabindex")) { t.focus(); saveFocusedCell(t); }
  });

  const serverTimeouts = new WeakMap();
  function showServerDomainCopied(el) {
    el.classList.add("is-copied");
    const ind = el.querySelector(".server-domain-copied");
    if (ind) ind.textContent = "✓ COPIED";
    clearTimeout(serverTimeouts.get(el));
    const to = setTimeout(() => { el.classList.remove("is-copied"); if (ind) ind.textContent = ""; serverTimeouts.delete(el); }, 1000);
    serverTimeouts.set(el, to);
  }

  async function copyServerDomain(el) {
    const d = el.dataset.domain; if (!d) return;
    try { await navigator.clipboard.writeText(d); showServerDomainCopied(el); log(`Copied: ${d}`, "info"); }
    catch { fallbackCopy(d); showServerDomainCopied(el); }
  }

  document.addEventListener("keydown", (e) => {
    const active = document.activeElement;
    const meta = e.metaKey || e.ctrlKey;
    if (active?.classList?.contains("redirect-domain-cell")) {
      const list = Array.from(document.querySelectorAll("#redirectTableBody .redirect-domain-cell"));
      const i = list.indexOf(active);
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Tab") {
        const dir = e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey) ? -1 : 1;
        const next = list[i + dir]; if (next) { e.preventDefault(); next.focus(); }
        return;
      }
      if (e.key === "Enter") { e.preventDefault(); previewFocusedRedirectDomain(active); }
      else if (e.key.toLowerCase() === "c" && meta) { e.preventDefault(); copyRedirectDomain(active); }
      return;
    }
    if (active?.classList?.contains("server-domain-cell")) {
      const list = active.parentElement;
      const items = Array.from(list.querySelectorAll(".server-domain-cell"));
      const i = items.indexOf(active);
      if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
        const n = items[i + 1]; if (n) { e.preventDefault(); n.focus(); } return;
      }
      if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
        const p = items[i - 1]; if (p) { e.preventDefault(); p.focus(); } return;
      }
      if (e.key === "Enter" || (e.key.toLowerCase() === "c" && meta)) {
        e.preventDefault(); copyServerDomain(active);
      }
    }
  });

  async function copyRedirectDomain(el) {
    const d = el.dataset.domain; if (!d) return;
    try {
      await navigator.clipboard.writeText(d);
      if (redirectProgress) redirectProgress.textContent = `Disalin: ${d}`;
      log(`Copied: ${d}`, "info");
    } catch { fallbackCopy(d); }
  }

  document.addEventListener("focusin", (e) => {
    const t = e.target;
    if (t.tagName === "TD" && t.hasAttribute("tabindex")) saveFocusedCell(t);
    if (t.classList?.contains("server-domain-cell")) {
      document.querySelectorAll(".server-domain-cell.is-focused").forEach((el) => el.classList.remove("is-focused"));
      t.classList.add("is-focused");
    }
  });

  document.getElementById("copyAllBtn")?.addEventListener("click", () => {
    if (processedDomains.length === 0) { showFeedback("⚠ Tidak ada domain"); return; }
    navigator.clipboard.writeText(processedDomains.join("\n")).then(() => {
      showFeedback(`✅ ${processedDomains.length} domain disalin`);
      log(`Copy all: ${processedDomains.length}`, "success");
    }).catch(() => fallbackCopy(processedDomains.join("\n")));
  });

  document.getElementById("copyNsBtn")?.addEventListener("click", () => {
    if (processedNS.length === 0) { showFeedback("⚠ Tidak ada NS"); return; }
    navigator.clipboard.writeText(processedNS.join("\n")).then(() => {
      showFeedback(`✅ ${processedNS.length} NS disalin`);
      log(`Copy all NS: ${processedNS.length}`, "success");
    }).catch(() => fallbackCopy(processedNS.join("\n")));
  });

  if (inputData) { inputData.addEventListener("input", processData); processData(); }

  // ═══════════════ SERVER MAPPING ═══════════════
  const serverDatabase = [
    { name: "SERVER 1", ips: ["132.48.200.96", "76.223.90.90"], brands: ["WDBOS", "JPSLOT", "BOSJOKO", "ZEUSSLOT", "MANCINGDUIT", "JUTAWANBET", "JUTAWAN", "LATOTO", "LA", "TOPANBOS88", "HOKBENTOTO", "HOKBEN"] },
    { name: "SERVER 2", ips: ["132.48.203.169", "76.223.88.75"], brands: ["DEPOBOS", "ANGKABET", "TVTOTO", "PULITOTO", "PULI", "WATITOTO", "WATI", "FATCAI99", "FATCAI", "RUANGWD", "TOPWD", "PESONA805"] },
    { name: "SERVER 3", ips: ["75.2.67.164", "3.33.129.68"], brands: ["BANDAR80", "BANDAR", "HOKIJITU", "INDOJP", "JUARA88", "JUARA", "LIGABANDOT", "LAPAK99", "LAPAK", "LAPAKMAHJONG", "ARENA303", "ARENA", "WDMAHJONG", "WDMAH", "SEJATIWIN", "MARKASWD", "CITAWIN"] },
  ];

  function renderServerDomainList(id, domains, emptyMsg) {
    const c = document.getElementById(id); if (!c) return;
    c.replaceChildren();
    if (domains.length === 0) {
      const e = document.createElement("div");
      e.className = "server-empty-state";
      e.textContent = emptyMsg;
      c.appendChild(e);
      return;
    }
    domains.forEach((d) => {
      const item = document.createElement("div");
      item.className = "server-domain-cell";
      item.setAttribute("role", "listitem");
      item.setAttribute("tabindex", "0");
      item.dataset.domain = d;
      const txt = document.createElement("span");
      txt.className = "server-domain-text";
      txt.textContent = d;
      const ind = document.createElement("span");
      ind.className = "server-domain-copied";
      ind.setAttribute("aria-live", "polite");
      item.append(txt, ind);
      c.appendChild(item);
    });
  }

  function processServerMapping() {
    const raw = document.getElementById("inputRawData")?.value || "";
    const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
    const s1 = [], s2 = [], s3 = [], idn = [];

    lines.forEach((line) => {
      if (!line.includes(".")) return;
      const ll = line.toLowerCase();
      let target = null;
      for (const srv of serverDatabase) {
        for (const b of srv.brands) {
          const k = b.toLowerCase();
          const norm = ll.replace(/aa/g, "a").replace(/oo/g, "o").replace(/ee/g, "e");
          if (norm.includes(k) || ll.includes(k) || norm.startsWith(k)) { target = srv.name; break; }
        }
        if (target) break;
      }
      if (target === "SERVER 1") { if (!s1.includes(line)) s1.push(line); }
      else if (target === "SERVER 2") { if (!s2.includes(line)) s2.push(line); }
      else if (target === "SERVER 3") { if (!s3.includes(line)) s3.push(line); }
      else idn.push(line);
    });

    [[s1, 1], [s2, 2], [s3, 3]].forEach(([domains, n]) => {
      renderServerDomainList(`server${n}Domains`, domains, "Belum ada domain untuk server ini.");
      const c = document.getElementById(`server${n}Count`);
      if (c) c.textContent = `${String(domains.length).padStart(2, "0")} ${domains.length === 1 ? "DOMAIN" : "DOMAINS"}`;
    });
    renderServerDomainList("outputIdnFallback", idn, "Belum ada domain IDN.");
    const ic = document.getElementById("idnDomainCount");
    if (ic) ic.textContent = `${String(idn.length).padStart(2, "0")} DOMAINS`;

    log(`Server mapping: S1=${s1.length}, S2=${s2.length}, S3=${s3.length}, IDN=${idn.length}`, "success");
    showFeedback(`✅ Mapping: ${s1.length + s2.length + s3.length} domain terpetakan`);
  }

  function copyServerMapping(n) {
    const c = document.getElementById(`server${n}Domains`);
    const domains = c ? Array.from(c.querySelectorAll(".server-domain-cell")).map((d) => d.dataset.domain).filter(Boolean) : [];
    if (domains.length === 0) { showFeedback(`⚠ Tidak ada data SERVER ${n}`); log(`Server ${n}: no data.`, "warn"); return; }
    const text = domains.join("\n");
    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject())
      .then(() => { showFeedback(`✅ ${domains.length} baris SERVER ${n} disalin`); log(`Server ${n} copied: ${domains.length}`, "success"); })
      .catch(() => fallbackCopy(text));
  }

  document.getElementById("runServerMappingBtn")?.addEventListener("click", processServerMapping);
  document.querySelectorAll("[data-copy-server]").forEach((btn) => {
    btn.addEventListener("click", () => copyServerMapping(Number(btn.dataset.copyServer)));
  });

  const inputRawData = document.getElementById("inputRawData");
  const serverInputCount = document.getElementById("serverInputCount");
  inputRawData?.addEventListener("input", () => {
    const n = inputRawData.value.split("\n").filter((l) => l.trim()).length;
    if (serverInputCount) serverInputCount.textContent = `${n} line${n === 1 ? "" : "s"}`;
  });

  window.processServerMapping = processServerMapping;
  window.copyServerMapping = copyServerMapping;

  applyOSLabels();

})();