# Personal Portfolio

A fast, dependency-free portfolio site. Plain HTML, CSS, and a small amount of JavaScript. No build step.

## Structure

```
index.html          all page content lives here
css/style.css       design tokens, layout, components, dark mode
js/main.js          theme toggle, mobile nav, active section highlighting
assets/favicon.svg  tab icon
assets/             put portrait.jpg and resume.pdf here
```

## Editing content

Everything you'd want to change is in `index.html`:

- **Hero**: name, tagline, and the availability line.
- **Selected work**: each `<li class="work-item">` is one project. Set the link `href` to the live site or repo, and edit the year, type, title, description, and tags.
- **About**: bio paragraphs and the "What I work with" list. Swap the portrait placeholder for `<img src="assets/portrait.jpg" alt="…">`.
- **Experience**: each `<li class="timeline-item">` is one role or degree.
- **Contact**: email address and social links.

Colours and fonts are CSS custom properties at the top of `css/style.css`. Change `--accent`, `--bg`, and `--ink` there and the whole site follows. Dark mode has its own block just below.

## Running locally

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Deploying to GitHub Pages

1. Push to the `main` branch.
2. In the repository settings, open **Pages** and set the source to **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The site will be live at `https://<username>.github.io/<repo>/` within a minute or two.
