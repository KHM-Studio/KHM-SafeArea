import "@khm-studio/safearea/css";
import "@khm-studio/safearea/auto";
import "./styles.css";

if ("serviceWorker" in navigator) {
  void navigator.serviceWorker.register("./sw.js");
}
