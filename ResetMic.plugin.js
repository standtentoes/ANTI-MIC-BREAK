/**
 * @name ResetMic
 * @author evo
 * @version 1.0.5
 * @description Bring your mic back from the dead - evo
 */

module.exports = class ResetMic {
    constructor() {
        this.observer = null;
    }

    start() {
        this.addObserver();
    }

    stop() {
        if (this.observer) this.observer.disconnect();
        this.removeResetButton();
    }

    addObserver() {
        const observer = new MutationObserver(() => ResetMic.addResetButton());
        this.observer = observer;
        observer.observe(document.body, { childList: true, subtree: true });
    }

    static async addResetButton() {
        let deafenBtn = document.querySelector("button[aria-label='Deafen']");
        if (!deafenBtn || document.querySelector("#resetMicBtn")) return;

        let resetBtn = deafenBtn.cloneNode(true);
        resetBtn.id = "resetMicBtn";
        resetBtn.setAttribute("aria-label", "Reset Mic");
        resetBtn.style.backgroundColor = "var(--status-danger)";

        resetBtn.onclick = async () => {
            try {
                // Search for module with setInputDevice
                const DeviceModule = BdApi.Webpack.getModule(
                    (m) =>
                        m &&
                        typeof m === "object" &&
                        ("setInputDevice" in m || "setInputDevice" in (m.__proto__ || {}))
                );

                if (!DeviceModule || typeof DeviceModule.setInputDevice !== "function") {
                    BdApi.showToast("❌ Could not find input device module!", { type: "error" });
                    console.log("ResetMic debug: No module with setInputDevice found.", DeviceModule);
                    return;
                }

                // Call with "default" to reselect the default mic
                await DeviceModule.setInputDevice("default");

                BdApi.showToast("✅ MIC REVIVED - MADE BY EVO", { type: "success" });
            } catch (err) {
                console.error("ResetMic error:", err);
                BdApi.showToast("❌ Mic reset failed. Check console for details.", { type: "error" });
            }
        };

        deafenBtn.parentNode.appendChild(resetBtn);
    }

    removeResetButton() {
        let resetBtn = document.querySelector("#resetMicBtn");
        if (resetBtn) resetBtn.remove();
    }
};
