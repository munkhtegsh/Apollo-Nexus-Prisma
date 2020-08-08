import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';
import express from 'express';
import * as path from 'path';
import { objectType, intArg, stringArg, mutationField } from '@nexus/schema';
import { makeSchema } from '@nexus/schema';
import { nexusSchemaPrisma } from 'nexus-plugin-prisma/schema';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
interface Context {
    request: Request & any;
    prisma: PrismaClient;
}

const context = (request: Request): Context => {
    return {
        request,
        prisma,
    };
}

const User = objectType({
    name: 'User',
    definition(t) {
        t.id('id');
        t.string('email');
    },
});

const createUser = mutationField('createUser', {
    type: User,
    resolve: (_root, _parent, prisma) => {
        return prisma.context //<============== autocomplation feature is not working ?
    }
})

const schema = makeSchema({
    types: [User],
    plugins: [nexusSchemaPrisma()],
    outputs: {
        schema: path.join(__dirname, './../schema.graphql'),
        typegen: path.join(__dirname, './generated/nexus.ts'),
    }
});

const { PORT = 5000 } = process.env;

const app = express();
const server = createServer(app);
const apollo = new ApolloServer({
    schema,
    context,
});
apollo.applyMiddleware({ app });

server.listen({ port: PORT }, () => {
    process.stdout.write(
        `🚀 Server ready at http://localhost:${PORT}${apollo.graphqlPath}\n`,
    );
});
