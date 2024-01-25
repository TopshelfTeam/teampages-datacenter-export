import "dotenv/config";

import fs from "fs";
import { getResultsPageFilePath } from "./utils";
import { getGroup } from "./api";
const BASE_URL = process.env.BASE_URL as string;

import type { Group } from "./types";

export async function addGroups({
  projectKey,
  pageId,
  groups,
}: {
  projectKey: string;
  pageId: string;
  groups: Group[];
}) {
  if (!groups?.length) return;

  const groupFilePath = `${getResultsPageFilePath(
    projectKey
  )}/${pageId}/groups.json`;

  const extendedGroupData: Group[] = [];

  for (const group of [...new Map(groups.map((m) => [m.name, m])).values()]) {
    const groupData = await getGroup({
      baseURL: BASE_URL,
      groupName: group?.name,
      id: group.id,
    });
    extendedGroupData.push(groupData);
  }

  await new Promise((res) => {
    try {
      if (!fs.existsSync(groupFilePath)) {
        fs.writeFileSync(groupFilePath, JSON.stringify(extendedGroupData));
        console.log(`groups for pageId ${pageId} was created`);
      } else {
        const data = fs.readFileSync(groupFilePath, "utf-8");
        const jsonObject = data ? JSON.parse(data) : [];
        const results = extendedGroupData.filter(
          (el) => !jsonObject.some((data: Group) => data.id === el.id)
        );

        fs.writeFileSync(
          groupFilePath,
          JSON.stringify([...jsonObject, ...results])
        );

        console.log(`groups for pageId ${pageId} was updated`);
      }
    } catch (err) {
      console.debug({ err });
      throw err;
    } finally {
      res({});
    }
  });
}
