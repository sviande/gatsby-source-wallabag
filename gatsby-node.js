const fetch = require("node-fetch");
const queryString = require("query-string");

exports.sourceNodes = async (
  { actions, createNodeId, createContentDigest, store, getNodes },
  configOptions
) => {
  const { createNode, setPluginStatus, touchNode } = actions;

  const existingNodes = getNodes().filter(
    n => n.internal.owner === `gatsby-source-wallabag`
  )
  existingNodes.forEach(n => touchNode(n))


  const pluginStatus = store.getState().status.plugins[
    "gatsby-source-wallabag"
  ];

  let lastFetched = null;
  if (pluginStatus) {
    lastFetched = pluginStatus.lastFetched;
  }

  const articleToNode = article => {
    return {
      ...article,
      id: createNodeId(article.id),
      parent: null,
      children: [],
      internal: {
        type: "WallabagArticles",
        contentDigest: createContentDigest(article)
      }
    };
  };

  // Gatsby adds a configOption that's not needed for this plugin, delete it
  delete configOptions.plugins;

  const authBody = {
    grant_type: "password",
    client_id: configOptions.clientID,
    client_secret: configOptions.clientSecret,
    username: configOptions.username,
    password: configOptions.password
  };

  const authResponse = await fetch(`${configOptions.URL}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: queryString.stringify(authBody)
  });
  const auth = await authResponse.json();

  const pageQuery = {
    sort: "updated",
    perPage: 500
  };

  if (lastFetched) {
    pageQuery.since = Math.round(lastFetched / 1000);
  }

  lastFetched = new Date();

  const pageResponse = await fetch(
    `${configOptions.URL}/api/entries.json?${queryString.stringify(pageQuery)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${auth.access_token}`
      }
    }
  );

  if (!pageResponse.ok) {
    throw new Error(pageResponse.statusText);
  }

  let entries = await pageResponse.json();

  do {
    entries._embedded.items.forEach(article => {
      article.created_at = new Date(article.created_at);
      article.updated_at = new Date(article.updated_at);
      article.archived_at = article.archived_at
        ? new Date(article.archived_at)
        : null;
      createNode(articleToNode(article));
    });

    if (!entries._links.next) {
      return;
    }
    const response = await fetch(entries._links.next.href, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${auth.access_token}`
      }
    });
    entries = await response.json();
  } while (entries._links.next);

  setPluginStatus({ lastFetched: lastFetched.getTime() });
  return;
};
