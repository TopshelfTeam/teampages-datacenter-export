import { WikiHistory } from "../types";
import { cleanURL, fetchWrap } from "../utils";
import { logVerbose } from "../utils/logger";

export async function getWikiHistory({
  baseURL,
  startAt = 0,
  maxResults = 1,
  pageId,
}: {
  baseURL: string;
  startAt?: number;
  maxResults?: number;
  pageId: string;
}) {
  const url = new URL(
    `${baseURL}/rest/simplewiki/2.0/history2?startAt=${startAt}&maxResults=${maxResults}&pageId=${pageId}`
  );
  const startTime = Date.now();
  logVerbose(`Get History: START`, {
    url: cleanURL(url),
  });

  const results = await fetchWrap(url.toString(), {
    method: "GET",
  }).then(async (response) => {
    return (await response.json()) as Promise<WikiHistory>;
  });

  logVerbose(`Get History: END`, {
    url: cleanURL(url),
    duration: Date.now() - startTime,
    historyKeys: results.values.map(({ id }) => id).join(","),
  });
  return results;
}
