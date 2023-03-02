import Express from "express";
import listEndpoints from "express-list-endpoints";
import authorsRouter from "./api/authors/index.js";
import blogPostsRouter from "./api/blogPosts/index.js";
import cors from "cors";
import {
  badRequestHandler,
  unauthorizedHandler,
  notFoundHandler,
  genericErrorHandler,
} from "./errorHandlers.js";
import { publicFolderPath } from "./lib/fs-tools.js";

const server = Express();
const port = 3001;

// Middlewares
const informativeMiddleware = (req, res, next) => {
  // an example of global middleware
  console.table({
    method: req.method,
    endpoint: req.url,
  });
  next();
};
server.use(Express.static(publicFolderPath));
server.use(informativeMiddleware);
server.use(cors());
server.use(Express.json()); //should be added BEFORE the endpoints, otherwise all the request bodies will be undefined!

// Endpoints
server.use("/authors", authorsRouter);
server.use("/blogPosts", blogPostsRouter);

// Error Handlers
server.use(badRequestHandler); // 400
server.use(unauthorizedHandler); // 401
server.use(notFoundHandler); // 404
server.use(genericErrorHandler); // it must be at the end of error handlers

server.listen(port, () => {
  // console.table(listEndpoints(server));
  console.log("Server port: ", port);
});
