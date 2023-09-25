import { initTRPC } from '@trpc/server';
import { OpenApiMeta } from 'trpc-openapi';

const t = initTRPC.meta<OpenApiMeta>().context().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const mergeRouters = t.mergeRouters;
