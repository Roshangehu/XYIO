# XYLO — Everything Digital, One Place

XYLO is a client-side React and Vite collection of PDF, image, creator, study, productivity, business, and developer tools, plus links to selected external services. Tools are code-split and loaded when their routes are opened.

## Development

```sh
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

## Browser storage

Favorites, recently opened tools, and the theme preference are stored in local storage. Homepage search, selected category, and scroll position are kept in session storage to restore navigation when returning from a tool.

Most file operations run in the browser. Some tools load large processing libraries or models only when needed. Review a tool's behavior before using sensitive data.

## Pages and SEO

About, Contact, Privacy, Terms, FAQ, tool suggestions, and the not-found page are available as client-side routes. Tool suggestions open a prefilled email draft to the project maintainer; the visitor reviews and sends it from their own email app.

`public/robots.txt` and `public/sitemap.xml` use the current deployment URL, `https://xylo-dun.vercel.app/`. Update those files and the canonical/Open Graph URL in `index.html` if the production domain changes.
