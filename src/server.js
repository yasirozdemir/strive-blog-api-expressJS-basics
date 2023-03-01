import Express from "express";
import listEndpoints from "express-list-endpoints";
import authorsRouter from "./api/authors/index.js";
import cors from "cors";

const server = Express();
const port = 3001;

server.use(cors());

const informativeMiddleware = (req, res, next) => {
  // an example of global middleware
  console.table({
    method: req.method,
    url: req.url,
  });
  next();
};

server.use(informativeMiddleware);
server.use(Express.json()); //should be added BEFORE the endpoints, otherwise all the request bodies will be undefined!

server.use("/authors", authorsRouter);

server.listen(port, () => {
  console.table(listEndpoints(server));
});
