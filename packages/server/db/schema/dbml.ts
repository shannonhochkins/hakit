import * as schema from './db';
import { pgGenerate } from 'drizzle-dbml-generator';
const out = './schema.dbml';
const relational = true;
pgGenerate({ schema, out, relational });