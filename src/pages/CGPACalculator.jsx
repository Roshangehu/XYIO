import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Plus,
  Trash2,
  Calculator,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import "./CGPACalculator.css";

const gradePoints = {
  "O": 10,
  "A+": 9,
  "A": 8,
  "B+": 7,
  "B": 6,
  "C": 5,
  "P": 4,
  "F": 0,
};

const createSemester = (number) => ({
  id: Date.now() + Math.random(),
  name: `Semester ${number}`,
  subjects: [
    {
      id: Date.now() + Math.random(),
      name: "",
      credits: 4,
      grade: "A",
    },
  ],
});

export default function CGPACalculator() {
  const [mode, setMode] = useState("cgpa");

  const [semesters, setSemesters] = useState(() => {
    try {
      const saved = localStorage.getItem("xylo-cgpa-data");
      return saved ? JSON.parse(saved) : [createSemester(1)];
    } catch {
      return [createSemester(1)];
    }
  });

  const [sgpaCredits, setSgpaCredits] = useState(20);
  const [sgpaValue, setSgpaValue] = useState("8.0");
  const [previousCGPA, setPreviousCGPA] = useState("");
  const [previousCredits, setPreviousCredits] = useState("");
  const [newCredits, setNewCredits] = useState("20");
  const [newSGPA, setNewSGPA] = useState("8.0");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem("xylo-cgpa-data", JSON.stringify(semesters));
  }, [semesters]);

  const addSemester = () => {
    setSemesters((prev) => [
      ...prev,
      createSemester(prev.length + 1),
    ]);
  };

  const removeSemester = (semesterId) => {
    setSemesters((prev) =>
      prev.filter((semester) => semester.id !== semesterId)
    );
  };

  const updateSemesterName = (semesterId, name) => {
    setSemesters((prev) =>
      prev.map((semester) =>
        semester.id === semesterId
          ? { ...semester, name }
          : semester
      )
    );
  };

  const addSubject = (semesterId) => {
    setSemesters((prev) =>
      prev.map((semester) =>
        semester.id === semesterId
          ? {
              ...semester,
              subjects: [
                ...semester.subjects,
                {
                  id: Date.now() + Math.random(),
                  name: "",
                  credits: 4,
                  grade: "A",
                },
              ],
            }
          : semester
      )
    );
  };

  const removeSubject = (semesterId, subjectId) => {
    setSemesters((prev) =>
      prev.map((semester) =>
        semester.id === semesterId
          ? {
              ...semester,
              subjects: semester.subjects.filter(
                (subject) => subject.id !== subjectId
              ),
            }
          : semester
      )
    );
  };

  const updateSubject = (
    semesterId,
    subjectId,
    field,
    value
  ) => {
    setSemesters((prev) =>
      prev.map((semester) =>
        semester.id === semesterId
          ? {
              ...semester,
              subjects: semester.subjects.map((subject) =>
                subject.id === subjectId
                  ? { ...subject, [field]: value }
                  : subject
              ),
            }
          : semester
      )
    );
  };

  const calculateSemester = (semester) => {
    const totalCredits = semester.subjects.reduce(
      (sum, subject) => sum + Math.max(0, Number(subject.credits) || 0),
      0
    );

    const totalPoints = semester.subjects.reduce(
      (sum, subject) =>
        sum +
        (Math.max(0, Number(subject.credits) || 0) *
          gradePoints[subject.grade]),
      0
    );

    const sgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

    return {
      totalCredits,
      totalPoints,
      sgpa,
    };
  };

  const semesterResults = semesters.map((semester) => ({
    ...semester,
    result: calculateSemester(semester),
  }));

  const totalCredits = semesterResults.reduce(
    (sum, semester) => sum + semester.result.totalCredits,
    0
  );

  const totalPoints = semesterResults.reduce(
    (sum, semester) => sum + semester.result.totalPoints,
    0
  );

  const cgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

  const percentage = cgpa * 9.5;

  const predictedCGPA = (() => {
    const oldCgpa = Number(previousCGPA);
    const oldCredit = Number(previousCredits);
    const nextSgpa = Number(newSGPA);
    const nextCredit = Number(newCredits);

    if (
      previousCGPA === "" ||
      previousCredits === "" ||
      newSGPA === "" ||
      newCredits === "" ||
      oldCgpa < 0 ||
      oldCgpa > 10 ||
      nextSgpa < 0 ||
      nextSgpa > 10 ||
      oldCredit <= 0 ||
      nextCredit <= 0
    ) {
      return null;
    }

    return (
      (oldCgpa * oldCredit + nextSgpa * nextCredit) /
      (oldCredit + nextCredit)
    );
  })();

  const copyResult = async () => {
    const result = `XYLO CGPA Calculator

CGPA: ${cgpa.toFixed(2)}
Estimated Percentage: ${percentage.toFixed(2)}%
Total Credits: ${totalCredits}

${semesterResults
  .map(
    (semester) =>
      `${semester.name}: ${semester.result.sgpa.toFixed(2)} SGPA`
  )
  .join("\n")}`;

    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const resetAll = () => {
    const fresh = [createSemester(1)];
    setSemesters(fresh);
    setPreviousCGPA("");
    setPreviousCredits("");
    setNewSGPA("8.0");
    setNewCredits("20");
  };

  return (
    <div className="cgpa-page">
      <div className="cgpa-container">

        <div className="cgpa-heading">
          <div className="cgpa-heading-icon">
            <GraduationCap size={27} />
          </div>

          <div>
            <span className="cgpa-eyebrow">STUDENT TOOLS</span>
            <h1>CGPA Calculator</h1>
            <p>
              Calculate your CGPA, SGPA and estimated percentage.
              Track your academic performance semester by semester.
            </p>
          </div>
        </div>

        <div className="cgpa-tabs">
          <button
            className={mode === "cgpa" ? "active" : ""}
            onClick={() => setMode("cgpa")}
          >
            <GraduationCap size={16} />
            CGPA Calculator
          </button>

          <button
            className={mode === "sgpa" ? "active" : ""}
            onClick={() => setMode("sgpa")}
          >
            <BookOpen size={16} />
            SGPA Calculator
          </button>

          <button
            className={mode === "prediction" ? "active" : ""}
            onClick={() => setMode("prediction")}
          >
            <TrendingUp size={16} />
            CGPA Predictor
          </button>
        </div>

        {mode === "cgpa" && (
          <>
            <div className="cgpa-result-banner">
              <div>
                <span>YOUR CURRENT CGPA</span>
                <h2>{cgpa.toFixed(2)}</h2>
                <p>
                  {totalCredits} total credits calculated
                </p>
              </div>

              <div className="cgpa-percentage">
                <span>Estimated Percentage</span>
                <strong>{percentage.toFixed(2)}%</strong>
                <small>Using CGPA × 9.5</small>
              </div>
            </div>

            <div className="cgpa-section-header">
              <div>
                <h3>Semester Details</h3>
                <p>Add subjects, credits and grades for each semester.</p>
              </div>

              <button
                className="cgpa-add-btn"
                onClick={addSemester}
              >
                <Plus size={16} />
                Add Semester
              </button>
            </div>

            <div className="cgpa-semesters">
              {semesterResults.map((semester) => (
                <div className="cgpa-semester-card" key={semester.id}>

                  <div className="cgpa-semester-header">
                    <div>
                      <input
                        className="cgpa-semester-name"
                        value={semester.name}
                        onChange={(e) =>
                          updateSemesterName(
                            semester.id,
                            e.target.value
                          )
                        }
                      />

                      <span>
                        {semester.result.totalCredits} Credits
                      </span>
                    </div>

                    <div className="cgpa-semester-right">
                      <div>
                        <small>SGPA</small>
                        <strong>
                          {semester.result.sgpa.toFixed(2)}
                        </strong>
                      </div>

                      {semesters.length > 1 && (
                        <button
                          className="cgpa-delete-btn"
                          onClick={() =>
                            removeSemester(semester.id)
                          }
                          aria-label="Remove semester"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="cgpa-table">
                    <div className="cgpa-table-head">
                      <span>Subject</span>
                      <span>Credits</span>
                      <span>Grade</span>
                      <span></span>
                    </div>

                    {semester.subjects.map((subject) => (
                      <div
                        className="cgpa-subject-row"
                        key={subject.id}
                      >
                        <input
                          type="text"
                          placeholder="Subject name"
                          value={subject.name}
                          onChange={(e) =>
                            updateSubject(
                              semester.id,
                              subject.id,
                              "name",
                              e.target.value
                            )
                          }
                        />

                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={subject.credits}
                          onChange={(e) =>
                            updateSubject(
                              semester.id,
                              subject.id,
                              "credits",
                              e.target.value
                            )
                          }
                        />

                        <select
                          value={subject.grade}
                          onChange={(e) =>
                            updateSubject(
                              semester.id,
                              subject.id,
                              "grade",
                              e.target.value
                            )
                          }
                        >
                          {Object.entries(gradePoints).map(
                            ([grade, points]) => (
                              <option key={grade} value={grade}>
                                {grade} ({points})
                              </option>
                            )
                          )}
                        </select>

                        <button
                          className="cgpa-delete-btn"
                          onClick={() =>
                            removeSubject(
                              semester.id,
                              subject.id
                            )
                          }
                          aria-label="Remove subject"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    className="cgpa-add-subject"
                    onClick={() => addSubject(semester.id)}
                  >
                    <Plus size={15} />
                    Add Subject
                  </button>

                </div>
              ))}
            </div>

            <div className="cgpa-bottom-actions">
              <button onClick={copyResult}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy Results"}
              </button>

              <button onClick={resetAll}>
                <RotateCcw size={16} />
                Reset All
              </button>
            </div>
          </>
        )}

        {mode === "sgpa" && (
          <div className="cgpa-single-card">
            <div className="cgpa-single-heading">
              <Calculator size={22} />
              <h3>SGPA Calculator</h3>
            </div>

            <p>
              Enter the total grade points earned and total credits
              for your semester.
            </p>

            <label>Total Grade Points</label>
            <input
              type="number"
              min="0"
              value={sgpaValue}
              onChange={(e) => setSgpaValue(e.target.value)}
              placeholder="Enter total grade points"
            />

            <label>Total Credits</label>
            <input
              type="number"
              min="0"
              value={sgpaCredits}
              onChange={(e) => setSgpaCredits(e.target.value)}
              placeholder="Enter total credits"
            />

            <div className="cgpa-single-result">
              <span>SGPA</span>
              <strong>
                {Number(sgpaCredits) > 0 &&
                Number(sgpaValue) >= 0
                  ? (Number(sgpaValue) / Number(sgpaCredits)).toFixed(2)
                  : "0.00"}
              </strong>
            </div>

            <small className="cgpa-formula">
              SGPA = Total Grade Points ÷ Total Credits
            </small>
          </div>
        )}

        {mode === "prediction" && (
          <div className="cgpa-single-card">
            <div className="cgpa-single-heading">
              <TrendingUp size={22} />
              <h3>CGPA Predictor</h3>
            </div>

            <p>
              Estimate your updated CGPA after your next semester.
            </p>

            <label>Previous CGPA</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.01"
              value={previousCGPA}
              onChange={(e) => setPreviousCGPA(e.target.value)}
              placeholder="Example: 7.50"
            />

            <label>Previous Total Credits</label>
            <input
              type="number"
              min="1"
              value={previousCredits}
              onChange={(e) => setPreviousCredits(e.target.value)}
              placeholder="Example: 110"
            />

            <label>Expected Next Semester SGPA</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.01"
              value={newSGPA}
              onChange={(e) => setNewSGPA(e.target.value)}
              placeholder="Example: 8.50"
            />

            <label>Next Semester Credits</label>
            <input
              type="number"
              min="1"
              value={newCredits}
              onChange={(e) => setNewCredits(e.target.value)}
              placeholder="Example: 22"
            />

            <div className="cgpa-single-result">
              <span>Predicted CGPA</span>
              <strong>
                {predictedCGPA !== null
                  ? predictedCGPA.toFixed(2)
                  : "--"}
              </strong>
            </div>

            <small className="cgpa-formula">
              This estimate uses credit-weighted CGPA calculation.
              Confirm the formula used by your university.
            </small>
          </div>
        )}

        <div className="cgpa-info-card">
          <h3>Understanding CGPA and SGPA</h3>

          <div>
            <strong>SGPA</strong>
            <p>
              Semester Grade Point Average measures your academic
              performance in one semester.
            </p>
          </div>

          <div>
            <strong>CGPA</strong>
            <p>
              Cumulative Grade Point Average measures your
              performance across multiple semesters.
            </p>
          </div>

          <div>
            <strong>Important</strong>
            <p>
              Grade-point scales, credit rules and percentage
              conversion formulas can vary by university. Select
              the grade mapping and formula prescribed by your institution.
            </p>
          </div>
        </div>

        <p className="cgpa-privacy">
          Your academic data is saved locally in your browser.
        </p>

      </div>
    </div>
  );
}