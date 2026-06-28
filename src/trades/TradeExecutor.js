import { loadSettings } from "../settings";

export default class TradeExecutor {
  constructor(ws) {
    this.ws = ws;
    this.settings = loadSettings();
    this.liveEnabled = false;
  }

  enableLive(enable = true) {
    this.liveEnabled = enable;
    if (enable && this.settings.apiToken) {
      try {
        this.ws && this.ws.authorize && this.ws.authorize(this.settings.apiToken)
          .then((resp) => {
            console.log("Authorize response:", resp);
          })
          .catch((err) => {
            console.warn("Authorize failed:", err);
          });
      } catch (e) {
        console.warn("Authorize threw:", e);
      }
    }
  }

  async executeTrade({ symbol, stake = 1, duration = 1, type = "differs", predictedDigit = null, barrier = undefined, currency = "USD" }) {
    const resultMeta = {
      symbol,
      stake,
      duration,
      type,
      predictedDigit,
      timestamp: Date.now(),
      simulated: !this.liveEnabled
    };

    if (!this.liveEnabled) {
      console.log("Dry-run executeTrade", resultMeta);
      return { ...resultMeta, success: true, simulated: true, pnl: 0 };
    }

    const settings = loadSettings();
    if (settings.accountType !== "real") {
      return { ...resultMeta, success: false, error: "Account type is not real" };
    }
    if (!settings.apiToken) {
      return { ...resultMeta, success: false, error: "Missing API token" };
    }
    if (!this.ws || !this.ws.buyContract) {
      return { ...resultMeta, success: false, error: "WebSocket buy not available" };
    }

    try {
      const params = {
        amount: stake,
        basis: "stake",
        contract_type: (() => {
          switch (type) {
            case "differs": return "DIGITDIFF";
            case "matches": return "DIGITMATCH";
            case "even": return "DIGITEVEN";
            case "odd": return "DIGITODD";
            case "over": return "DIGITOVER";
            case "under": return "DIGITUNDER";
            default: return "DIGITDIFF";
          }
        })(),
        currency,
        duration,
        duration_unit: "t",
        symbol,
        barrier
      };

      const resp = await this.ws.buyContract(params);
      const recorded = { ...resultMeta, success: true, live: true, response: resp };
      return recorded;
    } catch (err) {
      console.error("Live buy failed:", err);
      return { ...resultMeta, success: false, error: err.message || err };
    }
  }
}
