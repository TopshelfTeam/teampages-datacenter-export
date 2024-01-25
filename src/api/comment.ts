import { WikiComments } from "../types/comment";
import { cleanURL, fetchWrap } from "../utils";
import { logVerbose } from "../utils/logger";

export async function getWikiComments({
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
    `${baseURL}/rest/simplewiki/2.0/comment?startAt=${startAt}&maxResults=${maxResults}&pageId=${pageId}`
  );
  const startTime = Date.now();
  logVerbose(`Get Comments: START`, {
    url: cleanURL(url),
  });

  const results = await fetchWrap(url.toString(), {
    method: "GET",
  }).then(async (response) => {
    return (await response.json()) as Promise<WikiComments>;
  });

  logVerbose(`Get Comments: END`, {
    url: cleanURL(url),
    duration: Date.now() - startTime,
    commentKeys: results.values.map(({ id }) => id).join(","),
  });
  return results;
}
