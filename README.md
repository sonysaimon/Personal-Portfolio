# Vancouver Visual Culture Archive

Sonny Saimon's portfolio and research archive. Plain HTML, CSS, and a small amount of JavaScript. No build step, no dependencies.

## Pages

| File | Section |
| --- | --- |
| `index.html` | Home: hero, archive themes, about the project, latest field notes, recent writing |
| `about.html` | The project, the method, background, and contact |
| `archive.html` | All entries in a filterable grid |
| `entry.html` | One archive entry. Duplicate this file for each new entry |
| `projects.html` | Longer research and photography projects |
| `field-notes.html` | Short dated notes from the field |
| `writing.html` | Essays and longer pieces |
| `reference.html` | Books, archives, and sources, grouped by theme |
| `concentration.html` | Current focus and what has been set aside |
| `questions.html` | Open, partly answered, and settled research questions |

Shared files:

```
css/style.css       design tokens, layout, components
js/main.js          mobile menu, archive filter, entry image gallery
assets/img/         placeholder images. Replace with photographs
assets/favicon.svg  tab icon
```

## Editing content

Every page is self-contained HTML, so edit the text in place.

- **Header and footer** are repeated in each page. To change the site name or a nav label, search and replace across all `.html` files.
- **Images** are SVG placeholders in `assets/img/`. Drop in your own JPGs and update the `src` attributes. Square images work best in the archive grid; the hero is 16:9.
- **Archive entries**: each `<li class="grid-item">` on `archive.html` has a `data-category` that drives the filter buttons. Add a button and matching category to add a theme.
- **New entry page**: copy `entry.html`, rename it, and fill in the six fields (location, date, observation, context, interpretation, academic connection). Link to it from `archive.html`.
- **Colours and type** are custom properties at the top of `css/style.css`. Display type is Oswald, body is Inter, both from Google Fonts.

## Running locally

Open any `.html` file in a browser, or serve the folder:

```
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Deploying to GitHub Pages

1. Push to the `main` branch.
2. In the repository settings, open **Pages** and set the source to **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The site will be live at `https://<username>.github.io/<repo>/` within a minute or two.
