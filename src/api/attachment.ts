import { WikiAttachments } from "../types";
import { cleanURL, fetchWrap } from "../utils";
import { logVerbose } from "../utils/logger";

export async function getWikiAttachments({
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
    `${baseURL}/rest/simplewiki/2.0/attachment?includeVersion=true&startAt=${startAt}&maxResults=${maxResults}&pageId=${pageId}`
  );
  const startTime = Date.now();
  logVerbose(`Get Attachments: START`, {
    url: cleanURL(url),
  });

  const results = await fetchWrap(url.toString(), {
    method: "GET",
  }).then(async (response) => {
    return (await response.json()) as Promise<WikiAttachments>;
  });

  logVerbose(`Get Attachments: END`, {
    url: cleanURL(url),
    duration: Date.now() - startTime,
    attachmentKeys: results.values.map(({ id }) => id).join(","),
  });
  return results;
}
