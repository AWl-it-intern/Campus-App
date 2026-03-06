import { insertUsers } from "../db/index.js";

export async function createUser(payload) {
  return insertUsers(payload);
}
