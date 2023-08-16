import { GraphQLSchema } from 'graphql';
import { makeSchema, connectionPlugin } from 'nexus';
import { join } from 'path';
import { NexusTypes, ServerQueries, ServerMutations, NexusScalars, NexusEnums } from './types';

export const schema = makeSchema({
  types: [NexusTypes, ServerQueries, NexusScalars, NexusEnums, ServerMutations],
  plugins: [connectionPlugin()],
  outputs: {
    typegen: join(process.cwd(), 'node_modules', '@types', 'nexus-typegen', 'index.d.ts'),
    schema: join(process.cwd(), 'db/graphql/schema.graphql'),
  },
}) as unknown as GraphQLSchema;
