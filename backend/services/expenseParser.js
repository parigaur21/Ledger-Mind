

const CATEGORY_KEYWORDS = {
  food: ['food', 'grocery', 'groceries', 'restaurant', 'dinner', 'lunch', 'breakfast', 'coffee', 'snack', 'meal', 'pizza', 'burger', 'dining', 'eat', 'starbucks', 'cafe'],
  transport: ['transport', 'uber', 'lyft', 'taxi', 'cab', 'bus', 'train', 'metro', 'gas', 'fuel', 'petrol', 'parking', 'toll', 'flight', 'airline'],
  housing: ['rent', 'housing', 'mortgage', 'apartment', 'house', 'property', 'maintenance', 'repair'],
  shopping: ['shopping', 'amazon', 'clothes', 'clothing', 'shoes', 'electronics', 'gadget', 'purchase', 'buy', 'bought', 'store'],
  entertainment: ['entertainment', 'movie', 'netflix', 'spotify', 'game', 'concert', 'theatre', 'theater', 'subscription', 'streaming'],
  utilities: ['utility', 'utilities', 'electricity', 'electric', 'water', 'internet', 'wifi', 'phone', 'bill', 'gas bill'],
  healthcare: ['health', 'healthcare', 'doctor', 'hospital', 'medicine', 'pharmacy', 'medical', 'dental', 'gym', 'fitness'],
  education: ['education', 'course', 'book', 'books', 'tuition', 'school', 'college', 'university', 'class', 'training'],
  travel: ['travel', 'hotel', 'airbnb', 'vacation', 'trip', 'tourism', 'resort'],
  other: ['other', 'misc', 'miscellaneous']
};

function detectCategory(text) {
  const lower = text.toLowerCase();
  let bestMatch = 'other';
  let maxScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        const score = keyword.length;
        if (score > maxScore) {
          maxScore = score;
          bestMatch = category;
        }
      }
    }
  }
  return bestMatch;
}

function parseDate(text) {
  const lower = text.toLowerCase();
  const now = new Date();

  if (lower.includes('yesterday')) {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    return d;
  }
  if (lower.includes('today') || lower.includes('just now')) {
    return now;
  }
  if (lower.includes('last week')) {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d;
  }

  const daysAgoMatch = lower.match(/(\d+)\s*days?\s*ago/);
  if (daysAgoMatch) {
    const d = new Date(now);
    d.setDate(d.getDate() - parseInt(daysAgoMatch[1]));
    return d;
  }

  return now;
}

function parseExpenseFromText(text) {
  const amountMatch = text.match(/(?:₹|\$|rs\.?\s*)?\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i);
  if (!amountMatch) return null;

  const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  if (amount <= 0 || amount > 1000000) return null;

  const category = detectCategory(text);
  const date = parseDate(text);

  let description = text
    .replace(/\$?\s*\d+(?:,\d{3})*(?:\.\d{1,2})?/, '')
    .replace(/(?:spent|paid|add|added|bought|got)\s*/gi, '')
    .replace(/(?:on|for|at)\s*/gi, '')
    .replace(/(?:yesterday|today|last week|\d+\s*days?\s*ago)/gi, '')
    .trim();

  if (!description || description.length < 2) {
    description = category.charAt(0).toUpperCase() + category.slice(1) + ' expense';
  }

  description = description.charAt(0).toUpperCase() + description.slice(1);

  return { amount, category, description, date };
}

function isAddExpenseIntent(text) {
  const lower = text.toLowerCase();
  const addPatterns = [
    /(?:add|spent|paid|bought|got)\s/,
    /(?:₹|\$|rs\.?\s*)\s*\d+/i,
    /^\d+\s+(?:for|on|at)/,
    /(?:spent|paid)\s+\d+/
  ];
  return addPatterns.some(p => p.test(lower));
}

function isQueryIntent(text) {
  const lower = text.toLowerCase();
  const queryPatterns = [
    /how much/,
    /what.*spend/,
    /show.*expense/,
    /total.*spend/,
    /what.*biggest/,
    /what.*most/,
    /spending.*breakdown/,
    /category.*breakdown/,
    /this week/,
    /this month/,
    /last month/,
    /compare/
  ];
  return queryPatterns.some(p => p.test(lower));
}

module.exports = { parseExpenseFromText, isAddExpenseIntent, isQueryIntent, detectCategory };
