import express from 'express'
import { ENV } from './config/env.js';
import { db } from './config/db.js';
import { favoriteTable } from './db/schema.js';
import { eq, and } from 'drizzle-orm'; //
const app = express();
const PORT = ENV.PORT;

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is running" });
});

app.post("/api/favorities", async(req, res) => {

  try {
   const {userId,recepiId,title,image,cookTime,servings} = req.body;
    if(!userId || !recepiId || !title) {
      return res.status(400).json({ success: false, message: "Missing fields are required" });
    }
    const newFavorite = await db.insert(favoriteTable).values({
      userId,
      recepiId,
      title,
      image,
      cookTime,
      servings
    })
    .returning();
    res.status(201).json({ success: true, data: newFavorite });

  } catch (error) {
    console.error("Error creating favorite:", error);
    res.status(500).json({ success: false, message: "Internal server error" }); 
  }
});

app.delete("/api/favorities/:userId/:recepiId", async(req, res) => {
  try {
    const { userId, recepiId } = req.params;
    if (!userId || !recepiId) {
      return res.status(400).json({ success: false, message: "Missing userId or recepiId" });
    }
    const deletedFavorite = await db.delete(favoriteTable)
      .where(and (
        eq(favoriteTable.userId, userId),
        eq(favoriteTable.recepiId, recepiId)
      ));

    res.status(200).json({ success: true, data: deletedFavorite });
  } catch (error) {
    console.error("Error deleting favorite:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.get("/api/favorities/:userId", async(req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing userId" });
    }
    const favorites = await db.select().from(favoriteTable).where(eq(favoriteTable.userId, userId));
    res.status(200).json({ success: true, data: favorites });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})