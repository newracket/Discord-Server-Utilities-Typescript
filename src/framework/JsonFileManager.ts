import fs from "fs";
import path from "path";
// Importing all JSON files for typescript build
import mutedJSON from "../../jsons/muted.json";
import nicksJSON from "../../jsons/nicks.json";
import ranksJSON from "../../jsons/ranks.json";
import strikesJSON from "../../jsons/strikes.json";

export default class JSONFileManager {
  fileName: string;
  importedJSONs = { mutedJSON, nicksJSON, ranksJSON, strikesJSON };

  constructor(fileName: string) {
    this.fileName = fileName + ".json";

    if (!fs.existsSync(path.join(__dirname, `../../jsons/${this.fileName}`))) {
      fs.writeFileSync(
        path.join(__dirname, `../../jsons/${this.fileName}`),
        "{}"
      );
    }
  }

  get() {
    return JSON.parse(
      fs.readFileSync(
        path.join(__dirname, `../../jsons/${this.fileName}`),
        "utf8"
      )
    );
  }

  set(value: any) {
    fs.writeFileSync(
      path.join(__dirname, `../../jsons/${this.fileName}`),
      JSON.stringify(value)
    );

    return value;
  }

  setValue(key: string, value: any) {
    const currentJSON = this.get();
    currentJSON[key] = value;
    this.set(currentJSON);

    return currentJSON;
  }

  getValue(key: string) {
    return this.get()[key];
  }

  numKeys() {
    return Object.keys(this.get()).length;
  }

  append(value: string) {
    const currentJSON = this.get();
    currentJSON.push(value);
    this.set(currentJSON);

    return currentJSON;
  }

  hasKey(key: string) {
    return Object.keys(this.get()).includes(key);
  }

  deleteKey(key: string) {
    if (!this.hasKey(key)) return;

    const currentJSON = this.get();
    delete currentJSON[key];
    this.set(currentJSON);

    return currentJSON;
  }

  getKeyFromValue(value: string) {
    const jsonObject = this.get();
    const key = Object.keys(jsonObject).find(
      (key) => jsonObject[key] === value
    );

    return key ? key : "";
  }
}

module.exports = JSONFileManager;
