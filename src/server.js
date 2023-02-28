import Express from "express";
import listEndpoints from "express-list-endpoints";
import authorsReducer from "./api/authors/index.js";
import cors from "cors";

const server = Express();
const port = 3001;

server.use(Express.json()); //should be added BEFORE the endpoints, otherwise all the request bodies will be undefined!

server.use("/authors", authorsReducer);

server.use(
  cors({
    origin: "http://localhost:3000",
  })
);

server.listen(port, () => {
  console.table(listEndpoints(server));
  // listEndpoints(server) ⬇️
  //   [
  //     {
  //       path: "/authors",
  //       methods: ["GET", "POST"],
  //       middlewares: ["anonymous"],
  //     },
  //     {
  //       path: "/authors/:authorId",
  //       methods: ["GET", "PUT", "DELETE"],
  //       middlewares: ["anonymous"],
  //     },
  //   ];
});
