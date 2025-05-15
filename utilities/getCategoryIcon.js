export const getCategoryIcon = ({
  name = "",
  category = "",
  type = "budget",
}) => {
  const text = `${name} ${category}`.toLowerCase();

  const rules = [
    // 🛒 Food & Groceries
    {
      pattern:
        /\b(snack|snacks|food|grocer(y|ies)|meal|lunch|dinner|breakfast|kitchen)\b/,
      key: "food",
    },

    // ☕ Dining / Coffee / Takeout
    {
      pattern: /\b(coffee|cafe|dining|restaurant|takeout|fast\s?food|tea)\b/,
      key: "dining",
    },

    // 🏠 Rent / Housing
    {
      pattern: /\b(rent|mortgage|house|home|apartment|lease|landlord)\b/,
      key: "housing",
    },

    // 🚗 Transportation / Vehicle
    {
      pattern:
        /\b(car|vehicle|transport|fuel|gas|uber|lyft|taxi|ride|parking|bus|train)\b/,
      key: "transportation",
    },

    // 💳 Utilities / Bills
    {
      pattern:
        /\b(utility|electric|water|bill|internet|cable|gas\s?bill|wifi|phone)\b/,
      key: "utilities",
    },

    // 📚 Education
    {
      pattern:
        /\b(education|tuition|course|university|college|class|online\s?learning)\b/,
      key: "education",
    },

    // 💊 Healthcare / Medical
    {
      pattern:
        /\b(health|doctor|medical|hospital|medicine|pharmacy|gym|therapy|insurance)\b/,
      key: "healthcare",
    },

    // 🎮 Entertainment & Subscriptions
    {
      pattern:
        /\b(entertainment|netflix|spotify|hulu|youtube|movie|tv|game|xbox|playstation|subscription|membership)\b/,
      key: "entertainment",
    },

    // 🌎 Travel / Vacation
    {
      pattern:
        /\b(travel|flight|trip|vacation|airfare|hotel|booking|resort|airport)\b/,
      key: "travel",
    },

    // 💰 Savings / Wallet
    {
      pattern:
        /\b(saving(s)?|wallet|piggy\s?bank|stash|reserve|rainy\s?day|emergency\s?fund)\b/,
      key: "savings",
    },

    // 📈 Investment
    {
      pattern:
        /\b(investment|invest|stocks|shares|crypto|mutual\s?fund|portfolio|401k|index)\b/,
      key: "investment",
    },

    // 🏦 Bank / Cash / Checking
    {
      pattern: /\b(bank|cash|atm|checking|balance|deposit|withdrawal)\b/,
      key: "cash",
    },

    // 📕 Loans / Debt
    {
      pattern:
        /\b(student\s?loan|loan|credit\s?card|debt|borrow|owe|financing|emi|repayment)\b/,
      key: "debt",
    },
  ];

  let categoryKey = "misc"; // default

  for (const rule of rules) {
    if (rule.pattern.test(text)) {
      categoryKey = rule.key;
      break;
    }
  }

  const iconMap = {
    food: "shoppingcart",
    dining: "rest",
    housing: "home",
    transportation: "car",
    utilities: "creditcard",
    education: "book",
    healthcare: "hearto",
    entertainment: "playcircleo",
    travel: "airplane",
    savings: "wallet",
    investment: "linechart",
    debt: "book",
    cash: "bank",
    misc: "pay-circle-o1",
  };

  return iconMap[categoryKey] || "questioncircleo";
};
