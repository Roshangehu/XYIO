import { useState, useEffect, useRef, Suspense, lazy } from "react";
import {
  Search,
  ArrowRight,
  ArrowUpRight,
  FileText,
  Image,
  Sparkles,
  Code,
  BriefcaseBusiness,
  GraduationCap,
  Zap,
  PenTool,
  Globe,
  ShieldCheck,
  Layers,
  Sun,
  Moon,
  X,
  Scissors,
  Calculator,
  FileCode,
  ExternalLink,
  Menu,
} from "lucide-react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";

// Load PDF tools only when their routes are opened.
const PDFMerger = lazy(() => import("./pages/PDFMerger"));
const PDFSplitter = lazy(() => import("./pages/PDFSplitter"));
const PDFPageExtractor = lazy(() => import("./pages/PDFPageExtractor"));
const PDFPageRotator = lazy(() => import("./pages/PDFPageRotator"));
const JPGToPDF = lazy(() => import("./pages/JPGToPDF"));
const PDFCompressor = lazy(() => import("./pages/PDFCompressor"));
const PDFToWord = lazy(() => import("./pages/PDFToWord"));
const WordToPDF = lazy(() => import("./pages/WordToPDF"));
const PDFEditor = lazy(() => import("./pages/PDFEditor"));
const OCRPDF = lazy(() => import("./pages/OCRPDF"));

// Image Tools
const PNGToJPG = lazy(() => import("./pages/PNGToJPG"));
const JPGToPNG = lazy(() => import("./pages/JPGToPNG"));
const ImageCompressor = lazy(() => import("./pages/ImageCompressor"));
const ImageResizer = lazy(() => import("./pages/ImageResizer"));
const ImageCropper = lazy(() => import("./pages/ImageCropper"));
const ImageToBase64 = lazy(() => import("./pages/ImageToBase64"));
const Base64ToImage = lazy(() => import("./pages/Base64ToImage"));
const ImageConverter = lazy(() => import("./pages/ImageConverter"));
const HEICToJPG = lazy(() => import("./pages/HEICToJPG"));
const BackgroundRemover = lazy(() => import("./pages/BackgroundRemover"));

// Create & Build Tools
const SurveyMaker = lazy(() => import("./pages/SurveyMaker"));
const QuizMaker = lazy(() => import("./pages/QuizMaker"));
const PollMaker = lazy(() => import("./pages/PollMaker"));
const FormBuilder = lazy(() => import("./pages/FormBuilder"));
const ResumeMaker = lazy(() => import("./pages/ResumeMaker"));
const InvoiceGenerator = lazy(() => import("./pages/InvoiceGenerator"));
const CertificateMaker = lazy(() => import("./pages/CertificateMaker"));
const FlashcardMaker = lazy(() => import("./pages/FlashcardMaker"));
const TimetableMaker = lazy(() => import("./pages/TimetableMaker"));
const RandomNamePicker = lazy(() => import("./pages/RandomNamePicker"));
const categories = [
  {
    name: "PDF & Documents",
    desc: "Merge, convert, compress and edit documents.",
    count: 12,
    icon: FileText,
    color: "red",
  },
  {
    name: "Images & Graphics",
    desc: "Resize, optimize and transform images.",
    count: 18,
    icon: Image,
    color: "green",
  },
  {
    name: "AI & Machine Learning",
    desc: "Discover AI-powered tools and services.",
    count: 25,
    icon: Sparkles,
    color: "purple",
  },
  {
    name: "Developer Tools",
    desc: "Format, encode, test and debug.",
    count: 20,
    icon: Code,
    color: "blue",
  },
  {
    name: "Business & Finance",
    desc: "Invoices, GST, calculations and more.",
    count: 15,
    icon: BriefcaseBusiness,
    color: "orange",
  },
  {
    name: "Education",
    desc: "Calculators and useful student resources.",
    count: 10,
    icon: GraduationCap,
    color: "blue",
  },
  {
    name: "Productivity",
    desc: "Make everyday tasks easier.",
    count: 14,
    icon: Zap,
    color: "orange",
  },
  {
    name: "Design & Creative",
    desc: "Explore creative resources and utilities.",
    count: 9,
    icon: PenTool,
    color: "pink",
  },
];

const tools = [
  {
    name: "PDF Merger",
    desc: "Combine multiple PDF files into one.",
    category: "PDF & Documents",
    icon: FileText,
    color: "red",
    type: "internal",
    route: "/tools/pdf-merger",
  },
  {
    name: "PDF Splitter",
    desc: "Split a PDF into multiple files.",
    category: "PDF & Documents",
    icon: Scissors,
    color: "purple",
    type: "internal",
    route: "/tools/pdf-splitter",
  },
  {
    name: "PDF Page Rotator",
    desc: "Rotate PDF pages clockwise or counterclockwise.",
    category: "PDF & Documents",
    icon: FileText,
    color: "red",
    type: "internal",
    route: "/tools/pdf-page-rotator",
  },
  {
    name: "JPG to PDF",
    desc: "Convert multiple images into one PDF document.",
    category: "PDF & Documents",
    icon: FileText,
    color: "red",
    type: "internal",
    route: "/tools/jpg-to-pdf",
  },
  // 7. PDF Compressor
  {
    name: "PDF Compressor",
    desc: "Reduce PDF file size for easier sharing.",
    category: "PDF & Documents",
    icon: FileText,
    color: "orange",
    type: "internal",
    route: "/tools/pdf-compressor",
  },

  // 8. PDF to Word
  {
    name: "PDF to Word",
    desc: "Convert PDF documents into editable Word files.",
    category: "PDF & Documents",
    icon: FileText,
    color: "blue",
    type: "internal",
    route: "/tools/pdf-to-word",
  },

  // 9. Word to PDF
  {
    name: "Word to PDF",
    desc: "Convert Word documents into PDF files.",
    category: "PDF & Documents",
    icon: FileText,
    color: "blue",
    type: "internal",
    route: "/tools/word-to-pdf",
  },

  // 10. PDF Editor
  {
    name: "PDF Editor",
    desc: "Add text, images and annotations to PDF files.",
    category: "PDF & Documents",
    icon: FileText,
    color: "purple",
    type: "internal",
    route: "/tools/pdf-editor",
  },

  // 11. OCR PDF
  {
    name: "OCR PDF",
    desc: "Extract text from scanned PDF documents.",
    category: "PDF & Documents",
    icon: FileText,
    color: "green",
    type: "internal",
    route: "/tools/ocr-pdf",
  },
  {
    name: "PDF Page Extractor",
    desc: "Extract selected pages from a PDF.",
    category: "PDF & Documents",
    icon: FileText,
    color: "red",
    type: "internal",
    route: "/tools/pdf-page-extractor",
  },
  {
    name: "Image Compressor",
    desc: "Compress images without losing quality.",
    category: "Images & Graphics",
    icon: Image,
    color: "green",
    type: "internal",
    route: "/tools/image-compressor",
  },
  {
    name: "Image Resizer",
    desc: "Resize images to your preferred dimensions.",
    category: "Images & Graphics",
    icon: Image,
    color: "green",
    type: "internal",
    route: "/tools/image-resizer",
  },
  // Image Tools

  {
    name: "PNG to JPG",
    desc: "Convert PNG images into JPG format.",
    category: "Images & Graphics",
    icon: Image,
    color: "green",
    type: "internal",
    route: "/tools/png-to-jpg",
  },
  {
    name: "JPG to PNG",
    desc: "Convert JPG images into PNG format.",
    category: "Images & Graphics",
    icon: Image,
    color: "green",
    type: "internal",
    route: "/tools/jpg-to-png",
  },
  {
    name: "Image Cropper",
    desc: "Crop images to your preferred dimensions.",
    category: "Images & Graphics",
    icon: Image,
    color: "green",
    type: "internal",
    route: "/tools/image-cropper",
  },
  {
    name: "Image to Base64",
    desc: "Convert images into Base64 encoded strings.",
    category: "Images & Graphics",
    icon: Image,
    color: "blue",
    type: "internal",
    route: "/tools/image-to-base64",
  },
  {
    name: "Base64 to Image",
    desc: "Convert Base64 strings back into images.",
    category: "Images & Graphics",
    icon: Image,
    color: "blue",
    type: "internal",
    route: "/tools/base64-to-image",
  },
  {
    name: "Image Converter",
    desc: "Convert images between different formats.",
    category: "Images & Graphics",
    icon: Image,
    color: "purple",
    type: "internal",
    route: "/tools/image-converter",
  },
  {
    name: "HEIC to JPG",
    desc: "Convert HEIC photos into JPG images.",
    category: "Images & Graphics",
    icon: Image,
    color: "orange",
    type: "internal",
    route: "/tools/heic-to-jpg",
  },
  {
    name: "Background Remover",
    desc: "Remove backgrounds from images.",
    category: "Images & Graphics",
    icon: Image,
    color: "purple",
    type: "internal",
    route: "/tools/background-remover",
  },

  {
    name: "JSON Formatter",
    desc: "Format and validate JSON data.",
    category: "Developer Tools",
    icon: Code,
    color: "blue",
    type: "internal",
    route: "/tools/json-formatter",
  },
  {
    name: "GST Calculator",
    desc: "Calculate GST and tax breakdowns.",
    category: "Business & Finance",
    icon: Calculator,
    color: "orange",
    type: "internal",
    route: "/tools/gst-calculator",
  },
  {
    name: "CGPA Calculator",
    desc: "Calculate your semester GPA and CGPA.",
    category: "Education",
    icon: GraduationCap,
    color: "blue",
    type: "internal",
    route: "/tools/cgpa-calculator",
  },
  {
    name: "QR Code Generator",
    desc: "Generate QR codes for links and text.",
    category: "Productivity",
    icon: FileCode,
    color: "purple",
    type: "internal",
    route: "/tools/qr-generator",
  },

  // CREATE & BUILD TOOLS

{
  name: "Survey Maker",
  desc: "Create custom surveys and collect responses.",
  category: "Productivity",
  icon: FileText,
  color: "blue",
  type: "internal",
  route: "/tools/survey-maker",
},
{
  name: "Quiz Maker",
  desc: "Create interactive quizzes and test knowledge.",
  category: "Education",
  icon: GraduationCap,
  color: "purple",
  type: "internal",
  route: "/tools/quiz-maker",
},
{
  name: "Poll Maker",
  desc: "Create polls and collect votes.",
  category: "Productivity",
  icon: BarChart,
  color: "green",
  type: "internal",
  route: "/tools/poll-maker",
},
{
  name: "Form Builder",
  desc: "Build custom forms with multiple fields.",
  category: "Productivity",
  icon: FileText,
  color: "blue",
  type: "internal",
  route: "/tools/form-builder",
},
{
  name: "Resume Maker",
  desc: "Create a professional resume in minutes.",
  category: "Business & Finance",
  icon: BriefcaseBusiness,
  color: "orange",
  type: "internal",
  route: "/tools/resume-maker",
},
{
  name: "Invoice Generator",
  desc: "Generate professional invoices.",
  category: "Business & Finance",
  icon: Calculator,
  color: "orange",
  type: "internal",
  route: "/tools/invoice-generator",
},
{
  name: "Certificate Maker",
  desc: "Design and download certificates.",
  category: "Design & Creative",
  icon: Award,
  color: "purple",
  type: "internal",
  route: "/tools/certificate-maker",
},
{
  name: "Flashcard Maker",
  desc: "Create flashcards for effective learning.",
  category: "Education",
  icon: Layers,
  color: "blue",
  type: "internal",
  route: "/tools/flashcard-maker",
},
{
  name: "Timetable Maker",
  desc: "Create and organize your weekly timetable.",
  category: "Productivity",
  icon: GraduationCap,
  color: "green",
  type: "internal",
  route: "/tools/timetable-maker",
},
{
  name: "Random Name Picker",
  desc: "Pick random names from a list.",
  category: "Productivity",
  icon: Shuffle,
  color: "purple",
  type: "internal",
  route: "/tools/random-name-picker",
},
];

const externalTools = [
  {
    name: "ChatGPT",
    desc: "AI assistant for research, writing and problem solving.",
    category: "AI",
    url: "https://chatgpt.com",
  },
  {
    name: "Canva",
    desc: "Create presentations, graphics and designs.",
    category: "Design",
    url: "https://www.canva.com",
  },
  {
    name: "GitHub",
    desc: "Build and collaborate on software projects.",
    category: "Development",
    url: "https://github.com",
  },
  {
    name: "Figma",
    desc: "Design interfaces and collaborate with teams.",
    category: "Design",
    url: "https://www.figma.com",
  },
];

function HomePage() {
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  const searchRef = useRef(null);

  const filteredTools = tools.filter((tool) => {
    const matchesSearch = `${tool.name} ${tool.desc} ${tool.category}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      activeCategory === "All" || tool.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const suggestions = search.trim()
    ? tools
        .filter((tool) =>
          `${tool.name} ${tool.desc} ${tool.category}`
            .toLowerCase()
            .includes(search.toLowerCase()),
        )
        .slice(0, 5)
    : [];

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const selectSuggestion = (tool) => {
    setSearch(tool.name);
    setShowSuggestions(false);
    setActiveCategory("All");
    scrollTo("tools");
  };

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }

      if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className={`xylo ${dark ? "dark" : ""}`}>
      {/* NAVIGATION */}

      <header className="navbar">
        <div className="nav-inner">
          <a href="#" className="brand">
            <span className="brand-mark">
              <span></span>
              <span></span>
            </span>
            <span>XYLO</span>
          </a>

          <span className="brand-divider"></span>

          <span className="brand-tagline">Everything Digital, One Place.</span>

          <nav className="nav-links">
            <a href="#tools">Tools</a>
            <a href="#categories">Categories</a>
            <a href="#discover">Discover</a>
            <a href="#submit">Submit</a>
          </nav>

          <div className="nav-actions">
            <button
              className="nav-icon"
              aria-label="Focus search"
              onClick={() => searchRef.current?.focus()}
            >
              <Search size={20} />
            </button>

            <button
              className="theme-toggle"
              onClick={() => setDark(!dark)}
              aria-label="Toggle theme"
              title="Toggle dark mode"
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            <button
              className="get-started"
              onClick={() => scrollTo("categories")}
            >
              Explore tools
            </button>

            <button
              className="mobile-menu"
              onClick={() => scrollTo("categories")}
              aria-label="Explore categories"
            >
              <Menu />
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}

      <section className="hero">
        <div className="hero-left">
          <div className="eyebrow">
            <span></span>
            YOUR DIGITAL TOOLBOX
          </div>

          <h1>
            The right tool for
            <br />
            whatever you're
            <br />
            <em>trying to do.</em>
          </h1>

          <p className="hero-text">
            Free online tools, useful websites and digital services —
            thoughtfully brought together in one place.
          </p>

          {/* SEARCH */}

          <div className="search-wrapper">
            <div className="search-box">
              <Search size={22} />

              <input
                ref={searchRef}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowSuggestions(true);
                  setActiveCategory("All");
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search tools, websites or categories..."
              />

              {search && (
                <button
                  className="clear-search"
                  onClick={() => {
                    setSearch("");
                    setShowSuggestions(false);
                  }}
                  aria-label="Clear search"
                >
                  <X size={17} />
                </button>
              )}

              <span className="shortcut">Ctrl K</span>

              <button
                className="search-submit"
                onClick={() => {
                  setShowSuggestions(false);
                  scrollTo("tools");
                }}
                aria-label="Search"
              >
                <ArrowRight size={21} />
              </button>
            </div>

            {showSuggestions && search.trim() && (
              <div className="suggestion-panel">
                {suggestions.length > 0 ? (
                  <>
                    {suggestions.map((tool) => {
                      const Icon = tool.icon;

                      return (
                        <button
                          className="suggestion-item"
                          key={tool.name}
                          onClick={() => selectSuggestion(tool)}
                        >
                          <span className={`tool-icon ${tool.color}`}>
                            <Icon size={19} />
                          </span>

                          <span className="suggestion-info">
                            <strong>{tool.name}</strong>
                            <small>{tool.desc}</small>
                          </span>

                          <ArrowRight size={17} />
                        </button>
                      );
                    })}
                  </>
                ) : (
                  <div className="no-suggestions">No matching tools found.</div>
                )}

                <button
                  className="suggestion-footer"
                  onClick={() => {
                    setShowSuggestions(false);
                    scrollTo("tools");
                  }}
                >
                  View all search results <ArrowRight size={15} />
                </button>
              </div>
            )}
          </div>

          <div className="popular-searches">
            <strong>Popular:</strong>

            {["PDF", "AI Tools", "Images", "Business"].map((item) => (
              <button
                key={item}
                onClick={() => {
                  setSearch(item);
                  setShowSuggestions(false);
                  scrollTo("tools");
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* HERO VISUAL */}

        <div className="hero-right">
          <div className="visual-orbit"></div>

          <div className="visual-glow"></div>

          <div className="floating-tool pdf-card">
            <span className="tool-icon red">
              <FileText size={27} />
            </span>

            <div>
              <strong>PDF Merger</strong>
              <p>Merge multiple PDFs in seconds.</p>
            </div>
          </div>

          <div className="floating-tool image-card">
            <span className="tool-icon green">
              <Image size={27} />
            </span>

            <div>
              <strong>Image Compressor</strong>
              <p>Reduce image size without quality loss.</p>
            </div>
          </div>

          <div className="floating-tool code-card">
            <span className="tool-icon blue">
              <Code size={27} />
            </span>

            <div>
              <strong>JSON Formatter</strong>
              <p>Format and validate JSON data.</p>
            </div>
          </div>

          <div className="floating-tool ai-card">
            <span className="tool-icon purple">
              <Sparkles size={27} />
            </span>

            <div>
              <strong>AI Tools</strong>
              <p>Explore powerful AI utilities.</p>
            </div>
          </div>

          <div className="xylo-center-logo">
            <div className="brand-mark">
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}

      <section className="benefits">
        <div className="benefit">
          <Zap />
          <div>
            <strong>100+ Tools</strong>
            <span>Free to use</span>
          </div>
        </div>

        <div className="benefit">
          <Layers />
          <div>
            <strong>15+ Categories</strong>
            <span>Explore & discover</span>
          </div>
        </div>

        <div className="benefit">
          <span className="infinity">∞</span>
          <div>
            <strong>No Sign-Up</strong>
            <span>Use instantly</span>
          </div>
        </div>

        <div className="benefit">
          <ShieldCheck />
          <div>
            <strong>Privacy First</strong>
            <span>No account needed</span>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}

      <section className="content-section" id="categories">
        <div className="section-heading">
          <div>
            <div className="section-kicker">
              <span></span>
              EXPLORE THE COLLECTION
            </div>

            <h2>Find tools by category.</h2>

            <p>Everything organized, nothing complicated.</p>
          </div>

          <button
            className="view-all"
            onClick={() => {
              setActiveCategory("All");
              scrollTo("tools");
            }}
          >
            View all categories <ArrowUpRight size={19} />
          </button>
        </div>

        <div className="category-grid">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <button
                className="category-card"
                key={category.name}
                onClick={() => {
                  setActiveCategory(category.name);
                  setSearch("");
                  scrollTo("tools");
                }}
              >
                <span className={`category-icon ${category.color}`}>
                  <Icon size={27} />
                </span>

                <div className="category-info">
                  <h3>{category.name}</h3>
                  <p>{category.desc}</p>
                </div>

                <span className="category-count">{category.count} tools</span>

                <ArrowUpRight className="category-arrow" size={17} />
              </button>
            );
          })}
        </div>
      </section>

      {/* POPULAR TOOLS */}

      <section className="content-section tools-section" id="tools">
        <div className="section-heading">
          <div>
            <div className="section-kicker">
              <span></span>
              OUR COLLECTION
            </div>

            <h2>Tools worth knowing.</h2>

            <p>Simple utilities for your everyday tasks.</p>
          </div>

          <span className="result-count">{filteredTools.length} tools</span>
        </div>

        <div className="filter-row">
          <button
            className={activeCategory === "All" ? "filter-active" : ""}
            onClick={() => setActiveCategory("All")}
          >
            All tools
          </button>

          {categories.map((category) => (
            <button
              key={category.name}
              className={
                activeCategory === category.name ? "filter-active" : ""
              }
              onClick={() => setActiveCategory(category.name)}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="tools-grid">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;

            return (
              <article className="tool-card" key={tool.name}>
                <div className="tool-card-top">
                  <span className={`tool-icon ${tool.color}`}>
                    <Icon size={24} />
                  </span>

                  <span className="free-badge">FREE</span>
                </div>

                <span className="tool-category">{tool.category}</span>

                <h3>{tool.name}</h3>

                <p>{tool.desc}</p>

                <button
                  className="tool-action"
                  onClick={() => navigate(tool.route)}
                >
                  Use tool <ArrowRight size={17} />
                </button>
              </article>
            );
          })}

          {filteredTools.length === 0 && (
            <p className="empty-result">No matching tools found.</p>
          )}
        </div>
      </section>

      {/* EXTERNAL SERVICES */}

      <section className="discover-section" id="discover">
        <div className="section-heading">
          <div>
            <div className="section-kicker">
              <span></span>
              DISCOVER MORE
            </div>

            <h2>Good tools exist everywhere.</h2>

            <p>
              Discover websites, software and digital services created around
              the world.
            </p>
          </div>

          <Globe size={40} strokeWidth={1.3} />
        </div>

        <div className="external-grid">
          {externalTools.map((tool) => (
            <a
              className="external-card"
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              key={tool.name}
            >
              <div className="external-top">
                <span>{tool.category}</span>
                <ExternalLink size={18} />
              </div>

              <h3>{tool.name}</h3>

              <p>{tool.desc}</p>

              <span className="external-link">
                Visit website <ArrowUpRight size={16} />
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* SUBMIT */}

      <section className="submit-section" id="submit">
        <div>
          <div className="section-kicker">
            <span></span>
            FOR CREATORS & DEVELOPERS
          </div>

          <h2>Built something useful?</h2>

          <p>
            Share your creation with people looking for useful digital tools and
            services.
          </p>
        </div>

        <button className="submit-button">
          Submit your tool <ArrowUpRight size={18} />
        </button>
      </section>

      {/* FOOTER */}

      <footer className="footer">
        <div className="footer-top">
          <div>
            <a href="#" className="brand">
              <span className="brand-mark">
                <span></span>
                <span></span>
              </span>
              XYLO
            </a>

            <p>Everything Digital, One Place.</p>
          </div>

          <div className="footer-links">
            <a href="#tools">Tools</a>
            <a href="#categories">Categories</a>
            <a href="#discover">Discover</a>
            <a href="#submit">Submit</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 XYLO. All rights reserved.</span>
          <span>Discover. Explore. Get things done.</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={<div className="tool-loading">Loading XYLO tool...</div>}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/tools/pdf-merger" element={<PDFMerger />} />
          <Route path="/tools/pdf-splitter" element={<PDFSplitter />} />
          <Route
            path="/tools/pdf-page-extractor"
            element={<PDFPageExtractor />}
          />
          <Route path="/tools/pdf-page-rotator" element={<PDFPageRotator />} />
          <Route path="/tools/jpg-to-pdf" element={<JPGToPDF />} />

          <Route path="/tools/pdf-compressor" element={<PDFCompressor />} />
          <Route path="/tools/pdf-to-word" element={<PDFToWord />} />
          <Route path="/tools/word-to-pdf" element={<WordToPDF />} />
          <Route path="/tools/pdf-editor" element={<PDFEditor />} />
          <Route path="/tools/ocr-pdf" element={<OCRPDF />} />
          {/* Image Tools */}

          <Route path="/tools/png-to-jpg" element={<PNGToJPG />} />
          <Route path="/tools/jpg-to-png" element={<JPGToPNG />} />
          <Route path="/tools/image-compressor" element={<ImageCompressor />} />
          <Route path="/tools/image-resizer" element={<ImageResizer />} />
          <Route path="/tools/image-cropper" element={<ImageCropper />} />
          <Route path="/tools/image-to-base64" element={<ImageToBase64 />} />
          <Route path="/tools/base64-to-image" element={<Base64ToImage />} />
          <Route path="/tools/image-converter" element={<ImageConverter />} />
          <Route path="/tools/heic-to-jpg" element={<HEICToJPG />} />
          <Route
            path="/tools/background-remover"
            element={<BackgroundRemover />}
          />

          {/* Create & Build Tools */}
          <Route path="/tools/survey-maker" element={<SurveyMaker />} />
          <Route path="/tools/quiz-maker" element={<QuizMaker />} />
          <Route path="/tools/poll-maker" element={<PollMaker />} />
          <Route path="/tools/form-builder" element={<FormBuilder />} />
          <Route path="/tools/resume-maker" element={<ResumeMaker />} />
          <Route
            path="/tools/invoice-generator"
            element={<InvoiceGenerator />}
          />
          <Route
            path="/tools/certificate-maker"
            element={<CertificateMaker />}
          />
          <Route path="/tools/flashcard-maker" element={<FlashcardMaker />} />
          <Route path="/tools/timetable-maker" element={<TimetableMaker />} />
          <Route
            path="/tools/random-name-picker"
            element={<RandomNamePicker />}
          />
          <Route path="*" element={<h2>404 — Page not found</h2>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
