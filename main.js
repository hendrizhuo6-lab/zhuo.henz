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
        <span>Baru&nbsp; : <strong>${result.totalNew}</strong></span>
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
