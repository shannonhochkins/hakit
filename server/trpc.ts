import { initTRPC } from '@trpc/server';

const t = initTRPC.meta().context().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const mergeRouters = t.mergeRouters;
