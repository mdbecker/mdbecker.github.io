const http = require("http"),
  fs = require("fs"),
  path = require("path");
const root = path.resolve(process.argv[2]),
  port = Number(process.argv[3]);
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".xml": "application/xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
};
http
  .createServer((req, res) => {
    let file = path.resolve(
      root,
      "." + decodeURIComponent(new URL(req.url, "http://localhost").pathname),
    );
    if (!file.startsWith(root + path.sep) && file !== root) {
      res.writeHead(403).end();
      return;
    }
    try {
      if (fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
      fs.statSync(file);
      res.setHeader(
        "content-type",
        types[path.extname(file)] || "application/octet-stream",
      );
      fs.createReadStream(file).pipe(res);
    } catch {
      res.writeHead(404).end("Not found");
    }
  })
  .listen(port, "127.0.0.1");
