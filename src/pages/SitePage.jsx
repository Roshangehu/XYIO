import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

const pageContent = {
  about: {
    title: "Everything digital, one place.",
    intro:
      "XYLO brings practical browser-based tools and useful digital services together, so you can get everyday tasks done without hunting across the web.",
    sections: [
      {
        title: "Useful by design",
        body: "Browse the collection by category, search by name or task, and save the tools you use most. XYLO is designed to work without an account.",
      },
      {
        title: "A growing collection",
        body: "The catalog includes PDF and image utilities, study and productivity tools, and links to services from across the web.",
      },
    ],
  },
  privacy: {
    title: "Privacy policy",
    intro:
      "XYLO does not ask you to create an account. This page explains the data used by the site and its browser-based tools.",
    sections: [
      {
        title: "Your files and tool data",
        body: "Where a tool processes a file in your browser, the file stays on your device. Some tools may load libraries or machine-learning models from external providers. Review a tool's behavior before using it with sensitive information.",
      },
      {
        title: "Local preferences",
        body: "XYLO stores your selected theme, recently used tools, and favorites in your browser's local storage. Search, category, and scroll state are kept in session storage to restore your homepage when you return.",
      },
      {
        title: "External services",
        body: "Links to third-party websites leave XYLO. Those sites have their own privacy policies and may collect information according to their terms.",
      },
      {
        title: "Questions",
        body: "If you have a privacy question or want to report a concern, use the project contact link below.",
      },
    ],
  },
  terms: {
    title: "Terms of use",
    intro:
      "XYLO and its tools are provided for general convenience. By using the site, you agree to use it lawfully and to check outputs before relying on them.",
    sections: [
      {
        title: "Your responsibility",
        body: "You are responsible for the files and data you choose to process, and for keeping your own copies of important originals and results.",
      },
      {
        title: "No professional advice",
        body: "Calculations, generated documents, and other outputs are informational and may not be accurate for every situation. Verify important results independently and seek qualified advice when needed.",
      },
      {
        title: "Third-party services",
        body: "Third-party websites are provided for convenience. XYLO does not control their availability, content, or terms.",
      },
      {
        title: "Availability",
        body: "Features may change or become unavailable. Use the tools at your own discretion and do not rely on XYLO as the sole copy of important information.",
      },
    ],
  },
};

function ContactPage() {
  return (
    <>
      <p className="site-lead">
        Have a question, found a problem, or want to suggest a useful tool?
      </p>
      <div className="site-info-card">
        <h2>Get in touch</h2>
        <p>
          XYLO is maintained in the open. Use the project issue tracker to
          report a bug, ask a question, or share a suggestion.
        </p>
        <a
          className="site-primary-link"
          href="https://github.com/Roshangehu/XYIO/issues/new"
          target="_blank"
          rel="noopener noreferrer"
        >
          Contact the project <ArrowUpRight size={17} />
        </a>
      </div>
      <div className="site-info-card">
        <h2>Submitting a tool</h2>
        <p>
          Include the tool name, its website, and a short description in your
          suggestion. Never include private information in a public issue.
        </p>
      </div>
    </>
  );
}

function FAQPage() {
  const questions = [
    [
      "Are XYLO's tools free?",
      "The tools in this collection are available without a XYLO account. A linked third-party service may have its own fees or usage limits.",
    ],
    [
      "Do I need to sign up?",
      "No XYLO account is required. Favorites and recently used tools are saved only in your browser.",
    ],
    [
      "Are my files uploaded?",
      "Many tools process files in your browser, but some features may load external libraries or models. Check the relevant tool and avoid using sensitive files unless you understand how they are handled.",
    ],
    [
      "Why can't I find a tool?",
      "Search by the tool name, category, or a related task. You can also send a suggestion from the Contact page.",
    ],
    [
      "How do I clear favorites or recent tools?",
      "Use the Favorites or Recently used filters on the homepage. Browser storage can also be cleared from your browser's site settings.",
    ],
  ];

  return (
    <>
      <p className="site-lead">
        Quick answers about the XYLO collection and your browser data.
      </p>
      <div className="site-faq-list">
        {questions.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </>
  );
}

function NotFoundPage() {
  return (
    <>
      <p className="site-lead">
        We couldn’t find the page you requested. It may have moved or the
        address may be incorrect.
      </p>
      <Link className="site-primary-link" to="/">
        <ArrowLeft size={17} /> Back to XYLO
      </Link>
    </>
  );
}

export default function SitePage({ page }) {
  if (page === "contact") {
    return (
      <SiteLayout title="Contact XYLO">
        <ContactPage />
      </SiteLayout>
    );
  }

  if (page === "faq") {
    return (
      <SiteLayout title="Frequently asked questions">
        <FAQPage />
      </SiteLayout>
    );
  }

  if (page === "notFound") {
    return (
      <SiteLayout title="Page not found">
        <NotFoundPage />
      </SiteLayout>
    );
  }

  const content = pageContent[page];
  if (!content) {
    return (
      <SiteLayout title="Page not found">
        <NotFoundPage />
      </SiteLayout>
    );
  }

  return (
    <SiteLayout title={content.title}>
      <p className="site-lead">{content.intro}</p>
      <div className="site-info-grid">
        {content.sections.map((section) => (
          <section className="site-info-card" key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
    </SiteLayout>
  );
}

function SiteLayout({ title, children }) {
  return (
    <div className="xylo site-page">
      <header className="site-header">
        <Link className="brand" to="/" aria-label="XYLO home">
          <span className="brand-mark">
            <span />
            <span />
          </span>
          XYLO
        </Link>
        <nav aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </header>
      <main className="site-content">
        <p className="section-kicker">
          <span />
          XYLO INFORMATION
        </p>
        <h1>{title}</h1>
        {children}
        <Link className="site-back-link" to="/">
          <ArrowLeft size={15} /> Back to all tools
        </Link>
      </main>
      <footer className="site-footer">
        <span>© 2026 XYLO. All rights reserved.</span>
        <nav aria-label="Legal">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </footer>
    </div>
  );
}
