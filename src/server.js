import Express from "express";
import listEndpoints from "express-list-endpoints";
import authorsReducer from "./api/authors/index.js";

const server = Express();
const port = 3001;

server.use(Express.json()); //should be added BEFORE the endpoints, otherwise all the request bodies will be undefined!

server.use("/authors", authorsReducer);

server.listen(port, () => {
  console.table(listEndpoints(server));
});
