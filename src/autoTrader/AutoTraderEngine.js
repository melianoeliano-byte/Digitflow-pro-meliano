import React, { useEffect, useImperativeHandle, forwardRef, useState } from "react";
import TradeExecutor from "../trades/TradeExecutor";
import SessionPL from "../session/SessionPL";
import ConfirmLiveModal from "../components/ConfirmLiveModal";

const AutoTraderEngine = forwardRef(function AutoTraderEngine(props, ref) {
  const { ws, scanner, settings } = props;
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState([]);
  const [trades, setTrades] = useState([]);
  const [executor, setExecutor] = useState(null);
  const [liveMode, setLiveMode] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [liveConfirmed, setLiveConfirmed] = useState(false);

  useEffect(() => {
    if (!scanner) return;
    const exec = new TradeExecutor(ws);
    setExecutor(exec);

    const confirmations = {}; // map symbol|digit -> count

    const onSignal = async (signal) => {
      setLog((l) => [{ time: Date.now(), signal }, ...l].slice(0, 500));

      if (!running) return;

      // confirmation logic
      const key = `${signal.symbol}::${signal.digit || signal.type}`;
      confirmations[key] = (confirmations[key] || 0) + 1;

      if (confirmations[key] >= (settings.confirmScans || 3)) {
        confirmations[key] = 0; // reset

        const bulk = settings.bulkContracts || 30;
        const stakeBase = settings.defaultStake || 1;
        const duration = settings.tickDuration || 1;

        for (let b = 0; b < bulk; b++) {
          const tradeRes = await exec.executeTrade({
            symbol: signal.symbol,
            stake: stakeBase,
            duration,
            type: signal.type,
            predictedDigit: signal.digit,
            barrier: signal.digit
          });

          const recorded = {
            ...tradeRes,
            timestamp: Date.now(),
            contract_id: tradeRes && tradeRes.response && tradeRes.response.contract_id ? tradeRes.response.contract_id : (tradeRes && tradeRes.response && tradeRes.response.transaction_id ? tradeRes.response.transaction_id : null),
            pnl: tradeRes.pnl || 0,
            simulated: !tradeRes.live
          };

          setTrades((t) => [recorded, ...t].slice(0, 1000));
          setLog((l) => [{ time: Date.now(), trade: recorded }, ...l].slice(0, 500));
        }
      }
    };

    scanner.onSignal(onSignal);

    return () => {
      // cleanup not strictly necessary here
    };
  }, [scanner, running, settings, liveMode, ws]);

  useEffect(() => {
    if (executor) {
      executor.enableLive(liveMode && liveConfirmed && settings.accountType === "real");
    }
  }, [executor, liveMode, liveConfirmed, settings]);

  // listen for contract updates to update P/L
  useEffect(() => {
    if (!ws) return;

    const onContract = (contract) => {
      // contract: proposal_open_contract payload (contains: contract_id, is_expired, profit, payout, tick_count etc.)
      setTrades((list) => {
        return list.map((tr) => {
          if (!tr.contract_id) return tr;
          // match by contract_id
          if (String(tr.contract_id) === String(contract.contract_id) || String(tr.contract_id) === String(contract.id)) {
            return {
              ...tr,
              pnl: typeof contract.profit !== 'undefined' ? contract.profit : tr.pnl,
              closed: !!contract.is_expired,
              contract_update: contract
            };
          }
          return tr;
        });
      });

      setLog((l) => [{ time: Date.now(), contract_update: contract }, ...l].slice(0, 500));
    };

    const onTransaction = (tx) => {
      // transaction events can include sell/buy confirmations
      setLog((l) => [{ time: Date.now(), transaction: tx }, ...l].slice(0, 500));
    };

    ws.onProposalOpen && ws.onProposalOpen(onContract);
    ws.onTransaction && ws.onTransaction(onTransaction);

    return () => {
      // no handler removal implemented in DerivWS; handlers accumulate for app lifetime
    };
  }, [ws]);

  useImperativeHandle(ref, () => ({
    start: () => {
      setRunning(true);
      scanner && scanner.start && scanner.start(settings.updateInterval || 1000);
    },
    stop: () => {
      setRunning(false);
      scanner && scanner.stop && scanner.stop();
    }
  }));

  const requestEnableLive = () => {
    // open confirmation modal
    setConfirmOpen(true);
  };

  const confirmLive = () => {
    setLiveConfirmed(true);
    setConfirmOpen(false);
    setLiveMode(true);
  };

  const cancelLive = () => {
    setConfirmOpen(false);
    setLiveMode(false);
    setLiveConfirmed(false);
  };

  return (
    <div>
      <h3>Auto Trader</h3>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <button onClick={() => { setRunning(true); scanner && scanner.start && scanner.start(settings.updateInterval || 1000); }} disabled={running}>Start</button>
        <button onClick={() => { setRunning(false); scanner && scanner.stop && scanner.stop(); }} disabled={!running}>Stop</button>

        <label style={{ marginLeft: 12 }}>
          <input type="checkbox" checked={liveMode} onChange={(e) => {
            if (e.target.checked) requestEnableLive(); else { setLiveMode(false); setLiveConfirmed(false); }
          }} /> Enable Live (requires real account & token)
        </label>

        <div style={{ marginLeft: "auto", color: "#f6e05e" }}>
          <strong>Warning:</strong> Live mode may place real trades. Keep tokens out of source control.
        </div>
      </div>

      <ConfirmLiveModal open={confirmOpen} onConfirm={confirmLive} onCancel={cancelLive} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 12 }}>
        <div>
          <h4>Activity Log</h4>
          <div style={{ maxHeight: 420, overflow: "auto", background: "#071024", padding: 8 }}>
            {log.map((entry, i) => (
              <div key={i} style={{ marginBottom: 6, borderBottom: "1px solid #152238", paddingBottom: 6 }}>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>{new Date(entry.time).toLocaleTimeString()}</div>
                <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{JSON.stringify(entry, null, 2)}</pre>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SessionPL trades={trades} />
        </div>
      </div>
    </div>
  );
});

export default AutoTraderEngine;
