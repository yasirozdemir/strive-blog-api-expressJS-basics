import Express from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid";
import createHttpError from "http-errors";

const blogPostsRouter = Express.Router();

const blogPostsJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "blogPosts.json"
);

const getBlogPosts = () => JSON.parse(fs.readFileSync(blogPostsJSONPath));
const writeBlogPost = (blogPosts) =>
  fs.writeFileSync(blogPostsJSONPath, JSON.stringify(blogPosts));

// POST
blogPostsRouter.post("/", (req, res, next) => {
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
});

// GET ALL
blogPostsRouter.get("/", (req, res, next) => {
  try {
    const blogPosts = getBlogPosts();
    res.send(blogPosts);
  } catch (error) {
    next(error);
  }
});

// GET BY ID
blogPostsRouter.get("/:blogPostId", (req, res, next) => {
  try {
    const specificBlogPost = getBlogPosts().find(
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

export default blogPostsRouter;
