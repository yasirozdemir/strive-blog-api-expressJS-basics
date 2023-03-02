import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const { readJSON, writeJSON, writeFile } = fs;

export const dataFolderPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../data"
);

export const authorsJSONPath = join(dataFolderPath, "auhtors.json");
export const authorsPublicPath = join(process.cwd(), "./public/img/auhtors");

export const blogPostsJSONPath = join(dataFolderPath, "blogPosts.json");
// const blogPostImgsPublicPath = join(process.cwd(), "./public/img/blogPosts");

export const getAuthors = () => readJSON(authorsJSONPath);
export const writeAuthors = (authors) => writeJSON(authorsJSONPath, authors);

export const getBlogPosts = () => readJSON(blogPostsJSONPath);
export const writeBlogPosts = (blogPosts) =>
  writeJSON(blogPostsJSONPath, blogPosts);

export const saveAuthorsAvatars = (fileName, fileContentAsBuffer) =>
  writeFile(join(authorsPublicPath, fileName), fileContentAsBuffer);
