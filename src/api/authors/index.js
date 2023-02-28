import Express, { response } from "express";
import fs from "fs"; // fs (file system), url and path are core modules
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid";

const authorsRouter = Express.Router();

// HOW TO GET authors.json PATH
// 1) console.log("CURRENT FILE URL:", import.meta.url);
// 2) console.log("CURRENT FILE PATH:", fileURLToPath(import.meta.url));
// 3) console.log("PARENT FOLDER'S PATH: ", dirname(fileURLToPath(import.meta.url)));
// 4) console.log("authors.json path:", join(dirname(fileURLToPath(import.meta.url)), "authors.json"))

const authorsJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "authors.json"
);

// POST
authorsRouter.post("/", (request, response) => {
  const newAuthor = {
    ...request.body,
    createdAt: new Date(),
    updatedAt: new Date(),
    id: uniqid(),
  };
  const authors = JSON.parse(fs.readFileSync(authorsJSONPath));
  authors.push(newAuthor);
  fs.writeFileSync(authorsJSONPath, JSON.stringify(authors));
  response.status(201).send({ id: newAuthor.id }); // 201 -> OK, created!
});

// GET (ALL THE AUTHORS)
authorsRouter.get("/", (request, response) => {
  const fileContentRaw = fs.readFileSync(authorsJSONPath);
  const authors = JSON.parse(fileContentRaw);
  response.send(authors);
});

// GET (SINGLE AUTHOR)
authorsRouter.get("/:authorId", (request, response) => {
  const authors = JSON.parse(fs.readFileSync(authorsJSONPath));
  const author = authors.find((a) => a.id === request.params.authorId);
  response.send(author);
});

export default authorsRouter;
