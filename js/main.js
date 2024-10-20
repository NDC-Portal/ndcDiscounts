//git Discounts from firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-database.js";
//firebase
const firebaseConfig = {
  apiKey: "AIzaSyAPz61fOc5VIlv5FDZ3V1-JrxmFwM2ytK0",
  authDomain: "ndcdiscounts-4a367.firebaseapp.com",
  projectId: "ndcdiscounts-4a367",
  storageBucket: "ndcdiscounts-4a367.appspot.com",
  messagingSenderId: "186499651910",
  appId: "1:186499651910:web:bd575b13c55e8f5f28ed47",
  measurementId: "G-JHDXBP1DEH",
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
/////////////////
let discounts = [];
let originalDiscounts = [];
// fetch fun
function fetchDiscounts() {
  const dbRef = ref(database, "discounts");

  get(dbRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        originalDiscounts = snapshot.val();
        discounts = [...originalDiscounts];
        displayDiscounts(discounts);
        drawDisc(discounts);
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}
//display fun
function displayDiscounts(discountsData) {
  console.log(discountsData);
}
/////////////////////////////////////
//filter fun
const searchBtn = document.querySelector(".searchBtn");
searchBtn.addEventListener("click", function (stop) {
  stop.preventDefault()
  const airlineInput = document.querySelector(".airline").value.toUpperCase();
  const supplierSelect = document.querySelector(".supplier").value;
  const marketSelect = document.querySelector(".market").value;
  console.log("Airline Code Entered:", airlineInput);
  console.log("Supplier Selected:", supplierSelect);
  console.log("Market Selected:", marketSelect);
  discounts = originalDiscounts.filter((item) => {
    const airlineRules = item.Rules.filter(
      (rule) => rule.ATTRIBUTE_NAME === "airlineCode" || rule.ATTRIBUTE_NAME === "airlineName"
    );
    const supplierRules = item.Rules.filter(
      (rule) => rule.ATTRIBUTE_NAME === "supplier"
    );
    let airlineMatch = true;
    if (airlineRules.length > 0) {
      const airlineValue = airlineRules[0].VALUE;
      const cleanedValue = airlineRules[0].CLEANED_CRITERIA_VALUE;
      if (airlineValue === "IN") {
        airlineMatch = cleanedValue.includes(airlineInput);
      } else if (airlineValue === "NOT IN") {
        airlineMatch = !cleanedValue.includes(airlineInput);
      }
    }
    let supplierMatch = true;
    if (supplierSelect && supplierSelect !== "select") {
      const supplierValues =
        supplierRules.length > 0 ? supplierRules[0].CLEANED_CRITERIA_VALUE.split(",") : [];
      supplierMatch = supplierValues.includes(supplierSelect);
    }
    let marketMatch = true;
    if (marketSelect && marketSelect !== "select") {
      marketMatch = item.COUNTRY_NAMES.includes(marketSelect);
    }
    return (airlineMatch && supplierMatch && marketMatch);
  });
  discounts.sort((a, b) => {
    const aAirlineRule = a.Rules.find(rule => rule.ATTRIBUTE_NAME === "airlineCode");
    const bAirlineRule = b.Rules.find(rule => rule.ATTRIBUTE_NAME === "airlineCode");

    const aType = aAirlineRule ? aAirlineRule.VALUE : "IN All";
    const bType = bAirlineRule ? bAirlineRule.VALUE : "IN All";

    if (aType === "IN" && aAirlineRule.CLEANED_CRITERIA_VALUE.includes(airlineInput)) return -1;
    if (bType === "IN" && bAirlineRule.CLEANED_CRITERIA_VALUE.includes(airlineInput)) return 1;

    if (aType === "NOT IN") return -1;
    if (bType === "NOT IN") return 1;

    return 0; // يبقي كما هو في حالة التساوي
  });
  currentPage = 1
  console.log(discounts);
  drawDisc(discounts);
});
/////////////////////////////////////////////////////
let currentPage = 1;
const itemsPerPage = 10;
function formatNumber(num) {
  const parsedNum = parseFloat(num);
  if (isNaN(parsedNum)) return ''; // إذا لم يكن رقمًا، ارجع سلسلة فارغة

  // استخدم toString() لتحويل الرقم إلى سلسلة، ثم أزل الأصفار الزائدة
  return parsedNum.toString().replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
}
//fun to draw table for discounts
function drawDisc(discounts) {
  const table = document.querySelector(".table tbody");
  const totalPages = Math.ceil(discounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDiscounts = discounts.slice(startIndex, endIndex);
  let discount = currentDiscounts.map((item) => {
    const supplierRule = item.Rules.filter(
      (rule) => rule.ATTRIBUTE_NAME == "supplier"
    );
    const airlineRule = item.Rules.filter(
      (rule) => rule.ATTRIBUTE_NAME == "airlineCode" || rule.ATTRIBUTE_NAME == "airlineName"
    );
    const airlineValue =
      airlineRule.length > 0 ? airlineRule[0].VALUE : "IN";
    const airlineCleanedValue =
      airlineRule.length > 0 ? airlineRule[0].CLEANED_CRITERIA_VALUE : "All";
    const supplierCleanedValue =
      supplierRule.length > 0 ? supplierRule[0].CLEANED_CRITERIA_VALUE : "All";


    console.log(airlineRule);
    const valueType = item.MARKUP_TYPE == 0 ? '%' : ""
    return `
        <tr>
        <td>${item.RULES_UID}</td>
        <td>${item.RULE_NAME}</td>
        <td>${item.RULE_START_DATE}</td>
        <td>${item.RULE_END_DATE}</td>
        <td>${item.COUNTRY_NAMES}</td>
        <td>${airlineValue}</td>
        <td>${airlineCleanedValue}</td>
        <td>${supplierCleanedValue}</td>
        <td>${formatNumber(item.MARKUP_VALUE)}${valueType}</td>
        <td><i class="btn btn-success fas fa-eye" data-uid='${item.RULES_UID}'></i></td>
        </tr>
        `;
  });
  console.log(table);
  console.log(discount);
  table.innerHTML = discount.join("");
  const eyeIcons = document.querySelectorAll(".fa-eye");
  eyeIcons.forEach(icon => {
    icon.addEventListener("click", function() {
      const uid = icon.getAttribute('data-uid');
      window.location.href = `discountDetails.html?uid=${uid}`; // الانتقال إلى صفحة التفاصيل
    });
  });
  document.getElementById(
    "pageInfo"
  ).textContent = `Page Number ${currentPage}`;
  document.getElementById(
    "totalDiscounts"
  ).textContent = `Total: ${discounts.length}`;
  document.getElementById("prevButton").disabled = currentPage === 1;
  document.getElementById("nextButton").disabled = currentPage === totalPages;
}
document.getElementById("prevButton").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    drawDisc(discounts);
  }
});
document.getElementById("nextButton").addEventListener("click", () => {
  if (currentPage < Math.ceil(discounts.length / itemsPerPage)) {
    currentPage++;
    drawDisc(discounts);
  }
});
////////////////////////////////////
window.onload = fetchDiscounts;
