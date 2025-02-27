import { z } from "zod";
import { insertUserSchema } from "../packages/server/db/schema/users";
import { insertConfigSchema } from "../packages/server/db/schema/config";


export const createUserSchema = insertUserSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export type CreateUser = z.infer<typeof createUserSchema>;

// If you want to omit auto-generated columns (e.g. id, timestamps), do so here:
export const createConfigSchema = insertConfigSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// This is the type for creating new config on the client
export type CreateConfiguration = z.infer<typeof createConfigSchema>;