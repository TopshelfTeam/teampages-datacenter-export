import "dotenv/config";

import fs from "fs";
import { getResultsPageFilePath } from "./utils";
import { getUser } from "./api/user";
const BASE_URL = process.env.BASE_URL as string;

import type { User } from "./types";

export async function addUserMappings({
  projectKey,
  pageId,
  users,
}: {
  projectKey: string;
  pageId: string;
  users: User[];
}) {
  if (!users?.length) return;

  const userMappingsFilePath = `${getResultsPageFilePath(
    projectKey
  )}/${pageId}/user-mappings.json`;

  const extendedUserData: User[] = [];

  for (const user of [...new Map(users.map((m) => [m.name, m])).values()]) {
    const userData = await getUser({
      baseURL: BASE_URL,
      name: user.name,
      displayName: user.displayName,
    });
    extendedUserData.push(userData);
  }

  await new Promise((res) => {
    try {
      if (!fs.existsSync(userMappingsFilePath)) {
        fs.writeFileSync(
          userMappingsFilePath,
          JSON.stringify(extendedUserData)
        );
        console.log(`user mappings for pageId ${pageId} was created`);
      } else {
        const data = fs.readFileSync(userMappingsFilePath, "utf-8");
        const jsonObject = data ? JSON.parse(data) : [];
        const results = extendedUserData.filter(
          (el) => !jsonObject.some((data: User) => data.name === el.name)
        );

        fs.writeFileSync(
          userMappingsFilePath,
          JSON.stringify([...jsonObject, ...results])
        );

        console.log(`user mappings for pageId ${pageId} was created`);
      }
    } catch (err) {
      console.debug({ err });
      throw err;
    } finally {
      res({});
    }
  });
}
