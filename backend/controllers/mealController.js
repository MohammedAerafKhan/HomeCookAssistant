const { OpenAI } = require("openai");
const User = require("../models/User");
const MAX_RETRIES = 3;

const client = new OpenAI({
  apiKey: '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',
  baseURL: "https://api.groq.com/openai/v1"
});

function parseMarkdownToStructuredPlan(markdown, expectedMeals) {
  const days = markdown.split(/### Day \d:/).filter(Boolean);
  if (days.length !== 7) return null;

  const structured = [];

  for (const dayText of days) {
    const lines = dayText.trim().split("\n").filter(Boolean);
    const meals = {};

    for (const line of lines) {
      const match = line.match(/^\*\s*(.+?):\s*(.*)/);
      if (match) {
        const [, mealType, description] = match;
        meals[mealType.trim()] = description.trim();
      }
    }

    // Ensure all expected meals are present
    const isValid = expectedMeals.every(meal => meals[meal]);
    if (!isValid) return null;

    structured.push(meals);
  }

  return structured;
}

function parseGroceryMarkdown(markdown) {
  const lines = markdown.split("\n").map((l) => l.trim()).filter(Boolean);
  const result = {};
  let currentCategory = null;

  for (const line of lines) {
    const headerMatch = line.match(/^###\s+([^:]+):/);
    if (headerMatch) {
      const category = headerMatch[1].trim();
      if (!category) return null;
      currentCategory = category;
      result[currentCategory] = [];
      continue;
    }

    const itemMatch = line.match(/^\*\s+(.+?)\s*\(([^)]+)\)$/);
    if (itemMatch && currentCategory) {
      const name = itemMatch[1].trim();
      const quantity = itemMatch[2].trim();
      if (!name || !quantity) return null;
      result[currentCategory].push({ item: name, quantity });
      continue;
    }

    // Invalid line format
    return null;
  }

  return Object.keys(result).length ? result : null;
}

const generateMealPlan = async (req, res) => {
  const weekOffset = parseInt(req.query.offset || '0', 10);
  const email = req.session.user.email;
  const dbUser = await User.findOne({ email });
  if (!dbUser || !dbUser.quizData) {
    console.error("Generate meal plan Error: User/quizData not found =>", dbUser);
    console.error("quizData =>", dbUser.quizData);
    return res.status(400).json({ message: 'User/quizData not found' });
  }

  const quiz = dbUser.quizData;

  const prompt = `
    Hello, 
    I am a ${quiz.gender}, age: ${quiz.age}, height: ${quiz.height}, weight: ${quiz.weight} and my goals are ${quiz.reason}.
    My prefered meal type is ${quiz.mealType}, my cooking skills are ${quiz.skillLevel} level. I have (${quiz.restrictions.join(", ")}) allergy, if the brackets are empty then I dont have any allergy.
    My favoirate cuisines are ${quiz.cuisine.join(", ")}
    
    Generate a full 7-day meal plan for ${quiz.mealsPerDay.join(", ")} for me.
    dont send any extra text at all and Output should be in the following manner:
    ### Day X: (X being 1 to 7)
    * Breakfast/Lunch/Dinner:
`;

  let structuredPlan = null;
  let rawText = "";

for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "You are a helpful meal planning assistant." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2500,
        top_p: 0.9
      });

      rawText = response.choices[0].message.content.trim();
      structuredPlan = parseMarkdownToStructuredPlan(rawText, quiz.mealsPerDay);

      if (structuredPlan) {
        break;
      } else {
        console.warn(`Attempt ${attempt}: invalid plan, retrying...`);
      }
    } catch (err) {
      console.error(`Attempt ${attempt} failed:`, err.message);
    }
  }

  if (!structuredPlan) {
    console.error("Invalid meal plan format or missing meals.")
    console.log("!structuredPlan Raw Text: ", rawText)
    console.log("!structuredPlan Structured Plan: ", structuredPlan)
    return res.status(400).json({ message: "Invalid meal plan format or missing meals." });
  }

  console.log("=========================== For debugging ===========================")
  console.log("Raw Text: ", rawText)
  console.log("Structured Plan: ", structuredPlan)

  dbUser.mealPlan = structuredPlan;
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - ((startDate.getDay() + 6) % 7));
  if (weekOffset) {
    startDate.setDate(startDate.getDate() + weekOffset * 7);
  }

  dbUser.mealHistory = dbUser.mealHistory || [];
  dbUser.mealHistory = dbUser.mealHistory.filter(w =>
    w.startDate.toISOString().slice(0,10) !== startDate.toISOString().slice(0,10)
  );
  dbUser.mealHistory.push({ startDate, plan: structuredPlan });
  if (dbUser.mealHistory.length > 3) {
    dbUser.mealHistory = dbUser.mealHistory.slice(-3);
  }

  await dbUser.save();

  req.session.rawMealPlan = rawText;
  // req.session.currentWeekStart = iso;
  res.json({ plan: structuredPlan });
};

const generateGroceryList = async (req, res) => {
  const email = req.session.user.email;
  const dbUser = await User.findOne({ email });

  if (!dbUser) {
    console.error("Generate grocery list Error: User not found =>", dbUser);
    return res.status(400).json({ message: 'User not found' });
  }

  const rawInstructionsText = req.session.rawInstructions;
  const weekOffset = parseInt(req.query.offset || '0', 10);
  console.log("Raw Instructions in generate Grocery List: ", rawInstructionsText)
  if (!rawInstructionsText) {
     return res.status(400).json({ message: "No instruction data found. Please generate instructions first." });
  }

  const prompt = `
I have the following 7-day meal plan's preparation instructions in Markdown format. Please analyze the plan and generate a grocery list.

${rawInstructionsText}

Do not send any extra text apart from the grocery list. Return the grocery list in the following format:
### GroceryCategoryX: (Category being vegetables, spices, grains etc.)
* groceryItem_x (quantity)

`

  let structuredGrocery = null;
  let groceryList = "";

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "You are a helpful assistant that creates structured grocery lists from weekly meal plans." },
          { role: "user", content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 3000,
        top_p: 0.9
      });

      groceryList = response.choices[0].message.content.trim();
      console.log("Generated Grocery List:\n", groceryList);
      structuredGrocery = parseGroceryMarkdown(groceryList);
      if (structuredGrocery) {
        break;
      } else {
        console.warn(`Attempt ${attempt}: invalid grocery list format, retrying...`);
      }
    } catch (err) {
      console.error(`Attempt ${attempt} failed:`, err.message);
    }
  }

  if (!structuredGrocery) {
    console.error("Invalid grocery list format.");
    console.log("Raw Grocery List:\n", groceryList);
    return res.status(400).json({ message: "Invalid grocery list format." });
  }

  dbUser.groceryList = structuredGrocery;
  dbUser.mealHistory = dbUser.mealHistory || [];

  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - ((startDate.getDay() + 6) % 7));
  if (weekOffset) {
    startDate.setDate(startDate.getDate() + weekOffset * 7);
  }

  const weekKey = startDate.toISOString().slice(0, 10);
  const weekIndex = dbUser.mealHistory.findIndex(
    w => w.startDate.toISOString().slice(0,10) === weekKey
  );
  if (weekIndex !== -1) {
    dbUser.mealHistory[weekIndex].groceryList = structuredGrocery;
  }
  await dbUser.save();

  res.json({ groceryList: structuredGrocery });
};

function parseInstructionsMarkdown(markdown, expectedMeals) {
  const lines = markdown.split("\n");
  const instructionsMap = {};
  let currentDay = null;
  let currentMeal = null;
  let buffer = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();

    const dayMatch = line.match(/^[-*]\s*Day\s+(\d+)/i);
    if (dayMatch) {
      if (currentDay && currentMeal && buffer.length) {
        instructionsMap[currentDay][currentMeal] = buffer.join("\n").trim();
      }
      currentDay = `Day ${dayMatch[1]}`;
      instructionsMap[currentDay] = {};
      currentMeal = null;
      buffer = [];
      continue;
    }

    const mealMatch = line.match(/^\*\s*(.+?):\s*(.*)/);
    if (mealMatch && currentDay) {
      if (currentMeal && buffer.length) {
        instructionsMap[currentDay][currentMeal] = buffer.join("\n").trim();
      }
      currentMeal = mealMatch[1].trim();
      buffer = [mealMatch[2].trim()];
      continue;
    }

    if (currentDay && currentMeal && line.length > 0) {
      buffer.push(line); // collect all indented or numbered step lines
    }
  }

  // Final flush after loop
  if (currentDay && currentMeal && buffer.length) {
    instructionsMap[currentDay][currentMeal] = buffer.join("\n").trim();
  }

  // Validate
  const allDaysPresent = Object.keys(instructionsMap).length === 7;
  const allMealsValid = Object.values(instructionsMap).every(dayObj =>
    Object.keys(dayObj).every(meal => expectedMeals.includes(meal))
  );

  return allDaysPresent && allMealsValid ? instructionsMap : null;
}


const generateInstructions = async (req, res) => {
  const email = req.session.user.email;
  const dbUser = await User.findOne({ email });

  if (!dbUser || !req.session.rawMealPlan || !dbUser.quizData) {
    return res.status(400).json({ message: "Missing user data or meal plan. Please generate meal plan first." });
  }

  const rawText = req.session.rawMealPlan;
  const expectedMeals = dbUser.quizData.mealsPerDay;

  const prompt = `
You are a meal assistant. The user has a 7-day meal plan formatted in markdown. For each day's meals, provide detailed but concise step-by-step cooking instructions.

Return the instructions in **this format exactly**:
- Day 1
  * Breakfast: [step-by-step instructions]
  * Lunch: [step-by-step instructions]
  * Dinner: [step-by-step instructions]
- Day 2
  ...
(Only include the meals listed in the plan. If a day only has Lunch and Dinner, include just those.)

Here is the meal plan:

${rawText}
`;

  try {
    const response = await client.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: "You are a structured meal instruction generator." },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 5000,
      top_p: 0.9
    });

    const rawInstructions = response.choices[0].message.content.trim();
    const structuredInstructions = parseInstructionsMarkdown(rawInstructions, expectedMeals);

    if (!structuredInstructions) {
      console.error("Invalid instruction format or incomplete.");
      console.log("Raw Instructions:\n", rawInstructions);
      return res.status(400).json({ message: "Invalid format or missing instructions." });
    }

    // Save to DB
    dbUser.instructions = structuredInstructions;
    dbUser.mealHistory = dbUser.mealHistory || [];
    if (dbUser.mealHistory.length) {
      dbUser.mealHistory[dbUser.mealHistory.length - 1].instructions = structuredInstructions;
    }
    console.log("Raw Instructions:\n", rawInstructions);
    console.log("Processed Instructions: ", structuredInstructions)

    await dbUser.save();
    req.session.rawInstructions = rawInstructions;

    res.json({ instructions: structuredInstructions });
  } catch (err) {
    console.error("Instruction generation failed:", err.message);
    res.status(500).json({ message: "Failed to generate instructions." });
  }
};

module.exports = {
  generateMealPlan,
  generateGroceryList,
  generateInstructions,
};
