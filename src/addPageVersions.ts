import "dotenv/config";

import { getWikiPageVersion } from "./api";
import fs from "fs";

import { parser } from "stream-json";
import { streamValues } from "stream-json/streamers/StreamValues";

import { getUniqUsersFromBodyContent, isUserExist } from "./utils";

import type { User } from "./types";

import { ROOT_DIR } from "./const";

const BASE_URL = process.env.BASE_URL as string;

export async function addPageVersions({
  pageId,
  projectKey,
}: {
  pageId: string;
  projectKey: string;
}): Promise<User[]> {
  const users: User[] = [];
  const pagePath = `${ROOT_DIR}/${projectKey}/${pageId}`;

  const readStream = fs.createReadStream(`${pagePath}/history.json`);
  for await (const data of readStream.pipe(parser()).pipe(streamValues())) {
    for (const value of data.value) {
      if (value.entity !== "VERSION") continue;
      const pageVersion = await getWikiPageVersion({
        baseURL: BASE_URL,
        pageId: value.page.id,
        versionId: value.id,
      });

      const newUsers = getUniqUsersFromBodyContent(pageVersion?.body);
      newUsers.forEach((user) => {
        if (!users.some((el) => el.name === user.name)) {
          users.push(user);
        }
      });

      if (!isUserExist({ username: pageVersion.owner.username, users })) {
        newUsers.push({
          name: pageVersion.owner.username,
          displayName: pageVersion.owner.displayName,
        });
      }
      if (pageVersion?.watchers?.length) {
        for (const watcher of pageVersion.watchers) {
          if (!isUserExist({ username: watcher.username, users })) {
            users.push({
              name: watcher.username,
              displayName: watcher.displayName,
            });
          }
        }
      }

      fs.writeFileSync(
        `${pagePath}/page_${pageVersion.versionInfo.id}.json`,
        JSON.stringify(pageVersion)
      );

      console.log(
        `page version id ${pageVersion.versionInfo.id} for pageId ${pageId} was added`
      );
    }
  }

  return users;
}
