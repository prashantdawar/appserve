//
const cluster = require("cluster");
const os = require("os");
const numCPUs = os.cpus().length;
let server = require("http").createServer();
const url = require("url");
const path = require("path");
const fs = require("fs");
//
//
// maps file extention to MIME types
const mimeType = {
  ".ico": "image/x-icon",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".svg": "image/svg+xml",
  //
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".eot": "appliaction/vnd.ms-fontobject",
  ".ttf": "aplication/font-sfnt"
};
const www_path = process.env.WWW_PATH || "www";
const workerProcess = numCPUs > 4 ? numCPUs : 4;
let port = process.env.PORT || 3001;
//
if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  // Fork workers.
  for (let i = 0; i < workerProcess; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  // Workers can share any TCP connection
  server
    .on("request", (req, res) => {
      res.setHeader("content-type", "application/json");
      let promise = new Promise((resolve, reject) => {
        if (req.method != "GET") {
          return reject({ statusCode: 405 });
        }
        // hard limit on acceptable hostname
        //
        let host = req.headers.host;
        // if (host.length > 50) return reject({ statusCode: 404 });
        // let domainURL = host.slice(0, host.indexOf(":"));
        console.log(host);
        let domainURL = host;
        let domain = "";
        if (domainURL == "localhost") {
          domain = "localhost";
        } else {
          let subDomain = domainURL.split(".");
          let dExtenstion = subDomain.pop();
          domain = subDomain.pop();
        }
        console.log(domain);
        if (!isNaN(domain)) return reject({ statusCode: 502 });
        //
        const sanitizePath = path
          .normalize(req.url)
          .replace(/^(\.\.[\/\\])+/, "");
        let pathname = path.join(
          os.homedir(),
          www_path,
          domainURL,
          sanitizePath
        );
        if (fs.statSync(pathname).isDirectory()) {
          pathname += "index.html";
        }
        console.log(pathname);
        // https://nodejs.org/api/fs.html#fs_fs_access_path_mode_callback
        fs.open(pathname, "r", (err, fd) => {
          if (err) {
            if (err.code === "ENOENT") {
              return reject({ statusCode: 404 });
            }
            return reject();
          }
          //
          fs.readFile(pathname, (err, data) => {
            if (err) {
              return reject();
            }
            const ext = path.parse(pathname).ext;
            return resolve({ data, ext });
          });
        });
        // return resolve(pathname);
      });

      promise
        .then(resObj => {
          res.statusCode = resObj.statusCode || 200;
          res.setHeader("content-type", mimeType[resObj.ext]);
          res.write(resObj.data);
        })
        .catch(err => {
          console.log(err);
          res.statusCode = err ? err.statusCode || 500 : 500;
        })
        .then(_ => {
          res.end();
        });
    })
    .listen(port, () => {
      console.log(`Server is running at PORT: ${port}`);
      // setTimeout(() => {
      //   process.exit();
      // }, 7000 - Math.random() * 5000);
    });

  console.log(`Worker ${process.pid} started`);
}
module.exports = server;
