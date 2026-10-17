export const API_URL = "https://offici5l-fcetool.hf.space/extract";

export const SUPPORTED_TARGETS = [
  "abl.img",
  "aop.img",
  "aop_config.img",
  "apusys.img",
  "audio_dsp.img",
  "bluetooth.img",
  "boot.img",
  "ccu.img",
  "connsys_bt.img",
  "connsys_gnss.img",
  "connsys_wifi.img",
  "countrycode.img",
  "cpucp.img",
  "cpucp_dtb.img",
  "devcfg.img",
  "dpm.img",
  "dsp.img",
  "dtbo.img",
  "featenabler.img",
  "gpueb.img",
  "gz.img",
  "hyp.img",
  "imagefv.img",
  "init_boot.img",
  "keymaster.img",
  "lk.img",
  "logo.img",
  "mcf_ota.img",
  "mcupm.img",
  "md1img.img",
  "modem.img",
  "mvpu_algo.img",
  "odm_dlkm.img",
  "pi_img.img",
  "preloader.img",
  "preloader_emmc.img",
  "preloader_raw.img",
  "preloader_ufs.img",
  "qupfw.img",
  "recovery.img",
  "scp.img",
  "shrm.img",
  "spmfw.img",
  "sspm.img",
  "super_empty.img",
  "system_dlkm.img",
  "tee.img",
  "tz.img",
  "uefi.img",
  "uefisecapp.img",
  "vbmeta.img",
  "vbmeta_system.img",
  "vbmeta_vendor.img",
  "vcp.img",
  "vendor_boot.img",
  "vendor_dlkm.img",
  "vendor_kernel_boot.img",
  "xbl.img",
  "xbl_config.img",
  "xbl_ramdump.img",
];
export const SUPPORTED_TARGETS_SET = new Set(SUPPORTED_TARGETS);

/** Validate absolute HTTP(S) URLs without relying on URL being available in the bot runtime. */
export function isValidUrl(value) {
  if (typeof value !== "string") return false;
  const input = value.trim();
  if (!input || /\s/.test(input)) return false;

  const match = /^(https?):\/\/([^/?#]+)(?:[/?#][^\s]*)?$/i.exec(input);
  if (!match) return false;

  const authority = match[2];
  if (!authority || authority.includes("@")) return false;

  let hostname;
  let port = "";
  if (authority.startsWith("[")) {
    const close = authority.indexOf("]");
    if (close < 0) return false;
    hostname = authority.slice(1, close);
    const suffix = authority.slice(close + 1);
    if (!/^[0-9a-f:.]+$/i.test(hostname)) return false;
    if (suffix && !/^:\d{1,5}$/.test(suffix)) return false;
    port = suffix ? suffix.slice(1) : "";
  } else {
    const colon = authority.lastIndexOf(":");
    if (colon >= 0) {
      if (authority.indexOf(":") !== colon) return false;
      hostname = authority.slice(0, colon);
      port = authority.slice(colon + 1);
      if (!/^\d{1,5}$/.test(port)) return false;
    } else {
      hostname = authority;
    }
    if (!hostname || hostname.length > 253) return false;
    const labels = hostname.split(".");
    if (labels.some((label) =>
      !label || label.length > 63 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label)
    )) return false;
  }

  return !port || (Number(port) > 0 && Number(port) <= 65535);
}
