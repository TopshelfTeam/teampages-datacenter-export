import { cleanURL, fetchWrap } from "../utils";
import { logVerbose } from "../utils/logger";
import fs from "fs";

export async function saveImage({
  imageURL,
  outputLocationPath,
}: {
  imageURL: string;
  outputLocationPath: string;
}) {
  const url = new URL(imageURL);
  logVerbose(`Save an Image: START`, {
    url: cleanURL(url),
  });

  await fetchWrap(url.toString(), {
    method: "GET",
  })
    .then(async (res) => {
      return await new Promise((resolve, reject) => {
        if (!res.body) throw new Error("file doesn't exist");
        const dest = fs.createWriteStream(outputLocationPath);

        // @ts-expect-error test
        res.body.pipe(dest);
        // @ts-expect-error test
        res.body.on("end", () => {
          resolve("outputLocationPath was saved");
        });
        dest.on("error", (err) => {
          reject(err);
        });
      });
    })
    .then((x) => console.log(x))
    .catch((err) => {
      throw err;
    });

  logVerbose(`Save an Image: END`, {
    url: cleanURL(url),
  });
}
