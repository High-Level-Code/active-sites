import fs from "node:fs";

export function log(path: string, message: string) {
  fs.appendFileSync(path, message);
}
