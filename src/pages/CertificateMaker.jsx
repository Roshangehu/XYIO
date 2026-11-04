import { useEffect, useRef, useState } from "react";
import {
  Award,
  Download,
  Eye,
  Edit3,
  RotateCcw,
  Palette,
} from "lucide-react";
import "./CertificateMaker.css";

const initialCertificate = {
  title: "CERTIFICATE OF ACHIEVEMENT",
  recipient: "Recipient Name",
  description:
    "has successfully completed the course and demonstrated outstanding dedication and achievement.",
  course: "Web Development",
  issuer: "XYLO Academy",
  signatory: "Director / Instructor",
  date: new Date().toISOString().split("T")[0],
  certificateId: "XYLO-2026-001",
  theme: "classic",
};

const themes = {
  classic: {
    label: "Classic Gold",
    primary: "#b28a36",
    background: "#fffdf7",
  },
  blue: {
    label: "Royal Blue",
    primary: "#315c9b",
    background: "#f8fbff",
  },
  green: {
    label: "Emerald",
    primary: "#27836a",
    background: "#f7fffb",
  },
  purple: {
    label: "Royal Purple",
    primary: "#7652a5",
    background: "#fcf9ff",
  },
};

export default function CertificateMaker() {
  const certificateRef = useRef(null);

  const [certificate, setCertificate] = useState(() => {
    try {
      const saved = localStorage.getItem("xylo-certificate");
      return saved ? JSON.parse(saved) : initialCertificate;
    } catch {
      return initialCertificate;
    }
  });

  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    localStorage.setItem("xylo-certificate", JSON.stringify(certificate));
  }, [certificate]);

  const updateField = (field, value) => {
    setCertificate((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetCertificate = () => {
    if (window.confirm("Reset all certificate details?")) {
      setCertificate({
        ...initialCertificate,
        date: new Date().toISOString().split("T")[0],
        certificateId: `XYLO-${Date.now().toString().slice(-6)}`,
      });
      setShowPreview(false);
    }
  };

  const downloadCertificate = () => {
    if (!certificate.recipient.trim() || !certificate.issuer.trim()) {
      alert("Please enter the recipient and issuer name.");
      return;
    }

    setShowPreview(true);

    setTimeout(() => {
      window.print();
    }, 300);
  };

  const selectedTheme = themes[certificate.theme] || themes.classic;

  const formattedDate = certificate.date
    ? new Date(`${certificate.date}T00:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Date";

  const renderCertificate = () => (
    <div
      className={`certificate-paper certificate-theme-${certificate.theme}`}
      ref={certificateRef}
      style={{
        "--certificate-primary": selectedTheme.primary,
        "--certificate-background": selectedTheme.background,
      }}
    >
      <div className="certificate-outer-border">
        <div className="certificate-inner-border">
          <div className="certificate-content">
            <div className="certificate-top-icon">
              <Award size={43} strokeWidth={1.4} />
            </div>

            <div className="certificate-issuer">
              {certificate.issuer || "Organization Name"}
            </div>

            <div className="certificate-heading">
              {certificate.title || "CERTIFICATE"}
            </div>

            <div className="certificate-divider">
              <span />
              <Award size={17} />
              <span />
            </div>

            <p className="certificate-presented">This certificate is proudly presented to</p>

            <h1 className="certificate-recipient">
              {certificate.recipient || "Recipient Name"}
            </h1>

            <div className="certificate-recipient-line" />

            <p className="certificate-description">
              {certificate.description}
            </p>

            <h2 className="certificate-course">
              {certificate.course || "Course / Achievement"}
            </h2>

            <div className="certificate-bottom">
              <div className="certificate-date-block">
                <strong>{formattedDate}</strong>
                <span>Date</span>
              </div>

              <div className="certificate-seal">
                <Award size={27} />
                <span>AWARDED</span>
              </div>

              <div className="certificate-signature">
                <strong>{certificate.signatory || "Authorized Signatory"}</strong>
                <span>{certificate.issuer || "Organization"}</span>
              </div>
            </div>

            <div className="certificate-id">
              Certificate ID: {certificate.certificateId}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="certificate-tool">
      <header className="certificate-header">
        <div>
          <div className="certificate-breadcrumb">XYLO / CREATE & BUILD</div>
          <h1>Certificate Maker</h1>
          <p>
            Create beautiful certificates for courses, achievements, events,
            and recognition.
          </p>
        </div>

        <div className="certificate-header-icon">
          <Award size={28} />
        </div>
      </header>

      <div className="certificate-toolbar">
        <div className="certificate-save-status">
          <span />
          Automatically saved in this browser
        </div>

        <div className="certificate-toolbar-actions">
          <button
            className="certificate-secondary-btn"
            type="button"
            onClick={resetCertificate}
          >
            <RotateCcw size={16} />
            Reset
          </button>

          <button
            className="certificate-secondary-btn"
            type="button"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <Edit3 size={16} /> : <Eye size={16} />}
            {showPreview ? "Edit" : "Preview"}
          </button>

          <button
            className="certificate-primary-btn"
            type="button"
            onClick={downloadCertificate}
          >
            <Download size={16} />
            Download PDF
          </button>
        </div>
      </div>

      {showPreview ? (
        <div className="certificate-preview-wrapper">
          {renderCertificate()}
        </div>
      ) : (
        <div className="certificate-layout">
          <div className="certificate-editor">
            <section className="certificate-section">
              <div className="certificate-section-heading">
                <span>01</span>
                <div>
                  <h2>Certificate information</h2>
                  <p>Choose the certificate title and organization.</p>
                </div>
              </div>

              <div className="certificate-form-grid">
                <label className="certificate-full-width">
                  Certificate title
                  <input
                    value={certificate.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="CERTIFICATE OF ACHIEVEMENT"
                  />
                </label>

                <label>
                  Organization / Issuer
                  <input
                    value={certificate.issuer}
                    onChange={(e) => updateField("issuer", e.target.value)}
                    placeholder="Organization name"
                  />
                </label>

                <label>
                  Certificate ID
                  <input
                    value={certificate.certificateId}
                    onChange={(e) =>
                      updateField("certificateId", e.target.value)
                    }
                    placeholder="XYLO-2026-001"
                  />
                </label>
              </div>
            </section>

            <section className="certificate-section">
              <div className="certificate-section-heading">
                <span>02</span>
                <div>
                  <h2>Recipient details</h2>
                  <p>Who is receiving this certificate?</p>
                </div>
              </div>

              <div className="certificate-form-grid">
                <label className="certificate-full-width">
                  Recipient name
                  <input
                    value={certificate.recipient}
                    onChange={(e) => updateField("recipient", e.target.value)}
                    placeholder="Enter recipient's full name"
                  />
                </label>

                <label className="certificate-full-width">
                  Description
                  <textarea
                    rows="3"
                    value={certificate.description}
                    onChange={(e) =>
                      updateField("description", e.target.value)
                    }
                    placeholder="Describe why this certificate is being awarded..."
                  />
                </label>

                <label className="certificate-full-width">
                  Course / Achievement
                  <input
                    value={certificate.course}
                    onChange={(e) => updateField("course", e.target.value)}
                    placeholder="Course or achievement name"
                  />
                </label>
              </div>
            </section>

            <section className="certificate-section">
              <div className="certificate-section-heading">
                <span>03</span>
                <div>
                  <h2>Authorization</h2>
                  <p>Add the date and signatory information.</p>
                </div>
              </div>

              <div className="certificate-form-grid">
                <label>
                  Issue date
                  <input
                    type="date"
                    value={certificate.date}
                    onChange={(e) => updateField("date", e.target.value)}
                  />
                </label>

                <label>
                  Signatory designation
                  <input
                    value={certificate.signatory}
                    onChange={(e) => updateField("signatory", e.target.value)}
                    placeholder="Director / Instructor"
                  />
                </label>
              </div>
            </section>

            <section className="certificate-section">
              <div className="certificate-section-heading">
                <span>04</span>
                <div>
                  <h2>Choose a design</h2>
                  <p>Select a color theme for your certificate.</p>
                </div>
              </div>

              <div className="certificate-themes">
                {Object.entries(themes).map(([key, theme]) => (
                  <button
                    type="button"
                    key={key}
                    className={`certificate-theme-option ${
                      certificate.theme === key ? "active" : ""
                    }`}
                    onClick={() => updateField("theme", key)}
                  >
                    <span
                      className="certificate-theme-swatch"
                      style={{
                        background: theme.primary,
                      }}
                    />
                    <span>{theme.label}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <aside className="certificate-sidebar">
            <div className="certificate-sidebar-icon">
              <Palette size={21} />
            </div>

            <h3>Your certificate</h3>
            <p>
              Your design updates automatically as you edit the information.
            </p>

            <div className="certificate-mini-preview">
              <div
                className="certificate-mini-border"
                style={{
                  borderColor: selectedTheme.primary,
                  background: selectedTheme.background,
                }}
              >
                <Award
                  size={23}
                  style={{ color: selectedTheme.primary }}
                />
                <strong>{certificate.title || "CERTIFICATE"}</strong>
                <span>{certificate.recipient || "Recipient Name"}</span>
                <small>{certificate.course || "Course / Achievement"}</small>
              </div>
            </div>

            <div className="certificate-sidebar-info">
              <div>
                <span>FORMAT</span>
                <strong>A4 Landscape</strong>
              </div>
              <div>
                <span>EXPORT</span>
                <strong>PDF / Print</strong>
              </div>
              <div>
                <span>STORAGE</span>
                <strong>Browser Local</strong>
              </div>
            </div>

            <button
              className="certificate-primary-btn certificate-sidebar-button"
              type="button"
              onClick={() => setShowPreview(true)}
            >
              <Eye size={16} />
              View full certificate
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}