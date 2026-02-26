import { insertUsers } from "../../db.js";

export async function createUser(payload) {
  return insertUsers(payload);
}
