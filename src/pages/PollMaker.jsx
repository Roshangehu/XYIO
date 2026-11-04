import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Eye,
  Save,
  Check,
  BarChart3,
  Vote,
  RotateCcw,
  Copy,
} from "lucide-react";

import "./PollMaker.css";

const STORAGE_KEY = "xylo-poll-maker";

const initialPoll = {
  title: "What do you think?",
  description: "Choose your preferred option and share your opinion.",
  multipleChoice: false,
  options: [
    { id: 1, text: "Option 1", votes: 0 },
    { id: 2, text: "Option 2", votes: 0 },
  ],
};

function PollMaker() {
  const [poll, setPoll] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialPoll;
    } catch {
      return initialPoll;
    }
  });

  const [mode, setMode] = useState("editor");
  const [selected, setSelected] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [message, setMessage] = useState("All changes saved");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(poll));
  }, [poll]);

  const updatePoll = (field, value) => {
    setPoll((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addOption = () => {
    setPoll((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        {
          id: Date.now() + Math.random(),
          text: `Option ${prev.options.length + 1}`,
          votes: 0,
        },
      ],
    }));
  };

  const updateOption = (id, value) => {
    setPoll((prev) => ({
      ...prev,
      options: prev.options.map((option) =>
        option.id === id ? { ...option, text: value } : option
      ),
    }));
  };

  const deleteOption = (id) => {
    setPoll((prev) => ({
      ...prev,
      options: prev.options.filter((option) => option.id !== id),
    }));
  };

  const savePoll = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(poll));
    setMessage("Poll saved successfully!");

    setTimeout(() => {
      setMessage("All changes saved");
    }, 2000);
  };

  const openVoting = () => {
    if (!poll.title.trim()) {
      alert("Please enter a poll title.");
      return;
    }

    if (poll.options.length < 2) {
      alert("Please add at least two options.");
      return;
    }

    if (poll.options.some((option) => !option.text.trim())) {
      alert("Please fill in all option names.");
      return;
    }

    setSelected([]);
    setHasVoted(false);
    setMode("vote");
  };

  const selectOption = (id) => {
    if (poll.multipleChoice) {
      setSelected((prev) =>
        prev.includes(id)
          ? prev.filter((item) => item !== id)
          : [...prev, id]
      );
    } else {
      setSelected([id]);
    }
  };

  const submitVote = () => {
    if (selected.length === 0) {
      alert("Please select at least one option.");
      return;
    }

    setPoll((prev) => ({
      ...prev,
      options: prev.options.map((option) =>
        selected.includes(option.id)
          ? { ...option, votes: option.votes + 1 }
          : option
      ),
    }));

    setHasVoted(true);
    setMode("results");
  };

  const totalVotes = poll.options.reduce(
    (sum, option) => sum + option.votes,
    0
  );

  const getPercentage = (votes) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const resetVotes = () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset all poll votes?"
    );

    if (!confirmed) return;

    setPoll((prev) => ({
      ...prev,
      options: prev.options.map((option) => ({
        ...option,
        votes: 0,
      })),
    }));

    setSelected([]);
    setHasVoted(false);
    setMode("editor");
  };

  const copyPollTitle = async () => {
    try {
      await navigator.clipboard.writeText(
        `${poll.title}\n${poll.description}\n\n${poll.options
          .map((option) => option.text)
          .join("\n")}`
      );

      alert("Poll copied to clipboard!");
    } catch {
      alert("Unable to copy. Please try again.");
    }
  };

  const downloadResults = () => {
    const rows = [
      ["Poll", poll.title],
      ["Description", poll.description],
      ["Total Votes", totalVotes],
      [],
      ["Option", "Votes", "Percentage"],
      ...poll.options.map((option) => [
        option.text,
        option.votes,
        `${getPercentage(option.votes)}%`,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "xylo-poll-results.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="poll-page">
      <header className="poll-header">
        <a href="/" className="poll-logo">
          XYLO<span>.</span>
        </a>

        <div className="poll-header-actions">
          <span className="poll-save-status">
            <Check size={14} />
            {message}
          </span>

          {mode === "editor" && (
            <>
              <button
                className="poll-secondary-btn"
                onClick={() => setMode("preview")}
              >
                <Eye size={16} />
                Preview
              </button>

              <button className="poll-primary-btn" onClick={savePoll}>
                <Save size={16} />
                Save
              </button>
            </>
          )}

          {mode !== "editor" && (
            <button
              className="poll-secondary-btn"
              onClick={() => setMode("editor")}
            >
              Back to Editor
            </button>
          )}
        </div>
      </header>

      <main className="poll-container">
        <div className="poll-heading">
          <div>
            <div className="poll-breadcrumb">
              XYLO / Create & Build / Poll Maker
            </div>

            <h1>Poll Maker</h1>

            <p>Create polls, collect votes and visualize results.</p>
          </div>

          {mode === "editor" && (
            <button className="poll-start-btn" onClick={openVoting}>
              <Vote size={17} />
              Start Voting
            </button>
          )}
        </div>

        {mode === "editor" && (
          <div className="poll-workspace">
            <section className="poll-editor">
              <div className="poll-title-card">
                <div className="poll-accent"></div>

                <input
                  className="poll-title-input"
                  value={poll.title}
                  onChange={(e) => updatePoll("title", e.target.value)}
                  placeholder="Enter your poll question..."
                />

                <textarea
                  className="poll-description-input"
                  value={poll.description}
                  onChange={(e) =>
                    updatePoll("description", e.target.value)
                  }
                  placeholder="Add a description..."
                />
              </div>

              <div className="poll-options-card">
                <div className="poll-section-heading">
                  <div>
                    <h3>Answer Options</h3>
                    <p>Add the choices people can vote for.</p>
                  </div>

                  <span>{poll.options.length} Options</span>
                </div>

                <div className="poll-option-list">
                  {poll.options.map((option, index) => (
                    <div className="poll-option-row" key={option.id}>
                      <span className="poll-option-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <input
                        value={option.text}
                        onChange={(e) =>
                          updateOption(option.id, e.target.value)
                        }
                        placeholder={`Option ${index + 1}`}
                      />

                      <button
                        onClick={() => deleteOption(option.id)}
                        disabled={poll.options.length <= 2}
                        title="Delete option"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  className="poll-add-option"
                  onClick={addOption}
                >
                  <Plus size={17} />
                  Add Another Option
                </button>
              </div>

              <div className="poll-settings-card">
                <h3>Poll Settings</h3>

                <label className="poll-setting-row">
                  <div>
                    <strong>Allow multiple selections</strong>
                    <p>Let voters select more than one option.</p>
                  </div>

                  <input
                    type="checkbox"
                    checked={poll.multipleChoice}
                    onChange={(e) =>
                      updatePoll("multipleChoice", e.target.checked)
                    }
                  />
                </label>
              </div>

              <div className="poll-editor-actions">
                <button
                  className="poll-secondary-btn"
                  onClick={copyPollTitle}
                >
                  <Copy size={16} />
                  Copy Poll
                </button>

                <button
                  className="poll-primary-btn"
                  onClick={openVoting}
                >
                  <Vote size={16} />
                  Preview Voting
                </button>
              </div>
            </section>

            <aside className="poll-sidebar">
              <div className="poll-sidebar-card">
                <h3>Poll Overview</h3>

                <div className="poll-stat">
                  <span>Total Options</span>
                  <strong>{poll.options.length}</strong>
                </div>

                <div className="poll-stat">
                  <span>Total Votes</span>
                  <strong>{totalVotes}</strong>
                </div>

                <div className="poll-stat">
                  <span>Voting Type</span>
                  <strong>
                    {poll.multipleChoice ? "Multiple" : "Single"}
                  </strong>
                </div>
              </div>

              <div className="poll-sidebar-card">
                <h3>Quick Tips</h3>

                <ul>
                  <li>Keep your poll question clear.</li>
                  <li>Use short and understandable options.</li>
                  <li>Avoid duplicate answer choices.</li>
                  <li>Preview your poll before voting.</li>
                </ul>
              </div>

              <div className="poll-sidebar-card poll-tip-card">
                <BarChart3 size={23} />

                <h3>Visualize Results</h3>

                <p>
                  Your poll results will be displayed with vote counts
                  and percentage bars.
                </p>
              </div>
            </aside>
          </div>
        )}

        {mode === "preview" && (
          <section className="poll-preview-card">
            <div className="poll-preview-accent"></div>

            <h2>{poll.title}</h2>
            <p>{poll.description}</p>

            <div className="poll-preview-type">
              {poll.multipleChoice
                ? "Multiple selection allowed"
                : "Select one option"}
            </div>

            {poll.options.map((option) => (
              <div className="poll-preview-option" key={option.id}>
                <span className="poll-radio"></span>
                {option.text}
              </div>
            ))}

            <button
              className="poll-primary-btn"
              onClick={openVoting}
            >
              <Vote size={16} />
              Start Voting
            </button>
          </section>
        )}

        {mode === "vote" && (
          <section className="poll-vote-card">
            <div className="poll-vote-top">
              <span>LIVE POLL PREVIEW</span>
              <span>
                {poll.multipleChoice ? "Multiple choice" : "Single choice"}
              </span>
            </div>

            <h2>{poll.title}</h2>
            <p>{poll.description}</p>

            <div className="poll-vote-options">
              {poll.options.map((option) => (
                <button
                  key={option.id}
                  className={`poll-vote-option ${
                    selected.includes(option.id) ? "selected" : ""
                  }`}
                  onClick={() => selectOption(option.id)}
                >
                  <span className="poll-vote-indicator">
                    {selected.includes(option.id) && <Check size={14} />}
                  </span>

                  {option.text}
                </button>
              ))}
            </div>

            <div className="poll-vote-footer">
              <span>
                {selected.length} option(s) selected
              </span>

              <button
                className="poll-primary-btn"
                onClick={submitVote}
              >
                Submit Vote
              </button>
            </div>
          </section>
        )}

        {mode === "results" && (
          <section className="poll-results-card">
            <div className="poll-results-icon">
              <BarChart3 size={30} />
            </div>

            <div className="poll-results-heading">
              <div>
                <span>POLL RESULTS</span>
                <h2>{poll.title}</h2>
                <p>{poll.description}</p>
              </div>

              <div className="poll-total-votes">
                <strong>{totalVotes}</strong>
                <span>Total Votes</span>
              </div>
            </div>

            {hasVoted && (
              <div className="poll-success-message">
                <Check size={16} />
                Your vote has been recorded on this device!
              </div>
            )}

            <div className="poll-result-list">
              {poll.options
                .slice()
                .sort((a, b) => b.votes - a.votes)
                .map((option) => (
                  <div className="poll-result-item" key={option.id}>
                    <div className="poll-result-label">
                      <span>{option.text}</span>

                      <strong>
                        {option.votes} votes · {getPercentage(option.votes)}%
                      </strong>
                    </div>

                    <div className="poll-progress-track">
                      <div
                        className="poll-progress-fill"
                        style={{
                          width: `${getPercentage(option.votes)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="poll-result-actions">
              <button
                className="poll-secondary-btn"
                onClick={downloadResults}
              >
                <BarChart3 size={16} />
                Export CSV
              </button>

              <button
                className="poll-secondary-btn"
                onClick={resetVotes}
              >
                <RotateCcw size={16} />
                Reset Votes
              </button>

              <button
                className="poll-primary-btn"
                onClick={() => setMode("editor")}
              >
                Back to Editor
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default PollMaker;