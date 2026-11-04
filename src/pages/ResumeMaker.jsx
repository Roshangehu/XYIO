import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Eye,
  Save,
  Download,
  User,
  GraduationCap,
  BriefcaseBusiness,
  Code,
  FolderKanban,
  Award,
  FileText,
  Mail,
  Phone,
  MapPin,
  Globe,
} from "lucide-react";

import "./ResumeMaker.css";

const STORAGE_KEY = "xylo-resume-maker";

const initialResume = {
  personal: {
    name: "",
    role: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
  },
  summary: "",
  education: [
    {
      id: 1,
      institution: "",
      degree: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  ],
  experience: [],
  projects: [],
  skills: [],
  certifications: [],
};

function ResumeMaker() {
  const [resume, setResume] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialResume;
    } catch {
      return initialResume;
    }
  });

  const [mode, setMode] = useState("editor");
  const [saveMessage, setSaveMessage] = useState("All changes saved");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
  }, [resume]);

  const updatePersonal = (field, value) => {
    setResume((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value,
      },
    }));
  };

  const updateSummary = (value) => {
    setResume((prev) => ({
      ...prev,
      summary: value,
    }));
  };

  const addEntry = (section, entry) => {
    setResume((prev) => ({
      ...prev,
      [section]: [
        ...prev[section],
        {
          id: Date.now() + Math.random(),
          ...entry,
        },
      ],
    }));
  };

  const updateEntry = (section, id, field, value) => {
    setResume((prev) => ({
      ...prev,
      [section]: prev[section].map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const deleteEntry = (section, id) => {
    setResume((prev) => ({
      ...prev,
      [section]: prev[section].filter((item) => item.id !== id),
    }));
  };

  const addSkill = () => {
    setResume((prev) => ({
      ...prev,
      skills: [...prev.skills, ""],
    }));
  };

  const updateSkill = (index, value) => {
    setResume((prev) => ({
      ...prev,
      skills: prev.skills.map((skill, i) =>
        i === index ? value : skill
      ),
    }));
  };

  const deleteSkill = (index) => {
    setResume((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const saveResume = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
    setSaveMessage("Saved successfully!");

    setTimeout(() => {
      setSaveMessage("All changes saved");
    }, 2000);
  };

  const downloadResume = () => {
    window.print();
  };

  const renderSectionHeading = (icon, title) => (
    <div className="resume-section-heading">
      {icon}
      <h3>{title}</h3>
    </div>
  );

  return (
    <div className="resume-page">
      <header className="resume-header">
        <a href="/" className="resume-logo">
          XYLO<span>.</span>
        </a>

        <div className="resume-header-actions">
          <span className="resume-save-status">
            <span></span>
            {saveMessage}
          </span>

          {mode === "editor" ? (
            <>
              <button
                className="resume-secondary-btn"
                onClick={() => setMode("preview")}
              >
                <Eye size={16} />
                Preview
              </button>

              <button
                className="resume-primary-btn"
                onClick={saveResume}
              >
                <Save size={16} />
                Save
              </button>
            </>
          ) : (
            <>
              <button
                className="resume-secondary-btn"
                onClick={() => setMode("editor")}
              >
                Back to Editor
              </button>

              <button
                className="resume-primary-btn"
                onClick={downloadResume}
              >
                <Download size={16} />
                Download PDF
              </button>
            </>
          )}
        </div>
      </header>

      <main className="resume-container">
        <div className="resume-heading">
          <div>
            <div className="resume-breadcrumb">
              XYLO / Create & Build / Resume Maker
            </div>

            <h1>Resume Maker</h1>

            <p>
              Build a professional resume that helps you stand out.
            </p>
          </div>

          {mode === "preview" && (
            <button
              className="resume-primary-btn"
              onClick={downloadResume}
            >
              <Download size={17} />
              Download Resume
            </button>
          )}
        </div>

        {mode === "editor" ? (
          <div className="resume-workspace">
            <section className="resume-editor">

              {/* Personal Information */}

              <div className="resume-editor-card">
                {renderSectionHeading(
                  <User size={19} />,
                  "Personal Information"
                )}

                <div className="resume-input-grid">
                  <div className="resume-input-group">
                    <label>Full Name</label>
                    <input
                      value={resume.personal.name}
                      onChange={(e) =>
                        updatePersonal("name", e.target.value)
                      }
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="resume-input-group">
                    <label>Professional Title</label>
                    <input
                      value={resume.personal.role}
                      onChange={(e) =>
                        updatePersonal("role", e.target.value)
                      }
                      placeholder="Software Developer"
                    />
                  </div>

                  <div className="resume-input-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={resume.personal.email}
                      onChange={(e) =>
                        updatePersonal("email", e.target.value)
                      }
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="resume-input-group">
                    <label>Phone Number</label>
                    <input
                      value={resume.personal.phone}
                      onChange={(e) =>
                        updatePersonal("phone", e.target.value)
                      }
                      placeholder="+91 9876543210"
                    />
                  </div>

                  <div className="resume-input-group">
                    <label>Location</label>
                    <input
                      value={resume.personal.location}
                      onChange={(e) =>
                        updatePersonal("location", e.target.value)
                      }
                      placeholder="Dehradun, India"
                    />
                  </div>

                  <div className="resume-input-group">
                    <label>LinkedIn Profile</label>
                    <input
                      value={resume.personal.linkedin}
                      onChange={(e) =>
                        updatePersonal("linkedin", e.target.value)
                      }
                      placeholder="linkedin.com/in/username"
                    />
                  </div>

                  <div className="resume-input-group full-width">
                    <label>Portfolio / Website</label>
                    <input
                      value={resume.personal.website}
                      onChange={(e) =>
                        updatePersonal("website", e.target.value)
                      }
                      placeholder="www.yourportfolio.com"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Summary */}

              <div className="resume-editor-card">
                {renderSectionHeading(
                  <FileText size={19} />,
                  "Professional Summary"
                )}

                <textarea
                  className="resume-large-textarea"
                  value={resume.summary}
                  onChange={(e) => updateSummary(e.target.value)}
                  placeholder="Write a short professional summary about yourself, your experience and your career goals..."
                />
              </div>

              {/* Education */}

              <div className="resume-editor-card">
                {renderSectionHeading(
                  <GraduationCap size={19} />,
                  "Education"
                )}

                {resume.education.map((item, index) => (
                  <div className="resume-entry" key={item.id}>
                    <div className="resume-entry-heading">
                      <span>EDUCATION {index + 1}</span>

                      <button
                        onClick={() =>
                          deleteEntry("education", item.id)
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="resume-input-grid">
                      <div className="resume-input-group">
                        <label>Institution</label>
                        <input
                          value={item.institution}
                          onChange={(e) =>
                            updateEntry(
                              "education",
                              item.id,
                              "institution",
                              e.target.value
                            )
                          }
                          placeholder="University Name"
                        />
                      </div>

                      <div className="resume-input-group">
                        <label>Degree / Course</label>
                        <input
                          value={item.degree}
                          onChange={(e) =>
                            updateEntry(
                              "education",
                              item.id,
                              "degree",
                              e.target.value
                            )
                          }
                          placeholder="B.Tech Computer Science"
                        />
                      </div>

                      <div className="resume-input-group">
                        <label>Start Date</label>
                        <input
                          value={item.startDate}
                          onChange={(e) =>
                            updateEntry(
                              "education",
                              item.id,
                              "startDate",
                              e.target.value
                            )
                          }
                          placeholder="2023"
                        />
                      </div>

                      <div className="resume-input-group">
                        <label>End Date</label>
                        <input
                          value={item.endDate}
                          onChange={(e) =>
                            updateEntry(
                              "education",
                              item.id,
                              "endDate",
                              e.target.value
                            )
                          }
                          placeholder="2027"
                        />
                      </div>

                      <div className="resume-input-group full-width">
                        <label>Additional Details</label>
                        <textarea
                          value={item.description}
                          onChange={(e) =>
                            updateEntry(
                              "education",
                              item.id,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="CGPA, achievements, relevant coursework..."
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  className="resume-add-btn"
                  onClick={() =>
                    addEntry("education", {
                      institution: "",
                      degree: "",
                      startDate: "",
                      endDate: "",
                      description: "",
                    })
                  }
                >
                  <Plus size={16} /> Add Education
                </button>
              </div>

              {/* Experience */}

              <div className="resume-editor-card">
                {renderSectionHeading(
                  <BriefcaseBusiness size={19} />,
                  "Work Experience"
                )}

                {resume.experience.map((item, index) => (
                  <div className="resume-entry" key={item.id}>
                    <div className="resume-entry-heading">
                      <span>EXPERIENCE {index + 1}</span>

                      <button
                        onClick={() =>
                          deleteEntry("experience", item.id)
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="resume-input-grid">
                      <div className="resume-input-group">
                        <label>Job Title</label>
                        <input
                          value={item.position}
                          onChange={(e) =>
                            updateEntry(
                              "experience",
                              item.id,
                              "position",
                              e.target.value
                            )
                          }
                          placeholder="Software Developer Intern"
                        />
                      </div>

                      <div className="resume-input-group">
                        <label>Company</label>
                        <input
                          value={item.company}
                          onChange={(e) =>
                            updateEntry(
                              "experience",
                              item.id,
                              "company",
                              e.target.value
                            )
                          }
                          placeholder="Company Name"
                        />
                      </div>

                      <div className="resume-input-group">
                        <label>Start Date</label>
                        <input
                          value={item.startDate}
                          onChange={(e) =>
                            updateEntry(
                              "experience",
                              item.id,
                              "startDate",
                              e.target.value
                            )
                          }
                          placeholder="Jan 2025"
                        />
                      </div>

                      <div className="resume-input-group">
                        <label>End Date</label>
                        <input
                          value={item.endDate}
                          onChange={(e) =>
                            updateEntry(
                              "experience",
                              item.id,
                              "endDate",
                              e.target.value
                            )
                          }
                          placeholder="Present"
                        />
                      </div>

                      <div className="resume-input-group full-width">
                        <label>Responsibilities / Achievements</label>
                        <textarea
                          value={item.description}
                          onChange={(e) =>
                            updateEntry(
                              "experience",
                              item.id,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Describe your responsibilities and achievements..."
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  className="resume-add-btn"
                  onClick={() =>
                    addEntry("experience", {
                      position: "",
                      company: "",
                      startDate: "",
                      endDate: "",
                      description: "",
                    })
                  }
                >
                  <Plus size={16} /> Add Experience
                </button>
              </div>

              {/* Projects */}

              <div className="resume-editor-card">
                {renderSectionHeading(
                  <FolderKanban size={19} />,
                  "Projects"
                )}

                {resume.projects.map((item, index) => (
                  <div className="resume-entry" key={item.id}>
                    <div className="resume-entry-heading">
                      <span>PROJECT {index + 1}</span>

                      <button
                        onClick={() =>
                          deleteEntry("projects", item.id)
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="resume-input-grid">
                      <div className="resume-input-group">
                        <label>Project Name</label>
                        <input
                          value={item.name}
                          onChange={(e) =>
                            updateEntry(
                              "projects",
                              item.id,
                              "name",
                              e.target.value
                            )
                          }
                          placeholder="AI Powered Application"
                        />
                      </div>

                      <div className="resume-input-group">
                        <label>Technologies Used</label>
                        <input
                          value={item.technologies}
                          onChange={(e) =>
                            updateEntry(
                              "projects",
                              item.id,
                              "technologies",
                              e.target.value
                            )
                          }
                          placeholder="React, Node.js, MongoDB"
                        />
                      </div>

                      <div className="resume-input-group full-width">
                        <label>Project Description</label>
                        <textarea
                          value={item.description}
                          onChange={(e) =>
                            updateEntry(
                              "projects",
                              item.id,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Explain what you built and its key features..."
                        />
                      </div>

                      <div className="resume-input-group full-width">
                        <label>Project Link</label>
                        <input
                          value={item.link}
                          onChange={(e) =>
                            updateEntry(
                              "projects",
                              item.id,
                              "link",
                              e.target.value
                            )
                          }
                          placeholder="GitHub or live project URL"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  className="resume-add-btn"
                  onClick={() =>
                    addEntry("projects", {
                      name: "",
                      technologies: "",
                      description: "",
                      link: "",
                    })
                  }
                >
                  <Plus size={16} /> Add Project
                </button>
              </div>

              {/* Skills */}

              <div className="resume-editor-card">
                {renderSectionHeading(
                  <Code size={19} />,
                  "Skills"
                )}

                <p className="resume-section-description">
                  Add your technical and professional skills.
                </p>

                <div className="resume-skills-editor">
                  {resume.skills.map((skill, index) => (
                    <div className="resume-skill-input" key={index}>
                      <input
                        value={skill}
                        onChange={(e) =>
                          updateSkill(index, e.target.value)
                        }
                        placeholder="e.g. JavaScript"
                      />

                      <button onClick={() => deleteSkill(index)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                <button className="resume-add-btn" onClick={addSkill}>
                  <Plus size={16} /> Add Skill
                </button>
              </div>

              {/* Certifications */}

              <div className="resume-editor-card">
                {renderSectionHeading(
                  <Award size={19} />,
                  "Certifications"
                )}

                {resume.certifications.map((item, index) => (
                  <div className="resume-entry" key={item.id}>
                    <div className="resume-entry-heading">
                      <span>CERTIFICATION {index + 1}</span>

                      <button
                        onClick={() =>
                          deleteEntry("certifications", item.id)
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="resume-input-grid">
                      <div className="resume-input-group">
                        <label>Certificate Name</label>
                        <input
                          value={item.name}
                          onChange={(e) =>
                            updateEntry(
                              "certifications",
                              item.id,
                              "name",
                              e.target.value
                            )
                          }
                          placeholder="Certificate Name"
                        />
                      </div>

                      <div className="resume-input-group">
                        <label>Issuing Organization</label>
                        <input
                          value={item.issuer}
                          onChange={(e) =>
                            updateEntry(
                              "certifications",
                              item.id,
                              "issuer",
                              e.target.value
                            )
                          }
                          placeholder="Organization Name"
                        />
                      </div>

                      <div className="resume-input-group">
                        <label>Year</label>
                        <input
                          value={item.year}
                          onChange={(e) =>
                            updateEntry(
                              "certifications",
                              item.id,
                              "year",
                              e.target.value
                            )
                          }
                          placeholder="2025"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  className="resume-add-btn"
                  onClick={() =>
                    addEntry("certifications", {
                      name: "",
                      issuer: "",
                      year: "",
                    })
                  }
                >
                  <Plus size={16} /> Add Certification
                </button>
              </div>
            </section>

            <aside className="resume-sidebar">
              <div className="resume-sidebar-card">
                <h3>Resume Overview</h3>

                <div className="resume-stat">
                  <span>Education</span>
                  <strong>{resume.education.length}</strong>
                </div>

                <div className="resume-stat">
                  <span>Experience</span>
                  <strong>{resume.experience.length}</strong>
                </div>

                <div className="resume-stat">
                  <span>Projects</span>
                  <strong>{resume.projects.length}</strong>
                </div>

                <div className="resume-stat">
                  <span>Skills</span>
                  <strong>
                    {resume.skills.filter((s) => s.trim()).length}
                  </strong>
                </div>

                <div className="resume-stat">
                  <span>Certifications</span>
                  <strong>{resume.certifications.length}</strong>
                </div>
              </div>

              <div className="resume-sidebar-card">
                <h3>Resume Tips</h3>

                <ul>
                  <li>Keep your resume concise.</li>
                  <li>Use measurable achievements.</li>
                  <li>Highlight relevant technical skills.</li>
                  <li>Include your best projects.</li>
                  <li>Check spelling before downloading.</li>
                </ul>
              </div>

              <div className="resume-sidebar-card resume-tip-card">
                <FileText size={22} />

                <h3>Professional Resume</h3>

                <p>
                  Your resume is automatically saved in your browser.
                  Preview it before downloading.
                </p>
              </div>
            </aside>
          </div>
        ) : (
          <section className="resume-preview">
            <div className="resume-paper">

              <div className="resume-paper-header">
                <h1>{resume.personal.name || "Your Name"}</h1>

                <h2>
                  {resume.personal.role || "Professional Title"}
                </h2>

                <div className="resume-contact">
                  {resume.personal.email && (
                    <span>
                      <Mail size={13} />
                      {resume.personal.email}
                    </span>
                  )}

                  {resume.personal.phone && (
                    <span>
                      <Phone size={13} />
                      {resume.personal.phone}
                    </span>
                  )}

                  {resume.personal.location && (
                    <span>
                      <MapPin size={13} />
                      {resume.personal.location}
                    </span>
                  )}

                  {resume.personal.linkedin && (
                    <span>
                     <Globe size={13} />
                      {resume.personal.linkedin}
                    </span>
                  )}

                  {resume.personal.website && (
                    <span>
                      <Globe size={13} />
                      {resume.personal.website}
                    </span>
                  )}
                </div>
              </div>

              {resume.summary && (
                <div className="resume-paper-section">
                  <h3>PROFESSIONAL SUMMARY</h3>
                  <p>{resume.summary}</p>
                </div>
              )}

              {resume.education.some(
                (item) => item.institution || item.degree
              ) && (
                <div className="resume-paper-section">
                  <h3>EDUCATION</h3>

                  {resume.education.map((item) => (
                    <div className="resume-paper-entry" key={item.id}>
                      <div className="resume-paper-entry-top">
                        <strong>{item.degree}</strong>

                       <span>
                          {item.startDate}
                          {item.endDate && ` - ${item.endDate}`}
                        </span>
                      </div>

                      <div>{item.institution}</div>

                      {item.description && (
                        <p>{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {resume.experience.some(
                (item) => item.position || item.company
              ) && (
                <div className="resume-paper-section">
                  <h3>WORK EXPERIENCE</h3>

                  {resume.experience.map((item) => (
                    <div className="resume-paper-entry" key={item.id}>
                      <div className="resume-paper-entry-top">
                        <strong>{item.position}</strong>

                        <span>
                          {item.startDate}
                          {item.endDate && ` - ${item.endDate}`}
                        </span>
                      </div>

                      <div>{item.company}</div>

                      {item.description && (
                        <p>{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {resume.projects.some(
                (item) => item.name || item.description
              ) && (
                <div className="resume-paper-section">
                  <h3>PROJECTS</h3>

                  {resume.projects.map((item) => (
                    <div className="resume-paper-entry" key={item.id}>
                      <div className="resume-paper-entry-top">
                        <strong>{item.name}</strong>
                        <span>{item.technologies}</span>
                      </div>

                      {item.description && (
                        <p>{item.description}</p>
                      )}

                      {item.link && (
                        <a href={item.link} target="_blank" rel="noreferrer">
                          {item.link}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {resume.skills.some((skill) => skill.trim()) && (
                <div className="resume-paper-section">
                  <h3>SKILLS</h3>

                  <div className="resume-paper-skills">
                    {resume.skills
                      .filter((skill) => skill.trim())
                      .map((skill, index) => (
                        <span key={index}>{skill}</span>
                      ))}
                  </div>
                </div>
              )}

              {resume.certifications.some(
                (item) => item.name || item.issuer
              ) && (
                <div className="resume-paper-section">
                  <h3>CERTIFICATIONS</h3>

                  {resume.certifications.map((item) => (
                    <div className="resume-paper-entry" key={item.id}>
                      <div className="resume-paper-entry-top">
                        <strong>{item.name}</strong>
                        <span>{item.year}</span>
                      </div>

                      <div>{item.issuer}</div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default ResumeMaker;