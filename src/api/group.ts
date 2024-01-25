import { Groups, Group } from "../types";
import { cleanURL, fetchWrap } from "../utils";
import { logVerbose } from "../utils/logger";

export async function getGroup({
  baseURL,
  groupName,
  id,
}: {
  baseURL: string;
  groupName?: string;
  id: string | number;
}): Promise<Group> {
  const url = new URL(`${baseURL}/rest/api/2/groups/picker?query=${id}`);
  const startTime = Date.now();
  logVerbose(`Get Group: START`, {
    url: cleanURL(url),
  });

  const results = await fetchWrap(url.toString(), {
    method: "GET",
  }).then(async (response) => {
    const result = (await response.json()) as Promise<Groups>;

    return result;
  });

  const group = results?.groups?.[0] as Group;

  if (!group) {
    logVerbose(`Get Group: END - GROUP NOT FOUND`, {
      url: cleanURL(url),
      duration: Date.now() - startTime,
      groupName,
    });

    return { name: groupName, id } as Group;
  }

  logVerbose(`Get Group: END`, {
    url: cleanURL(url),
    duration: Date.now() - startTime,
    groupName: group.name,
  });
  return { ...group, id };
}
