import Express, { json, response } from "express";
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

// Getting the path is explained step by step ⬆️
const authorsJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "authors.json"
);

// GET (ALL THE AUTHORS)
authorsRouter.get("/", (request, response) => {
  const fileContentRaw = fs.readFileSync(authorsJSONPath);
  // console.log(fileContentRaw); // fileContentRow <Buffer 5b 7b 22 6e 61... -> we should convert it into something readible and understandable by people using JSON.parse
  const authors = JSON.parse(fileContentRaw);
  response.send(authors);
});

// GET (SINGLE AUTHOR)
authorsRouter.get("/:authorId", (request, response) => {
  const authors = JSON.parse(fs.readFileSync(authorsJSONPath));
  const author = authors.find((a) => a.id === request.params.authorId); // find returns the specific author that we searched for
  response.send(author);
});

// POST
authorsRouter.post("/", (request, response) => {
  const authors = JSON.parse(fs.readFileSync(authorsJSONPath));
  const checkMail = authors.some((a) => a.email === request.body.email);

  if (checkMail) {
    response.status(400).send("Email is already in use!");
  } else {
    const newAuthor = {
      ...request.body,
      avatar: `https://ui-avatars.com/api/?name=${request.body.name}+${request.body.surname}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      id: uniqid(),
    };
    authors.push(newAuthor);
    fs.writeFileSync(authorsJSONPath, JSON.stringify(authors)); // updating authors.json with last added author
    response.status(201).send({ id: newAuthor.id }); // 201 -> OK, created!
  }
});

// PUT (UPDATE A SINGLE AUTHOR)
authorsRouter.put("/:authorId", (request, response) => {
  const authors = JSON.parse(fs.readFileSync(authorsJSONPath));

  const authorIndex = authors.findIndex(
    (a) => a.id === request.params.authorId
  );
  const oldVersionOfAuthor = authors[authorIndex];
  const updatedAuthor = {
    ...oldVersionOfAuthor,
    ...request.body,
    updatedAt: new Date(),
  };
  authors[authorIndex] = updatedAuthor;
  fs.writeFileSync(authorsJSONPath, JSON.stringify(authors)); // updating authors.json with last updated author
  response.send(updatedAuthor);
});

// DELETE
authorsRouter.delete("/:authorId", (request, response) => {
  const authors = JSON.parse(fs.readFileSync(authorsJSONPath));
  const remainingAuthors = authors.filter(
    (a) => a.id !== request.params.authorId
  );
  fs.writeFileSync(authorsJSONPath, JSON.stringify(remainingAuthors));
  response.status(204).send(); // 204 OK, no content!
});

export default authorsRouter;
