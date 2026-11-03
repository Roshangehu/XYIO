import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Eye,
  Save,
  X,
  Check,
  FileText,
  Download,
  ClipboardList,
  ChevronDown,
} from "lucide-react";

import "./FormBuilder.css";

const STORAGE_KEY = "xylo-form-builder";
const RESPONSE_KEY = "xylo-form-responses";

const fieldTypes = [
  { value: "text", label: "Short Text" },
  { value: "textarea", label: "Long Text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone Number" },
  { value: "number", label: "Number" },
  { value: "dropdown", label: "Dropdown" },
  { value: "radio", label: "Multiple Choice" },
  { value: "checkbox", label: "Checkboxes" },
];

const createField = () => ({
  id: Date.now() + Math.random(),
  type: "text",
  label: "",
  placeholder: "Enter your answer",
  required: false,
  options: ["Option 1", "Option 2"],
});

const initialForm = {
  title: "Untitled Form",
  description: "Please fill out the form below.",
  fields: [],
};

function FormBuilder() {
  const [form, setForm] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialForm;
    } catch {
      return initialForm;
    }
  });

  const [responses, setResponses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(RESPONSE_KEY)) || [];
    } catch {
      return [];
    }
  });

  const [mode, setMode] = useState("editor");
  const [answers, setAnswers] = useState({});
  const [saveMessage, setSaveMessage] = useState("All changes saved");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    setSaveMessage("All changes saved");
  }, [form]);

  useEffect(() => {
    localStorage.setItem(RESPONSE_KEY, JSON.stringify(responses));
  }, [responses]);

  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addField = () => {
    setForm((prev) => ({
      ...prev,
      fields: [...prev.fields, createField()],
    }));
  };

  const updateField = (id, field, value) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const deleteField = (id) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.filter((item) => item.id !== id),
    }));

    setAnswers((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const addOption = (id) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.map((field) =>
        field.id === id
          ? {
              ...field,
              options: [
                ...field.options,
                `Option ${field.options.length + 1}`,
              ],
            }
          : field
      ),
    }));
  };

  const updateOption = (id, index, value) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.map((field) =>
        field.id === id
          ? {
              ...field,
              options: field.options.map((option, i) =>
                i === index ? value : option
              ),
            }
          : field
      ),
    }));
  };

  const deleteOption = (id, index) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.map((field) =>
        field.id === id
          ? {
              ...field,
              options: field.options.filter((_, i) => i !== index),
            }
          : field
      ),
    }));
  };

  const saveForm = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    setSaveMessage("Saved successfully!");

    setTimeout(() => setSaveMessage("All changes saved"), 2000);
  };

  const openPreview = () => {
    if (!form.title.trim()) {
      alert("Please enter a form title.");
      return;
    }

    if (form.fields.length === 0) {
      alert("Please add at least one field.");
      return;
    }

    const invalidField = form.fields.some(
      (field) =>
        !field.label.trim() ||
        (["dropdown", "radio", "checkbox"].includes(field.type) &&
          (field.options.length === 0 ||
            field.options.some((option) => !option.trim())))
    );

    if (invalidField) {
      alert("Please complete all field labels and options.");
      return;
    }

    setAnswers({});
    setMode("preview");
  };

  const submitForm = (e) => {
    e.preventDefault();

    const missing = form.fields.some((field) => {
      const answer = answers[field.id];

      if (!field.required) return false;

      return (
        answer === undefined ||
        answer === "" ||
        (Array.isArray(answer) && answer.length === 0)
      );
    });

    if (missing) {
      alert("Please complete all required fields.");
      return;
    }

    const newResponse = {
      id: Date.now(),
      submittedAt: new Date().toISOString(),
      answers: { ...answers },
    };

    setResponses((prev) => [...prev, newResponse]);
    setAnswers({});
    setMode("success");
  };

  const updateAnswer = (id, value, checked = false) => {
    setAnswers((prev) => {
      if (checked) {
        const current = prev[id] || [];

        return {
          ...prev,
          [id]: current.includes(value)
            ? current.filter((item) => item !== value)
            : [...current, value],
        };
      }

      return {
        ...prev,
        [id]: value,
      };
    });
  };

  const exportResponses = () => {
    if (responses.length === 0) {
      alert("No form responses available to export.");
      return;
    }

    const headers = [
      "Submission Date",
      ...form.fields.map((field) => field.label),
    ];

    const rows = responses.map((response) => [
      new Date(response.submittedAt).toLocaleString(),
      ...form.fields.map((field) => {
        const value = response.answers[field.id];

        return Array.isArray(value) ? value.join("; ") : value ?? "";
      }),
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "xylo-form-responses.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const renderField = (field, editable = false) => {
    if (editable) return null;

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            placeholder={field.placeholder}
            value={answers[field.id] || ""}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
          />
        );

      case "email":
        return (
          <input
            type="email"
            placeholder={field.placeholder || "example@email.com"}
            value={answers[field.id] || ""}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
          />
        );

      case "phone":
        return (
          <input
            type="tel"
            placeholder={field.placeholder || "Enter phone number"}
            value={answers[field.id] || ""}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
          />
        );

      case "number":
        return (
          <input
            type="number"
            placeholder={field.placeholder || "Enter a number"}
            value={answers[field.id] || ""}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
          />
        );

      case "dropdown":
        return (
          <select
            value={answers[field.id] || ""}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
          >
            <option value="">Select an option</option>

            {field.options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "radio":
        return (
          <div className="form-preview-options">
            {field.options.map((option, index) => (
              <label key={index}>
                <input
                  type="radio"
                  name={`field-${field.id}`}
                  checked={answers[field.id] === option}
                  onChange={() => updateAnswer(field.id, option)}
                />
                {option}
              </label>
            ))}
          </div>
        );

      case "checkbox":
        return (
          <div className="form-preview-options">
            {field.options.map((option, index) => (
              <label key={index}>
                <input
                  type="checkbox"
                  checked={(answers[field.id] || []).includes(option)}
                  onChange={(e) =>
                    updateAnswer(field.id, option, e.target.checked)
                  }
                />
                {option}
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            type="text"
            placeholder={field.placeholder}
            value={answers[field.id] || ""}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="form-builder-page">
      <header className="fb-header">
        <a href="/" className="fb-logo">
          XYLO<span>.</span>
        </a>

        <div className="fb-header-actions">
          <span className="fb-save-status">
            <Check size={14} />
            {saveMessage}
          </span>

          {mode === "editor" && (
            <>
              <button
                className="fb-secondary-btn"
                onClick={openPreview}
              >
                <Eye size={16} /> Preview
              </button>

              <button
                className="fb-primary-btn"
                onClick={saveForm}
              >
                <Save size={16} /> Save
              </button>
            </>
          )}

          {mode !== "editor" && (
            <button
              className="fb-secondary-btn"
              onClick={() => setMode("editor")}
            >
              Back to Editor
            </button>
          )}
        </div>
      </header>

      <main className="fb-container">
        <div className="fb-heading">
          <div>
            <div className="fb-breadcrumb">
              XYLO / Create & Build / Form Builder
            </div>

            <h1>Form Builder</h1>

            <p>Build custom forms and collect information easily.</p>
          </div>

          {mode === "editor" && (
            <button
              className="fb-primary-btn"
              onClick={openPreview}
            >
              <Eye size={16} /> Preview Form
            </button>
          )}
        </div>

        {mode === "editor" && (
          <div className="fb-workspace">
            <section className="fb-editor">
              <div className="fb-title-card">
                <div className="fb-accent"></div>

                <input
                  className="fb-title-input"
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                  placeholder="Untitled Form"
                />

                <textarea
                  className="fb-description-input"
                  value={form.description}
                  onChange={(e) =>
                    updateForm("description", e.target.value)
                  }
                  placeholder="Write a description..."
                />
              </div>

              {form.fields.map((field, index) => (
                <div className="fb-field-card" key={field.id}>
                  <div className="fb-field-top">
                    <span>
                      FIELD {String(index + 1).padStart(2, "0")}
                    </span>

                    <button
                      onClick={() => deleteField(field.id)}
                      title="Delete field"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <input
                    className="fb-field-label"
                    value={field.label}
                    onChange={(e) =>
                      updateField(field.id, "label", e.target.value)
                    }
                    placeholder="Enter field label..."
                  />

                  <div className="fb-field-settings">
                    <div className="fb-type-select">
                      <FileText size={16} />

                      <select
                        value={field.type}
                        onChange={(e) =>
                          updateField(field.id, "type", e.target.value)
                        }
                      >
                        {fieldTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>

                      <ChevronDown size={14} />
                    </div>

                    <label className="fb-required">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) =>
                          updateField(
                            field.id,
                            "required",
                            e.target.checked
                          )
                        }
                      />
                      Required
                    </label>
                  </div>

                  {!["dropdown", "radio", "checkbox"].includes(
                    field.type
                  ) && (
                    <input
                      className="fb-placeholder-input"
                      value={field.placeholder}
                      onChange={(e) =>
                        updateField(
                          field.id,
                          "placeholder",
                          e.target.value
                        )
                      }
                      placeholder="Enter placeholder text..."
                    />
                  )}

                  {["dropdown", "radio", "checkbox"].includes(
                    field.type
                  ) && (
                    <div className="fb-options">
                      <span className="fb-options-heading">
                        FIELD OPTIONS
                      </span>

                      {field.options.map((option, i) => (
                        <div className="fb-option-row" key={i}>
                          <span>{i + 1}.</span>

                          <input
                            value={option}
                            onChange={(e) =>
                              updateOption(field.id, i, e.target.value)
                            }
                            placeholder="Enter option..."
                          />

                          <button
                            onClick={() =>
                              deleteOption(field.id, i)
                            }
                            disabled={field.options.length <= 1}
                            title="Delete option"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      ))}

                      <button
                        className="fb-add-option"
                        onClick={() => addOption(field.id)}
                      >
                        <Plus size={15} /> Add Option
                      </button>
                    </div>
                  )}
                </div>
              ))}

              <button className="fb-add-field" onClick={addField}>
                <Plus size={19} />
                Add Form Field
              </button>
            </section>

            <aside className="fb-sidebar">
              <div className="fb-sidebar-card">
                <h3>Form Overview</h3>

                <div className="fb-stat">
                  <span>Total Fields</span>
                  <strong>{form.fields.length}</strong>
                </div>

                <div className="fb-stat">
                  <span>Required Fields</span>
                  <strong>
                    {form.fields.filter((field) => field.required).length}
                  </strong>
                </div>

                <div className="fb-stat">
                  <span>Submissions</span>
                  <strong>{responses.length}</strong>
                </div>
              </div>

              <div className="fb-sidebar-card">
                <h3>Available Fields</h3>

                <ul>
                  <li>Short and long text</li>
                  <li>Email and phone</li>
                  <li>Numbers</li>
                  <li>Dropdown menus</li>
                  <li>Multiple choice</li>
                  <li>Checkboxes</li>
                </ul>
              </div>

              <div className="fb-sidebar-card fb-submissions-card">
                <ClipboardList size={22} />

                <h3>Form Responses</h3>

                <p>
                  {responses.length} submission(s) collected on this device.
                </p>

                <button
                  onClick={exportResponses}
                  disabled={responses.length === 0}
                >
                  <Download size={15} /> Export CSV
                </button>
              </div>
            </aside>
          </div>
        )}

        {mode === "preview" && (
          <section className="fb-preview-card">
            <div className="fb-preview-accent"></div>

            <h2>{form.title}</h2>

            <p className="fb-preview-description">
              {form.description}
            </p>

            <form onSubmit={submitForm}>
              {form.fields.map((field, index) => (
                <div className="fb-preview-field" key={field.id}>
                  <label>
                    {index + 1}. {field.label}
                    {field.required && (
                      <span className="fb-required-mark"> *</span>
                    )}
                  </label>

                  {renderField(field)}
                </div>
              ))}

              <button type="submit" className="fb-submit-btn">
                Submit Form
              </button>
            </form>
          </section>
        )}

        {mode === "success" && (
          <section className="fb-success-card">
            <div className="fb-success-icon">
              <Check size={35} />
            </div>

            <h2>Form Submitted!</h2>

            <p>
              Your response has been saved successfully on this device.
            </p>

            <div className="fb-success-actions">
              <button
                className="fb-primary-btn"
                onClick={() => setMode("editor")}
              >
                Back to Editor
              </button>

              <button
                className="fb-secondary-btn"
                onClick={() => {
                  setAnswers({});
                  setMode("preview");
                }}
              >
                Submit Another Response
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default FormBuilder;