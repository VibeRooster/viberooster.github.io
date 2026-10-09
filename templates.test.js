const assert = require("node:assert/strict");
const test = require("node:test");
const {
  TEMPLATE_REFERENCES,
  fetchTemplateCatalog,
  parseTemplateFile,
  renderTemplateList,
  templateBrowseUrl,
  templateShareText,
  withReference,
} = require("./templates.js");

const LEVER = `---
name: lever-explorable
title: Lever explorable
description: One-page explorable with two numeric levers and a result that updates as the reader moves them.
---

# Lever explorable
`;

const FUTURE = `---
name: future-shape
title: Future shape
description: A template that is not on GitHub yet in this test.
---

# Future
`;

test("each published template has a reference roost", () => {
  assert.deepEqual(Object.keys(TEMPLATE_REFERENCES).sort(), [
    "diagram-explorable",
    "guided-walkthrough",
    "lever-explorable",
    "screencam-gallery",
    "slide-mode-explorable",
  ]);
});

test("frontmatter without a description is left off the list", () => {
  assert.equal(parseTemplateFile("---\nname: bare\ntitle: Bare\n---\n", "bare.md"), null);
});

test("a new template name is listed without a reference roost", () => {
  const meta = parseTemplateFile(FUTURE, "future-shape.md");
  assert.ok(meta);
  const row = withReference(
    Object.assign({}, meta, {
      url: "https://github.com/VibeRooster/hatch-mcp/blob/main/templates/future-shape.md",
    })
  );
  assert.equal(row.referenceUrl, undefined);
  const text = templateShareText(row);
  assert.match(text, /^Based on our chat, create an interactive HTML page/);
  assert.match(text, /"Future shape" template \(future-shape\)/);
  assert.match(text, /templates\/future-shape\.md/);
  assert.doesNotMatch(text, /Reference page:/);
  assert.match(text, /explain Human in the Loop and ask the end-user if a HITL chip is necessary$/);
  const html = renderTemplateList([row]);
  assert.match(html, /No reference page yet/);
  assert.match(html, /future-shape/);
  assert.doesNotMatch(html, /<script/i);
});

test("lever-explorable prompt names the file and the reference page", () => {
  const meta = parseTemplateFile(LEVER, "lever-explorable.md");
  const row = withReference(
    Object.assign({}, meta, {
      url: "https://github.com/VibeRooster/hatch-mcp/blob/main/templates/lever-explorable.md",
    })
  );
  assert.equal(row.referenceUrl, "https://template-lever-explorable.theroost.dev");
  assert.equal(
    templateShareText(row),
    [
      'Based on our chat, create an interactive HTML page from the "Lever explorable" template (lever-explorable).',
      "",
      "Template file: https://github.com/VibeRooster/hatch-mcp/blob/main/templates/lever-explorable.md",
      "Reference page: https://template-lever-explorable.theroost.dev",
      "",
      "Open the template file, replace every bracketed string, keep the inputs and the HITL settings hook, and hatch the HTML once.",
      "The reference page shows the filled shape.",
      "explain Human in the Loop and ask the end-user if a HITL chip is necessary",
    ].join("\n")
  );
  const html = renderTemplateList([row]);
  assert.match(html, /https:\/\/template-lever-explorable\.theroost\.dev/);
  assert.match(html, /Copy prompt/);
});

test("catalog follows the GitHub directory and skips the readme", async () => {
  const raw = "https://raw.githubusercontent.com/VibeRooster/hatch-mcp/main/";
  const listed = [
    {
      name: "README.md",
      path: "templates/README.md",
      type: "file",
      download_url: `${raw}templates/README.md`,
    },
    {
      name: "future-shape.md",
      path: "templates/future-shape.md",
      type: "file",
      download_url: `${raw}templates/future-shape.md`,
    },
    {
      name: "lever-explorable.md",
      path: "templates/lever-explorable.md",
      type: "file",
      download_url: `${raw}templates/lever-explorable.md`,
    },
  ];
  const bodies = {
    [`${raw}templates/future-shape.md`]: FUTURE,
    [`${raw}templates/lever-explorable.md`]: LEVER,
  };
  const fetchImpl = async (input) => {
    const url = String(input);
    if (url.includes("/contents/templates")) {
      return new Response(JSON.stringify(listed), { status: 200 });
    }
    const body = bodies[url];
    if (!body) return new Response("missing", { status: 404 });
    return new Response(body, { status: 200 });
  };

  const catalog = await fetchTemplateCatalog(fetchImpl);
  assert.equal(catalog.browse, templateBrowseUrl());
  assert.deepEqual(
    catalog.templates.map((row) => row.name),
    ["future-shape", "lever-explorable"]
  );
  assert.equal(catalog.templates[0].referenceUrl, undefined);
  assert.equal(catalog.templates[1].referenceUrl, "https://template-lever-explorable.theroost.dev");
});

test("catalog fetches do not set User-Agent", async () => {
  const raw = "https://raw.githubusercontent.com/VibeRooster/hatch-mcp/main/";
  const calls = [];
  const fetchImpl = async (input, init) => {
    calls.push({ url: String(input), headers: (init && init.headers) || {} });
    if (String(input).includes("/contents/templates")) {
      return new Response(
        JSON.stringify([
          {
            name: "lever-explorable.md",
            path: "templates/lever-explorable.md",
            type: "file",
            download_url: `${raw}templates/lever-explorable.md`,
          },
        ]),
        { status: 200 }
      );
    }
    return new Response(LEVER, { status: 200 });
  };

  const catalog = await fetchTemplateCatalog(fetchImpl);
  assert.equal(catalog.templates.length, 1);
  assert.equal(calls.length, 2);
  for (const call of calls) {
    const names = Object.keys(call.headers).map((name) => name.toLowerCase());
    assert.equal(names.includes("user-agent"), false, call.url);
  }
  assert.equal(calls[1].url, `${raw}templates/lever-explorable.md`);
  assert.equal(Object.keys(calls[1].headers).length, 0);
});

test("prompt text is escaped in the list", () => {
  const html = renderTemplateList([
    {
      name: "angle",
      title: "A <b>title</b>",
      description: "Uses <script>",
      url: "https://github.com/VibeRooster/hatch-mcp/blob/main/templates/angle.md",
    },
  ]);
  assert.match(html, /A &lt;b&gt;title&lt;\/b&gt;/);
  assert.doesNotMatch(html, /<b>title<\/b>/);
  assert.doesNotMatch(html, /<script>/);
});
