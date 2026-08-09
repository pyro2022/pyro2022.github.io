# 个人博客

一个使用 HTML、CSS 和原生 JavaScript 构建的静态个人博客，附带用于管理文章的 Python 命令行工具。

## 项目结构

```
index.html       — 主页面（首页、文章列表、关于、文章详情）
style.css        — 全部样式，包含亮色/暗色主题、响应式布局
i18n.js          — 中英文翻译
posts/           — 文章数据：每篇文章一个 .json 文件，以及生成的 index.js
script.js        — 应用逻辑（路由、渲染、搜索、主题/语言切换）
manage.py        — 管理文章的命令行工具
```

## 快速开始

在浏览器中打开 `index.html` 即可。无需构建步骤或服务器。

---

## 使用 `manage.py` 管理文章

所有文章数据以独立文件存储在 `posts/` 目录中。使用 `manage.py` 创建、编辑或删除文章，然后运行 `build` 命令更新站点。

### 列出所有文章

```bash
python manage.py list
```

打印摘要表格：

```
ID   Title                                              Tag              Date
------------------------------------------------------------------------------------
1    The Art of Writing Clean Components                Engineering      2026-07-28
2    Understanding the CSS Cascade                      CSS              2026-07-14
...
```

### 查看文章详情

```bash
python manage.py show <id>
```

打印全部字段：标题、副标题、标签、日期、阅读时长（含字数统计）、摘要以及正文预览。

```bash
python manage.py show 3
```

### 创建新文章

```bash
python manage.py new
```

交互流程：
1. 依次输入**标题**、**副标题**、**标签**、**日期**、**阅读时长**和**摘要**
2. 打开文本编辑器（`$EDITOR`）编写正文 HTML
3. 保存为 `posts/<id>.json`

默认行为：日期 → 当天，阅读时长 → 根据字数自动计算。

跳过编辑器、从文件读取正文：

```bash
python manage.py new --body-file draft.html
```

### 编辑文章

```bash
python manage.py edit <id>
```

与 `new` 流程相同，但每个提示都会预填当前值。按回车保留原值。

```bash
python manage.py edit 3
python manage.py edit 3 --body-file updated.html
```

### 删除文章

```bash
python manage.py delete <id>
```

显示文章标题，确认后删除。

```bash
python manage.py delete 5
python manage.py delete 5 --force   # 跳过确认
```

### 构建（更新站点）

```bash
python manage.py build
```

从 `posts/` 目录生成 `posts/index.js`（JavaScript 格式的完整文章数据）。**创建/编辑/删除文章后务必运行此命令**，浏览器中才能看到变化。

---

## 文章字段

| 字段 | 格式 | 说明 |
|-------|--------|-------|
| `title` | 文本 | 必填 |
| `subtitle` | 文本 | 必填，在文章详情页标题下方显示 |
| `tag` | 文本 | 必填，用于分类筛选（如 `Engineering`、`CSS`） |
| `date` | `YYYY-MM-DD` | 必填，默认为当天 |
| `readTime` | `"N min read"` | 留空或设为 `"auto"` 时按字数自动计算（约 200 词/分钟） |
| `excerpt` | 纯文本 | 必填，显示在文章卡片上 |
| `body` | HTML | 必填，在编辑器中编写 |

---

## 编辑器配置

`new` 和 `edit` 命令会打开你常用的文本编辑器来编写文章正文。按以下优先级查找：

1. `$EDITOR` 环境变量
2. `$VISUAL` 环境变量
3. VS Code（`code`）
4. 记事本（Windows）或 nano（Linux/macOS）

使用 VS Code：`set EDITOR=code`（Windows）或 `export EDITOR=code`（Unix）。
