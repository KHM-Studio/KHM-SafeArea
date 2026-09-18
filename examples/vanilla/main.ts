import "@khm/safearea/css";
import "@khm/safearea/auto";
import "./styles.css";

if ("serviceWorker" in navigator) {
  void navigator.serviceWorker.register("./sw.js");
}
