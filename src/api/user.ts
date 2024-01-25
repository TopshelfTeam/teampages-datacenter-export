import { User } from "../types";
import { cleanURL, fetchWrap } from "../utils";
import { logVerbose } from "../utils/logger";

export async function getUser({
  baseURL,
  name,
  displayName,
}: {
  baseURL: string;
  name: string;
  displayName?: string;
}) {
  const url = new URL(`${baseURL}/rest/api/2/user?username=${name}`);
  const startTime = Date.now();
  logVerbose(`Get User: START`, {
    url: cleanURL(url),
  });

  const results = await fetchWrap(url.toString(), {
    method: "GET",
  }).then(async (response) => {
    const result = (await response.json()) as Promise<
      User & { errorMessages: [] }
    >;

    return result;
  });

  if (results?.errorMessages?.length) {
    logVerbose(`Get User: END - USER NOT FOUND`, {
      url: cleanURL(url),
      duration: Date.now() - startTime,
      userKey: name,
    });

    return { name, displayName } as User;
  }

  logVerbose(`Get User: END`, {
    url: cleanURL(url),
    duration: Date.now() - startTime,
    userKey: results.key,
  });
  return results as User;
}
