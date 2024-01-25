import { WikiProjects, WikiPages, WikiPage } from "../types";
import { cleanURL, fetchWrap } from "../utils";
import { logVerbose } from "../utils/logger";

export async function getWikiProjects({
  baseURL,
  startAt = 0,
  maxResults = 50,
  projectKey,
}: {
  baseURL: string;
  startAt?: number;
  maxResults?: number;
  projectKey?: string;
}) {
  const searchParticularProject = projectKey ? `&query=${projectKey}` : "";

  const url = new URL(
    `${baseURL}/rest/simplewiki/2.0/project?startAt=${startAt}&maxResults=${maxResults}${searchParticularProject}`
  );
  const startTime = Date.now();
  logVerbose(`Get Projects: START`, {
    url: cleanURL(url),
  });

  const results = await fetchWrap(url.toString(), {
    method: "GET",
  }).then(async (response) => {
    return (await response.json()) as Promise<WikiProjects>;
  });

  logVerbose(`Get Projects: END`, {
    url: cleanURL(url),
    duration: Date.now() - startTime,
    projectKeys: results.values.map(({ key }) => key).join(","),
  });
  return results;
}

export async function getWikiPages({
  baseURL,
  startAt = 0,
  maxResults = 50,
  projectKey,
  params,
}: {
  baseURL: string;
  startAt?: number;
  maxResults?: number;
  projectKey: string;
  params?: string;
}) {
  const url = new URL(
    `${baseURL}/rest/simplewiki/2.0/pages${params ? "?" + params : ""}`
  );
  const startTime = Date.now();
  logVerbose(`Get Pages: START`, {
    url: cleanURL(url),
  });

  const results = await fetchWrap(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startAt,
      maxResults,
      projectKey,
    }),
  }).then(async (response) => {
    return (await response.json()) as Promise<WikiPages>;
  });

  logVerbose(`Get Pages: END`, {
    url: cleanURL(url),
    duration: Date.now() - startTime,
    projectKeys: results.values.map(({ key }) => key).join(","),
  });
  return results;
}

export async function getWikiPage({
  baseURL,
  pageId,
}: {
  baseURL: string;
  pageId: string;
}) {
  const url = new URL(
    `${baseURL}/rest/simplewiki/2.0/page?includePermissions=true&includeSharing=true&trackUsage=true&pageId=${pageId}`
  );
  const startTime = Date.now();
  logVerbose(`Get Page: START`, {
    url: cleanURL(url),
  });

  const results = await fetchWrap(url.toString(), {
    method: "GET",
  }).then(async (response) => {
    return (await response.json()) as Promise<WikiPage>;
  });

  logVerbose(`Get Page: END`, {
    url: cleanURL(url),
    duration: Date.now() - startTime,
    projectKeys: results.id,
  });
  return results;
}

export async function getWikiPageVersion({
  baseURL,
  pageId,
  versionId,
}: {
  baseURL: string;
  pageId: string;
  versionId: string;
}) {
  const url = new URL(
    `${baseURL}/rest/simplewiki/2.0/page?changeId=${versionId}&includePermissions=true&includeSharing=true&trackUsage=false&pageId=${pageId}`
  );
  const startTime = Date.now();
  logVerbose(`Get Page Version: START`, {
    url: cleanURL(url),
  });

  const results = await fetchWrap(url.toString(), {
    method: "GET",
  }).then(async (response) => {
    return (await response.json()) as Promise<WikiPage>;
  });

  logVerbose(`Get Page Version: END`, {
    url: cleanURL(url),
    duration: Date.now() - startTime,
    projectKeys: results.id,
  });
  return results;
}
