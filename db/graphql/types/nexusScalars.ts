import { asNexusMethod } from 'nexus';
import { GraphQLScalarType } from 'graphql';
import { DateTimeResolver } from 'graphql-scalars';

export const DateTime = asNexusMethod(new GraphQLScalarType(DateTimeResolver), 'dateTime');
