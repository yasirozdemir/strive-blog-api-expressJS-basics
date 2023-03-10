import Express from "express";
// import fs from "fs"; // fs (file system), url and path are core modules
import uniqid from "uniqid";
import {
  getAuthors,
  writeAuthors,
  saveAuthorsAvatars,
  getAuthorsReadibleStream,
} from "../../lib/fs-tools.js";
import multer from "multer";
import { extname } from "path";
import createHttpError from "http-errors";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { sendRegistrationEmail } from "../../lib/email-tools.js";
import { Transform } from "@json2csv/node";
import { pipeline } from "stream";

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
authorsRouter.post("/", async (request, response, next) => {
  try {
    const authors = await getAuthors();
    const checkMail = authors.some((a) => a.email === request.body.email);

    if (checkMail) {
      response.status(400).send({
        message: "Email is already in use!",
      });
    } else {
      const newAuthor = {
        ...request.body,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: uniqid(),
      };
      authors.push(newAuthor);
      await writeAuthors(authors); // updating authors.json with last added author
      response.status(201).send({ id: newAuthor.id }); // 201 -> OK, created!
    }
  } catch (error) {
    next(error);
  }
});

// GET CSV
authorsRouter.get("/csv", async (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", "attachment; filename=authors.csv");
    const source = getAuthorsReadibleStream();
    const transfrom = new Transform({ fields: ["id", "name", "surname"] });
    const destination = res;
    pipeline(source, transfrom, destination, (err) => {
      if (err) console.log(err);
    });
  } catch (error) {
    next(error);
  }
});

// GET (ALL THE AUTHORS)
authorsRouter.get("/", async (request, response, next) => {
  // const fileContentRaw = fs.readFileSync(authorsJSONPath);
  // console.log(fileContentRaw); // fileContentRow <Buffer 5b 7b 22 6e 61... -> we should convert it into something readible and understandable by people using JSON.parse
  try {
    const authors = await getAuthors();
    response.send(authors);
  } catch (error) {
    next(error);
  }
});

// GET (SINGLE AUTHOR)
authorsRouter.get("/:authorId", async (request, response, next) => {
  try {
    const authors = await getAuthors();
    const author = authors.find((a) => a.id === request.params.authorId); // find returns the specific author that we searched for
    response.send(author);
  } catch (error) {
    next(error);
  }
});

// PUT (UPDATE A SINGLE AUTHOR)
authorsRouter.put("/:authorId", async (request, response, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
});

// DELETE
authorsRouter.delete("/:authorId", async (request, response, next) => {
  try {
    const authors = await getAuthors();
    const remainingAuthors = authors.filter(
      (a) => a.id !== request.params.authorId
    );
    await writeAuthors(remainingAuthors);
    response.status(204).send(); // 204 OK, no content!
  } catch (error) {
    next(error);
  }
});

// POST author avatar WITHOUT cloudinary
// authorsRouter.post(
//   "/:authorId/avatar",
//   multer().single("avatar"),
//   async (req, res, next) => {
//     try {
//       const authors = await getAuthors();
//       const index = authors.findIndex((a) => a.id === req.params.authorId);

//       if (index !== -1) {
//         const fileExtension = extname(req.file.originalname);
//         const fileName = req.params.authorId + fileExtension;
//         await saveAuthorsAvatars(fileName, req.file.buffer);
//         authors[index].avatar = `http://localhost:3001/img/authors/${fileName}`;
//         await writeAuthors(authors);
//         res.status(201).send({ message: "avatar uploaded!" });
//       } else {
//         next(
//           createHttpError(
//             404,
//             `Author with the id (${req.params.authorId}) not found!`
//           )
//         );
//       }
//     } catch (error) {
//       next(error);
//     }
//   }
// );

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "strive-blog/authors/avatars",
    },
  }),
}).single("avatar");

// POST author avatar WITH cloudinary
authorsRouter.post(
  "/:authorId/avatar",
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      const authors = await getAuthors();
      const index = authors.findIndex((b) => b.id === req.params.authorId);

      if (index !== -1) {
        // const fileExtension = extname(req.file.originalname);
        // const fileName = req.params.authorId + fileExtension;

        // find a way to change the file name with ID
        authors[index].avatar = req.file.path;
        await writeAuthors(authors);

        console.log(req.file);

        res.status(201).send({ message: "cover uploaded!" });
      } else {
        next(
          createHttpError(
            404,
            `Author with the id (${req.params.authorId}) not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

authorsRouter.post("/register", async (req, res, next) => {
  try {
    const { email } = req.body;
    await sendRegistrationEmail(email);
    res.send({ message: "Registration is succesfull!" });
  } catch (error) {
    next(error);
  }
});

export default authorsRouter;
