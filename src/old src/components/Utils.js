import CryptoJS from "crypto-js";

const secretKey = "d05781304bc041dc89d9c47105fb";

// Function to encrypt data
function encryptData(data) {
  return CryptoJS.AES.encrypt(data, secretKey).toString();
}

// Function to decrypt data
function decryptData(encryptedData) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Error decrypting data:", error);
    return null;
  }
}

// Function to store encrypted expiration date in local storage
export function storeExpirationDate(expirationDate) {
  const encryptedDate = encryptData(expirationDate.toISOString());
  localStorage.setItem("UserId", encryptedDate);
}

// Function to retrieve and decrypt expiration date from local storage
export function getExpirationDate() {
  const encryptedDate = localStorage.getItem("UserId");
  if (!encryptedDate) {
    return null; // Handle case where expiration date is not set
  }

  const decryptedDate = decryptData(encryptedDate);
  return new Date(decryptedDate);
}

// Function to check if expiration date has passed
export function hasExpirationDatePassed() {
  const expirationDate = getExpirationDate();
  if (!expirationDate) {
    return false; // Handle case where expiration date is not set
  }

  const currentDate = new Date();
  return currentDate > expirationDate;
}
export function getPreviousMonday() {
  const currentDate = new Date();
  const currentDayOfWeek = currentDate.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
  const mondayDifference = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1; // Calculate the difference in days between the current day and Monday
  const previousMonday = new Date(currentDate); // Create a new date object based on the current date
  previousMonday.setDate(currentDate.getDate() - mondayDifference - 7); // Subtract the difference in days plus 7 days to get the previous Monday

  // Format the date as "year-month-date"
  const year = previousMonday.getFullYear();
  const month = String(previousMonday.getMonth() + 1).padStart(2, "0");
  const date = String(previousMonday.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
}
export function getMonday() {
  const currentDate = new Date();
  const currentDayOfWeek = currentDate.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
  const mondayDifference = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1; // Calculate the difference in days between the current day and Monday
  currentDate.setDate(currentDate.getDate() - mondayDifference); // Subtract the difference in days from the current date to get Monday
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const date = String(currentDate.getDate()).padStart(2, "0");
  const weekStartDate = `${year}-${month}-${date}`;
  return weekStartDate;
}

export function UpdateTrail(day) {
  const newExpirationDate = new Date();
  newExpirationDate.setDate(newExpirationDate.getDate() + day);
  storeExpirationDate(newExpirationDate);
  storeExpirationDate(newExpirationDate);
}

// var key = "secret_vF1XFuLGj4CxoPGdunGtdOimMRln4OwUYai8JVBwyxc";
// const notionAPIKey = "YOUR_NOTION_API_KEY";

// const notionAPIEndpoint = "https://api.notion.com/v1/pages";

// const requestData = {
//   method: "POST",
//   headers: {
//     Authorization: `Bearer ${key}`,
//     "Content-Type": "application/json",
//     "Notion-Version": "2022-06-28",
//   },
//   body: JSON.stringify({
//     parent: { database_id: "d9824bdc84454327be8b5b47500af6ce" },
//     icon: {
//       emoji: "🥬",
//     },
//     cover: {
//       external: {
//         url: "https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg",
//       },
//     },
//     properties: {
//       Name: {
//         title: [
//           {
//             text: {
//               content: "Tuscan Kale",
//             },
//           },
//         ],
//       },
//       Description: {
//         rich_text: [
//           {
//             text: {
//               content: "A dark green leafy vegetable",
//             },
//           },
//         ],
//       },
//       "Food group": {
//         select: {
//           name: "Vegetable",
//         },
//       },
//       Price: { number: 2.5 },
//     },
//     children: [
//       {
//         object: "block",
//         type: "heading_2",
//         heading_2: {
//           rich_text: [{ type: "text", text: { content: "Lacinato kale" } }],
//         },
//       },
//       {
//         object: "block",
//         type: "paragraph",
//         paragraph: {
//           rich_text: [
//             {
//               type: "text",
//               text: {
//                 content:
//                   "Lacinato kale is a variety of kale with a long tradition in Italian cuisine, especially that of Tuscany. It is also known as Tuscan kale, Italian kale, dinosaur kale, kale, flat back kale, palm tree kale, or black Tuscan palm.",
//                 link: { url: "https://en.wikipedia.org/wiki/Lacinato_kale" },
//               },
//             },
//           ],
//         },
//       },
//     ],
//   }),
// };

// fetch(notionAPIEndpoint, requestData)
//   .then((response) => {
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     return response.json();
//   })
//   .then((data) => {
//     console.log("Success:", data);
//   })
//   .catch((error) => {
//     console.error("Error:", error);
//   });
