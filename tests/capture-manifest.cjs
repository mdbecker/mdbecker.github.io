const fs = require("fs"),
  path = require("path");
const root = process.argv[2];
const routes = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === "index.html")
      routes.push(
        "/" +
          path
            .relative(root, path.dirname(p))
            .replaceAll("\\", "/")
            .replace(/^\.$/, "") +
          "/",
      );
  }
}
walk(root);
fs.writeFileSync(
  "tests/fixtures/routes.json",
  JSON.stringify(routes.map((r) => r.replace("//", "/")).sort(), null, 2) +
    "\n",
);
