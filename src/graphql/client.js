import { InMemoryCache } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { WebSocketLink } from "apollo-link-ws";
const headers = { "x-hasura-admin-secret": "react12" };

const client = new ApolloClient({
  link: new WebSocketLink({
    uri: "wss://instagram-react12-clone.herokuapp.com/v1/graphql",
    options: {
      reconnect: true,
      connectionParams: {
        headers,
      },
    },
  }),
  cache: new InMemoryCache(),
});

export default client;
