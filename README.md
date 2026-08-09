# Personal Blog

A static personal blog built with HTML, CSS, and vanilla JavaScript — plus a Python CLI for managing posts.

## Project structure

```
index.html       — Main page (home, blog listing, about, single-post view)
style.css        — All styles, light/dark themes, responsive layout
i18n.js          — Translations (Chinese / English)
posts/           — Post data: one .json per post, plus generated index.js
script.js        — App logic (routing, rendering, search, theme, language toggle)
manage.py        — CLI tool for managing blog posts
```

## Quick start

Open `index.html` in a browser. No build step or server required.

---

## Managing posts with `manage.py`

All post data lives as individual files in `posts/`. Use `manage.py` to create, edit, or delete posts, then run `build` to update the site.

### List all posts

```bash
python manage.py list
```

Prints a summary table:

```
ID   Title                                              Tag              Date
------------------------------------------------------------------------------------
1    The Art of Writing Clean Components                Engineering      2026-07-28
2    Understanding the CSS Cascade                      CSS              2026-07-14
...
```

### Show a post

```bash
python manage.py show <id>
```

Prints every field: title, subtitle, tag, date, read time (with word count), excerpt, and a body preview.

```bash
python manage.py show 3
```

### Create a new post

```bash
python manage.py new
```

Interactive flow:
1. Prompts for **title**, **subtitle**, **tag**, **date**, **read time**, and **excerpt**
2. Opens your text editor (`$EDITOR`) to write the body HTML
3. Saves to `posts/<id>.json`

Defaults: date → today, read time → auto-computed from word count.

To skip the editor and read the body from a file:

```bash
python manage.py new --body-file draft.html
```

### Edit a post

```bash
python manage.py edit <id>
```

Same flow as `new`, but every prompt is pre-filled with the current value. Press Enter to keep it.

```bash
python manage.py edit 3
python manage.py edit 3 --body-file updated.html
```

### Delete a post

```bash
python manage.py delete <id>
```

Shows the post title and asks for confirmation before removing.

```bash
python manage.py delete 5
python manage.py delete 5 --force   # skip confirmation
```

### Build (update the site)

```bash
python manage.py build
```

Generates `posts/index.js` (full post data as JavaScript) from the `posts/` directory. **Run this after any create/edit/delete** for changes to appear in the browser.

---

## Post fields

| Field | Format | Notes |
|-------|--------|-------|
| `title` | Text | Required |
| `subtitle` | Text | Required, shown below title in post view |
| `tag` | Text | Required, used for filtering (e.g. `Engineering`, `CSS`) |
| `date` | `YYYY-MM-DD` | Required, defaults to today |
| `readTime` | `"N min read"` | Auto-computed if blank or set to `"auto"` (~200 wpm) |
| `excerpt` | Plain text | Required, shown on post cards |
| `body` | HTML | Required, written/edited in `$EDITOR` |

---

## Editor setup

The `new` and `edit` commands open your preferred text editor for writing the post body. It checks, in order:

1. `$EDITOR` environment variable
2. `$VISUAL` environment variable
3. VS Code (`code`)
4. Notepad (Windows) or nano (Linux/macOS)

To use VS Code: `set EDITOR=code` (Windows) or `export EDITOR=code` (Unix).
