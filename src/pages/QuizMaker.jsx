import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Eye,
  Save,
  X,
  Check,
  Play,
  RotateCcw,
  Trophy,
  FileText,
} from "lucide-react";

import "./QuizMaker.css";

const STORAGE_KEY = "xylo-quiz-maker";

const createQuestion = () => ({
  id: Date.now() + Math.random(),
  title: "",
  options: ["Option 1", "Option 2", "Option 3", "Option 4"],
  correctAnswer: 0,
  points: 1,
});

const initialQuiz = {
  title: "Untitled Quiz",
  description: "Test your knowledge with this quiz.",
  questions: [],
};

function QuizMaker() {
  const [quiz, setQuiz] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialQuiz;
    } catch {
      return initialQuiz;
    }
  });

  const [mode, setMode] = useState("editor");
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [saveMessage, setSaveMessage] = useState("All changes saved");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quiz));
    setSaveMessage("All changes saved");
  }, [quiz]);

  const updateQuiz = (field, value) => {
    setQuiz((prev) => ({ ...prev, [field]: value }));
  };

  const addQuestion = () => {
    setQuiz((prev) => ({
      ...prev,
      questions: [...prev.questions, createQuestion()],
    }));
  };

  const updateQuestion = (id, field, value) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === id ? { ...q, [field]: value } : q
      ),
    }));
  };

  const deleteQuestion = (id) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }));
  };

  const addOption = (id) => {
    setQuiz((prev) => ({
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
    setQuiz((prev) => ({
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
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id !== id) return q;

        const options = q.options.filter((_, i) => i !== index);

        let correctAnswer = q.correctAnswer;

        if (index === correctAnswer) {
          correctAnswer = 0;
        } else if (index < correctAnswer) {
          correctAnswer -= 1;
        }

        return { ...q, options, correctAnswer };
      }),
    }));
  };

  const saveQuiz = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quiz));
    setSaveMessage("Saved successfully!");

    setTimeout(() => {
      setSaveMessage("All changes saved");
    }, 2000);
  };

  const startQuiz = () => {
    if (quiz.questions.length === 0) {
      alert("Please add at least one question.");
      return;
    }

    const incomplete = quiz.questions.some(
      (q) =>
        !q.title.trim() ||
        q.options.length < 2 ||
        q.options.some((option) => !option.trim()) ||
        !Number.isFinite(Number(q.correctAnswer)) ||
        q.correctAnswer < 0 ||
        q.correctAnswer >= q.options.length ||
        Number(q.points) < 1
    );

    if (incomplete) {
      alert(
        "Please complete every question, add at least two options, and select a valid correct answer."
      );
      return;
    }

    setAnswers({});
    setResult(null);
    setMode("attempt");
  };

  const submitQuiz = () => {
    if (Object.keys(answers).length !== quiz.questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    let score = 0;
    let total = 0;

    quiz.questions.forEach((q) => {
      const points = Number(q.points) || 1;
      total += points;

      if (Number(answers[q.id]) === Number(q.correctAnswer)) {
        score += points;
      }
    });

    setResult({ score, total });
    setMode("result");
  };

  const resetQuiz = () => {
    setAnswers({});
    setResult(null);
    setMode("attempt");
  };

  const downloadQuiz = () => {
    window.print();
  };

  const totalMarks = quiz.questions.reduce(
    (sum, q) => sum + (Number(q.points) || 1),
    0
  );

  return (
    <div className="quiz-page">
      <header className="quiz-header">
        <a href="/" className="quiz-logo">
          XYLO<span>.</span>
        </a>

        <div className="quiz-header-actions">
          <span className="quiz-save-status">
            <Check size={14} /> {saveMessage}
          </span>

          {mode === "editor" && (
            <>
              <button
                className="quiz-secondary-btn"
                onClick={() => setMode("preview")}
              >
                <Eye size={16} /> Preview
              </button>

              <button className="quiz-primary-btn" onClick={saveQuiz}>
                <Save size={16} /> Save
              </button>
            </>
          )}

          {mode !== "editor" && (
            <button
              className="quiz-secondary-btn"
              onClick={() => setMode("editor")}
            >
              Back to Editor
            </button>
          )}
        </div>
      </header>

      <main className="quiz-container">
        <div className="quiz-heading">
          <div>
            <div className="quiz-breadcrumb">
              XYLO / Create & Build / Quiz Maker
            </div>

            <h1>Quiz Maker</h1>

            <p>Create interactive quizzes and test your knowledge.</p>
          </div>

          {mode === "editor" && (
            <button className="quiz-start-btn" onClick={startQuiz}>
              <Play size={16} /> Start Quiz
            </button>
          )}
        </div>

        {mode === "editor" && (
          <>
            <div className="quiz-workspace">
              <section className="quiz-editor">
                <div className="quiz-title-card">
                  <div className="quiz-title-accent"></div>

                  <input
                    className="quiz-title-input"
                    value={quiz.title}
                    onChange={(e) => updateQuiz("title", e.target.value)}
                    placeholder="Enter quiz title"
                  />

                  <textarea
                    className="quiz-description-input"
                    value={quiz.description}
                    onChange={(e) =>
                      updateQuiz("description", e.target.value)
                    }
                    placeholder="Write a description..."
                  />

                  <div className="quiz-total-info">
                    <span>{quiz.questions.length} Questions</span>
                    <span>{totalMarks} Total Marks</span>
                  </div>
                </div>

                {quiz.questions.map((q, index) => (
                  <div className="quiz-question-card" key={q.id}>
                    <div className="quiz-question-top">
                      <span>
                        QUESTION {String(index + 1).padStart(2, "0")}
                      </span>

                      <button
                        onClick={() => deleteQuestion(q.id)}
                        title="Delete question"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>

                    <input
                      className="quiz-question-title"
                      value={q.title}
                      onChange={(e) =>
                        updateQuestion(q.id, "title", e.target.value)
                      }
                      placeholder="Write your question..."
                    />

                    <div className="quiz-answer-heading">
                      <span>ANSWER OPTIONS</span>
                      <span>Select the correct answer</span>
                    </div>

                    <div className="quiz-options-list">
                      {q.options.map((option, i) => (
                        <div className="quiz-option-row" key={i}>
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={Number(q.correctAnswer) === i}
                            onChange={() =>
                              updateQuestion(q.id, "correctAnswer", i)
                            }
                            title="Mark as correct answer"
                          />

                          <input
                            className="quiz-option-input"
                            value={option}
                            onChange={(e) =>
                              updateOption(q.id, i, e.target.value)
                            }
                            placeholder={`Option ${i + 1}`}
                          />

                          <button
                            onClick={() => deleteOption(q.id, i)}
                            disabled={q.options.length <= 2}
                            title="Remove option"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="quiz-question-footer">
                      <button
                        className="quiz-add-option"
                        onClick={() => addOption(q.id)}
                      >
                        <Plus size={15} /> Add Option
                      </button>

                      <label>
                        Marks:
                        <input
                          type="number"
                          min="1"
                          value={q.points}
                          onChange={(e) =>
                            updateQuestion(q.id, "points", e.target.value)
                          }
                        />
                      </label>
                    </div>

                    <p className="quiz-correct-hint">
                      Select the radio button beside the correct answer.
                    </p>
                  </div>
                ))}

                <button className="quiz-add-question" onClick={addQuestion}>
                  <Plus size={19} /> Add Question
                </button>
              </section>

              <aside className="quiz-sidebar">
                <div className="quiz-sidebar-card">
                  <h3>Quiz Overview</h3>

                  <div className="quiz-stat">
                    <span>Total Questions</span>
                    <strong>{quiz.questions.length}</strong>
                  </div>

                  <div className="quiz-stat">
                    <span>Total Marks</span>
                    <strong>{totalMarks}</strong>
                  </div>
                </div>

                <div className="quiz-sidebar-card">
                  <h3>How it works</h3>

                  <ul>
                    <li>Add questions and answer options.</li>
                    <li>Select the correct answer.</li>
                    <li>Assign marks to each question.</li>
                    <li>Start the quiz to test it.</li>
                    <li>View your score instantly.</li>
                  </ul>
                </div>

                <div className="quiz-sidebar-card quiz-tip-card">
                  <Trophy size={22} />
                  <h3>Make learning fun</h3>
                  <p>
                    Create quizzes for students, friends, employees or
                    yourself.
                  </p>
                </div>
              </aside>
            </div>
          </>
        )}

        {mode === "preview" && (
          <section className="quiz-preview-card">
            <div className="quiz-preview-accent"></div>

            <h2>{quiz.title}</h2>
            <p>{quiz.description}</p>

            <div className="quiz-preview-info">
              {quiz.questions.length} Questions · {totalMarks} Marks
            </div>

            {quiz.questions.map((q, index) => (
              <div className="quiz-preview-question" key={q.id}>
                <h3>
                  {index + 1}. {q.title || "Untitled Question"}
                </h3>

                {q.options.map((option, i) => (
                  <div className="quiz-preview-option" key={i}>
                    <span className="quiz-preview-radio"></span>
                    {option}
                  </div>
                ))}

                <span className="quiz-points-label">
                  {q.points} {Number(q.points) === 1 ? "mark" : "marks"}
                </span>
              </div>
            ))}

            <button className="quiz-start-btn" onClick={startQuiz}>
              <Play size={16} /> Attempt Quiz
            </button>

            <button
              className="quiz-download-btn"
              onClick={downloadQuiz}
            >
              <FileText size={16} /> Print / Save as PDF
            </button>
          </section>
        )}

        {mode === "attempt" && (
          <section className="quiz-attempt-card">
            <div className="quiz-attempt-heading">
              <div>
                <h2>{quiz.title}</h2>
                <p>{quiz.description}</p>
              </div>

              <span>
                {quiz.questions.length} Questions
              </span>
            </div>

            {quiz.questions.map((q, index) => (
              <div className="quiz-attempt-question" key={q.id}>
                <h3>
                  {index + 1}. {q.title}
                </h3>

                {q.options.map((option, i) => (
                  <label className="quiz-attempt-option" key={i}>
                    <input
                      type="radio"
                      name={`answer-${q.id}`}
                      checked={Number(answers[q.id]) === i}
                      onChange={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          [q.id]: i,
                        }))
                      }
                    />
                    {option}
                  </label>
                ))}
              </div>
            ))}

            <button
              className="quiz-submit-btn"
              onClick={submitQuiz}
            >
              Submit Quiz
            </button>
          </section>
        )}

        {mode === "result" && result && (
          <section className="quiz-result-card">
            <div className="quiz-result-icon">
              <Trophy size={38} />
            </div>

            <h2>Quiz Completed!</h2>

            <p>Here is your result.</p>

            <div className="quiz-score">
              {result.score}
              <span> / {result.total}</span>
            </div>

            <div className="quiz-percentage">
              {result.total > 0
                ? Math.round((result.score / result.total) * 100)
                : 0}
              % Score
            </div>

            <div className="quiz-result-actions">
              <button
                className="quiz-start-btn"
                onClick={resetQuiz}
              >
                <RotateCcw size={16} /> Try Again
              </button>

              <button
                className="quiz-secondary-btn"
                onClick={() => setMode("editor")}
              >
                Edit Quiz
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default QuizMaker;