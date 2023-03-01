import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";

const blogPostSchema = {
  category: {
    in: ["body"],
    isString: {
      errorMessage: "Title is a mandatory field and needs to be a string!",
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
