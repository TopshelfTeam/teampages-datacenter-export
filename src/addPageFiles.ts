import "dotenv/config";

import fs from "fs";

import { getWikiAttachments, saveImage } from "./api";
import { isUserExist } from "./utils";

import type { User, WikiAttachment } from "./types";
const BASE_URL = process.env.BASE_URL as string;
import { ROOT_DIR } from "./const";

export async function addPageFiles({
  pageId,
  projectKey,
  startAt = 0,
  maxResults = 50,
  users,
}: {
  pageId: string;
  projectKey: string;
  startAt?: number;
  maxResults?: number;
  users: User[];
}): Promise<User[]> {
  const pagePath = `${ROOT_DIR}/${projectKey}/${pageId}`;
  const attachmentMetaPath = `${pagePath}/attachments.json`;
  const attachmentMetaData: WikiAttachment[] = [];

  const attachments = await getWikiAttachments({
    baseURL: BASE_URL,
    pageId,
    startAt,
    maxResults,
  });
  if (attachments.values.length) {
    for (const attachment of attachments.values) {
      if (!fs.existsSync(`${pagePath}/files`)) {
        fs.mkdirSync(`${pagePath}/files`);
      }
      if (!isUserExist({ username: attachment.author.username, users })) {
        users.push({
          name: attachment.author.username,
          displayName: attachment.author.displayName,
        });
      }

      attachmentMetaData.push(attachment);

      await saveImage({
        imageURL: `${attachment.content}&dl=1`,
        outputLocationPath: `${pagePath}/files/${attachment.filename}`,
      });
    }

    if (!fs.existsSync(attachmentMetaPath)) {
      fs.writeFileSync(attachmentMetaPath, JSON.stringify(attachmentMetaData));
      console.log(
        `attachment meta ids ${attachmentMetaData
          .map(({ id }) => id)
          .join(", ")} for pageId ${pageId}  was added`
      );
    } else {
      const data = fs.readFileSync(attachmentMetaPath, "utf-8");
      const jsonObject = data ? JSON.parse(data) : [];

      fs.writeFileSync(
        attachmentMetaPath,
        JSON.stringify([...jsonObject, ...attachmentMetaData])
      );

      if (attachmentMetaData.length) {
        console.log(
          `attachment meta ids ${attachmentMetaData
            .map(({ id }) => id)
            .join(", ")} for pageId ${pageId}  was updated`
        );
      }
    }
  }
  if (attachments?.isLast === false) {
    await addPageFiles({
      startAt: startAt + maxResults,
      maxResults,
      projectKey,
      pageId,
      users,
    });
  }
  return users;
}
