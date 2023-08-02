import { PrismaClient } from '@prisma/client';
import { GraphQLSchema } from 'graphql';
import { makeSchema, connectionPlugin } from 'nexus';
import { join } from 'path';
import * as types from './types';
import * as serverQueries from './serverQueries';

export const schema = makeSchema({
  types: [types, serverQueries],
  plugins: [connectionPlugin()],
  outputs: {
    typegen: join(process.cwd(), 'node_modules', '@types', 'nexus-typegen', 'index.d.ts'),
    schema: join(process.cwd(), 'database/graphql/schema.graphql'),
  },
}) as unknown as GraphQLSchema;
