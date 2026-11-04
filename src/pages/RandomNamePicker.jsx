import { useState } from "react";
import {
  Plus,
  Trash2,
  Shuffle,
  Trophy,
  RotateCcw,
  Copy,
  Users,
  Sparkles,
} from "lucide-react";
import "./RandomNamePicker.css";

export default function RandomNamePicker() {
  const [nameInput, setNameInput] = useState("");
  const [names, setNames] = useState(() => {
    try {
      const saved = localStorage.getItem("xylo-random-names");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [winners, setWinners] = useState([]);
  const [winnerCount, setWinnerCount] = useState(1);
  const [isPicking, setIsPicking] = useState(false);

  const saveNames = (updatedNames) => {
    setNames(updatedNames);
    localStorage.setItem("xylo-random-names", JSON.stringify(updatedNames));
  };

  const addNames = () => {
    const newNames = nameInput
      .split(/[\n,]+/)
      .map((name) => name.trim())
      .filter(Boolean);

    if (!newNames.length) return;

    saveNames([...names, ...newNames]);
    setNameInput("");
    setWinners([]);
  };

  const removeName = (index) => {
    const updated = names.filter((_, i) => i !== index);
    saveNames(updated);
    setWinners([]);
  };

  const clearNames = () => {
    if (!window.confirm("Remove all names from the list?")) return;

    saveNames([]);
    setWinners([]);
  };

  const pickWinner = () => {
    if (names.length === 0) {
      alert("Add some names before picking a winner.");
      return;
    }

    const count = Math.min(
      Math.max(1, Number(winnerCount) || 1),
      names.length
    );

    setIsPicking(true);
    setWinners([]);

    setTimeout(() => {
      const shuffled = [...names];

      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      const selected = shuffled.slice(0, count);
      setWinners(selected);
      setIsPicking(false);
    }, 900);
  };

  const resetPicker = () => {
    setWinners([]);
  };

  const copyWinner = async () => {
    if (!winners.length) return;

    try {
      await navigator.clipboard.writeText(winners.join("\n"));
      alert("Winner names copied!");
    } catch {
      alert("Unable to copy. Please copy the names manually.");
    }
  };

  return (
    <div className="random-picker-tool">
      <header className="random-picker-header">
        <div>
          <div className="random-picker-breadcrumb">
            XYLO / CREATE & BUILD
          </div>
          <h1>Random Name Picker</h1>
          <p>
            Add names, spin the selection, and pick random winners fairly for
            games, giveaways, classrooms, and events.
          </p>
        </div>

        <div className="random-picker-header-icon">
          <Shuffle size={28} />
        </div>
      </header>

      <div className="random-picker-layout">
        <section className="random-picker-editor">
          <div className="random-picker-section-heading">
            <div className="random-picker-heading-icon">
              <Users size={19} />
            </div>
            <div>
              <h2>Add participants</h2>
              <p>Enter one name per line or separate names with commas.</p>
            </div>
          </div>

          <textarea
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder={"Roshan\nRahul\nPriya\nAman"}
            rows="6"
          />

          <button
            className="random-picker-primary-btn"
            type="button"
            onClick={addNames}
          >
            <Plus size={17} />
            Add names
          </button>

          <div className="random-picker-list-heading">
            <div>
              <h3>Participants</h3>
              <span>{names.length} names added</span>
            </div>

            {names.length > 0 && (
              <button
                className="random-picker-clear-btn"
                type="button"
                onClick={clearNames}
              >
                Clear all
              </button>
            )}
          </div>

          {names.length > 0 ? (
            <div className="random-picker-name-list">
              {names.map((name, index) => (
                <div className="random-picker-name-item" key={`${name}-${index}`}>
                  <span className="random-picker-name-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="random-picker-name-text">{name}</span>

                  <button
                    type="button"
                    onClick={() => removeName(index)}
                    aria-label={`Remove ${name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="random-picker-empty-list">
              <Users size={28} />
              <p>No participants added yet.</p>
            </div>
          )}
        </section>

        <section className="random-picker-stage">
          <div className="random-picker-stage-top">
            <span>RANDOM SELECTION</span>
            <Sparkles size={19} />
          </div>

          <div className={`random-picker-result ${isPicking ? "picking" : ""}`}>
            {isPicking ? (
              <>
                <div className="random-picker-spinner" />
                <h2>Picking a winner...</h2>
                <p>Good luck everyone!</p>
              </>
            ) : winners.length > 0 ? (
              <>
                <div className="random-picker-trophy">
                  <Trophy size={34} />
                </div>

                <span className="random-picker-winner-label">
                  {winners.length === 1 ? "THE WINNER IS" : "THE WINNERS ARE"}
                </span>

                <div className="random-picker-winner-list">
                  {winners.map((name, index) => (
                    <h2 key={`${name}-${index}`}>{name}</h2>
                  ))}
                </div>

                <p>Congratulations!</p>
              </>
            ) : (
              <>
                <div className="random-picker-placeholder-icon">
                  <Trophy size={35} />
                </div>
                <h2>Who's going to win?</h2>
                <p>Your randomly selected name will appear here.</p>
              </>
            )}
          </div>

          <div className="random-picker-settings">
            <label>
              Number of winners
              <input
                type="number"
                min="1"
                max={Math.max(names.length, 1)}
                value={winnerCount}
                onChange={(e) => setWinnerCount(e.target.value)}
              />
            </label>

            <div className="random-picker-participant-count">
              <span>Available participants</span>
              <strong>{names.length}</strong>
            </div>
          </div>

          <button
            className="random-picker-draw-btn"
            type="button"
            onClick={pickWinner}
            disabled={isPicking || names.length === 0}
          >
            <Shuffle size={18} />
            {isPicking ? "Selecting..." : "Pick random winner"}
          </button>

          {winners.length > 0 && (
            <div className="random-picker-result-actions">
              <button
                className="random-picker-secondary-btn"
                type="button"
                onClick={copyWinner}
              >
                <Copy size={15} />
                Copy result
              </button>

              <button
                className="random-picker-secondary-btn"
                type="button"
                onClick={resetPicker}
              >
                <RotateCcw size={15} />
                Reset result
              </button>
            </div>
          )}

          <div className="random-picker-disclaimer">
            <Sparkles size={14} />
            <span>
              Names are selected randomly in your browser. No data is sent to a
              server.
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}