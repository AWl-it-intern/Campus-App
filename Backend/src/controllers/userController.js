import { createUser } from "../services/userService.js";

// Insert Users ----------------------------
export async function insertUsersHandler(req, res) {
  try {
    const result = await createUser(req.body);
    res.status(201).json({
      success: true,
      id: result.insertedId,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}
