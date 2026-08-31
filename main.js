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
    "tab-about": document.getElementById("tab-content-about"),
    "tab-about2": document.getElementById("tab-content-about2"),
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
    { brand: "TOPWD", keywords: ["topwd"] }, // Hanya topwd, tanpa kata "top"
    { brand: "PESONA805", keywords: ["pesona"] },
    { brand: "Bandar80", keywords: ["bandar", "baandar", "banda", "band"] },
    { brand: "HOKIJITU", keywords: ["hokijitu", "hoki"] },
    { brand: "INDOJP", keywords: ["indojp"] }, // Hanya indojp, tanpa kata "indo"
    { brand: "LIGABANDOT", keywords: ["ligabandot"] },
    { brand: "LAPAK", keywords: ["lapak"] },
    { brand: "WDMAHJONG", keywords: ["wdmahjong"] },
    { brand: "SEJATIWIN", keywords: ["sejatiwin", "sejati"] },
    { brand: "CITAWIN", keywords: ["citawin",] },
    { brand: "MANCINGDUIT", keywords: ["mancingduit", "mancing"] },
    { brand: "ARENA303", keywords: ["arena"] },
    { brand: "MARKASWD", keywords: ["markaswd", "markas"] },
    { brand: "JUARA88", keywords: ["juara88", "juara"] },
    { brand: "LINETOGEL", keywords: ["linetogel", "line"] },
    { brand: "GENGTOTO", keywords: ["gengtoto", "geng"] },
    { brand: "GOLTOGEL", keywords: ["goltogel", "gol"] }, // "gol" dihapus
    { brand: "TOGELUP", keywords: ["togelup", "togel"] },
    { brand: "DINGDONGTOGEL", keywords: ["dingdong"] },
    { brand: "HOMETOGEL", keywords: ["hometogel", "home"] },
    { brand: "UDINTOGEL", keywords: ["udintogel", "udin"] },
    { brand: "JONITOGEL", keywords: ["jonitogel", "joni"] },
    { brand: "INDRATOGEL", keywords: ["indratogel", "indra"] },
    { brand: "FIATOGEL", keywords: ["fiatogel", "fia"] }, // "fia" dihapus
    { brand: "PATIHTOTO", keywords: ["patihtoto", "patih"] },
    { brand: "LUNATOGEL", keywords: ["lunatogel", "luna"] },
    { brand: "PWVIP4D", keywords: ["pwvip", "pwvip4d", "pwvid"] },
    { brand: "TOGELON", keywords: ["togelon"] },
    { brand: "OPPATOTO", keywords: ["oppatoto", "oppa"] },
    { brand: "YOKTOGEL", keywords: ["yoktogel", "yok"] },
    { brand: "YOWESTOGEL", keywords: ["yowestogel", "yowes"] },
    { brand: "PROTOGEL", keywords: ["protogel", "pro"] }, // "pro" dihapus
    { brand: "MARIATOGEL", keywords: ["mariatogel", "maria"] },
    { brand: "ZIATOGEL", keywords: ["ziatogel", "zia"] },
    { brand: "DANATOTO", keywords: ["danatoto", "dana"] },
    { brand: "PARTAITOGEL", keywords: ["partaitogel", "partai"] },
    { brand: "SITUSTOTO", keywords: ["situstoto", "situs"] },
    { brand: "NANASTOTO", keywords: ["nanastoto", "nanas"] }, // "nan" dihapus
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

  // Memisahkan data berdasarkan header brand (baris tanpa titik, atau [BRAND])
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

  // Klasifikasi JENIS (AMP/BLOG/RTP/ART, wajib pakai tanda hubung sesuai aturan)
  // lalu fallback ke KEPALA = angka pertama yang muncul setelah nama domain.
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
  // 5. RENDER HASIL (memakai class CSS panel/status-badge/brand-report)
  // ==========================================
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

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
        <span>Lama&nbsp; : <strong>${result.totalOld}</strong></span>
        <span>Baru&nstrongbsp; : <strong>${result.totalNew}</strong></span>
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
})();

(function () {
        const inputData = document.getElementById("inputData");
        const resultTable = document.getElementById("resultTable");
        const rowCount = document.getElementById("rowCount");
        const feedback = document.getElementById("copyFeedback");

        let processedDomains = [];
        let processedNS = [];
        let lastFocusedCell = null; // Untuk menyimpan cell terakhir yang difokuskan

        // ============================================================
        // 1. PROSES DATA
        // ============================================================
        function processData() {
          const text = inputData.value;
          const lines = text
            .split("\n")
            .map((l) => l.trim())
            .filter((l) => l !== "");

          processedDomains = [];
          processedNS = [];

          let currentDomain = "";
          let currentNS = [];

          lines.forEach((line) => {
            const isNS =
              line.includes(".ns.") ||
              line.includes("ns.cloudflare") ||
              (line.split(".").length > 2 &&
                (line.toLowerCase().includes("ns") ||
                  line.toLowerCase().includes("cloudflare")));

            const isDomain =
              !isNS &&
              (line.endsWith(".com") ||
                line.endsWith(".net") ||
                line.endsWith(".org") ||
                line.endsWith(".id") ||
                line.endsWith(".co.id") ||
                line.endsWith(".xyz") ||
                line.endsWith(".info") ||
                line.endsWith(".biz") ||
                (line.includes(".") && line.split(".").length === 2));

            if (isDomain) {
              if (currentDomain) {
                processedDomains.push(currentDomain);
                processedNS.push(currentNS.join(","));
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
          });

          if (currentDomain) {
            processedDomains.push(currentDomain);
            processedNS.push(currentNS.join(","));
          }

          renderTable();
        }

        // ============================================================
        // 2. RENDER TABEL
        // ============================================================
        function renderTable() {
          const count = processedDomains.length;
          rowCount.textContent = count;

          if (count === 0) {
            resultTable.innerHTML = `<tr><td class="empty-msg" colspan="3">Data akan muncul di sini...</td></tr>`;
            lastFocusedCell = null;
            return;
          }

          let html = "";
          for (let i = 0; i < count; i++) {
            const rowNum = i + 1;
            const domain = escapeHtml(processedDomains[i] || "");
            const ns = escapeHtml(processedNS[i] || "");
            html += `<tr>
                        <td class="row-number">${rowNum}</td>
                        <td class="domain-cell domain-highlight" tabindex="0" role="gridcell" data-value="${domain}" data-row="${i}" data-col="domain">${domain}</td>
                        <td class="ns-cell ns-highlight" tabindex="0" role="gridcell" data-value="${ns}" data-row="${i}" data-col="ns">${ns}</td>
                    </tr>`;
          }
          resultTable.innerHTML = html;

          attachKeyboardNav("resultSheet");

          // Jika ada lastFocusedCell, fokuskan kembali
          if (lastFocusedCell) {
            const cell = document.querySelector(
              `#resultSheet td[data-row="${lastFocusedCell.row}"][data-col="${lastFocusedCell.col}"]`,
            );
            if (cell) {
              setTimeout(() => cell.focus(), 50);
              return;
            }
          }

          // Jika tidak ada, fokus ke cell pertama
          const firstCell = document.querySelector("#resultSheet td[tabindex]");
          if (firstCell) setTimeout(() => firstCell.focus(), 50);
        }



// ============================================================
// 3. KEYBOARD NAVIGASI
// ============================================================
function attachKeyboardNav(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;

  if (table._keydownHandler) {
    table.removeEventListener("keydown", table._keydownHandler);
  }

  const handler = function (e) {
    const target = e.target;
    if (target.tagName !== "TD" || !target.hasAttribute("tabindex")) return;

    const row = target.parentElement;
    const tbody = row.parentElement;
    const rows = Array.from(tbody.querySelectorAll("tr"));
    const currentRowIndex = rows.indexOf(row);

    const cells = Array.from(row.querySelectorAll("td[tabindex]"));
    const currentCellIndex = cells.indexOf(target);

    let newRowIndex = currentRowIndex;
    let newCellIndex = currentCellIndex;

    switch (e.key) {
      case "Enter": // <-- DITAMBAHKAN
      case "ArrowDown":
        e.preventDefault();
        // Shift + Enter untuk naik ke atas (opsional tapi standar Excel/Sheet)
        if (e.key === "Enter" && e.shiftKey) {
          newRowIndex = Math.max(currentRowIndex - 1, 0);
        } else {
          newRowIndex = Math.min(currentRowIndex + 1, rows.length - 1);
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        newRowIndex = Math.max(currentRowIndex - 1, 0);
        break;
      case "ArrowRight":
        e.preventDefault();
        newCellIndex = Math.min(currentCellIndex + 1, cells.length - 1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        newCellIndex = Math.max(currentCellIndex - 1, 0);
        break;
      case "Tab":
        return;
      default:
        return;
    }

    if (
      newRowIndex !== currentRowIndex ||
      newCellIndex !== currentCellIndex
    ) {
      const newRow = rows[newRowIndex];
      if (newRow) {
        const newCells = newRow.querySelectorAll("td[tabindex]");
        const targetCell = newCells[newCellIndex] || newCells[0];
        if (targetCell) {
          targetCell.focus();
          targetCell.scrollIntoView({ block: "nearest" });
          // Simpan posisi cell yang difokuskan
          saveFocusedCell(targetCell);
        }
      }
    }
  };

  table._keydownHandler = handler;
  table.addEventListener("keydown", handler);
}

        // ============================================================
        // 4. FUNGSI COPY - DENGAN MEMPERTAHANKAN FOKUS
        // ============================================================

        /**
         * COPY SEMUA DATA - Tetap di cell aktif
         */
        window.copyAllData = function () {
          if (processedDomains.length === 0) {
            showFeedback("⚠️ Tidak ada data untuk disalin!", "#ef4444");
            return;
          }

          // Simpan cell yang aktif sebelum copy
          const activeCell = document.activeElement;
          const isCellFocused =
            activeCell &&
            activeCell.tagName === "TD" &&
            activeCell.hasAttribute("tabindex");

          let combined = [];
          for (let i = 0; i < processedDomains.length; i++) {
            combined.push(`${processedDomains[i]}\t${processedNS[i] || ""}`);
          }

          const textToCopy = combined.join("\n");

          navigator.clipboard
            .writeText(textToCopy)
            .then(() => {
              showFeedback(
                `✅ ${processedDomains.length} baris data (2 kolom) disalin!`,
                "#1a73e8",
              );
              // Kembalikan fokus ke cell tadi
              if (isCellFocused) {
                setTimeout(() => activeCell.focus(), 50);
              }
            })
            .catch(() => {
              fallbackCopy(textToCopy);
              if (isCellFocused) {
                setTimeout(() => activeCell.focus(), 50);
              }
            });
        };

        /**
         * COPY NS SAJA - Tetap di cell aktif
         */
        window.copyNSOnly = function () {
          if (processedNS.length === 0) {
            showFeedback("⚠️ Tidak ada data NS untuk disalin!", "#ef4444");
            return;
          }

          const activeCell = document.activeElement;
          const isCellFocused =
            activeCell &&
            activeCell.tagName === "TD" &&
            activeCell.hasAttribute("tabindex");

          const textToCopy = processedNS.join("\n");

          navigator.clipboard
            .writeText(textToCopy)
            .then(() => {
              showFeedback(
                `✅ ${processedNS.length} baris NS disalin!`,
                "#8b5cf6",
              );
              if (isCellFocused) {
                setTimeout(() => activeCell.focus(), 50);
              }
            })
            .catch(() => {
              fallbackCopy(textToCopy);
              if (isCellFocused) {
                setTimeout(() => activeCell.focus(), 50);
              }
            });
        };

        /**
         * COPY SEL AKTIF - Tetap di cell yang sama
         */
        window.copyActiveCell = function () {
          const active = document.activeElement;
          if (
            active &&
            active.tagName === "TD" &&
            active.hasAttribute("tabindex")
          ) {
            const text = active.textContent.trim();
            if (text) {
              navigator.clipboard
                .writeText(text)
                .then(() => {
                  showFeedback(`✅ Disalin: "${text}"`, "#10b981");
                  // Fokus tetap di cell yang sama (sudah aktif)
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

        /**
         * FALLBACK COPY
         */
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

        // ============================================================
        // 5. FUNGSI UTILITY UNTUK FOKUS
        // ============================================================

        function saveFocusedCell(cell) {
          if (cell && cell.tagName === "TD") {
            const row = cell.getAttribute("data-row");
            const col = cell.getAttribute("data-col");
            if (row !== null && col !== null) {
              lastFocusedCell = { row: parseInt(row), col: col };
            }
          }
        }

        // ============================================================
        // 6. EVENT Ctrl+C - COPY SEL AKTIF & TETAP FOKUS
        // ============================================================
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

document.addEventListener("keydown", function (e) {
  if ((e.ctrlKey || e.metaKey) && e.key === "c") {
    const active = document.activeElement;
    if (active && active.tagName === "TD" && active.hasAttribute("tabindex")) {
      e.preventDefault();
      const text = active.textContent.trim();
      if (text) {
        navigator.clipboard.writeText(text).then(() => {
          showFeedback(`✅ Disalin: "${text}"`, "#10b981");
          setTimeout(() => active.focus(), 50);
        }).catch(() => {
          fallbackCopy(text);
          setTimeout(() => active.focus(), 50);
        });
      } else {
        showFeedback("⚠️ Sel kosong", "#f59e0b");
      }
      return; // ✅ STOP PROPAGASI
    }
    // ✅ Jika bukan TD, biarkan default (copy normal)
  }
});

        // ============================================================
        // 7. EVENT LAINNYA
        // ============================================================

        // Simpan fokus saat klik pada cell
        document.addEventListener("click", function (e) {
          if (e.target.tagName === "TD" && e.target.closest(".sheet-table")) {
            if (e.target.hasAttribute("tabindex")) {
              e.target.focus();
              saveFocusedCell(e.target);
            }
          }
        });

        // Simpan fokus saat navigasi keyboard
        document.addEventListener("focusin", function (e) {
          if (e.target.tagName === "TD" && e.target.hasAttribute("tabindex")) {
            saveFocusedCell(e.target);
          }
        });

        // ============================================================
        // 8. UTILITY
        // ============================================================

        function escapeHtml(text) {
          return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
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

        window.clearInput = function () {
          inputData.value = "";
          processedDomains = [];
          processedNS = [];
          lastFocusedCell = null;
          renderTable();
          inputData.focus();
        };

        // ============================================================
        // 9. INIT
        // ============================================================

        inputData.addEventListener("input", processData);

        processData();
        window.processData = processData;
      })();
