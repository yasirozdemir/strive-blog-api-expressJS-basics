import Express from "express";
import uniqid from "uniqid";
import createHttpError from "http-errors";
import authorsRouter from "../authors/index.js";
import { checkBlogPostSchema, triggerBadRequest } from "./validation.js";
import {
  getBlogPosts,
  getBlogPostsReadibleStream,
  // saveBlogPostsCover,
  writeBlogPosts,
} from "../../lib/fs-tools.js";
import multer from "multer";
// import { extname } from "path";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { blogPostToPDF } from "../../lib/pdf-tools.js";
import { pipeline } from "stream";
import { Transform } from "@json2csv/node";
import { sendPostPublishedEmail } from "../../lib/email-tools.js";

const blogPostsRouter = Express.Router();

// POST
blogPostsRouter.post(
  "/",
  checkBlogPostSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const blogPosts = await getBlogPosts();
      const newBlogPost = {
        ...req.body,
        createdAt: new Date(),
        id: uniqid(),
      };
      blogPosts.push(newBlogPost);
      await writeBlogPosts(blogPosts);
      await sendPostPublishedEmail(newBlogPost.author.email);
      res.status(201).send({ postId: newBlogPost.id });
    } catch (error) {
      next(error);
    }
  }
);

// GET CSV
blogPostsRouter.get("/csv", async (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", "attachment; filename=blogposts.csv");
    const source = getBlogPostsReadibleStream();
    const transfrom = new Transform({ fields: ["id", "title", "category"] });
    const destination = res;
    pipeline(source, transfrom, destination, (err) => {
      if (err) console.log(err);
    });
  } catch (error) {
    next(error);
  }
});

// GET ALL
blogPostsRouter.get("/", async (req, res, next) => {
  try {
    const blogPosts = await getBlogPosts();
    if (req.query && req.query.title) {
      const blogPostsWithSearchedTitle = blogPosts.filter((b) =>
        b.title.toLowerCase().includes(req.query.title.toLowerCase())
      );
      res.send(blogPostsWithSearchedTitle);
    } else {
      res.send(blogPosts);
    }
  } catch (error) {
    next(error);
  }
});

// GET BY BLOGPOST ID
blogPostsRouter.get("/:blogPostId", async (req, res, next) => {
  try {
    const blogPosts = await getBlogPosts();
    const specificBlogPost = blogPosts.find(
      (b) => b.id === req.params.blogPostId
    );
    if (specificBlogPost) {
      res.send(specificBlogPost);
    } else
      next(
        createHttpError(
          404,
          `Blog Post with the id (${req.params.blogPostId}) not found!`
        )
      );
  } catch (error) {
    next(error);
  }
});

// GET AN AUTHOR'S BLOG POSTS
authorsRouter.get("/:authorId/blogPosts", async (req, res, next) => {
  try {
    const blogPosts = await getBlogPosts();
    const authorsPosts = blogPosts.filter(
      (b) => b.author.id === req.params.authorId
    );
    res.send(authorsPosts);
  } catch (error) {
    next(error);
  }
});

// PUT
blogPostsRouter.put("/:blogPostId", async (req, res, next) => {
  try {
    const blogPosts = await getBlogPosts();
    const index = blogPosts.findIndex(
      (blogPost) => blogPost.id === req.params.blogPostId
    );
    if (index !== -1) {
      const oldVersionOfBlogPost = blogPosts[index];
      const updatedBlogPost = {
        ...oldVersionOfBlogPost,
        ...req.body,
        updatedAt: new Date(),
      };
      blogPosts[index] = updatedBlogPost;
      await writeBlogPosts(blogPosts);
      res.send(
        `Blog Post with the id (${req.params.blogPostId}) has been updated!`
      );
    } else {
      next(
        createHttpError(
          404,
          `Blog Post with the id (${req.params.blogPostId}) not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

// DELETE
blogPostsRouter.delete("/:blogPostId", async (req, res, next) => {
  try {
    const blogPosts = await getBlogPosts();
    const remainingBlogPosts = blogPosts.filter(
      (b) => b.id !== req.params.blogPostId
    );
    if (blogPosts.length !== remainingBlogPosts.length) {
      await writeBlogPosts(remainingBlogPosts);
      res.status(204).send();
    } else {
      next(
        createHttpError(
          404,
          `Blog Post with the id ${req.params.blogPostId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

// POST Blog Post Comment
blogPostsRouter.post("/:blogPostId/comments", async (req, res, next) => {
  try {
    const blogPosts = await getBlogPosts();
    const index = blogPosts.findIndex(
      (blogPost) => blogPost.id === req.params.blogPostId
    );
    const newComment = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      id: uniqid(),
    };
    blogPosts[index].comments.push(newComment);
    await writeBlogPosts(blogPosts);
    res.send("comment sent");
  } catch (error) {
    next(error);
  }
});

// GET Blog Post Comment
blogPostsRouter.get("/:blogPostId/comments", async (req, res, next) => {
  try {
    const blogPosts = await getBlogPosts();
    const specificBlogPost = blogPosts.find(
      (b) => b.id === req.params.blogPostId
    );
    if (specificBlogPost) {
      res.send(specificBlogPost.comments);
    } else
      next(
        createHttpError(
          404,
          `Blog Post with the id (${req.params.blogPostId}) not found!`
        )
      );
  } catch (error) {
    next(error);
  }
});

// POST Blog Post Cover WITHOUT cloudinary
// blogPostsRouter.post(
//   "/:blogPostId/cover",
//   multer().single("cover"),
//   async (req, res, next) => {
//     try {
// const blogPosts = await getBlogPosts();
// const index = blogPosts.findIndex((b) => b.id === req.params.blogPostId);

// if (index !== -1) {
//   const fileExtension = extname(req.file.originalname);
//   const fileName = req.params.blogPostId + fileExtension;
//   await saveBlogPostsCover(fileName, req.file.buffer);

//   blogPosts[
//     index
//   ].cover = `http://localhost:3001/img/blogPosts/${fileName}`;
//   await writeBlogPosts(blogPosts);

//   res.status(201).send({ message: "cover uploaded!" });
// } else {
//   next(
//     createHttpError(
//       404,
//       `Blog post with the id (${req.params.blogPostId}) not found!`
//     )
//   );
// }
//     } catch (error) {
//       next(error);
//     }
//   }
// );

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "strive-blog/blogs/covers",
    },
  }),
}).single("cover");

// POST Blog Post Cover WITH cloudinary
blogPostsRouter.post(
  "/:blogPostId/cover",
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      const blogPosts = await getBlogPosts();
      const index = blogPosts.findIndex((b) => b.id === req.params.blogPostId);

      if (index !== -1) {
        // const fileExtension = extname(req.file.originalname);
        // const fileName = req.params.blogPostId + fileExtension;

        // find a way to change the file name with ID
        blogPosts[index].cover = req.file.path;
        await writeBlogPosts(blogPosts);

        res.status(201).send({ message: "cover uploaded!" });
      } else {
        next(
          createHttpError(
            404,
            `Blog post with the id (${req.params.blogPostId}) not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

blogPostsRouter.get("/:blogPostId/pdf/download", async (req, res, next) => {
  try {
    const blogPosts = await getBlogPosts();
    const specificBlogPost = blogPosts.find(
      (b) => b.id === req.params.blogPostId
    );
    if (specificBlogPost) {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${specificBlogPost.title}.pdf`
      );
      const source = await blogPostToPDF(specificBlogPost);
      const destination = res;
      pipeline(source, destination, (err) => {
        if (err) console.log(err);
      });
    } else
      next(
        createHttpError(
          404,
          `Blog Post with the id (${req.params.blogPostId}) not found!`
        )
      );
  } catch (error) {
    next(error);
  }
});

export default blogPostsRouter;
