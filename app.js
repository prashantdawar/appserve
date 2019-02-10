//
const cluster = require("cluster");
// const http = require('http');
const numCPUs = require("os").cpus().length;
let server = require("http").createServer();
let hostname = process.env.OPENSHIFT_NODEJS_IP;
let port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3001;
//
//
//
if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
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
      let host = req.headers.host;
      if (host.length > 50) {
        res.statusCode = 404;
        res.end();
        return;
      }
      let subDomain = host.slice(0, host.indexOf(":")).split(".");
      let domain = subDomain.pop();
      if (!isNaN(domain)) {
        res.statusCode = 502;
        res.end();
        //
        return;
      }
      // res.write(JSON.stringify(Object.keys(req)));
      res.write(JSON.stringify(host));
      res.end();
      return;
    })
    .listen(port, hostname, () => {
      console.log(`Server is running at PORT: ${port}`);
      // setTimeout(() => {
      //   process.exit();
      // }, 7000 - Math.random() * 5000);
    });

  // console.log(`Worker ${process.pid} started`);
}
module.exports = server;
