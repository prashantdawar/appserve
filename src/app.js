//
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
const workerProcess = numCPUs > 4 ? numCPUs : 4;
let server = require("http").createServer();
const url = require("url");
let port = process.env.PORT || 3001;
//
//
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
        // let err = {};
        if (req.method != "GET") {
          return reject({ statusCode: 405 });
        }
        //
        // hard limit on acceptable hostname
        let host = req.headers.host;
        if (host.length > 50) return reject({ statusCode: 404 });

        let subDomain = host.slice(0, host.indexOf(":")).split(".");
        let dExtenstion = subDomain.pop();
        let domain = subDomain.pop();
        // if (!isNaN(domain)) return reject({ statusCode: 502 });
        return resolve(req.url);
      });

      promise
        .then(resObj => {
          res.statusCode = resObj.statusCode || 200;
          res.write(JSON.stringify(resObj));
        })
        .catch(err => {
          res.statusCode = err.statusCode || 500;
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
