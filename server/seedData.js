const mongoose = require('mongoose');

// Define your Mongoose schema and model
const codeBlockSchema = new mongoose.Schema({
  title: String,
  code: String,
  original: String,
  solution: String,
});

const CodeBlock = mongoose.model('CodeBlock', codeBlockSchema);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/codeBlocksDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  // Clear existing data
  await CodeBlock.deleteMany({});

  // Insert sample data with real code examples
  await CodeBlock.create([
    {
      title: 'Async Function',
      code: `
async function fetchData() {
  try {
    // TODO: Fetch data from API
    console.log("Fetching data...");
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
`,
      original: `
async function fetchData() {
  try {
    // Fetch data from API
    console.log("Fetching data...");
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
`,
      solution: `
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    console.log("Fetched data:", data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
`,
    },
    {
      title: 'Sorting Array',
      code: `
function sortArray(arr) {
  // TODO: Implement sorting algorithm
  console.log("Sorting array...");
}
`,
      original: `
function sortArray(arr) {
  // Implement sorting algorithm
  console.log("Sorting array...");
}
`,
      solution: `
function sortArray(arr) {
  return arr.sort((a, b) => a - b);
}
`,
    },
    {
      title: 'Fibonacci Sequence',
      code: `
function fibonacci(n) {
  // TODO: Calculate Fibonacci sequence
  console.log("Calculating Fibonacci sequence...");
}
`,
      original: `
function fibonacci(n) {
  // Calculate Fibonacci sequence
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
`,
      solution: `
function fibonacci(n) {
  const sequence = [0, 1];
  for (let i = 2; i <= n; i++) {
    sequence.push(sequence[i - 1] + sequence[i - 2]);
  }
  return sequence;
}
`,
    },
    {
      title: 'Palindrome Checker',
      code: `
function isPalindrome(str) {
  // TODO: Check if a string is a palindrome
  console.log("Checking if the string is a palindrome...");
}
`,
      original: `
function isPalindrome(str) {
  // Check if a string is a palindrome
  const cleanedStr = str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const reversedStr = cleanedStr.split('').reverse().join('');
  return cleanedStr === reversedStr;
}
`,
      solution: `
function isPalindrome(str) {
  const cleanedStr = str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const reversedStr = cleanedStr.split('').reverse().join('');
  return cleanedStr === reversedStr;
}
`,
    },
  ]);

  console.log('Sample data added');
  mongoose.connection.close();
})
.catch(err => {
  console.error('Error connecting to MongoDB', err);
});
