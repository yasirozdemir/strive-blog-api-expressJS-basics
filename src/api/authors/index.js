import Express from "express";
import fs from "fs"; // fs (file system), url and path are core modules
import uniqid from "uniqid";
import { getAuthors, writeAuthors } from "../../lib/fs-tools.js";

const authorsRouter = Express.Router();

// HOW TO GET authors.json PATH
// 1) console.log("CURRENT FILE URL:", import.meta.url);
// 2) console.log("CURRENT FILE PATH:", fileURLToPath(import.meta.url));
// 3) console.log("PARENT FOLDER'S PATH: ", dirname(fileURLToPath(import.meta.url)));
// 4) console.log("authors.json path:", join(dirname(fileURLToPath(import.meta.url)), "authors.json"))

// Getting the path is explained step by step ⬆️
// const authorsJSONPath = join(
//   dirname(fileURLToPath(import.meta.url)),
//   "authors.json"
// );

// POST
authorsRouter.post("/", async (request, response) => {
  const authors = await getAuthors();
  const checkMail = authors.some((a) => a.email === request.body.email);

  if (checkMail) {
    response.status(400).send({
      message: "Email is already in use!",
    });
  } else {
    const newAuthor = {
      ...request.body,
      avatar: `https://ui-avatars.com/api/?name=${request.body.name}+${request.body.surname}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      id: uniqid(),
    };
    authors.push(newAuthor);
    await writeAuthors(authors); // updating authors.json with last added author
    response.status(201).send({ id: newAuthor.id }); // 201 -> OK, created!
  }
});

// GET (ALL THE AUTHORS)
authorsRouter.get("/", async (request, response) => {
  // const fileContentRaw = fs.readFileSync(authorsJSONPath);
  // console.log(fileContentRaw); // fileContentRow <Buffer 5b 7b 22 6e 61... -> we should convert it into something readible and understandable by people using JSON.parse
  const authors = await getAuthors();
  response.send(authors);
});

// GET (SINGLE AUTHOR)
authorsRouter.get("/:authorId", async (request, response) => {
  const authors = await getAuthors();
  const author = authors.find((a) => a.id === request.params.authorId); // find returns the specific author that we searched for
  response.send(author);
});

// PUT (UPDATE A SINGLE AUTHOR)
authorsRouter.put("/:authorId", async (request, response) => {
  const authors = await getAuthors();

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
  // fs.writeFileSync(authorsJSONPath, JSON.stringify(authors)); // updating authors.json with last updated author
  await writeAuthors(authors);
  response.send(updatedAuthor);
});

// DELETE
authorsRouter.delete("/:authorId", async (request, response) => {
  const authors = await getAuthors();
  const remainingAuthors = authors.filter(
    (a) => a.id !== request.params.authorId
  );
  await writeAuthors(remainingAuthors);
  response.status(204).send(); // 204 OK, no content!
});

export default authorsRouter;
