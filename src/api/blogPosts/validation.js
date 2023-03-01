import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";

const blogPostSchema = {
  category: {
    in: ["body"],
    isString: {
      errorMessage: "category is a mandatory field and needs to be a string!",
    },
  },
  title: {
    in: ["body"],
    isString: {
      errorMessage: "title is a mandatory field and needs to be a string!",
    },
  },
  cover: {
    in: ["body"],
    isString: {
      errorMessage: "cover is a mandatory field and needs to be a url string!",
    },
  },
  readTime: {
    in: ["body"],
    isObject: {
      errorMessage: "readTime is a mandatory field and needs to be an object!",
    },
  },
  "readTime.value": {
    in: ["body"],
    isNumeric: {
      errorMessage: "value is a mandatory field and needs to be a number!",
    },
  },
  "readTime.unit": {
    in: ["body"],
    isString: {
      errorMessage: "unit is a mandatory field and needs to be a string!",
    },
  },
  author: {
    in: ["body"],
    isObject: {
      errorMessage: "author is a mandatory field and needs to be an object!",
    },
  },
  "author.name": {
    in: ["body"],
    isString: {
      errorMessage: "name is a mandatory field and needs to be a string!",
    },
  },
  content: {
    in: ["body"],
    isString: {
      errorMessage: "content is a mandatory field and needs to be a string!",
    },
  },
};

export const checkBlogPostSchema = checkSchema(blogPostSchema);

export const triggerBadRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    next();
  } else {
    next(
      createHttpError(400, "Errors during blog post validation", {
        errors: errors.array(),
      })
    );
  }
};
