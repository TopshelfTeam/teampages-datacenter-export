import "dotenv/config";

import { getWikiProjects } from "./api";
import fs from "fs";
import { WikiProject } from "./types";

const BASE_URL = process.env.BASE_URL as string;

export async function createProjects({
  startAt = 0,
  maxResults = 50,
  projectsFilePath,
  projectKey,
}: {
  startAt?: number;
  maxResults?: number;
  projectsFilePath: string;
  projectKey?: string;
}) {
  const projects = await getWikiProjects({
    baseURL: BASE_URL,
    startAt,
    maxResults,
    projectKey,
  });
  const values = projects.values.filter((el) => !!el.wikiData.pageCount);

  await new Promise((res) => {
    if (!startAt) {
      fs.writeFileSync(projectsFilePath, JSON.stringify(values));
    } else {
      const data = fs.readFileSync(projectsFilePath, "utf-8");
      const jsonObject = data ? JSON.parse(data) : [];
      const results = values.filter(
        (el) => !jsonObject.some((data: WikiProject) => data.id === el.id)
      );
      fs.writeFileSync(
        projectsFilePath,
        JSON.stringify([...jsonObject, ...results])
      );
      if (results.length) {
        console.log(
          `project: ${results.map(({ key }) => key).join(", ")} was created`
        );
      }
    }
    res({});
  });

  if (projects?.isLast === false) {
    await createProjects({
      startAt: startAt + maxResults,
      maxResults,
      projectsFilePath,
      projectKey,
    });
  }
}
