import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { homeSeo, SITE_ORIGIN, toolSeoByRoute } from "./toolSeo";

function setMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.setAttribute("content", content);
}

function setCanonical(url) {
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.append(element);
  }
  element.href = url;
}

export default function RouteSEO() {
  const { pathname } = useLocation();

  useEffect(() => {
    const route = pathname.replace(/\/+$/, "") || "/";
    const tool = toolSeoByRoute.get(route);
    const title = tool?.title || (route === "/" ? homeSeo.title : "XYLO — Everything Digital, One Place");
    const description = tool?.description || (route === "/" ? homeSeo.description : "Discover free PDF, image, study, productivity, business, and developer tools in one place with XYLO.");
    const canonical = `${SITE_ORIGIN}${route}`;

    document.title = title;
    setMeta("name", "description", description);
    setMeta("name", "robots", "index, follow");
    setMeta("property", "og:type", "website");
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonical);
    setCanonical(canonical);

    let structuredData = document.getElementById("xylo-route-structured-data");
    if (tool) {
      if (!structuredData) {
        structuredData = document.createElement("script");
        structuredData.id = "xylo-route-structured-data";
        structuredData.type = "application/ld+json";
        document.head.append(structuredData);
      }
      structuredData.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: tool.name,
        url: canonical,
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
    } else {
      structuredData?.remove();
    }
  }, [pathname]);

  return null;
}
