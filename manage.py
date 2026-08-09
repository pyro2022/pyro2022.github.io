#!/usr/bin/env python3
"""Blog post manager for the static blog.

Usage:
  python manage.py list              List all posts
  python manage.py show <id>         Show full details of a post
  python manage.py new               Create a new post interactively
  python manage.py new --body-file PATH   Create with body from file
  python manage.py edit <id>         Edit an existing post
  python manage.py delete <id>       Delete a post
  python manage.py build             Generate posts/index.js from posts/ directory
"""

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import textwrap
from datetime import date

# Fix Windows console encoding for em-dash and other Unicode
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# --- Constants ---
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
POSTS_DIR = os.path.join(SCRIPT_DIR, "posts")
POSTS_INDEX = os.path.join(POSTS_DIR, "index.js")
WORDS_PER_MINUTE = 200


# ============================================================
#  Data helpers
# ============================================================

def load_posts():
    """Load all posts from posts/ directory. Returns empty list if dir missing."""
    posts = []
    if not os.path.isdir(POSTS_DIR):
        return posts
    for fname in sorted(os.listdir(POSTS_DIR)):
        if fname == "index.js":
            continue  # skip the generated index
        if fname.endswith(".json"):
            filepath = os.path.join(POSTS_DIR, fname)
            with open(filepath, "r", encoding="utf-8") as f:
                posts.append(json.load(f))
    return posts


def save_post(post):
    """Save a single post to posts/<id>.json."""
    os.makedirs(POSTS_DIR, exist_ok=True)
    path = os.path.join(POSTS_DIR, f"{post['id']}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(post, f, indent=2, ensure_ascii=False)
        f.write("\n")


def delete_post_file(post_id):
    """Delete a single post file from posts/<id>.json."""
    path = os.path.join(POSTS_DIR, f"{post_id}.json")
    if os.path.exists(path):
        os.remove(path)


def find_post(posts, post_id):
    """Return (index, post) for the given id, or (None, None)."""
    for i, p in enumerate(posts):
        if p["id"] == post_id:
            return i, p
    return None, None


def next_id(posts):
    """Return the next available post id."""
    if not posts:
        return 1
    return max(p["id"] for p in posts) + 1


def count_words(html_body):
    """Rough word count from HTML by stripping tags."""
    text = re.sub(r"<[^>]+>", " ", html_body)
    text = re.sub(r"&[a-z]+;", " ", text)
    return len(text.split())


def auto_read_time(html_body):
    """Compute an estimated reading-time string."""
    words = count_words(html_body)
    minutes = max(1, round(words / WORDS_PER_MINUTE))
    return f"{minutes} min read"


# ============================================================
#  Editor helpers
# ============================================================

def get_editor():
    """Return the user's preferred text editor command."""
    editor = os.environ.get("EDITOR") or os.environ.get("VISUAL")
    if editor:
        return editor
    # Windows fallbacks
    if sys.platform == "win32":
        for candidate in ["code.cmd", "notepad.exe"]:
            if shutil.which(candidate):
                return candidate
        return "notepad.exe"
    # Unix fallbacks
    for candidate in ["nano", "vim", "vi"]:
        if shutil.which(candidate):
            return candidate
    return None


def open_editor(initial_content=""):
    """Open the user's editor on a temp file. Returns the content if modified."""
    editor = get_editor()
    if not editor:
        print("Error: No text editor found. Set $EDITOR or use --body-file.", file=sys.stderr)
        sys.exit(1)

    # Build command — some editors need a --wait flag to block until the window closes
    cmd = [editor]
    editor_base = os.path.basename(editor).lower().replace(".cmd", "").replace(".exe", "")
    if editor_base in ("code", "subl", "sublime_text", "atom"):
        cmd.append("--wait")

    suffix = ".html"
    with tempfile.NamedTemporaryFile(mode="w", suffix=suffix, delete=False, encoding="utf-8") as tf:
        tf.write(initial_content)
        tmp_path = tf.name

    # Record mtime before opening editor
    mtime_before = os.path.getmtime(tmp_path)

    try:
        subprocess.run(cmd + [tmp_path], check=True, shell=False)

        # Check if file was touched at all
        mtime_after = os.path.getmtime(tmp_path)
        if mtime_after == mtime_before:
            # Editor didn't write — user likely closed without saving
            return initial_content

        with open(tmp_path, "r", encoding="utf-8") as tf:
            content = tf.read()
    except subprocess.CalledProcessError:
        print("Warning: Editor exited with an error.", file=sys.stderr)
        return initial_content
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass

    # Normalize both to detect frivolous changes (line endings, trailing whitespace)
    def normalize(s):
        return s.replace("\r\n", "\n").replace("\r", "\n").rstrip()

    if normalize(content) == normalize(initial_content):
        return initial_content  # no meaningful change

    return content


def read_body_from_file(path):
    """Read body content from a file path."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        print(f"Error: File not found: {path}", file=sys.stderr)
        sys.exit(1)
    except OSError as e:
        print(f"Error reading {path}: {e}", file=sys.stderr)
        sys.exit(1)


# ============================================================
#  Interactive prompts
# ============================================================

def prompt(prompt_text, default=""):
    """Prompt with an optional default value."""
    if default:
        result = input(f"{prompt_text} [{default}]: ").strip()
    else:
        result = input(f"{prompt_text}: ").strip()
    return result if result else default


def prompt_field(field_name, current=None, required=True):
    """Prompt for a single-line field."""
    if current:
        value = prompt(f"{field_name}", current)
    else:
        while True:
            value = prompt(field_name)
            if not required or value:
                break
            print("  This field is required.")
    return value


def collect_post_fields(current=None, body_file=None):
    """Interactively collect all post fields. Returns a post dict (without id)."""
    print()
    print("=== Blog Post Editor ===")
    print("(Press Enter to keep the current value shown in [brackets])")
    print()

    title = prompt_field("Title", current["title"] if current else None)
    subtitle = prompt_field("Subtitle", current["subtitle"] if current else None)
    tag = prompt_field("Tag (e.g. Engineering, CSS, Design)", current["tag"] if current else None)
    date_val = prompt_field(
        "Date (YYYY-MM-DD)",
        current["date"] if current else date.today().isoformat()
    )
    excerpt = prompt_field("Excerpt", current["excerpt"] if current else None)

    # Read time
    if current:
        rt_default = current["readTime"]
    else:
        rt_default = "auto"
    read_time = prompt("Read time (e.g. '5 min read', or blank for auto)", rt_default)

    # Body
    current_body = current["body"] if current else ""
    if body_file:
        body = read_body_from_file(body_file)
    else:
        mode = "edit" if current else "create"
        print(f"\n  Opening editor to {mode} the post body HTML...")
        if current_body:
            body = open_editor(current_body)
        else:
            starter = (
                "<p>Start writing your post here. You can use HTML tags like:</p>\n"
                "<h2>Section heading</h2>\n"
                "<p>Paragraph text...</p>\n"
                "<pre><code>code block</code></pre>\n"
            )
            body = open_editor(starter)

    # Auto read time if requested
    if not read_time or read_time == "auto":
        read_time = auto_read_time(body)

    return {
        "title": title,
        "subtitle": subtitle,
        "tag": tag,
        "date": date_val,
        "readTime": read_time,
        "excerpt": excerpt,
        "body": body,
    }


# ============================================================
#  Command implementations
# ============================================================

def cmd_list(posts):
    """Print a summary table of all posts."""
    if not posts:
        print("No posts yet. Create one with: python manage.py new")
        return

    # Column widths
    print()
    print(f"{'ID':<4} {'Title':<50} {'Tag':<16} {'Date':<14}")
    print("-" * 84)
    for p in sorted(posts, key=lambda x: x["id"]):
        title = p["title"][:48] + "…" if len(p["title"]) > 49 else p["title"]
        print(f"{p['id']:<4} {title:<50} {p['tag']:<16} {p['date']:<14}")
    print(f"\n{len(posts)} post(s) total.\n")


def cmd_show(posts, post_id):
    """Print full details of a single post."""
    _, post = find_post(posts, post_id)
    if not post:
        print(f"No post found with id {post_id}.", file=sys.stderr)
        sys.exit(1)

    print()
    print(f"  ID:       {post['id']}")
    print(f"  Title:    {post['title']}")
    print(f"  Subtitle: {post['subtitle']}")
    print(f"  Tag:      {post['tag']}")
    print(f"  Date:     {post['date']}")
    print(f"  Read:     {post['readTime']} ({count_words(post['body'])} words)")
    print(f"  Excerpt:  {post['excerpt']}")
    print(f"  Body:     ({len(post['body'])} chars)")
    print(f"             ── first line: {post['body'].split(chr(10), 1)[0].strip()[:80]}")
    print()


def cmd_new(posts, body_file=None):
    """Create a new post interactively."""
    fields = collect_post_fields(current=None, body_file=body_file)
    new_post = {"id": next_id(posts), **fields}
    posts.append(new_post)
    save_post(new_post)
    print(f"\n[OK] Post #{new_post['id']} \"{new_post['title']}\" created.")
    print(f"  Run 'python manage.py build' to update the site.")


def cmd_edit(posts, post_id, body_file=None):
    """Edit an existing post."""
    idx, post = find_post(posts, post_id)
    if not post:
        print(f"No post found with id {post_id}.", file=sys.stderr)
        sys.exit(1)

    print(f"\nEditing post #{post['id']}: \"{post['title']}\"")
    fields = collect_post_fields(current=post, body_file=body_file)

    # Check if anything actually changed
    changed = False
    for key in fields:
        old_val = post.get(key, "")
        new_val = fields[key]
        if old_val.strip() != new_val.strip():
            changed = True
            break

    if not changed:
        print(f"\n[OK] No changes detected — post not modified.")
        return

    posts[idx] = {"id": post["id"], **fields}
    save_post(posts[idx])
    print(f"\n[OK] Post #{post['id']} \"{fields['title']}\" updated.")
    print(f"  Run 'python manage.py build' to update the site.")


def cmd_delete(posts, post_id, force=False):
    """Delete a post with confirmation."""
    idx, post = find_post(posts, post_id)
    if not post:
        print(f"No post found with id {post_id}.", file=sys.stderr)
        sys.exit(1)

    if not force:
        print(f"\n  Post #{post['id']}: \"{post['title']}\"")
        confirm = input("  Delete this post? [y/N]: ").strip().lower()
        if confirm not in ("y", "yes"):
            print("  Cancelled.")
            return

    del posts[idx]
    delete_post_file(post_id)
    print(f"[OK] Post #{post_id} deleted.")
    print(f"  Run 'python manage.py build' to update the site.")


def cmd_build(posts):
    """Generate posts/index.js (full post data as JS) from posts/ directory."""
    os.makedirs(POSTS_DIR, exist_ok=True)
    with open(POSTS_INDEX, "w", encoding="utf-8") as f:
        f.write("// Generated by manage.py build — do not edit by hand.\n")
        f.write("window.blogPosts = ")
        json.dump(posts, f, indent=2, ensure_ascii=False)
        f.write(";\n")
    print(f"[OK] Wrote {len(posts)} post(s) to posts/index.js")


# ============================================================
#  Argument parsing & dispatch
# ============================================================

def main():
    parser = argparse.ArgumentParser(
        description="Manage blog posts for the static blog.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=textwrap.dedent("""\
            Examples:
              python manage.py list
              python manage.py show 3
              python manage.py new
              python manage.py new --body-file draft.html
              python manage.py edit 3
              python manage.py delete 5
              python manage.py build
        """),
    )
    sub = parser.add_subparsers(dest="command", help="Available commands")

    # list
    sub.add_parser("list", help="List all posts")

    # show
    sp = sub.add_parser("show", help="Show full details of a post")
    sp.add_argument("id", type=int, help="Post ID")

    # new
    np = sub.add_parser("new", help="Create a new post interactively")
    np.add_argument("--body-file", metavar="PATH", help="Read body HTML from file instead of editor")

    # edit
    ep = sub.add_parser("edit", help="Edit an existing post")
    ep.add_argument("id", type=int, help="Post ID")
    ep.add_argument("--body-file", metavar="PATH", help="Read body HTML from file instead of editor")

    # delete
    dp = sub.add_parser("delete", help="Delete a post")
    dp.add_argument("id", type=int, help="Post ID")
    dp.add_argument("--force", "-f", action="store_true", help="Skip confirmation prompt")

    # build
    sub.add_parser("build", help="Generate posts/index.js from posts/ directory")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(0)

    posts = load_posts()

    if args.command == "list":
        cmd_list(posts)
    elif args.command == "show":
        cmd_show(posts, args.id)
    elif args.command == "new":
        cmd_new(posts, body_file=args.body_file)
    elif args.command == "edit":
        cmd_edit(posts, args.id, body_file=args.body_file)
    elif args.command == "delete":
        cmd_delete(posts, args.id, force=args.force)
    elif args.command == "build":
        cmd_build(posts)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
