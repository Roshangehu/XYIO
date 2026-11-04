import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  categoryDescriptions,
  homeSeo,
  SITE_ORIGIN,
  toolSeo,
} from "../src/seo/toolSeo.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(projectRoot, "dist");
const template = await readFile(path.join(outputDirectory, "index.html"), "utf8");

const escapeHtml = (value) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#39;");

const escapeJsonForHtml = (value) =>
  JSON.stringify(value).replaceAll("<", "\\u003c").replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026");

const structuredData = (tool) => ({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: tool.name,
  url: `${SITE_ORIGIN}${tool.route}`,
  description: tool.description,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
});

function buildHtml({ title, description, canonical, rootContent, schema }) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeCanonical = escapeHtml(canonical);
  const ldJson = schema
    ? `<script id="xylo-route-structured-data" type="application/ld+json">${escapeJsonForHtml(schema)}</script>`
    : "";
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`)
    .replace(
      /<meta\s+name="description"[\s\S]*?>/i,
      `<meta name="description" content="${safeDescription}" />`,
    )
    .replace(
      /<link\s+rel="canonical"[^>]*>/i,
      `<link rel="canonical" href="${safeCanonical}" />`,
    )
    .replace(
      /<meta\s+property="og:url"[^>]*>/i,
      `<meta property="og:url" content="${safeCanonical}" />`,
    )
    .replace(
      /<meta\s+property="og:title"[^>]*>/i,
      `<meta property="og:title" content="${safeTitle}" />`,
    )
    .replace(
      /<meta\s+property="og:description"[\s\S]*?>/i,
      `<meta property="og:description" content="${safeDescription}" />`,
    )
    .replace("</head>", `${ldJson}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${rootContent}</div>`);
  return html;
}

const categoryLinks = Object.entries(categoryDescriptions)
  .map(([category, description]) => {
    const links = toolSeo
      .filter((tool) => tool.category === category)
      .map(
        (tool) =>
          `<li><a href="${escapeHtml(tool.route)}">${escapeHtml(tool.name)}</a></li>`,
      )
      .join("\n");
    return `<section><h2>${escapeHtml(category)}</h2><p>${escapeHtml(description)}</p><ul>${links}</ul></section>`;
  })
  .join("\n");

const homepageCanonical = `${SITE_ORIGIN}/`;
const homepageContent = `<main class="seo-prerendered"><header><p>XYLO · FREE ONLINE TOOLS</p><h1>Everything Digital, One Place</h1><p>${escapeHtml(homeSeo.description)}</p></header><nav aria-label="Browse all XYLO tools"><h2>Explore all tools</h2>${categoryLinks}</nav></main>`;
const homepage = buildHtml({
  title: homeSeo.title,
  description: homeSeo.description,
  canonical: homepageCanonical,
  rootContent: homepageContent,
});
await writeFile(path.join(outputDirectory, "index.html"), homepage);

for (const tool of toolSeo) {
  const routeDirectory = path.join(
    outputDirectory,
    ...tool.route.split("/").filter(Boolean),
  );
  const canonical = `${SITE_ORIGIN}${tool.route}`;
  const pageContent = `<main class="seo-prerendered"><p>XYLO · ${escapeHtml(tool.category)}</p><h1>${escapeHtml(tool.h1)}</h1><p>${escapeHtml(tool.description)}</p><p><a href="/">Browse all free XYLO tools</a></p></main>`;
  const html = buildHtml({
    title: tool.title,
    description: tool.description,
    canonical,
    rootContent: pageContent,
    schema: structuredData(tool),
  });

  await mkdir(routeDirectory, { recursive: true });
  await Promise.all([
    writeFile(path.join(routeDirectory, "index.html"), html),
    writeFile(`${routeDirectory}.html`, html),
  ]);
}

const sitemapUrls = [
  { loc: homepageCanonical, changefreq: "weekly", priority: "1.0" },
  ...toolSeo.map((tool) => ({
    loc: `${SITE_ORIGIN}${tool.route}`,
    changefreq: "monthly",
    priority: "0.8",
  })),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls
  .map(
    (url) =>
      `  <url><loc>${escapeHtml(url.loc)}</loc><changefreq>${url.changefreq}</changefreq><priority>${url.priority}</priority></url>`,
  )
  .join("\n")}\n</urlset>\n`;
await writeFile(path.join(outputDirectory, "sitemap.xml"), sitemap);

console.log(`Prerendered homepage and ${toolSeo.length} tool pages; generated sitemap with ${sitemapUrls.length} URLs.`);
