import Express from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid";
import createHttpError from "http-errors";
import authorsRouter from "../authors/index.js";
import { checkBlogPostSchema, triggerBadRequest } from "./validation.js";

const blogPostsRouter = Express.Router();

const blogPostsJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "blogPosts.json"
);

const getBlogPosts = () => JSON.parse(fs.readFileSync(blogPostsJSONPath));
const writeBlogPost = (blogPosts) =>
  fs.writeFileSync(blogPostsJSONPath, JSON.stringify(blogPosts));

// POST
blogPostsRouter.post(
  "/",
  checkBlogPostSchema,
  triggerBadRequest,
  (req, res, next) => {
    try {
      const blogPosts = getBlogPosts();
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
      writeBlogPost(blogPosts);
      res.status(201).send({ postId: newBlogPost.id });
    } catch (error) {
      next(error);
    }
  }
);

// GET ALL
blogPostsRouter.get("/", (req, res, next) => {
  try {
    const blogPosts = getBlogPosts();
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
blogPostsRouter.get("/:blogPostId", (req, res, next) => {
  try {
    const blogPosts = getBlogPosts();
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
authorsRouter.get("/:authorId/blogPosts", (req, res, next) => {
  try {
    const blogPosts = getBlogPosts();
    const authorsPosts = blogPosts.filter(
      (b) => b.author.id === req.params.authorId
    );
    res.send(authorsPosts);
  } catch (error) {
    next(error);
  }
});

// PUT
blogPostsRouter.put("/:blogPostId", (req, res, next) => {
  try {
    const blogPosts = getBlogPosts();
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
      writeBlogPost(blogPosts);
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
blogPostsRouter.delete("/:blogPostId", (req, res, next) => {
  try {
    const blogPosts = getBlogPosts();
    const remainingBlogPosts = blogPosts.filter(
      (b) => b.id !== req.params.blogPostId
    );
    if (blogPosts.length !== remainingBlogPosts.length) {
      writeBlogPost(remainingBlogPosts);
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

export default blogPostsRouter;
