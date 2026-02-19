import {
  insertUsers,
} from "../../db.js";

// Insert Users ----------------------------
export async function insertUsersHandler(req, res) {
  try {
    const result = await insertUsers(req.body);
    res.status(201).json({
      success: true,
      id: result.insertedId,
    });
  }
  catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}
