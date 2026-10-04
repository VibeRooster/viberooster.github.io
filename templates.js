/**
 * Template gallery. Same source and frontmatter rules as list_templates
 * on mcp.theroost.dev: templates/*.md on hatch-mcp main, description required.
 * A file that lands on main shows up here without a site rebuild.
 *
 * Reference roost URLs are not part of that tool. They live in TEMPLATE_REFERENCES.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.VibeRoosterTemplates = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const TEMPLATE_REPO = {
    owner: "VibeRooster",
    repo: "hatch-mcp",
    branch: "main",
    directory: "templates",
  };

  /** Live example URL keyed by template name. Add one after that roost is published. */
  const TEMPLATE_REFERENCES = {
    "lever-explorable": "https://template-lever-explorable.theroost.dev",
  };

  const MAX_TEMPLATES = 40;

  function templateRepoWebUrl() {
    return `https://github.com/${TEMPLATE_REPO.owner}/${TEMPLATE_REPO.repo}`;
  }

  function templateBrowseUrl() {
    return `${templateRepoWebUrl()}/tree/${TEMPLATE_REPO.branch}/${TEMPLATE_REPO.directory}`;
  }

  function rawPrefix() {
    return `https://raw.githubusercontent.com/${TEMPLATE_REPO.owner}/${TEMPLATE_REPO.repo}/${TEMPLATE_REPO.branch}/`;
  }

  function parseTemplateFile(markdown, fileName) {
    const normalized = String(markdown).replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
    if (!normalized.startsWith("---\n")) return null;
    const end = normalized.indexOf("\n---\n", 4);
    if (end < 0) return null;
    const fields = {};
    for (const line of normalized.slice(4, end).split("\n")) {
      const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
      if (!match) continue;
      fields[match[1]] = match[2].trim();
    }
    const description = fields.description || "";
    if (!description) return null;
    const fallback = fileName.replace(/\.md$/i, "");
    const name = fields.name || fallback;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) return null;
    return { name, title: fields.title || name, description };
  }

  function isTemplateFile(item) {
    if (!item || typeof item !== "object") return false;
    if (item.type !== "file" || typeof item.name !== "string" || typeof item.path !== "string") return false;
    if (!item.name.endsWith(".md") || item.name.toLowerCase() === "readme.md") return false;
    if (item.path !== `${TEMPLATE_REPO.directory}/${item.name}`) return false;
    return typeof item.download_url === "string" && item.download_url.startsWith(rawPrefix());
  }

  function withReference(template) {
    const referenceUrl = TEMPLATE_REFERENCES[template.name];
    return referenceUrl ? Object.assign({}, template, { referenceUrl }) : Object.assign({}, template);
  }

  function templateShareText(template) {
    const lines = [
      `Create a page from the VibeRooster template "${template.title}" (${template.name}).`,
      "",
      `Template file: ${template.url}`,
    ];
    if (template.referenceUrl) lines.push(`Reference page: ${template.referenceUrl}`);
    lines.push(
      "",
      "Open the template file, replace every bracketed string, keep the inputs and the HITL settings hook, and hatch the HTML once."
    );
    if (template.referenceUrl) lines.push("The reference page shows the filled shape.");
    return lines.join("\n");
  }

  async function fetchTemplateCatalog(fetchImpl) {
    const fetchFn = fetchImpl || fetch;
    const { owner, repo, branch, directory } = TEMPLATE_REPO;
    const listUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${directory}?ref=${branch}`;
    const listRes = await fetchFn(listUrl, {
      headers: { accept: "application/vnd.github+json", "user-agent": "viberooster-site" },
    });
    if (listRes.status === 404) {
      return { repo: templateRepoWebUrl(), browse: templateBrowseUrl(), templates: [] };
    }
    if (!listRes.ok) {
      throw new Error(`Template list returned HTTP ${listRes.status}. Browse ${templateBrowseUrl()}.`);
    }
    const listed = await listRes.json();
    if (!Array.isArray(listed)) throw new Error(`Template path ${directory} is not a directory.`);

    const files = listed.filter(isTemplateFile).slice(0, MAX_TEMPLATES);
    const found = await Promise.all(
      files.map(async (file) => {
        const res = await fetchFn(file.download_url, { headers: { "user-agent": "viberooster-site" } });
        if (!res.ok) return null;
        const meta = parseTemplateFile(await res.text(), file.name);
        if (!meta) return null;
        return withReference(
          Object.assign({}, meta, {
            url: `https://github.com/${owner}/${repo}/blob/${branch}/${file.path}`,
          })
        );
      })
    );
    const templates = found.filter(Boolean);
    templates.sort((a, b) => a.name.localeCompare(b.name));
    return { repo: templateRepoWebUrl(), browse: templateBrowseUrl(), templates };
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderTemplateList(templates) {
    if (!templates.length) return "<p>No templates in the catalog yet.</p>";
    return templates
      .map((template) => {
        const prompt = templateShareText(template);
        const reference = template.referenceUrl
          ? `<p><a href="${escapeHtml(template.referenceUrl)}">Reference page</a></p>`
          : "<p class=\"pending\">No reference page yet.</p>";
        return `<article class="card" data-name="${escapeHtml(template.name)}">
          <h2>${escapeHtml(template.title)}</h2>
          <p>${escapeHtml(template.description)}</p>
          ${reference}
          <label class="prompt-label" for="prompt-${escapeHtml(template.name)}">Prompt</label>
          <textarea id="prompt-${escapeHtml(template.name)}" class="prompt" readonly rows="8">${escapeHtml(prompt)}</textarea>
          <div class="actions">
            <button type="button" class="copy" data-copy="${escapeHtml(template.name)}">Copy prompt</button>
          </div>
        </article>`;
      })
      .join("");
  }

  return {
    TEMPLATE_REFERENCES,
    parseTemplateFile,
    templateBrowseUrl,
    templateShareText,
    withReference,
    fetchTemplateCatalog,
    renderTemplateList,
    escapeHtml,
  };
});
