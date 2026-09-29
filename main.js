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
    "tab-server": document.getElementById("tab-content-server"), // <-- Ditambahkan di sini
    "tab-about": document.getElementById("tab-content-about"),
    "tab-help": document.getElementById("tab-content-help"),
  };

 function switchTab(activeBtn) {
    if (!activeBtn) return;
    const targetId = activeBtn.id;

    navButtons.forEach((btn) => btn.classList.remove("active"));
    Object.values(tabContents).forEach((content) => {
      if (content) content.classList.remove("active");
    });

    activeBtn.classList.add("active");
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
  });

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
      statusDiv.innerHTML = '<span class="status-badge">⏳ Silakan tekan CEK</span>';
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

    const combined = processedDomains.map((d, i) => `${d}\t${processedNS[i] || ""}`);
    const textToCopy = combined.join("\n");

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        showFeedback(`✅ ${processedDomains.length} baris data disalin!`, "#1a73e8");
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

  function copyActiveCell() {
    const active = document.activeElement;
    if (active && active.tagName === "TD" && active.hasAttribute("tabindex")) {
      const text = active.textContent.trim();
      if (text) {
        navigator.clipboard.writeText(text)
          .then(() => {
            showFeedback(`✅ Disalin: "${text}"`, "#10b981");
            setTimeout(() => active.focus(), 50);
          })
          .catch(() => {
            fallbackCopy(text);
            setTimeout(() => active.focus(), 50);
          });
      } else {
        showFeedback("⚠️ Sel kosong", "#f59e0b");
      }
    } else {
      showFeedback("👆 Klik sel terlebih dahulu", "#f59e0b");
    }
  }

  function clearInput() {
    inputData.value = "";
    processedDomains = [];
    processedNS = [];
    lastFocusedCell = null;
    renderTable();
    inputData.focus();
  }

  document.getElementById("clearInputBtn")?.addEventListener("click", clearInput);
  document.getElementById("processDataBtn")?.addEventListener("click", processData);
  document.getElementById("copyAllBtn")?.addEventListener("click", copyAllData);
  document.getElementById("copyCellBtn")?.addEventListener("click", copyActiveCell);
  document.getElementById("copyNsBtn")?.addEventListener("click", copyNSOnly);

  document.addEventListener("copy", function (e) {
    const active = document.activeElement;
    if (active && active.tagName === "TD" && active.hasAttribute("tabindex")) {
      e.preventDefault();
      const text = active.textContent.trim();
      if (text) {
        e.clipboardData.setData("text/plain", text);
        showFeedback(`✅ Disalin: "${text}"`, "#10b981");
        setTimeout(() => active.focus(), 50);
      } else {
        showFeedback("⚠️ Sel kosong", "#f59e0b");
      }
    }
  });

  document.addEventListener("click", function (e) {
    const target = e.target;
    if (target.tagName === "TD" && target.closest(".sheet-table") && target.hasAttribute("tabindex")) {
      target.focus();
      saveFocusedCell(target);
    }
  });

  document.addEventListener("focusin", function (e) {
    const target = e.target;
    if (target.tagName === "TD" && target.hasAttribute("tabindex")) {
      saveFocusedCell(target);
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

      const tbody = document.getElementById('serverMappingBody');
      const maxRows = Math.max(server1Domains.length, server2Domains.length, server3Domains.length, 1);
      let tableHtml = '';

      for (let i = 0; i < maxRows; i++) {
          let d1 = server1Domains[i] || '';
          let d2 = server2Domains[i] || '';
          let d3 = server3Domains[i] || '';

          tableHtml += `
              <tr>
                  <td style="border: 1px solid var(--border-primary); padding: 8px; color: var(--accent-blue-light);">${d1}</td>
                  <td style="border: 1px solid var(--border-primary); padding: 8px; color: var(--accent-blue-light);">${d2}</td>
                  <td style="border: 1px solid var(--border-primary); padding: 8px; color: var(--accent-blue-light);">${d3}</td>
              </tr>
          `;
      }

      tbody.innerHTML = tableHtml;
      document.getElementById('outputIdnFallback').value = idnFallbackResults.join('\n');
  };
})();