import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  RotateCcw,
  Eye,
  EyeOff,
  Layers,
  BookOpen,
} from "lucide-react";
import "./FlashcardMaker.css";

const initialCards = [
  {
    id: 1,
    question: "What is HTML?",
    answer: "HTML stands for HyperText Markup Language. It structures content on web pages.",
  },
  {
    id: 2,
    question: "What is CSS?",
    answer: "CSS stands for Cascading Style Sheets. It controls the appearance and layout of web pages.",
  },
  {
    id: 3,
    question: "What is JavaScript?",
    answer: "JavaScript is a programming language used to add interactivity and dynamic behavior to websites.",
  },
];

export default function FlashcardMaker() {
  const [cards, setCards] = useState(() => {
    try {
      const saved = localStorage.getItem("xylo-flashcards");
      return saved ? JSON.parse(saved) : initialCards;
    } catch {
      return initialCards;
    }
  });

  const [deckTitle, setDeckTitle] = useState(() => {
    return localStorage.getItem("xylo-flashcard-title") || "My Study Deck";
  });

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [activeTab, setActiveTab] = useState("study");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState([]);
  const [unknownCards, setUnknownCards] = useState([]);

  useEffect(() => {
    localStorage.setItem("xylo-flashcards", JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem("xylo-flashcard-title", deckTitle);
  }, [deckTitle]);

  const currentCard = cards[currentIndex];

  const addCard = (e) => {
    e.preventDefault();

    if (!question.trim() || !answer.trim()) {
      alert("Please enter both a question and an answer.");
      return;
    }

    const newCard = {
      id: Date.now(),
      question: question.trim(),
      answer: answer.trim(),
    };

    setCards((prev) => [...prev, newCard]);
    setQuestion("");
    setAnswer("");
  };

  const deleteCard = (id) => {
    if (!window.confirm("Delete this flashcard?")) return;

    const updatedCards = cards.filter((card) => card.id !== id);

    setCards(updatedCards);
    setCurrentIndex((prev) =>
      updatedCards.length === 0 ? 0 : Math.min(prev, updatedCards.length - 1)
    );
    setIsFlipped(false);
    setKnownCards((prev) => prev.filter((cardId) => cardId !== id));
    setUnknownCards((prev) => prev.filter((cardId) => cardId !== id));
  };

  const nextCard = () => {
    if (!cards.length) return;

    setCurrentIndex((prev) => (prev + 1) % cards.length);
    setIsFlipped(false);
  };

  const previousCard = () => {
    if (!cards.length) return;

    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    setIsFlipped(false);
  };

  const shuffleCards = () => {
    const shuffled = [...cards];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCards([]);
    setUnknownCards([]);
  };

  const markKnown = () => {
    if (!currentCard) return;

    setKnownCards((prev) =>
      prev.includes(currentCard.id) ? prev : [...prev, currentCard.id]
    );

    setUnknownCards((prev) =>
      prev.filter((id) => id !== currentCard.id)
    );

    nextCard();
  };

  const markUnknown = () => {
    if (!currentCard) return;

    setUnknownCards((prev) =>
      prev.includes(currentCard.id) ? prev : [...prev, currentCard.id]
    );

    setKnownCards((prev) =>
      prev.filter((id) => id !== currentCard.id)
    );

    nextCard();
  };

  const resetProgress = () => {
    setKnownCards([]);
    setUnknownCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const progress =
    cards.length > 0
      ? Math.round((knownCards.length / cards.length) * 100)
      : 0;

  return (
    <div className="flashcard-tool">
      <header className="flashcard-header">
        <div>
          <div className="flashcard-breadcrumb">XYLO / CREATE & BUILD</div>
          <h1>Flashcard Maker</h1>
          <p>
            Create your own study cards, test your memory, and track your
            learning progress.
          </p>
        </div>

        <div className="flashcard-header-icon">
          <Layers size={28} />
        </div>
      </header>

      <div className="flashcard-deck-header">
        <div className="flashcard-deck-title">
          <BookOpen size={20} />
          <input
            value={deckTitle}
            onChange={(e) => setDeckTitle(e.target.value)}
            placeholder="Name your study deck"
          />
        </div>

        <div className="flashcard-deck-count">
          {cards.length} {cards.length === 1 ? "card" : "cards"}
        </div>
      </div>

      <div className="flashcard-tabs">
        <button
          className={activeTab === "study" ? "active" : ""}
          onClick={() => setActiveTab("study")}
          type="button"
        >
          <BookOpen size={16} />
          Study cards
        </button>

        <button
          className={activeTab === "manage" ? "active" : ""}
          onClick={() => setActiveTab("manage")}
          type="button"
        >
          <Layers size={16} />
          Manage cards
        </button>
      </div>

      {activeTab === "study" ? (
        <div className="flashcard-study">
          <div className="flashcard-study-top">
            <div>
              <span className="flashcard-eyebrow">STUDY SESSION</span>
              <h2>{deckTitle}</h2>
            </div>

            <button
              className="flashcard-outline-btn"
              type="button"
              onClick={shuffleCards}
              disabled={cards.length < 2}
            >
              <Shuffle size={15} />
              Shuffle
            </button>
          </div>

          {cards.length > 0 ? (
            <>
              <div className="flashcard-progress-area">
                <div className="flashcard-progress-labels">
                  <span>
                    Card {currentIndex + 1} of {cards.length}
                  </span>
                  <span>{progress}% mastered</span>
                </div>

                <div className="flashcard-progress-track">
                  <div
                    className="flashcard-progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div
                className={`flashcard-card ${isFlipped ? "flipped" : ""}`}
                onClick={() => setIsFlipped((prev) => !prev)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setIsFlipped((prev) => !prev);
                  }
                }}
              >
                <div className="flashcard-card-top">
                  <span>{isFlipped ? "ANSWER" : "QUESTION"}</span>
                  {isFlipped ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </div>

                <div className="flashcard-card-content">
                  <span className="flashcard-card-label">
                    {isFlipped ? "Here's the answer" : "Think about it..."}
                  </span>

                  <h2>
                    {isFlipped ? currentCard.answer : currentCard.question}
                  </h2>
                </div>

                <div className="flashcard-card-bottom">
                  <RotateCcw size={15} />
                  Click card to {isFlipped ? "see question" : "reveal answer"}
                </div>
              </div>

              <div className="flashcard-navigation">
                <button
                  className="flashcard-outline-btn"
                  onClick={previousCard}
                  type="button"
                >
                  <ChevronLeft size={17} />
                  Previous
                </button>

                <button
                  className="flashcard-outline-btn"
                  onClick={() => setIsFlipped((prev) => !prev)}
                  type="button"
                >
                  <RotateCcw size={16} />
                  Flip card
                </button>

                <button
                  className="flashcard-outline-btn"
                  onClick={nextCard}
                  type="button"
                >
                  Next
                  <ChevronRight size={17} />
                </button>
              </div>

              {isFlipped && (
                <div className="flashcard-knowledge-actions">
                  <button
                    className="flashcard-unknown-btn"
                    onClick={markUnknown}
                    type="button"
                  >
                    Still learning
                  </button>

                  <button
                    className="flashcard-known-btn"
                    onClick={markKnown}
                    type="button"
                  >
                    I knew this
                  </button>
                </div>
              )}

              <div className="flashcard-study-stats">
                <div>
                  <span className="flashcard-stat-dot known" />
                  <strong>{knownCards.length}</strong>
                  <span>Known</span>
                </div>

                <div>
                  <span className="flashcard-stat-dot unknown" />
                  <strong>{unknownCards.length}</strong>
                  <span>Still learning</span>
                </div>

                <button onClick={resetProgress} type="button">
                  <RotateCcw size={13} />
                  Reset progress
                </button>
              </div>
            </>
          ) : (
            <div className="flashcard-empty">
              <BookOpen size={35} />
              <h3>No flashcards yet</h3>
              <p>Add some questions and answers to start studying.</p>
              <button
                className="flashcard-dark-btn"
                onClick={() => setActiveTab("manage")}
                type="button"
              >
                Create flashcards
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flashcard-manage">
          <section className="flashcard-add-section">
            <div className="flashcard-section-heading">
              <div>
                <span className="flashcard-eyebrow">BUILD YOUR DECK</span>
                <h2>Add a new flashcard</h2>
                <p>Create a question and its corresponding answer.</p>
              </div>
            </div>

            <form onSubmit={addCard}>
              <label>
                Question
                <textarea
                  rows="3"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter your question..."
                />
              </label>

              <label>
                Answer
                <textarea
                  rows="4"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter the answer..."
                />
              </label>

              <button className="flashcard-dark-btn" type="submit">
                <Plus size={17} />
                Add flashcard
              </button>
            </form>
          </section>

          <section className="flashcard-list-section">
            <div className="flashcard-list-heading">
              <div>
                <h2>Your flashcards</h2>
                <p>{cards.length} cards in this deck</p>
              </div>
            </div>

            {cards.length > 0 ? (
              <div className="flashcard-list">
                {cards.map((card, index) => (
                  <div className="flashcard-list-item" key={card.id}>
                    <div className="flashcard-list-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="flashcard-list-content">
                      <strong>{card.question}</strong>
                      <p>{card.answer}</p>
                    </div>

                    <button
                      className="flashcard-remove-btn"
                      onClick={() => deleteCard(card.id)}
                      type="button"
                      aria-label="Delete flashcard"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flashcard-empty">
                <Layers size={32} />
                <h3>Your deck is empty</h3>
                <p>Add your first flashcard above.</p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}