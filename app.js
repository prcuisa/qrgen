/* ============================================================
   QRcraft — logika QR generator (client-side, tanpa server)
   Library: qr-code-styling
   ============================================================ */

(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  let activeType = "url";
  let logoData = null;

  /* ---------- Instance QR ---------- */
  const qr = new QRCodeStyling({
    width: 320,
    height: 320,
    type: "canvas",
    data: "https://",
    margin: 16,
    qrOptions: { errorCorrectionLevel: "Q" },
    dotsOptions: { color: "#12141a", type: "square" },
    backgroundOptions: { color: "#ffffff" },
    cornersSquareOptions: { color: "#12141a", type: "square" },
    cornersDotOptions: { color: "#12141a", type: "square" },
    imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 6, crossOrigin: "anonymous" },
  });
  qr.append($("#qrCanvas"));

  /* ============================================================
     PEMBENTUK DATA per tipe
     ============================================================ */
  const esc = (s) => (s || "").replace(/([\\;,:])/g, "\\$1");
  const val = (id) => (($(id) && $(id).value) || "").trim();

  function fmtICSDate(dtLocal) {
    if (!dtLocal) return "";
    return dtLocal.replace(/[-:]/g, "").replace("T", "T") + "00";
  }

  function buildData() {
    switch (activeType) {
      case "url": {
        let u = val("#url_value");
        if (!u || u === "https://") return "https://";
        return u;
      }
      case "text":
        return val("#text_value") || " ";

      case "email": {
        const to = val("#email_to");
        const sub = encodeURIComponent(val("#email_subject"));
        const body = encodeURIComponent(val("#email_body"));
        let q = [];
        if (sub) q.push("subject=" + sub);
        if (body) q.push("body=" + body);
        return "mailto:" + to + (q.length ? "?" + q.join("&") : "");
      }
      case "phone":
        return "tel:" + val("#phone_value");

      case "sms": {
        const num = val("#sms_number");
        const body = val("#sms_body");
        return "SMSTO:" + num + (body ? ":" + body : "");
      }
      case "whatsapp": {
        const num = val("#wa_number").replace(/[^\d]/g, "");
        const body = encodeURIComponent(val("#wa_body"));
        return "https://wa.me/" + num + (body ? "?text=" + body : "");
      }
      case "wifi": {
        const ssid = esc(val("#wifi_ssid"));
        const pass = esc(val("#wifi_password"));
        const enc = val("#wifi_encryption") || "WPA";
        const hidden = $("#wifi_hidden").checked ? "true" : "false";
        if (enc === "nopass") return `WIFI:T:nopass;S:${ssid};;`;
        return `WIFI:T:${enc};S:${ssid};P:${pass};H:${hidden};;`;
      }
      case "vcard": {
        const first = val("#vc_first"), last = val("#vc_last");
        const lines = [
          "BEGIN:VCARD", "VERSION:3.0",
          `N:${last};${first};;;`,
          `FN:${(first + " " + last).trim()}`,
        ];
        if (val("#vc_org")) lines.push(`ORG:${val("#vc_org")}`);
        if (val("#vc_title")) lines.push(`TITLE:${val("#vc_title")}`);
        if (val("#vc_phone")) lines.push(`TEL;TYPE=CELL:${val("#vc_phone")}`);
        if (val("#vc_email")) lines.push(`EMAIL:${val("#vc_email")}`);
        if (val("#vc_web")) lines.push(`URL:${val("#vc_web")}`);
        if (val("#vc_address")) lines.push(`ADR;TYPE=WORK:;;${val("#vc_address")};;;;`);
        lines.push("END:VCARD");
        return lines.join("\n");
      }
      case "geo": {
        const lat = val("#geo_lat"), lng = val("#geo_lng");
        return `geo:${lat || 0},${lng || 0}`;
      }
      case "event": {
        const lines = [
          "BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT",
          `SUMMARY:${val("#ev_title")}`,
        ];
        if (val("#ev_location")) lines.push(`LOCATION:${val("#ev_location")}`);
        if (val("#ev_desc")) lines.push(`DESCRIPTION:${val("#ev_desc")}`);
        if (val("#ev_start")) lines.push(`DTSTART:${fmtICSDate(val("#ev_start"))}`);
        if (val("#ev_end")) lines.push(`DTEND:${fmtICSDate(val("#ev_end"))}`);
        lines.push("END:VEVENT", "END:VCALENDAR");
        return lines.join("\n");
      }
      default:
        return " ";
    }
  }

  /* ============================================================
     PEMBENTUK OPSI GAYA
     ============================================================ */
  function buildOptions() {
    const size = parseInt($("#qrSize").value, 10);
    const margin = parseInt($("#qrMargin").value, 10);
    const ec = $("#ecLevel").value;
    const dotType = $("#dotType").value;
    const cornerSquareType = $("#cornerSquareType").value;
    const cornerDotType = $("#cornerDotType").value;

    const fillMode = $(".seg-btn.is-active").dataset.fillmode;
    const bgTransparent = $("#bgTransparent").checked;
    const bgColor = bgTransparent ? "rgba(0,0,0,0)" : $("#bgColor").value;

    let dotsOptions = { type: dotType };
    let cornersSquareOptions = { type: cornerSquareType };
    let cornersDotOptions = { type: cornerDotType };

    if (fillMode === "gradient") {
      const gradient = {
        type: $("#gradType").value,
        rotation: 0.7,
        colorStops: [
          { offset: 0, color: $("#gradColor1").value },
          { offset: 1, color: $("#gradColor2").value },
        ],
      };
      dotsOptions.gradient = gradient;
      cornersSquareOptions.gradient = gradient;
      cornersDotOptions.gradient = gradient;
    } else {
      const c = $("#fgColor").value;
      dotsOptions.color = c;
      cornersSquareOptions.color = c;
      cornersDotOptions.color = c;
    }

    const opts = {
      width: size,
      height: size,
      data: buildData(),
      margin: margin,
      qrOptions: { errorCorrectionLevel: ec },
      dotsOptions,
      cornersSquareOptions,
      cornersDotOptions,
      backgroundOptions: { color: bgColor },
      imageOptions: {
        hideBackgroundDots: $("#logoHideDots").checked,
        imageSize: parseInt($("#logoSize").value, 10) / 100,
        margin: 6,
        crossOrigin: "anonymous",
      },
    };
    opts.image = logoData || undefined;
    return opts;
  }

  /* ---------- Update (debounced) ---------- */
  let raf = null;
  function update() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      try {
        qr.update(buildOptions());
      } catch (e) {
        console.error(e);
      }
    });
  }

  /* ============================================================
     EVENT: pemilih tipe
     ============================================================ */
  $$(".type-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      $$(".type-chip").forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      activeType = chip.dataset.type;
      $$(".form").forEach((f) => f.classList.remove("is-active"));
      const target = $(`.form[data-form="${activeType}"]`);
      if (target) target.classList.add("is-active");
      update();
    });
  });

  /* ---------- Semua input form memicu update ---------- */
  $$("#forms input, #forms textarea, #forms select").forEach((el) => {
    el.addEventListener("input", update);
    el.addEventListener("change", update);
  });

  /* ---------- Lokasi GPS ---------- */
  $("#geo_locate").addEventListener("click", () => {
    if (!navigator.geolocation) return toast("Browser tidak mendukung lokasi");
    toast("Meminta izin lokasi...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        $("#geo_lat").value = pos.coords.latitude.toFixed(6);
        $("#geo_lng").value = pos.coords.longitude.toFixed(6);
        update();
        toast("Lokasi terisi");
      },
      () => toast("Gagal mengambil lokasi")
    );
  });

  /* ============================================================
     EVENT: kontrol gaya
     ============================================================ */
  ["#dotType", "#cornerSquareType", "#cornerDotType", "#gradType", "#ecLevel"].forEach((id) =>
    $(id).addEventListener("change", () => { clearPreset(); update(); })
  );

  // sinkron color picker <-> hex
  function syncColor(pickerId, hexId) {
    const picker = $(pickerId), hex = $(hexId);
    picker.addEventListener("input", () => { hex.value = picker.value; clearPreset(); update(); });
    hex.addEventListener("input", () => {
      let v = hex.value.trim();
      if (!v.startsWith("#")) v = "#" + v;
      if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)) { picker.value = v; clearPreset(); update(); }
    });
  }
  syncColor("#fgColor", "#fgColorHex");
  syncColor("#bgColor", "#bgColorHex");
  syncColor("#gradColor1", "#gradColor1Hex");
  syncColor("#gradColor2", "#gradColor2Hex");

  $("#bgTransparent").addEventListener("change", () => {
    $("#bgColor").disabled = $("#bgTransparent").checked;
    update();
  });

  // fill mode solid/gradient
  $$(".seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".seg-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const grad = btn.dataset.fillmode === "gradient";
      $("#fgSolidRow").classList.toggle("hidden", grad);
      $("#fgGradientRow").classList.toggle("hidden", !grad);
      clearPreset();
      update();
    });
  });

  /* ---------- Sliders ---------- */
  $("#qrSize").addEventListener("input", (e) => { $("#sizeVal").textContent = e.target.value + " px"; update(); });
  $("#qrMargin").addEventListener("input", (e) => { $("#marginVal").textContent = e.target.value; update(); });
  $("#logoSize").addEventListener("input", (e) => { $("#logoSizeVal").textContent = e.target.value + "%"; update(); });
  $("#logoHideDots").addEventListener("change", update);

  /* ============================================================
     LOGO
     ============================================================ */
  $("#logoFile").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast("Ukuran logo maksimal 2 MB");
    const reader = new FileReader();
    reader.onload = (ev) => {
      logoData = ev.target.result;
      $("#logoName").textContent = file.name;
      $("#logoRemove").classList.remove("hidden");
      $("#logoOpts").style.display = "flex";
      if ($("#ecLevel").value === "L" || $("#ecLevel").value === "M") $("#ecLevel").value = "H";
      update();
    };
    reader.readAsDataURL(file);
  });
  $("#logoRemove").addEventListener("click", () => {
    logoData = null;
    $("#logoFile").value = "";
    $("#logoName").textContent = "";
    $("#logoRemove").classList.add("hidden");
    $("#logoOpts").style.display = "none";
    update();
  });

  /* ============================================================
     PRESET
     ============================================================ */
  const PRESETS = {
    classic: { dot: "square", cs: "square", cd: "square", mode: "solid", fg: "#12141a", bg: "#ffffff" },
    rounded: { dot: "rounded", cs: "extra-rounded", cd: "dot", mode: "solid", fg: "#12141a", bg: "#ffffff" },
    dots:    { dot: "dots", cs: "dot", cd: "dot", mode: "solid", fg: "#1f2430", bg: "#ffffff" },
    neon:    { dot: "extra-rounded", cs: "extra-rounded", cd: "dot", mode: "gradient", g1: "#5b4bff", g2: "#00d4ff", gt: "linear", bg: "#0b0d12" },
    sunset:  { dot: "classy-rounded", cs: "extra-rounded", cd: "dot", mode: "gradient", g1: "#ff5e62", g2: "#ff9966", gt: "linear", bg: "#ffffff" },
    mono:    { dot: "classy", cs: "square", cd: "square", mode: "solid", fg: "#000000", bg: "#ffffff" },
  };

  $$(".preset").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = PRESETS[btn.dataset.preset];
      if (!p) return;
      $$(".preset").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      $("#dotType").value = p.dot;
      $("#cornerSquareType").value = p.cs;
      $("#cornerDotType").value = p.cd;

      $$(".seg-btn").forEach((b) => b.classList.toggle("is-active", b.dataset.fillmode === p.mode));
      const grad = p.mode === "gradient";
      $("#fgSolidRow").classList.toggle("hidden", grad);
      $("#fgGradientRow").classList.toggle("hidden", !grad);

      if (grad) {
        setColor("#gradColor1", "#gradColor1Hex", p.g1);
        setColor("#gradColor2", "#gradColor2Hex", p.g2);
        $("#gradType").value = p.gt;
      } else {
        setColor("#fgColor", "#fgColorHex", p.fg);
      }
      setColor("#bgColor", "#bgColorHex", p.bg);
      $("#bgTransparent").checked = false;
      $("#bgColor").disabled = false;
      update();
    });
  });

  function setColor(pickerId, hexId, v) { $(pickerId).value = v; $(hexId).value = v; }
  function clearPreset() { $$(".preset").forEach((b) => b.classList.remove("is-active")); }

  /* ============================================================
     UNDUH / SALIN
     ============================================================ */
  function fileName(ext) {
    const base = "qrcode-" + activeType + "-" + Date.now();
    return { name: base, extension: ext };
  }
  $("#dlPng").addEventListener("click", () => { qr.download(fileName("png")); toast("PNG diunduh"); });
  $("#dlSvg").addEventListener("click", () => { qr.download(fileName("svg")); toast("SVG diunduh"); });
  $("#dlJpeg").addEventListener("click", () => { qr.download(fileName("jpeg")); toast("JPEG diunduh"); });
  $("#dlWebp").addEventListener("click", () => { qr.download(fileName("webp")); toast("WebP diunduh"); });

  $("#copyImg").addEventListener("click", async () => {
    try {
      const blob = await qr.getRawData("png");
      if (!navigator.clipboard || !window.ClipboardItem) return toast("Browser tidak mendukung salin gambar");
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast("Gambar disalin ke clipboard");
    } catch (e) {
      console.error(e);
      toast("Gagal menyalin");
    }
  });

  /* ============================================================
     TOAST
     ============================================================ */
  let toastTimer = null;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  /* ---------- Init ---------- */
  update();
})();