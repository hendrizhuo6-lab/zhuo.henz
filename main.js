(function () {
  "use strict";

  // ==========================================
  // 0. JAM SISTEM (status bar)
  // ==========================================
  const clockEl = document.getElementById("systemClock");
  function tickClock() {
    if (!clockEl) return;
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString("id-ID", { hour12: false });
  }
  tickClock();
  setInterval(tickClock, 1000);

  // ==========================================
  // 1. LOGIKA NAVIGASI TAB (Diperbarui dengan tab-server)
  // ==========================================
  const navButtons = Array.from(document.querySelectorAll(".navbar-button"));
  const tabContents = {
    "tab-home": document.getElementById("tab-content-home"),
    "tab-profile": document.getElementById("tab-content-profile"),
    "tab-dns": document.getElementById("tab-content-dns"),
    "tab-redirect": document.getElementById("tab-content-redirect"),
    "tab-server": document.getElementById("tab-content-server"), // <-- Ditambahkan di sini
    "tab-about": document.getElementById("tab-content-about"),
    "tab-help": document.getElementById("tab-content-help"),
  };

 function switchTab(activeBtn) {
    if (!activeBtn) return;
    const targetId = activeBtn.id;

    navButtons.forEach((btn) => {
      btn.classList.remove("active");
      btn.setAttribute("aria-selected", "false");
      btn.setAttribute("tabindex", "-1");
    });
    Object.values(tabContents).forEach((content) => {
      if (content) content.classList.remove("active");
    });

    activeBtn.classList.add("active");
    activeBtn.setAttribute("aria-selected", "true");
    activeBtn.setAttribute("tabindex", "0");
    const targetContent = tabContents[targetId];
    if (targetContent) {
      targetContent.classList.add("active");
      
      // TAMBAHAN: Paksa jendela atau area konten kembali ke paling atas saat pindah tab
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Jika area utama konten yang memiliki scroll sendiri, reset juga scrolly-nya:
      const mainContentArea = document.querySelector('.content');
      if (mainContentArea) mainContentArea.scrollTop = 0;
    }
  }
  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn));
    btn.addEventListener("keydown", (event) => {
      let nextIndex = navButtons.indexOf(btn);
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        nextIndex = (nextIndex + 1) % navButtons.length;
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        nextIndex = (nextIndex - 1 + navButtons.length) % navButtons.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = navButtons.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      const nextButton = navButtons[nextIndex];
      switchTab(nextButton);
      nextButton.focus();
    });
  });

  const redirectInput = document.getElementById("redirectUrlInput");
  const redirectInputPanel = document.getElementById("redirectInputPanel");
  const redirectProcessButton = document.getElementById("redirectProcessButton");
  const redirectCopyAllButton = document.getElementById("redirectCopyAllButton");
  const redirectExportButton = document.getElementById("redirectExportButton");
  const redirectTableBody = document.getElementById("redirectTableBody");
  const redirectProgress = document.getElementById("redirectProgress");
  const redirectPreviewFrame = document.getElementById("redirectPreviewFrame");
  const redirectPreviewPlaceholder = document.getElementById("redirectPreviewPlaceholder");
  const redirectActiveUrl = document.getElementById("redirectActiveUrl");
  let redirectLinks = [];
  let activeRedirectPreview = null;

  function normalizeRedirectUrl(rawUrl) {
    const withProtocol = /^[a-z][a-z\d+.-]*:/i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    const parsedUrl = new URL(withProtocol);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      throw new Error("Hanya tautan HTTP atau HTTPS yang didukung.");
    }
    return parsedUrl.href;
  }

  function renderRedirectLinks() {
    if (!redirectTableBody) return;
    redirectTableBody.replaceChildren();
    if (activeRedirectPreview && !redirectLinks.includes(activeRedirectPreview)) {
      activeRedirectPreview = null;
      if (redirectPreviewFrame) {
        redirectPreviewFrame.removeAttribute("src");
        redirectPreviewFrame.hidden = true;
      }
      if (redirectPreviewPlaceholder) redirectPreviewPlaceholder.hidden = false;
      if (redirectActiveUrl) {
        redirectActiveUrl.textContent = "-";
        redirectActiveUrl.title = "-";
      }
    }

    if (redirectLinks.length === 0) {
      const emptyRow = document.createElement("tr");
      const emptyCell = document.createElement("td");
      emptyCell.colSpan = 3;
      emptyCell.className = "redirect-empty";
      emptyCell.textContent = "Belum ada link. Masukkan link lalu pilih Proses Daftar Link.";
      emptyRow.appendChild(emptyCell);
      redirectTableBody.appendChild(emptyRow);
      return;
    }

    redirectLinks.forEach((link, index) => {
      const row = document.createElement("tr");
      row.dataset.redirectIndex = String(index);

      const numberCell = document.createElement("td");
      numberCell.className = "redirect-row-number";
      numberCell.textContent = String(index + 1);

      const urlCell = document.createElement("td");
      urlCell.className = "redirect-url-cell";
      if (link.url && link.domain) {
        const domainStart = link.source.toLowerCase().indexOf(link.domain.toLowerCase());
        if (domainStart >= 0) {
          urlCell.append(
            document.createTextNode(link.source.slice(0, domainStart)),
            createRedirectDomainElement(link.domain, link.source.slice(domainStart, domainStart + link.domain.length)),
            document.createTextNode(link.source.slice(domainStart + link.domain.length))
          );
        } else {
          urlCell.append(
            document.createTextNode(`${link.source} · `),
            createRedirectDomainElement(link.domain, link.domain)
          );
        }
      } else {
        urlCell.textContent = link.source;
      }
      if (link.error) {
        urlCell.title = link.error;
        urlCell.classList.add("redirect-invalid-url");
      }

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
        openLink.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3h7v7"/><path d="M10 14 21 3"/><path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6"/></svg>';
        actionsCell.appendChild(openLink);
      } else {
        const errorMessage = document.createElement("span");
        errorMessage.className = "redirect-error-label";
        errorMessage.textContent = "URL tidak valid";
        actionsCell.appendChild(errorMessage);
      }

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "redirect-delete-button";
      deleteButton.title = "Hapus";
      deleteButton.setAttribute("aria-label", `Hapus baris ${index + 1}`);
      deleteButton.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m19 6-1 14H6L5 6"/><path d="M10 11v5M14 11v5"/></svg>';
      deleteButton.addEventListener("click", () => {
        redirectLinks.splice(index, 1);
        renderRedirectLinks();
      });
      actionsCell.appendChild(deleteButton);

      row.append(numberCell, urlCell, actionsCell);
      if (activeRedirectPreview === link) row.classList.add("redirect-row-active");
      redirectTableBody.appendChild(row);
    });
  }

  function createRedirectDomainElement(domain, displayText) {
    const domainElement = document.createElement("span");
    domainElement.className = "redirect-domain-cell";
    domainElement.setAttribute("role", "button");
    domainElement.setAttribute("tabindex", "0");
    domainElement.setAttribute("aria-label", `Pratinjau halaman ${domain}. Tekan Ctrl+C untuk menyalin domain.`);
    domainElement.dataset.domain = domain;
    domainElement.textContent = displayText;
    return domainElement;
  }

  function processRedirectLinks() {
    if (!redirectInput || !redirectProgress) return;
    const rawUrls = redirectInput.value.split(/\r?\n/).map((url) => url.trim()).filter(Boolean);
    if (rawUrls.length === 0) {
      redirectProgress.textContent = "Masukkan minimal satu link terlebih dahulu.";
      return;
    }

    let invalidCount = 0;
    redirectLinks = rawUrls.map((source) => {
      try {
        const url = normalizeRedirectUrl(source);
        return { source, url, domain: new URL(url).hostname, error: "" };
      } catch (error) {
        invalidCount += 1;
        return {
          source,
          url: "",
          domain: "",
          error: error instanceof Error ? error.message : "URL tidak valid.",
        };
      }
    });
    renderRedirectLinks();
    if (redirectInputPanel instanceof HTMLDetailsElement) redirectInputPanel.open = false;
    redirectProgress.textContent = invalidCount
      ? `${redirectLinks.length} link dimuat; ${invalidCount} link tidak valid.`
      : `Berhasil memuat ${redirectLinks.length} link.`;
  }

  function showRedirectPreview(link, activeRow) {
    if (!link || !link.url || !redirectPreviewFrame || !redirectPreviewPlaceholder || !redirectActiveUrl) return;
    activeRedirectPreview = link;
    redirectTableBody?.querySelectorAll("tr").forEach((row) => row.classList.remove("redirect-row-active"));
    activeRow?.classList.add("redirect-row-active");
    redirectPreviewPlaceholder.hidden = true;
    redirectPreviewFrame.hidden = false;
    redirectPreviewFrame.src = link.url;
    redirectActiveUrl.textContent = link.source;
    redirectActiveUrl.title = link.source;
  }

  function exportRedirectLinks() {
    const validLinks = redirectLinks.filter((link) => link.url);
    if (validLinks.length === 0) {
      if (redirectProgress) redirectProgress.textContent = "Tidak ada link valid untuk diekspor.";
      return;
    }

    const csvEscape = (value) => `"${value.replace(/"/g, '""')}"`;
    const csv = ["URL Asal", ...validLinks.map((link) => csvEscape(link.source))].join("\r\n");
    const blobUrl = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const downloadLink = document.createElement("a");
    downloadLink.href = blobUrl;
    downloadLink.download = "daftar-link.csv";
    downloadLink.click();
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  }

  async function copyAllRedirectLinks() {
    if (!redirectProgress || redirectLinks.length === 0) {
      if (redirectProgress) redirectProgress.textContent = "Belum ada domain untuk disalin.";
      return;
    }

    const textToCopy = redirectLinks.map((link) => link.source).join("\n");
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API tidak tersedia.");
      }
      await navigator.clipboard.writeText(textToCopy);
      redirectProgress.textContent = `Berhasil menyalin ${redirectLinks.length} domain.`;
    } catch (error) {
      const temporaryInput = document.createElement("textarea");
      temporaryInput.value = textToCopy;
      temporaryInput.setAttribute("readonly", "");
      temporaryInput.style.position = "fixed";
      temporaryInput.style.left = "-9999px";
      document.body.appendChild(temporaryInput);
      let copied = false;
      try {
        temporaryInput.select();
        copied = document.execCommand("copy");
      } catch (fallbackError) {
        console.error("Clipboard fallback failed.", fallbackError);
      } finally {
        temporaryInput.remove();
      }

      if (!copied) {
        redirectProgress.textContent = "Gagal menyalin domain. Silakan salin manual dari tabel.";
        console.error("Unable to copy redirect links.", error);
        return;
      }
      redirectProgress.textContent = `Berhasil menyalin ${redirectLinks.length} domain.`;
    }
  }

  redirectCopyAllButton?.addEventListener("click", copyAllRedirectLinks);
  redirectProcessButton?.addEventListener("click", processRedirectLinks);
  redirectExportButton?.addEventListener("click", exportRedirectLinks);

  // ==========================================
  // 2. RULES PENGELOMPOKAN DOMAIN (Tab: Filter Domain)
  // ==========================================
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
    { brand: "MARIATOGEL", keywords: ["mariatogel", "maria"] },
    { brand: "ZIATOGEL", keywords: ["ziatogel", "zia"] },
    { brand: "DANATOTO", keywords: ["danatoto", "dana"] },
    { brand: "PARTAITOGEL", keywords: ["partaitogel", "partai"] },
    { brand: "SITUSTOTO", keywords: ["situstoto", "situs"] },
    { brand: "NANASTOTO", keywords: ["nanastoto", "nanas"] },
  ];

  const domainInputEl = document.getElementById("domainInput");
  const outputEl = document.getElementById("output");

  domainInputEl?.addEventListener("input", () => {
    const rawdomains = domainInputEl.value
      .split(/[\n,\s]+/)
      .map((d) => d.trim().toLowerCase())
      .filter((d) => d.length > 0);

    const grouped = {};
    rules.forEach((r) => (grouped[r.brand] = []));

    rawdomains.forEach((domain) => {
      const domainLower = String(domain).toLowerCase();
      let matchedRule = null;
      let longestKeyword = "";

      for (const rule of rules) {
        for (const kw of rule.keywords || []) {
          const keyword = String(kw).toLowerCase().trim();
          if (
            keyword &&
            domainLower.includes(keyword) &&
            keyword.length > longestKeyword.length
          ) {
            longestKeyword = keyword;
            matchedRule = rule;
          }
        }
      }

      if (matchedRule) {
        grouped[matchedRule.brand].push(domain);
      }
    });

    outputEl.innerHTML = "";
    for (const [brand, domains] of Object.entries(grouped)) {
      if (domains.length > 0) {
        let html = `<div class="brand-group"><div class="brand-header">${brand}</div>`;
        domains.forEach((d) => {
          html += `<div class="domain-item">${d}</div>`;
        });
        html += `</div>`;
        outputEl.innerHTML += html;
      }
    }
  });

  function copyToClipboard(text, buttonElement) {
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        if (buttonElement) {
          const originalText = buttonElement.innerText;
          buttonElement.innerText = "Copied!";
          setTimeout(() => {
            buttonElement.innerText = originalText;
          }, 2000);
        }
      })
      .catch((err) => {
        console.error("Gagal menyalin teks: ", err);
      });
  }

  const btnCopyOutput = document.getElementById("btn-copy-output");
  btnCopyOutput?.addEventListener("click", () => {
    if (!outputEl) return;
    const brandGroups = outputEl.querySelectorAll(".brand-group");
    if (brandGroups.length === 0) return;

    let formattedText = "";
    brandGroups.forEach((group) => {
      const brandHeader = group.querySelector(".brand-header");
      const brandName = brandHeader
        ? (brandHeader.textContent || brandHeader.innerText).trim()
        : "BRAND";
      const domainItems = group.querySelectorAll(".domain-item");
      const domains = Array.from(domainItems).map((item) =>
        (item.textContent || item.innerText).trim(),
      );
      if (brandName && domains.length > 0) {
        formattedText += `[${brandName}]\n`;
        formattedText += domains.join("\n") + "\n\n";
      }
    });

    copyToClipboard(formattedText.trim(), btnCopyOutput);
  });

  // ==========================================
  // 3. PARSER CEK PERGANTIAN DOMAIN
  // ==========================================
  function parseDataByBrand(text) {
    if (!text || typeof text !== "string") return new Map();

    const lines = text.split("\n");
    const brandsMap = new Map();
    let currentBrand = " UMUM";

    brandsMap.set(currentBrand, []);

    const brandAliases = {
      "DDT": "DINGDONGTOGEL"
    };

    for (let rawLine of lines) {
      let line = rawLine.trim();
      if (!line) continue;

      const attachedMatch = line.match(/^([A-Z0-9\s]+?)([a-z0-9\-]+\.[a-z]{2,})$/);
      if (attachedMatch && !line.startsWith("[")) {
        let potentialBrand = attachedMatch[1].trim().toUpperCase();
        const potentialDomain = attachedMatch[2].trim().toLowerCase();
        
        if (potentialBrand && potentialBrand.length <= 15) {
          currentBrand = brandAliases[potentialBrand] || potentialBrand;
          if (!brandsMap.has(currentBrand)) brandsMap.set(currentBrand, []);
          brandsMap.get(currentBrand).push(potentialDomain);
          continue;
        }
      }

      const isBracketBrand = line.startsWith("[") && line.endsWith("]");
      const isNotDomain = !line.includes(".");

      if (isBracketBrand || isNotDomain) {
        let cleanBrandName = line.replace(/[\[\]]/g, "").trim().toUpperCase();
        currentBrand = brandAliases[cleanBrandName] || cleanBrandName;
        if (!brandsMap.has(currentBrand)) brandsMap.set(currentBrand, []);
        continue;
      }

      const cleanDomain = line
        .toLowerCase()
        .replace(/^https?:\/\//i, "")
        .replace(/^www\./i, "")
        .split("/")[0]
        .trim();

      if (cleanDomain && cleanDomain.includes(".")) {
        if (!brandsMap.has(currentBrand)) brandsMap.set(currentBrand, []);
        const list = brandsMap.get(currentBrand);
        if (!list.includes(cleanDomain)) {
          list.push(cleanDomain);
        }
      }
    }

    if (brandsMap.has(" UMUM") && brandsMap.get(" UMUM").length === 0) {
      brandsMap.delete(" UMUM");
    }

    return brandsMap;
  }

  // ==========================================
  // 4. CORE COMPARATOR
  // ==========================================
  function compareData(oldText, newText) {
    const oldMap = parseDataByBrand(oldText);
    const newMap = parseDataByBrand(newText);

    let totalOld = 0;
    let totalNew = 0;
    oldMap.forEach((list) => (totalOld += list.length));
    newMap.forEach((list) => (totalNew += list.length));

    let isValid = true;
    const brandReports = [];

    function getDomainType(domain) {
      const d = domain.toLowerCase();
      if (d.includes("rtp")) return "RTP";
      if (d.includes("-amp") || d.includes("amp")) return "AMP";
      if (d.includes("-blog") || d.includes("blog")) return "BLOG";
      return "NORMAL / ANGKA";
    }

    const allBrands = new Set([...oldMap.keys(), ...newMap.keys()]);

    allBrands.forEach((brand) => {
      if (brand === "UNKNOWN" && oldMap.get(brand)?.length === 0 && newMap.get(brand)?.length === 0) return;

      const oldDomains = oldMap.get(brand) || [];
      const newDomains = newMap.get(brand) || [];

      const countOld = oldDomains.length;
      const countNew = newDomains.length;

      const oldTypes = { AMP: 0, BLOG: 0, RTP: 0, "NORMAL / ANGKA": 0 };
      oldDomains.forEach(d => oldTypes[getDomainType(d)]++);

      const newTypes = { AMP: 0, BLOG: 0, RTP: 0, "NORMAL / ANGKA": 0 };
      newDomains.forEach(d => newTypes[getDomainType(d)]++);

      let brandMatch = (countOld === countNew);
      if (brandMatch) {
        if (oldTypes.AMP !== newTypes.AMP || 
            oldTypes.BLOG !== newTypes.BLOG || 
            oldTypes.RTP !== newTypes.RTP ||
            oldTypes["NORMAL / ANGKA"] !== newTypes["NORMAL / ANGKA"]) {
          brandMatch = false;
        }
      }

      if (!brandMatch) {
        isValid = false;
      }

      brandReports.push({
        brand,
        brandMatch,
        totalOld: countOld,
        totalNew: countNew,
        oldTypes,
        newTypes
      });
    });

    brandReports.sort((a, b) => a.brand.localeCompare(b.brand));

    return { isValid, totalOld, totalNew, brandReports };
  }

  // ==========================================
  // 5. RENDER HASIL
  // ==========================================
  function renderResult(result) {
    const statusDiv = document.getElementById("statusContainer");
    const reportDiv = document.getElementById("reportContainer");
    if (!statusDiv || !reportDiv) return;

    if (!result) {
      statusDiv.replaceChildren();
      reportDiv.innerHTML = '<div style="color: var(--text-secondary); padding: 12px 0;">Silakan masukkan data lama dan data baru, lalu klik CEK PERGANTIAN.</div>';
      return;
    }

    if (result.isValid) {
      statusDiv.innerHTML = '<span class="status-badge valid">✅ SEMUA JENIS & JUMLAH DOMAIN SESUAI</span>';
    } else {
      statusDiv.innerHTML = '<span class="status-badge invalid">❌ ADA JUMLAH ATAU JENIS LINK YANG MELENCENG</span>';
    }

    let html = `
      <div class="total-domain" style="margin-bottom: 16px; font-family: var(--font-mono); display: flex; gap: 24px; padding: 12px 16px; background: var(--bg-tertiary); border-radius: 8px;">
        <span>Total Data Lama : <strong>${result.totalOld}</strong></span>
        <span>Total Pengganti : <strong>${result.totalNew}</strong></span>
      </div>
      <div class="detail-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px;">
    `;

    result.brandReports.forEach((b) => {
      const cardClass = b.brandMatch ? "match" : "mismatch";
      const icon = b.brandMatch ? "✅" : "❌";
      
      const detailColor = b.brandMatch ? "var(--text-secondary)" : "var(--accent-red)";
      const detailWeight = b.brandMatch ? "normal" : "bold";

      html += `
        <div class="brand-report ${cardClass}" style="padding: 12px 16px; border-radius: 8px; background: var(--bg-card); border: 1px solid var(--border-primary);">
          <div style="display: flex; justify-content: space-between; align-items: center; font-family: var(--font-mono); font-size: 13px; margin-bottom: 6px;">
            <span>${icon} <strong>${escapeHtml(b.brand)}</strong></span>
            <span style="color: ${b.brandMatch ? 'var(--accent-teal)' : 'var(--accent-red)'}; font-weight: bold;">
              Total: ${b.totalOld} → ${b.totalNew}
            </span>
          </div>
          <div style="font-size: 11px; color: ${detailColor}; font-weight: ${detailWeight}; font-family: var(--font-mono);">
            AMP: ${b.oldTypes.AMP}→${b.newTypes.AMP} | Blog: ${b.oldTypes.BLOG}→${b.newTypes.BLOG} | RTP: ${b.oldTypes.RTP}→${b.newTypes.RTP} | Normal: ${b.oldTypes["NORMAL / ANGKA"]}→${b.newTypes["NORMAL / ANGKA"]}
          </div>
        </div>
      `;
    });

    html += `</div>`;
    reportDiv.innerHTML = html;
  }

  function performCheck() {
    const oldText = document.getElementById("oldData")?.value || "";
    const newText = document.getElementById("newData")?.value || "";

    if (!oldText.trim() && !newText.trim()) {
      alert("Harap isi kedua kolom data lama dan baru!");
      return;
    }

    const result = compareData(oldText, newText);
    renderResult(result);
  }

  function resetChecker() {
    const oldInput = document.getElementById("oldData");
    const newInput = document.getElementById("newData");
    if (oldInput) oldInput.value = "";
    if (newInput) newInput.value = "";
    renderResult(null);
  }

  document.getElementById("checkBtn")?.addEventListener("click", performCheck);
  document.getElementById("resetBtn")?.addEventListener("click", resetChecker);

  renderResult(null);

  // ==========================================
  // 6. DNS PARSER (Tab: DNS)
  // ==========================================
  const inputData = document.getElementById("inputData");
  const resultTable = document.getElementById("resultTable");
  const rowCount = document.getElementById("rowCount");
  const feedback = document.getElementById("copyFeedback");

  let processedDomains = [];
  let processedNS = [];
  let lastFocusedCell = null;
  let isProcessing = false;
  let renderTimeout = null;

  function processData() {
    if (isProcessing) return;
    isProcessing = true;

    if (renderTimeout) {
      clearTimeout(renderTimeout);
      renderTimeout = null;
    }

    renderTimeout = setTimeout(() => {
      try {
        const text = inputData.value;
        const lines = text
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l !== "");

        let tempDomains = [];
        let tempNS = [];
        let rawPairs = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const lineLower = line.toLowerCase();
          const isNS = lineLower.includes(".ns.") || 
                       lineLower.includes("ns.cloudflare") ||
                       (lineLower.includes("ns") && lineLower.split(".").length > 2);
          const isDomain = !isNS && line.includes(".") && !lineLower.includes("http") && line.split(" ").length === 1;

          if (isDomain) {
            if (tempNS.length > 0 && tempDomains.length > 0) {
              tempDomains.forEach(d => {
                rawPairs.push({ domain: d, ns: tempNS.join(",") });
              });
              tempDomains = [];
              tempNS = [];
            }
            tempDomains.push(line);
          } else if (isNS) {
            tempNS.push(line);
          }
        }

        if (tempDomains.length > 0) {
          const joinedNS = tempNS.length > 0 ? tempNS.join(",") : "";
          tempDomains.forEach(d => {
            rawPairs.push({ domain: d, ns: joinedNS });
          });
        }

        const dnsGroups = {};
        rawPairs.forEach(pair => {
          const key = pair.ns.trim().toLowerCase();
          if (!key) return;
          if (!dnsGroups[key]) {
            dnsGroups[key] = {
              originalNS: pair.ns,
              domains: []
            };
          }
          if (!dnsGroups[key].domains.includes(pair.domain)) {
            dnsGroups[key].domains.push(pair.domain);
          }
        });

        const bulkGroups = [];
        const normalPairs = [];

        Object.keys(dnsGroups).forEach(key => {
          const group = dnsGroups[key];
          if (group.domains.length > 1) {
            bulkGroups.push(group);
          } else {
            normalPairs.push({ domain: group.domains[0], ns: group.originalNS });
          }
        });

        processedDomains = normalPairs.map(p => p.domain);
        processedNS = normalPairs.map(p => p.ns);
        renderTable(); 

        renderDynamicBulkContainers(bulkGroups);

      } catch (error) {
        console.error("Error processing data:", error);
      } finally {
        isProcessing = false;
        renderTimeout = null;
      }
    }, 300);
  }

  function renderDynamicBulkContainers(groups) {
    const container = document.getElementById('bulkResultContainer');
    if (!container) return;

    if (groups.length === 0) {
      container.innerHTML = '<span style="color: var(--text-tertiary); font-style: italic; font-family: var(--font-mono); font-size: 12px;">Belum ada data massal...</span>';
      return;
    }

    let html = '';
    groups.forEach((group, index) => {
      html += `
        <div class="dynamic-bulk-card">
          <div class="dynamic-bulk-header">
            🖥️ NS: ${escapeHtml(group.originalNS)}
          </div>
          <div class="dynamic-bulk-domains">
            ${group.domains.map(d => `<div>${escapeHtml(d)}</div>`).join('')}
          </div>
          <div class="dynamic-bulk-actions">
            <button class="btn-bulk-action btn-bulk-copy-all btn-copy-dynamic-bulk" data-group-index="${index}">
              📋 Copy Domain Saja (${group.domains.length})
            </button>
            <button class="btn-bulk-action btn-bulk-copy-ns btn-copy-ns-only" data-ns="${escapeHtml(group.originalNS)}">
              📋 Copy NS Saja
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.btn-copy-dynamic-bulk').forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        const targetGroup = groups[idx];
        const textToCopy = targetGroup.domains.join('\n');
        
        navigator.clipboard.writeText(textToCopy).then(() => {
          showFeedback(`✅ Berhasil menyalin ${targetGroup.domains.length} domain!`, "#34d399");
        });
      });
    });

    container.querySelectorAll('.btn-copy-ns-only').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nsText = btn.getAttribute('data-ns');
        navigator.clipboard.writeText(nsText).then(() => {
          showFeedback(`✅ NS berhasil disalin!`, "#34d399");
        });
      });
    });
  }

  function renderTable() {
    const count = processedDomains.length;
    rowCount.textContent = count;

    if (count === 0) {
      resultTable.innerHTML = `<tr><td class="empty-msg" colspan="3">Data akan muncul di sini...</td></tr>`;
      lastFocusedCell = null;
      return;
    }

    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < count; i++) {
      const rowNum = i + 1;
      const domain = escapeHtml(processedDomains[i] || "");
      const ns = escapeHtml(processedNS[i] || "");
      
      const tr = document.createElement("tr");
      
      const tdNum = document.createElement("td");
      tdNum.className = "row-number";
      tdNum.textContent = rowNum;
      tr.appendChild(tdNum);
      
      const tdDomain = document.createElement("td");
      tdDomain.className = "domain-cell domain-highlight";
      tdDomain.setAttribute("tabindex", "0");
      tdDomain.setAttribute("role", "gridcell");
      tdDomain.dataset.value = domain;
      tdDomain.dataset.row = i;
      tdDomain.dataset.col = "domain";
      tdDomain.textContent = domain;
      tr.appendChild(tdDomain);
      
      const tdNs = document.createElement("td");
      tdNs.className = "ns-cell ns-highlight";
      tdNs.setAttribute("tabindex", "0");
      tdNs.setAttribute("role", "gridcell");
      tdNs.dataset.value = ns;
      tdNs.dataset.row = i;
      tdNs.dataset.col = "ns";
      tdNs.textContent = ns;
      tr.appendChild(tdNs);
      
      fragment.appendChild(tr);
    }

    resultTable.innerHTML = "";
    resultTable.appendChild(fragment);

    if (lastFocusedCell) {
      const cell = resultTable.querySelector(
        `td[data-row="${lastFocusedCell.row}"][data-col="${lastFocusedCell.col}"]`
      );
      if (cell) {
        setTimeout(() => cell.focus(), 50);
        return;
      }
    }

    const firstCell = resultTable.querySelector("td[tabindex]");
    if (firstCell) setTimeout(() => firstCell.focus(), 50);
  }

  let keyboardHandler = null;

  function attachKeyboardNav() {
    if (keyboardHandler) {
      document.removeEventListener("keydown", keyboardHandler);
      keyboardHandler = null;
    }

    keyboardHandler = function(e) {
      const target = e.target;
      if (!target || target.tagName !== "TD" || !target.hasAttribute("tabindex")) return;
      
      const navigationKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"];
      if (!navigationKeys.includes(e.key)) return;
      
      e.preventDefault();
      
      const row = target.parentElement;
      const tbody = row.parentElement;
      const rows = Array.from(tbody.children);
      const currentRowIndex = rows.indexOf(row);
      
      const cells = Array.from(row.querySelectorAll("td[tabindex]"));
      const currentCellIndex = cells.indexOf(target);
      
      let newRowIndex = currentRowIndex;
      let newCellIndex = currentCellIndex;
      
      switch (e.key) {
        case "Enter":
          if (e.shiftKey) {
            newRowIndex = Math.max(currentRowIndex - 1, 0);
          } else {
            newRowIndex = Math.min(currentRowIndex + 1, rows.length - 1);
          }
          break;
        case "ArrowDown":
          newRowIndex = Math.min(currentRowIndex + 1, rows.length - 1);
          break;
        case "ArrowUp":
          newRowIndex = Math.max(currentRowIndex - 1, 0);
          break;
        case "ArrowRight":
          newCellIndex = Math.min(currentCellIndex + 1, cells.length - 1);
          break;
        case "ArrowLeft":
          newCellIndex = Math.max(currentCellIndex - 1, 0);
          break;
      }
      
      if (newRowIndex !== currentRowIndex || newCellIndex !== currentCellIndex) {
        const newRow = rows[newRowIndex];
        if (newRow) {
          const newCells = newRow.querySelectorAll("td[tabindex]");
          const targetCell = newCells[newCellIndex] || newCells[0];
          if (targetCell) {
            targetCell.focus();
            saveFocusedCell(targetCell);
          }
        }
      }
    };
    
    document.addEventListener("keydown", keyboardHandler);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function saveFocusedCell(cell) {
    if (cell && cell.tagName === "TD") {
      const row = cell.getAttribute("data-row");
      const col = cell.getAttribute("data-col");
      if (row !== null && col !== null) {
        lastFocusedCell = { row: parseInt(row), col: col };
      }
    }
  }

  function showFeedback(msg, bg = "#323232") {
    feedback.textContent = msg;
    feedback.style.background = bg;
    feedback.classList.add("show");
    clearTimeout(feedback._timeout);
    feedback._timeout = setTimeout(() => {
      feedback.classList.remove("show");
    }, 3000);
  }

  function fallbackCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      showFeedback("✅ Disalin (fallback)");
    } catch (e) {
      showFeedback("❌ Gagal menyalin", "#ef4444");
    }
    document.body.removeChild(textarea);
  }

  function copyAllData() {
    if (processedDomains.length === 0) {
      showFeedback("⚠️ Tidak ada data untuk disalin!", "#ef4444");
      return;
    }

    const textToCopy = processedDomains.join("\n");

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        showFeedback(`✅ ${processedDomains.length} domain disalin!`, "#1a73e8");
      })
      .catch(() => {
        fallbackCopy(textToCopy);
      });
  }

  function copyNSOnly() {
    if (processedNS.length === 0) {
      showFeedback("⚠️ Tidak ada data NS untuk disalin!", "#ef4444");
      return;
    }

    const textToCopy = processedNS.join("\n");

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        showFeedback(`✅ ${processedNS.length} baris NS disalin!`, "#8b5cf6");
      })
      .catch(() => {
        fallbackCopy(textToCopy);
      });
  }

  document.getElementById("copyAllBtn")?.addEventListener("click", copyAllData);
  document.getElementById("copyNsBtn")?.addEventListener("click", copyNSOnly);

  document.addEventListener("copy", function (e) {
    const active = document.activeElement;
    const isDnsCell = active && active.tagName === "TD" && active.hasAttribute("tabindex");
    const isServerDomain = active && active.classList.contains("server-domain-cell");
    const isRedirectDomain = active && active.classList.contains("redirect-domain-cell");
    if (isDnsCell || isServerDomain || isRedirectDomain) {
      e.preventDefault();
      const text = isServerDomain || isRedirectDomain ? active.dataset.domain : active.textContent.trim();
      if (text) {
        e.clipboardData.setData("text/plain", text);
        if (isRedirectDomain) {
          if (redirectProgress) redirectProgress.textContent = `Berhasil menyalin domain: ${text}.`;
        } else if (isServerDomain) {
          showServerDomainCopied(active);
        } else {
          showFeedback(`✅ Disalin: "${text}"`, "#10b981");
        }
        if (isDnsCell) setTimeout(() => active.focus(), 50);
      } else {
        showFeedback("⚠️ Sel kosong", "#f59e0b");
      }
    }
  });

  document.addEventListener("click", function (e) {
    const target = e.target;
    const redirectDomain = target instanceof Element ? target.closest(".redirect-domain-cell") : null;
    if (redirectDomain) {
      redirectDomain.focus();
      const activeRow = redirectDomain.closest("tr");
      const linkIndex = Number(activeRow?.dataset.redirectIndex);
      const link = redirectLinks[linkIndex];
      if (link) showRedirectPreview(link, activeRow);
      return;
    }

    const serverDomain = target instanceof Element ? target.closest(".server-domain-cell") : null;
    if (serverDomain) {
      serverDomain.focus();
      return;
    }
    if (target.tagName === "TD" && target.closest(".sheet-table") && target.hasAttribute("tabindex")) {
      target.focus();
      saveFocusedCell(target);
    }
  });

  const serverDomainCopyTimeouts = new WeakMap();

  function showServerDomainCopied(domainItem) {
    domainItem.classList.add("is-copied");
    const copiedIndicator = domainItem.querySelector(".server-domain-copied");
    if (copiedIndicator) copiedIndicator.textContent = "✓ COPIED";

    clearTimeout(serverDomainCopyTimeouts.get(domainItem));
    const timeout = setTimeout(() => {
      domainItem.classList.remove("is-copied");
      if (copiedIndicator) copiedIndicator.textContent = "";
      serverDomainCopyTimeouts.delete(domainItem);
    }, 1000);
    serverDomainCopyTimeouts.set(domainItem, timeout);
  }

  async function copyServerDomain(domainItem) {
    const domain = domainItem.dataset.domain;
    if (!domain) return;

    try {
      await navigator.clipboard.writeText(domain);
      showServerDomainCopied(domainItem);
    } catch (error) {
      console.error("Gagal menyalin domain:", error);
      fallbackCopy(domain);
      showServerDomainCopied(domainItem);
    }
  }

  document.addEventListener("keydown", function (event) {
    const active = document.activeElement;
    if (active instanceof HTMLElement && active.classList.contains("redirect-domain-cell")) {
      const domains = Array.from(document.querySelectorAll("#redirectTableBody .redirect-domain-cell"));
      const currentIndex = domains.indexOf(active);
      if (event.key === "Tab") {
        const nextDomain = domains[currentIndex + (event.shiftKey ? -1 : 1)];
        if (nextDomain) {
          event.preventDefault();
          nextDomain.focus();
        }
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        const activeRow = active.closest("tr");
        const link = redirectLinks[Number(activeRow?.dataset.redirectIndex)];
        if (link) showRedirectPreview(link, activeRow);
      } else if (event.key.toLowerCase() === "c" && event.ctrlKey) {
        event.preventDefault();
        copyRedirectDomain(active);
      }
      return;
    }

    if (!(active instanceof HTMLElement) || !active.classList.contains("server-domain-cell")) return;

    const list = active.parentElement;
    const domains = Array.from(list.querySelectorAll(".server-domain-cell"));
    const currentIndex = domains.indexOf(active);

    if (event.key === "ArrowDown" || (event.key === "Tab" && !event.shiftKey)) {
      const nextDomain = domains[currentIndex + 1];
      if (nextDomain) {
        event.preventDefault();
        nextDomain.focus();
      }
      return;
    }

    if (event.key === "ArrowUp" || (event.key === "Tab" && event.shiftKey)) {
      const previousDomain = domains[currentIndex - 1];
      if (previousDomain) {
        event.preventDefault();
        previousDomain.focus();
      }
      return;
    }

    if (event.key === "Enter" || (event.key.toLowerCase() === "c" && event.ctrlKey)) {
      event.preventDefault();
      copyServerDomain(active);
    }
  });

  async function copyRedirectDomain(domainElement) {
    const domain = domainElement.dataset.domain;
    if (!domain || !redirectProgress) return;

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API tidak tersedia.");
      }
      await navigator.clipboard.writeText(domain);
      redirectProgress.textContent = `Berhasil menyalin domain: ${domain}.`;
    } catch (error) {
      console.error("Gagal menyalin domain URL asal:", error);
      const temporaryInput = document.createElement("textarea");
      temporaryInput.value = domain;
      temporaryInput.setAttribute("readonly", "");
      temporaryInput.style.position = "fixed";
      temporaryInput.style.left = "-9999px";
      document.body.appendChild(temporaryInput);
      let copied = false;
      try {
        temporaryInput.select();
        copied = document.execCommand("copy");
      } catch (fallbackError) {
        console.error("Clipboard fallback gagal menyalin domain URL asal:", fallbackError);
      } finally {
        temporaryInput.remove();
        domainElement.focus();
      }
      redirectProgress.textContent = copied
        ? `Berhasil menyalin domain: ${domain}.`
        : "Gagal menyalin domain. Silakan coba lagi.";
    }
  }

  document.addEventListener("focusin", function (e) {
    const target = e.target;
    if (target.tagName === "TD" && target.hasAttribute("tabindex")) {
      saveFocusedCell(target);
    }
    if (target instanceof Element && target.classList.contains("server-domain-cell")) {
      document.querySelectorAll(".server-domain-cell.is-focused").forEach(item => {
        item.classList.remove("is-focused");
      });
      target.classList.add("is-focused");
    }
  });

  if (inputData) {
    inputData.addEventListener("input", processData);
    processData();
  }

  attachKeyboardNav();

  // ==========================================
  // 7. SERVER & BRAND MAPPING LOGIC (Dimasukkan ke dalam scope utama)
  // ==========================================
  const serverDatabase = [
      {
          name: "SERVER 1",
          ips: ["132.48.200.96", "76.223.90.90"],
          brands: ["WDBOS", "JPSLOT", "BOSJOKO", "ZEUSSLOT", "MANCINGDUIT", "JUTAWANBET", "LATOTO", "TOPANBOS88", "HOKBENTOTO"]
      },
      {
          name: "SERVER 2",
          ips: ["132.48.203.169", "76.223.88.75"],
          brands: ["DEPOBOS", "ANGKABET", "TVTOTO", "PULITOTO", "WATITOTO", "FATCAI99", "RUANGWD", "TOPWD", "PESONA805"]
      },
      {
          name: "SERVER 3",
          ips: ["75.2.67.164", "3.33.129.68"],
          brands: ["BANDAR80", "HOKIJITU", "INDOJP", "JUARA88", "LIGABANDOT", "LAPAK99", "LAPAKMAHJONG", "ARENA303", "WDMAHJONG", "SEJATIWIN", "MARKASWD", "CITAWIN"]
      },
      {
          name: "EXTRA BRANDS",
          ips: [],
          brands: ["GENGTOTO", "FIATOGEL", "DINGDONGTOGEL", "TOGELUP"]
      }
  ];

window.copyServerMapping = function(serverNumber) {
      const domainsContainer = document.getElementById(`server${serverNumber}Domains`);
      const domains = domainsContainer
          ? Array.from(domainsContainer.querySelectorAll(".server-domain-cell"))
              .map(domain => domain.dataset.domain)
              .filter(Boolean)
          : [];

      if (domains.length === 0) {
          showFeedback(`⚠️ Tidak ada data SERVER ${serverNumber} untuk disalin!`, "#ef4444");
          return;
      }

      const textToCopy = domains.join('\n');
      const clipboardWrite = navigator.clipboard
          ? navigator.clipboard.writeText(textToCopy)
          : Promise.reject(new Error("Clipboard API tidak tersedia"));

      clipboardWrite
          .then(() => showFeedback(`✅ ${domains.length} baris SERVER ${serverNumber} disalin!`, "#1a73e8"))
          .catch(() => fallbackCopy(textToCopy));
  };

function renderServerDomainList(containerId, domains, emptyMessage) {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.replaceChildren();
      if (domains.length === 0) {
          const emptyState = document.createElement("div");
          emptyState.className = "server-empty-state";
          emptyState.textContent = emptyMessage;
          container.appendChild(emptyState);
          return;
      }

      domains.forEach(domain => {
          const domainItem = document.createElement("div");
          domainItem.className = "server-domain-cell";
          domainItem.setAttribute("role", "listitem");
          domainItem.setAttribute("tabindex", "0");
          domainItem.dataset.domain = domain;

          const domainText = document.createElement("span");
          domainText.className = "server-domain-text";
          domainText.textContent = domain;

          const copiedIndicator = document.createElement("span");
          copiedIndicator.className = "server-domain-copied";
          copiedIndicator.setAttribute("aria-live", "polite");

          domainItem.append(domainText, copiedIndicator);
          container.appendChild(domainItem);
      });
  }

window.processServerMapping = function() {
      const rawInput = document.getElementById('inputRawData').value;
      const lines = rawInput.split('\n').map(l => l.trim()).filter(l => l.length > 0);

      // Database brand yang sudah dipisah per baris agar lebih mudah dan akurat
      const serverDatabase = [
          {
              name: "SERVER 1",
              brands: ["WDBOS", "JPSLOT", "BOSJOKO", "ZEUSSLOT", "MANCINGDUIT", "JUTAWANBET", "JUTAWAN", "LATOTO", "LA", "TOPANBOS88", "HOKBENTOTO", "HOKBEN"]
          },
          {
              name: "SERVER 2",
              brands: ["DEPOBOS", "ANGKABET", "TVTOTO", "PULITOTO", "PULI", "WATITOTO", "WATI", "FATCAI99", "FATCAI", "RUANGWD", "TOPWD", "PESONA805"]
          },
          {
              name: "SERVER 3",
              brands: ["BANDAR80", "BANDAR", "HOKIJITU", "INDOJP", "JUARA88", "JUARA", "LIGABANDOT", "LAPAK99", "LAPAK", "LAPAKMAHJONG", "ARENA303", "ARENA", "WDMAHJONG", "WDMAH", "SEJATIWIN", "MARKASWD", "CITAWIN"]
          }
      ];

      let server1Domains = [];
      let server2Domains = [];
      let server3Domains = [];
      let idnFallbackResults = [];

      lines.forEach(line => {
          let lowerLine = line.toLowerCase();
          let isDomain = line.includes('.');

          if (isDomain) {
              let targetServer = null;

              for (let srv of serverDatabase) {
                  for (let b of srv.brands) {
                      let keyword = b.toLowerCase();
                      let normalizedDomain = lowerLine.replace(/aa/g, "a").replace(/oo/g, "o").replace(/ee/g, "e");

                      if (normalizedDomain.includes(keyword) || lowerLine.includes(keyword) || normalizedDomain.startsWith(keyword)) {
                          targetServer = srv.name;
                          break;
                      }
                  }
                  if (targetServer) break;
              }

              if (targetServer === "SERVER 1") {
                  if (!server1Domains.includes(line)) server1Domains.push(line);
              } else if (targetServer === "SERVER 2") {
                  if (!server2Domains.includes(line)) server2Domains.push(line);
              } else if (targetServer === "SERVER 3") {
                  if (!server3Domains.includes(line)) server3Domains.push(line);
              } else {
                  idnFallbackResults.push(line);
              }
          }
      });

      const serverDomains = [server1Domains, server2Domains, server3Domains];
      serverDomains.forEach((domains, index) => {
          const serverNumber = index + 1;
          renderServerDomainList(
              `server${serverNumber}Domains`,
              domains,
              "Belum ada domain untuk server ini."
          );
          document.getElementById(`server${serverNumber}Count`).textContent =
              `${String(domains.length).padStart(2, "0")} ${domains.length === 1 ? "DOMAIN" : "DOMAINS"}`;
      });
      renderServerDomainList(
          "outputIdnFallback",
          idnFallbackResults,
          "Belum ada domain IDN."
      );
      document.getElementById("idnDomainCount").textContent =
          `${String(idnFallbackResults.length).padStart(2, "0")} DOMAINS`;
  };
})();