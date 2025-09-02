/**
 * @name MicRevive
 * @author evo
 * @version 1.1.1
 * @description Revives your mic and output device with one click.
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
        resetBtn.setAttribute("aria-label", "Reset Mic & Output");

        // --- Remove Discord’s default SVG icon ---
        let svg = resetBtn.querySelector("svg");
        if (svg) svg.remove();

        // --- Make button invisible so only image shows ---
        resetBtn.style.background = "transparent";
        resetBtn.style.border = "none";
        resetBtn.style.boxShadow = "none";
        resetBtn.style.padding = "0";
        resetBtn.style.marginLeft = "10px";
        resetBtn.style.display = "flex";
        resetBtn.style.alignItems = "center";
        resetBtn.style.justifyContent = "center";

        // --- Add custom image ---
        let img = document.createElement("img");
        img.src = "https://files.catbox.moe/t7g5f8.png"; // Change this URL or use base64
        img.style.width = "44px";
        img.style.height = "44px";
        img.style.objectFit = "contain";
        img.style.pointerEvents = "none"; // so clicks still hit the button

        resetBtn.prepend(img);

        resetBtn.onclick = async () => {
            try {
                // --- Input reset ---
                const InputModule = BdApi.Webpack.getModule(
                    (m) =>
                        m &&
                        typeof m === "object" &&
                        ("setInputDevice" in m || "setInputDevice" in (m.__proto__ || {}))
                );

                if (!InputModule || typeof InputModule.setInputDevice !== "function") {
                    BdApi.showToast("❌ Could not find input device module!", { type: "error" });
                    console.log("ResetMic debug: No module with setInputDevice found.", InputModule);
                    return;
                }

                await InputModule.setInputDevice("default");

                // --- Output reset ---
                const AudioModule = BdApi.Webpack.getModule(
                    (m) =>
                        m &&
                        typeof m === "object" &&
                        typeof m.setOutputDevice === "function"
                );

                if (AudioModule) await AudioModule.setOutputDevice("default");

                BdApi.showToast("MIC GOT ITS REBOOT CARD - MADE BY EVO", { type: "success" });

            } catch (err) {
                console.error("ResetMic error:", err);
                BdApi.showToast("❌ Reset failed. Check console for details.", { type: "error" });
            }
        };

        deafenBtn.parentNode.appendChild(resetBtn);
    }

    removeResetButton() {
        let resetBtn = document.querySelector("#resetMicBtn");
        if (resetBtn) resetBtn.remove();
    }
};
