import Express from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid";

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

export default blogPostsRouter;
