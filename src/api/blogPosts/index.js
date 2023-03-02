import Express from "express";
import uniqid from "uniqid";
import createHttpError from "http-errors";
import authorsRouter from "../authors/index.js";
import { checkBlogPostSchema, triggerBadRequest } from "./validation.js";
import {
  getBlogPosts,
  saveBlogPostsCover,
  writeBlogPosts,
} from "../../lib/fs-tools.js";
import multer from "multer";
import { extname } from "path";

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
        author: {
          ...req.body.author,
          avatar: `https://ui-avatars.com/api/?name=${req.body.name}+${req.body.surname}`,
        },
        createdAt: new Date(),
        id: uniqid(),
      };
      blogPosts.push(newBlogPost);
      await writeBlogPosts(blogPosts);
      res.status(201).send({ postId: newBlogPost.id });
    } catch (error) {
      next(error);
    }
  }
);

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
          "Blog Post with the id (${req.params.blogPostId}) not found!"
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

// POST Blog Post Cover
blogPostsRouter.post(
  "/:blogPostId/cover",
  multer().single("cover"),
  async (req, res, next) => {
    try {
      const fileExtension = extname(req.file.originalname);
      const fileName = req.params.blogPostId + fileExtension;
      await saveBlogPostsCover(fileName, req.file.buffer);

      const blogPosts = await getBlogPosts();
      const index = blogPosts.findIndex((b) => b.id === req.params.blogPostId);
      blogPosts[
        index
      ].cover = `http://localhost:3001/img/blogPosts/${fileName}`;
      await writeBlogPosts(blogPosts);

      res.status(201).send({ message: "cover uploaded!" });
    } catch (error) {
      next(error);
    }
  }
);

export default blogPostsRouter;
