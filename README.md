## Description
A Gatsby source plugin for sourcing data into your Gatsby application from your Wallabag instance.

The plugin creates `WallabagArticles` nodes from your wallabag articles.

## How to install
With npm
`npm install --save gatsby-source-wallabag`
Or yarn
`yarn add gatsby-source-wallabag`

## Examples of usage
The plugin require a clientID, clientSecret you can create a new API client at this URL https://app.wallabag.it/developer/client/create.

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
   {
      resolve: `gatsby-source-wallabag`,
      options: {
        URL: `https://wallabag.it`,
        clientID: `ClientIDGenerated`,
        clientSecret: `clientSecretGenerated`,
        username: `yourusername`,
        password: `yourpassword`
      },
    },
  ],
}
```

## How to query for data
The plugin create node with type `WallabagArticles`, it saves all article properties send by the API.
```graphql
query MyQuery {
  allWallabagArticles {
    edges {
      node {
        archived_at
        content
        created_at
        domain_name
        given_url
        hashed_given_url
        hashed_url
        user_name
        user_id
        user_email
        url
        updated_at
        title
        tags {
          label
          slug
          id
        }
        starred_at
        reading_time
        published_by
        published_at
        preview_picture
        origin_url
        mimetype
        is_starred
        is_public
        is_archived
        id
      }
    }
  }
}
```

## Example

The following example create new nodes from wallabagArticles

```javascript
// In your gatsby-node.js
const manageWallabagArticles = ({ node, createNodeId, getNode, actions }) => {
  //Create new node type from WallabagArticles
  const exampleNode = {
      id: createNodeID(someID),
      internal: {
        type: 'exampleType',
      }
      //add properties
  };
  createNode(exampleNode);
};

exports.onCreateNode = ({ node, createNodeId, getNode, actions }) => {
  if (node.internal.type === "WallabagArticles") {
    manageWallabagArticles({ node, createNodeId, getNode, actions });
  }
};
```
