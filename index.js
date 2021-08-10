const { gql, ApolloServer } = require("apollo-server");
const { Neo4jGraphQL } = require("@neo4j/graphql");
const neo4j = require("neo4j-driver");
require("dotenv").config();

const typeDefs = gql`
  type User {
    username: String
    orders: [Order!]! @relationship(type: "PLACED", direction: OUT)
  }

  type Order {
    orderId: ID! @id
    created: DateTime! @timestamp(operations: [CREATE])
    customer: User! @relationship(type: "PLACED", direction: IN)
    products: [Product!]! @relationship(type: "CONTAINS", direction: OUT, properties: "Contains")
  }

  type Video {
    title: String
    sku: String
  }

  type Book {
    title: String
    isbn: String
    pageCount: Int
  }

  union Product = Video | Book

  interface Contains {
      quantity: Int
  }
`;

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

const neoSchema = new Neo4jGraphQL({ typeDefs, driver });

const server = new ApolloServer({
  schema: neoSchema.schema,
});

server.listen().then(({ url }) => {
  console.log(`GraphQL server ready on ${url}`);
});
