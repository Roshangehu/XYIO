import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Eye,
  Save,
  X,
  ChevronDown,
  FileText,
  Check,
  Star,
} from "lucide-react";

import "./SurveyMaker.css";

const STORAGE_KEY = "xylo-survey-maker";

const questionTypes = [
  { value: "multiple", label: "Multiple Choice" },
  { value: "checkbox", label: "Checkboxes" },
  { value: "short", label: "Short Answer" },
  { value: "rating", label: "Rating Scale" },
];

const createQuestion = () => ({
  id: Date.now() + Math.random(),
  type: "multiple",
  title: "",
  required: false,
  options: ["Option 1", "Option 2"],
});

function SurveyMaker() {
  const [survey, setSurvey] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved
        ? JSON.parse(saved)
        : {
            title: "Untitled Survey",
            description: "Add a short description for your survey.",
            questions: [],
          };
    } catch {
      return {
        title: "Untitled Survey",
        description: "",
        questions: [],
      };
    }
  });

  const [preview, setPreview] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [responses, setResponses] = useState({});
  const [saveMessage, setSaveMessage] = useState("All changes saved");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(survey));
  }, [survey]);

  const updateSurvey = (field, value) => {
    setSurvey((prev) => ({ ...prev, [field]: value }));
  };

  const addQuestion = () => {
    const question = createQuestion();

    setSurvey((prev) => ({
      ...prev,
      questions: [...prev.questions, question],
    }));

    setActiveQuestion(question.id);
  };

  const updateQuestion = (id, field, value) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === id ? { ...q, [field]: value } : q
      ),
    }));
  };

  const deleteQuestion = (id) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }));

    setActiveQuestion(null);
  };

  const addOption = (id) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === id
          ? {
              ...q,
              options: [...q.options, `Option ${q.options.length + 1}`],
            }
          : q
      ),
    }));
  };

  const updateOption = (id, index, value) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === id
          ? {
              ...q,
              options: q.options.map((option, i) =>
                i === index ? value : option
              ),
            }
          : q
      ),
    }));
  };

  const deleteOption = (id, index) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === id
          ? {
              ...q,
              options: q.options.filter((_, i) => i !== index),
            }
          : q
      ),
    }));
  };

  const handleResponse = (id, value, checked = false) => {
    setResponses((prev) => {
      if (checked) {
        const current = prev[id] || [];
        return {
          ...prev,
          [id]: current.includes(value)
            ? current.filter((item) => item !== value)
            : [...current, value],
        };
      }

      return { ...prev, [id]: value };
    });
  };

  const printSurvey = () => {
    window.print();
  };

  const saveSurvey = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(survey));
    setSaveMessage("Saved successfully!");
    setTimeout(() => setSaveMessage("All changes saved"), 2000);
  };

  return (
    <div className="survey-page">
      <header className="survey-header">
        <a href="/" className="survey-logo">
          XYLO<span>.</span>
        </a>

        <div className="survey-header-right">
          <span className="survey-save-status">
            <Check size={15} /> {saveMessage}
          </span>

          <button className="survey-preview-btn" onClick={() => setPreview(!preview)}>
            <Eye size={17} />
            {preview ? "Back to Editor" : "Preview"}
          </button>

          <button className="survey-save-btn" onClick={saveSurvey}>
            <Save size={17} />
            Save
          </button>
        </div>
      </header>

      <main className="survey-container">
        <div className="survey-heading">
          <div>
            <div className="survey-breadcrumb">
              XYLO / Create & Build / Survey Maker
            </div>

            <h1>Survey Maker</h1>

            <p>
              Create beautiful surveys and collect meaningful feedback.
            </p>
          </div>

          {preview && (
            <button className="survey-print-btn" onClick={printSurvey}>
              <FileText size={17} /> Download PDF
            </button>
          )}
        </div>

        {preview ? (
          <section className="survey-preview">
            <div className="survey-preview-top"></div>

            <div className="survey-preview-content">
              <h2>{survey.title || "Untitled Survey"}</h2>
              <p className="survey-description">
                {survey.description}
              </p>

              {survey.questions.length === 0 && (
                <p className="survey-empty">
                  This survey doesn't have any questions yet.
                </p>
              )}

              {survey.questions.map((q, index) => (
                <div className="survey-preview-question" key={q.id}>
                  <h3>
                    {index + 1}. {q.title || "Untitled Question"}
                    {q.required && <span className="required-mark"> *</span>}
                  </h3>

                  {q.type === "multiple" &&
                    q.options.map((option, i) => (
                      <label className="survey-answer" key={i}>
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          onChange={() => handleResponse(q.id, option)}
                        />
                        {option}
                      </label>
                    ))}

                  {q.type === "checkbox" &&
                    q.options.map((option, i) => (
                      <label className="survey-answer" key={i}>
                        <input
                          type="checkbox"
                          onChange={(e) =>
                            handleResponse(q.id, option, e.target.checked)
                          }
                        />
                        {option}
                      </label>
                    ))}

                  {q.type === "short" && (
                    <input
                      className="survey-text-answer"
                      type="text"
                      placeholder="Your answer..."
                      onChange={(e) => handleResponse(q.id, e.target.value)}
                    />
                  )}

                  {q.type === "rating" && (
                    <div className="survey-rating">
                      {[1, 2, 3, 4, 5].map((number) => (
                        <button
                          key={number}
                          className={
                            Number(responses[q.id]) >= number
                              ? "rating-active"
                              : ""
                          }
                          onClick={() => handleResponse(q.id, number)}
                        >
                          <Star size={20} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {survey.questions.length > 0 && (
                <button
                  className="survey-submit-btn"
                  onClick={() => {
                    const missing = survey.questions.some(
                      (q) =>
                        q.required &&
                        (responses[q.id] === undefined ||
                          responses[q.id] === "" ||
                          responses[q.id]?.length === 0)
                    );

                    alert(
                      missing
                        ? "Please answer all required questions."
                        : "Preview completed! Response collection will be added in a future version."
                    );
                  }}
                >
                  Submit Survey
                </button>
              )}
            </div>
          </section>
        ) : (
          <div className="survey-workspace">
            <section className="survey-editor">
              <div className="survey-title-card">
                <div className="survey-title-accent"></div>

                <input
                  className="survey-title-input"
                  value={survey.title}
                  onChange={(e) => updateSurvey("title", e.target.value)}
                  placeholder="Untitled Survey"
                />

                <textarea
                  className="survey-description-input"
                  value={survey.description}
                  onChange={(e) =>
                    updateSurvey("description", e.target.value)
                  }
                  placeholder="Write a description for your survey..."
                  rows={2}
                />
              </div>

              <div className="survey-question-list">
                {survey.questions.map((q, index) => (
                  <div
                    className={`survey-question-card ${
                      activeQuestion === q.id ? "question-selected" : ""
                    }`}
                    key={q.id}
                    onClick={() => setActiveQuestion(q.id)}
                  >
                    <div className="question-card-top">
                      <span>QUESTION {String(index + 1).padStart(2, "0")}</span>

                      <button
                        className="question-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteQuestion(q.id);
                        }}
                        title="Delete question"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>

                    <input
                      className="question-title-input"
                      value={q.title}
                      onChange={(e) =>
                        updateQuestion(q.id, "title", e.target.value)
                      }
                      placeholder="Write your question here..."
                    />

                    <div className="question-settings">
                      <div className="question-type-select">
                        <FileText size={16} />

                        <select
                          value={q.type}
                          onChange={(e) =>
                            updateQuestion(q.id, "type", e.target.value)
                          }
                        >
                          {questionTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>

                        <ChevronDown size={14} />
                      </div>

                      <label className="required-toggle">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) =>
                            updateQuestion(q.id, "required", e.target.checked)
                          }
                        />
                        Required
                      </label>
                    </div>

                    {(q.type === "multiple" || q.type === "checkbox") && (
                      <div className="question-options">
                        {q.options.map((option, i) => (
                          <div className="question-option" key={i}>
                            <span className="option-indicator">
                              {q.type === "multiple" ? (
                                <span className="option-radio"></span>
                              ) : (
                                <span className="option-checkbox"></span>
                              )}
                            </span>

                            <input
                              value={option}
                              onChange={(e) =>
                                updateOption(q.id, i, e.target.value)
                              }
                              placeholder="Enter option"
                            />

                            <button
                              onClick={() => deleteOption(q.id, i)}
                              title="Remove option"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        ))}

                        <button
                          className="add-option-btn"
                          onClick={() => addOption(q.id)}
                        >
                          <Plus size={15} /> Add option
                        </button>
                      </div>
                    )}

                    {q.type === "short" && (
                      <div className="short-answer-placeholder">
                        Short answer text
                      </div>
                    )}

                    {q.type === "rating" && (
                      <div className="rating-editor">
                        {[1, 2, 3, 4, 5].map((number) => (
                          <Star size={20} key={number} />
                        ))}
                        <span>1 – 5 rating</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button className="add-question-btn" onClick={addQuestion}>
                <Plus size={19} />
                Add Question
              </button>
            </section>

            <aside className="survey-sidebar">
              <div className="sidebar-card">
                <h3>Survey Overview</h3>

                <div className="sidebar-stat">
                  <span>Total Questions</span>
                  <strong>{survey.questions.length}</strong>
                </div>

                <div className="sidebar-stat">
                  <span>Required Questions</span>
                  <strong>
                    {survey.questions.filter((q) => q.required).length}
                  </strong>
                </div>

                <div className="sidebar-stat">
                  <span>Question Types</span>
                  <strong>
                    {new Set(survey.questions.map((q) => q.type)).size}
                  </strong>
                </div>
              </div>

              <div className="sidebar-card">
                <h3>Quick Tips</h3>

                <ul className="survey-tips">
                  <li>Keep questions short and clear.</li>
                  <li>Avoid asking multiple things in one question.</li>
                  <li>Use required fields for important questions.</li>
                  <li>Preview your survey before sharing.</li>
                </ul>
              </div>

              <div className="sidebar-card sidebar-info">
                <div className="sidebar-info-icon">
                  <Save size={18} />
                </div>
                <h3>Automatic Saving</h3>
                <p>
                  Your survey is automatically saved in this browser.
                  You can continue editing it later on this device.
                </p>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default SurveyMaker;