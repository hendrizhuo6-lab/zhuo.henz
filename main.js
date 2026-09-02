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
  // 1. LOGIKA NAVIGASI TAB (satu-satunya sumber kebenaran)
  // ==========================================
  const navButtons = Array.from(document.querySelectorAll(".navbar-button"));
  const tabContents = {
    "tab-home": document.getElementById("tab-content-home"),
    "tab-profile": document.getElementById("tab-content-profile"),
    "tab-dns": document.getElementById("tab-content-dns"),
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
    if (targetContent) targetContent.classList.add("active");
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
  // 3. PARSER & CLASSIFIER (Tab: Cek Pergantian Domain)
  // ==========================================

  function parseDataByBrand(text) {
    if (!text || typeof text !== "string") return new Map();

    const lines = text.split("\n");
    const brandsMap = new Map();
    let currentBrand = "UNKNOWN";

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      const isBracketBrand = line.startsWith("[") && line.endsWith("]");
      const isNotDomain = !line.includes(".");

      if (isBracketBrand || isNotDomain) {
        currentBrand = line
          .replace(/[\[\]]/g, "")
          .trim()
          .toUpperCase();
        if (!brandsMap.has(currentBrand)) brandsMap.set(currentBrand, []);
        continue;
      }

      const cleanDomain = line
        .toLowerCase()
        .replace(/^https?:\/\//i, "")
        .replace(/^www\./i, "")
        .split("/")[0]
        .trim();

      if (cleanDomain) {
        if (!brandsMap.has(currentBrand)) brandsMap.set(currentBrand, []);
        brandsMap.get(currentBrand).push(cleanDomain);
      }
    }

    return brandsMap;
  }

  function classifyDomain(domain) {
    const d = domain.toLowerCase();

    if (d.includes("-amp")) return "AMP";
    if (d.includes("-blog")) return "BLOG";
    if (d.includes("-rtp")) return "RTP";
    if (d.includes("-art")) return "ART";

    const nameOnly = d.split(".")[0];
    const digitMatch = nameOnly.match(/\d/);

    if (digitMatch) return `Kepala ${digitMatch[0]}`;
    return "NORMAL (Tanpa Angka)";
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
    const globalErrors = [];
    const brandReports = [];

    if (totalOld !== totalNew) {
      isValid = false;
      globalErrors.push(
        `Total domain tidak sama! (Lama: ${totalOld}, Baru: ${totalNew})`,
      );
    }

    const allBrands = new Set([...oldMap.keys(), ...newMap.keys()]);

    allBrands.forEach((brand) => {
      const oldDomains = oldMap.get(brand) || [];
      const newDomains = newMap.get(brand) || [];

      const oldCounts = {};
      oldDomains.forEach((dom) => {
        const cat = classifyDomain(dom);
        oldCounts[cat] = (oldCounts[cat] || 0) + 1;
      });

      const newCounts = {};
      newDomains.forEach((dom) => {
        const cat = classifyDomain(dom);
        newCounts[cat] = (newCounts[cat] || 0) + 1;
      });

      const categories = new Set([
        ...Object.keys(oldCounts),
        ...Object.keys(newCounts),
      ]);
      const catDetails = [];
      let brandMatch = true;

      categories.forEach((cat) => {
        const oldCount = oldCounts[cat] || 0;
        const newCount = newCounts[cat] || 0;
        const match = oldCount === newCount;
        if (!match) {
          brandMatch = false;
          isValid = false;
        }
        catDetails.push({ category: cat, oldCount, newCount, match });
      });

      brandReports.push({
        brand,
        brandMatch,
        totalOld: oldDomains.length,
        totalNew: newDomains.length,
        categories: catDetails,
      });
    });

    return { isValid, totalOld, totalNew, globalErrors, brandReports };
  }

  // ==========================================
  // 5. RENDER HASIL
  // ==========================================
  function renderResult(result) {
    const statusDiv = document.getElementById("statusContainer");
    const reportDiv = document.getElementById("reportContainer");
    if (!statusDiv || !reportDiv) return;

    if (!result) {
      statusDiv.innerHTML =
        '<span class="status-badge">⏳ Silakan tekan CEK</span>';
      reportDiv.innerHTML =
        '<div style="color: var(--text-faint); padding: 12px 0;">Hasil perbandingan akan muncul di sini.</div>';
      return;
    }

    statusDiv.innerHTML = result.isValid
      ? '<span class="status-badge valid">✅ DATA BENAR</span>'
      : '<span class="status-badge invalid">❌ DATA TIDAK SESUAI</span>';

    let html = `
      <div class="total-domain">
        <span>Lama : <strong>${result.totalOld}</strong></span>
        <span>Baru : <strong>${result.totalNew}</strong></span>
      </div>
    `;

    if (result.globalErrors.length > 0) {
      html += `<div class="error-detail">${result.globalErrors
        .map(escapeHtml)
        .join("<br>")}</div>`;
    }

    html += '<div class="detail-grid">';
    result.brandReports.forEach((b) => {
      const cardClass = b.brandMatch ? "match" : "mismatch";
      html += `
        <div class="brand-report ${cardClass}">
          <div class="brand-title">
            <span>${b.brandMatch ? "✅" : "❌"} ${escapeHtml(b.brand)}</span>
            <span class="brand-count">${b.totalOld} → ${b.totalNew}</span>
          </div>
      `;
      b.categories.forEach((c) => {
        const badgeClass = c.match ? "ok" : "fail";
        const icon = c.match ? "✅" : "❌";
        html += `
          <div class="stat-line">
            <span class="label">${escapeHtml(c.category)}</span>
            <span class="badge ${badgeClass}">${c.oldCount} → ${c.newCount} ${icon}</span>
          </div>
        `;
      });
      html += `</div>`;
    });
    html += "</div>";

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
// 6. DNS PARSER (Tab: DNS) - OPTIMIZED
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

// ==========================================
// 6a. PROCESS DATA (Debounced)
// ==========================================
function processData() {
  if (isProcessing) return;
  isProcessing = true;

  // Clear previous timeout
  if (renderTimeout) {
    clearTimeout(renderTimeout);
    renderTimeout = null;
  }

  // Debounce: wait 300ms after last input before processing
  renderTimeout = setTimeout(() => {
    try {
      const text = inputData.value;
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l !== "");

      const newDomains = [];
      const newNS = [];
      let currentDomain = "";
      let currentNS = [];

      // Single pass parsing
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        const isNS = line.includes(".ns.") || 
                     line.includes("ns.cloudflare") ||
                     (line.split(".").length > 2 && 
                      (line.toLowerCase().includes("ns") || 
                       line.toLowerCase().includes("cloudflare")));

        const isDomain = !isNS && 
                        (line.endsWith(".com") || line.endsWith(".net") || 
                         line.endsWith(".org") || line.endsWith(".id") || 
                         line.endsWith(".co.id") || line.endsWith(".xyz") || 
                         line.endsWith(".info") || line.endsWith(".biz") ||
                         (line.includes(".") && line.split(".").length === 2));

        if (isDomain) {
          if (currentDomain) {
            newDomains.push(currentDomain);
            newNS.push(currentNS.join(","));
          }
          currentDomain = line;
          currentNS = [];
        } else if (isNS && currentDomain !== "") {
          currentNS.push(line);
        } else if (!isDomain && !isNS && currentDomain !== "") {
          if (line !== currentDomain) {
            currentNS.push(line);
          }
        }
      }

      if (currentDomain) {
        newDomains.push(currentDomain);
        newNS.push(currentNS.join(","));
      }

      // Only update if data actually changed
      const domainsChanged = JSON.stringify(processedDomains) !== JSON.stringify(newDomains);
      const nsChanged = JSON.stringify(processedNS) !== JSON.stringify(newNS);

      if (domainsChanged || nsChanged) {
        processedDomains = newDomains;
        processedNS = newNS;
        renderTable();
      }
    } catch (error) {
      console.error("Error processing data:", error);
    } finally {
      isProcessing = false;
      renderTimeout = null;
    }
  }, 300);
}

// ==========================================
// 6b. RENDER TABLE (Optimized with Document Fragment)
// ==========================================
function renderTable() {
  const count = processedDomains.length;
  rowCount.textContent = count;

  if (count === 0) {
    resultTable.innerHTML = `<tr><td class="empty-msg" colspan="3">Data akan muncul di sini...</td></tr>`;
    lastFocusedCell = null;
    return;
  }

  // Use DocumentFragment for batch DOM updates
  const fragment = document.createDocumentFragment();
  
  for (let i = 0; i < count; i++) {
    const rowNum = i + 1;
    const domain = escapeHtml(processedDomains[i] || "");
    const ns = escapeHtml(processedNS[i] || "");
    
    const tr = document.createElement("tr");
    
    // Row number cell
    const tdNum = document.createElement("td");
    tdNum.className = "row-number";
    tdNum.textContent = rowNum;
    tr.appendChild(tdNum);
    
    // Domain cell
    const tdDomain = document.createElement("td");
    tdDomain.className = "domain-cell domain-highlight";
    tdDomain.setAttribute("tabindex", "0");
    tdDomain.setAttribute("role", "gridcell");
    tdDomain.dataset.value = domain;
    tdDomain.dataset.row = i;
    tdDomain.dataset.col = "domain";
    tdDomain.textContent = domain;
    tr.appendChild(tdDomain);
    
    // NS cell
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

  // Batch update DOM
  resultTable.innerHTML = "";
  resultTable.appendChild(fragment);

  // Restore focus if possible
  if (lastFocusedCell) {
    const cell = resultTable.querySelector(
      `td[data-row="${lastFocusedCell.row}"][data-col="${lastFocusedCell.col}"]`
    );
    if (cell) {
      setTimeout(() => cell.focus(), 50);
      return;
    }
  }

  // Focus first cell
  const firstCell = resultTable.querySelector("td[tabindex]");
  if (firstCell) setTimeout(() => firstCell.focus(), 50);
}

// ==========================================
// 6c. KEYBOARD NAVIGATION (Optimized)
// ==========================================
let keyboardHandler = null;

function attachKeyboardNav() {
  // Remove old handler if exists
  if (keyboardHandler) {
    document.removeEventListener("keydown", keyboardHandler);
    keyboardHandler = null;
  }

  keyboardHandler = function(e) {
    const target = e.target;
    if (!target || target.tagName !== "TD" || !target.hasAttribute("tabindex")) return;
    
    // Only handle arrow keys and Enter
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
        // Enter moves to next row, same column
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

// ==========================================
// 6d. HELPER FUNCTIONS
// ==========================================
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

// ==========================================
// 6e. COPY FUNCTIONS
// ==========================================
window.copyAllData = function () {
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
};

window.copyNSOnly = function () {
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
};

window.copyActiveCell = function () {
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
};

window.clearInput = function () {
  inputData.value = "";
  processedDomains = [];
  processedNS = [];
  lastFocusedCell = null;
  renderTable();
  inputData.focus();
};

// ==========================================
// 6f. EVENT LISTENERS (Optimized)
// ==========================================

// Single event listener for clipboard copy
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

// Save focus on click
document.addEventListener("click", function (e) {
  const target = e.target;
  if (target.tagName === "TD" && target.closest(".sheet-table") && target.hasAttribute("tabindex")) {
    target.focus();
    saveFocusedCell(target);
  }
});

// Save focus on focusin
document.addEventListener("focusin", function (e) {
  const target = e.target;
  if (target.tagName === "TD" && target.hasAttribute("tabindex")) {
    saveFocusedCell(target);
  }
});

// ==========================================
// 6g. INIT
// ==========================================
if (inputData) {
  // Use input event with debouncing (handled in processData)
  inputData.addEventListener("input", processData);
  // Initial process
  processData();
}

// Attach keyboard navigation
attachKeyboardNav();

// Expose processData globally
window.processData = processData;
})();
