import Express from "express";
import listEndpoints from "express-list-endpoints";
import authorsRouter from "./api/authors/index.js";
import blogPostsRouter, { filesRouter } from "./api/blogPosts/index.js";
import cors from "cors";
import {
  badRequestHandler,
  unauthorizedHandler,
  notFoundHandler,
  genericErrorHandler,
} from "./errorHandlers.js";
import { publicFolderPath } from "./lib/fs-tools.js";
import createHttpError from "http-errors";

const server = Express();
const port = process.env.PORT || 3001;

// Middlewares
const informativeMiddleware = (req, res, next) => {
  // an example of global middleware
  console.table({
    method: req.method,
    endpoint: req.url,
  });
  next();
};

const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];
server.use(
  cors({
    origin: (currentOrigin, corsNext) => {
      if (!currentOrigin || whitelist.indexOf(currentOrigin) !== -1) {
        corsNext(null, true);
      } else {
        corsNext(
          createHttpError(
            400,
            `Origin ${currentOrigin} is not in the whitelist!`
          )
        );
      }
    },
  })
);

server.use(Express.static(publicFolderPath));
server.use(informativeMiddleware);
server.use(cors());
server.use(Express.json()); //should be added BEFORE the endpoints, otherwise all the request bodies will be undefined!

// Endpoints
server.use("/authors", authorsRouter);
server.use("/blogPosts", blogPostsRouter);
server.use("/files", filesRouter);

// Error Handlers
server.use(badRequestHandler); // 400
server.use(unauthorizedHandler); // 401
server.use(notFoundHandler); // 404
server.use(genericErrorHandler); // it must be at the end of error handlers

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log("Server running on port", port);
});
