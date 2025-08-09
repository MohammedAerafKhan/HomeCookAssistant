const express = require("express");
const router = express.Router();
const User = require("../models/User")
const {
  generateMealPlan,
  generateGroceryList,
  generateInstructions,
} = require("../controllers/mealController");

router.get("/generateMeal", generateMealPlan);

router.get("/generateGroceryList", generateGroceryList);

router.get("/generateInstructions", generateInstructions);

router.get("/stored", async (req, res) => {
  const user = req.session.user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const dbUser = await User.findOne({ email: user.email });
  if (!dbUser) return res.status(404).json({ message: "User not found" });

  const history = (dbUser.mealHistory || []).sort((a,b) => new Date(a.startDate) - new Date(b.startDate));
res.json({
  plan: dbUser.mealPlan || "",
  groceryList: dbUser.groceryList || {},
  instructions: dbUser.instructions || "",
  history: dbUser.mealHistory || []
});

});

module.exports = router;
