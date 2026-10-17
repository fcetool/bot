export const API_URL = "https://offici5l-fcetool.hf.space/extract";

export const SUPPORTED_TARGETS = [
  "boot.img",
  "init_boot.img",
  "dtbo.img",
  "super_empty.img",
  "vbmeta.img",
  "vendor_boot.img",
  "vendor_kernel_boot.img",
  "preloader.img",
  "recovery.img",
  "logo.img",
  "abl.img",
  "hyp.img",
  "modem.img",
  "tz.img",
  "xbl.img",
  "lk.img",
  "tee.img",
  "md1img.img",
  "preloader_emmc.img",
  "preloader_raw.img",
  "preloader_ufs.img",
  "vbmeta_system.img",
  "vbmeta_vendor.img",
  "system_dlkm.img",
  "vendor_dlkm.img",
  "aop.img",
  "aop_config.img",
  "bluetooth.img",
  "cpucp.img",
  "cpucp_dtb.img",
  "devcfg.img",
  "dsp.img",
  "featenabler.img",
  "imagefv.img",
  "keymaster.img",
  "qupfw.img",
  "shrm.img",
  "uefi.img",
  "uefisecapp.img",
  "xbl_config.img",
  "xbl_ramdump.img",
  "scp.img",
  "spmfw.img",
  "sspm.img",
];

export const SUPPORTED_TARGETS_SET = new Set(SUPPORTED_TARGETS);

/** Most commonly requested targets — shown as quick buttons */
export const POPULAR_TARGETS = [
  "boot.img",
  "init_boot.img",
  "recovery.img",
  "vbmeta.img",
  "vendor_boot.img",
  "dtbo.img",
  "preloader.img",
  "super_empty.img",
];

export function isValidUrl(url) {
  return /^https?:\/\/\S+/i.test(url);
}

export function getTargetsList() {
  return SUPPORTED_TARGETS.join(", ");
}

/** Build inline keyboard rows of 2 buttons each */
export function targetsKeyboard(targets, prefix = "t:") {
  const rows = [];
  for (let i = 0; i < targets.length; i += 2) {
    const row = [{ text: targets[i], callback_data: prefix + targets[i] }];
    if (targets[i + 1]) {
      row.push({ text: targets[i + 1], callback_data: prefix + targets[i + 1] });
    }
    rows.push(row);
  }
  return rows;
}

export function mainMenuKeyboard(botUsername) {
  return {
    inline_keyboard: [
      [{ text: "📦 Extract File", callback_data: "menu:extract" }],
      [
        { text: "📋 Supported Targets", callback_data: "menu:targets" },
        { text: "❓ How to Use", callback_data: "menu:help" },
      ],
      [
        { text: "🌐 Web Interface", url: "https://offici5l.github.io/fcetool" },
        { text: "📂 Source Code", url: "https://github.com/offici5l/fcetool" },
      ],
      [{ text: "📢 Channel", url: "https://t.me/Offici5l_Channel" }],
    ],
  };
}
