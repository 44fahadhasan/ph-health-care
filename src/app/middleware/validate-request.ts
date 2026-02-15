import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const validateRequest = (zodSchema: z.ZodTypeAny) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (req.body?.data && typeof req.body.data === "string") {
        req.body = JSON.parse(req.body.data);
      }

      const parsed = zodSchema.safeParse(req.body);

      if (!parsed.success) {
        return next(parsed.error);
      }

      req.body = parsed.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};
