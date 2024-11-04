import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import {
    getDatabase,
    ref,
    get,
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-database.js";
//firebase
const firebaseConfig = {
    apiKey: "AIzaSyCcNukd-4qShXtBDCTSHfTpev0yFZAf3BU",
    authDomain: "ndcmarkups.firebaseapp.com",
    databaseURL: "https://ndcmarkups-default-rtdb.firebaseio.com",
    projectId: "ndcmarkups",
    storageBucket: "ndcmarkups.appspot.com",
    messagingSenderId: "963473433249",
    appId: "1:963473433249:web:cf9055dbcb636f0f9d46e0",
    measurementId: "G-Z5LZVSG91T"
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
///////////////////////////////////////////////////////
let markups = [];
let originalMarkups = [];
// fetch fun
function fetchMarkups() {
    const dbRef = ref(database, "markups");

    get(dbRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                originalMarkups = snapshot.val();
                markups = [...originalMarkups];
                drawDisc(markups);
            } else {
                console.log("No data available");
            }
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
        });
}
//filter fun
const searchBtn = document.querySelector(".searchBtn");
searchBtn.addEventListener("click", function (stop) {
    stop.preventDefault()
    const airlineInput = document.querySelector(".airline").value.toUpperCase();
    const supplierSelect = document.querySelector(".supplier").value;
    const marketSelect = document.querySelector(".market").value;
    const pccSelect = document.querySelector(".pcc").value
    markups = originalMarkups.filter((item) => {
        const airlineRules = item.Rules.filter(
            (rule) => rule.ATTRIBUTE_NAME === "airlineCode" || rule.ATTRIBUTE_NAME === "airlineName"
        );
        const supplierRules = item.Rules.filter(
            (rule) => rule.ATTRIBUTE_NAME === "supplier"
        );
        const pccRules = item.Rules.filter((rule) => rule.ATTRIBUTE_NAME === "pcc")
        let airlineMatch = true;
        if (airlineRules.length > 0) { // إذا كان هناك قواعد للخطوط الجوية
            const airlineValue = airlineRules[0].VALUE;
            const cleanedValue = airlineRules[0].CLEANED_CRITERIA_VALUE.toUpperCase();
            if (airlineInput) { // فقط إذا كان هناك إدخال
                if (airlineValue === "IN") {
                    airlineMatch = cleanedValue.includes(airlineInput);
                } else if (airlineValue === "NOT IN") {
                    airlineMatch = !cleanedValue.includes(airlineInput);
                }
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
        let pccMatch = true
        if (pccSelect && pccSelect !== "select") {
            if (pccRules.length > 0) {
                const pccValues = pccRules[0].CLEANED_CRITERIA_VALUE.split(",")
                pccMatch = pccValues.includes(pccSelect)
            }
        }
        return (airlineMatch || !airlineInput) && supplierMatch && pccMatch && marketMatch;
    });
    markups.sort((a, b) => {
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
    drawDisc(markups);
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
function drawDisc(markups) {
    const table = document.querySelector(".table tbody");
    const totalPages = Math.ceil(markups.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentMarkups = markups.slice(startIndex, endIndex);
    let markup = currentMarkups.map((item) => {
        const supplierRule = item.Rules.filter(
            (rule) => rule.ATTRIBUTE_NAME == "supplier"
        );
        const airlineRule = item.Rules.filter(
            (rule) => rule.ATTRIBUTE_NAME == "airlineCode" || rule.ATTRIBUTE_NAME == "airlineName"
        );
        const pccRule = item.Rules.filter(
            (rule) => rule.ATTRIBUTE_NAME == "pcc"
        );
        const airlineValue =
            airlineRule.length > 0 ? airlineRule[0].VALUE : "IN";
        const airlineCleanedValue =
            airlineRule.length > 0 ? airlineRule[0].CLEANED_CRITERIA_VALUE : "All";
        const supplierCleanedValue =
            supplierRule.length > 0
                ? supplierRule[0].CLEANED_CRITERIA_VALUE.split(",").slice(0, 3).join(", ") + (supplierRule[0].CLEANED_CRITERIA_VALUE.split(",").length > 3 ? ", ...more" : "")
                : "All";
        const supplierDeatails = supplierRule.length > 0 ? supplierRule[0].CLEANED_CRITERIA_VALUE : "All"
        const pccCleanedValue =
            pccRule.length > 0
                ? pccRule[0].CLEANED_CRITERIA_VALUE.split(",").slice(0, 3).join(", ") + (pccRule[0].CLEANED_CRITERIA_VALUE.split(",").length > 3 ? ", ...more" : "")
                : "All";
        const pccDeatails = pccRule.length > 0 ? pccRule[0].CLEANED_CRITERIA_VALUE : "All"
        const countryCleandValue = item.COUNTRY_NAMES.split(",").slice(0, 3).join(", ") + (item.COUNTRY_NAMES.split(",").length > 3 ? ", ..." : "")
        const valueType = item.MARKUP_TYPE == 0 ? '%' : ""
        return `
          <tr>
          <td>${item.RULES_UID}</td>
          <td>${item.RULE_NAME}</td>
          <td>${item.RULE_END_DATE}</td>
          <td style="cursor: pointer;" onclick="alert('${item.COUNTRY_NAMES}')">${countryCleandValue}</td>
          <td>${airlineValue}</td>
          <td>${airlineCleanedValue}</td>
          <td style="cursor: pointer;" onclick="alert('${supplierDeatails}')">${supplierCleanedValue}</td>
          <td style="cursor: pointer;" onclick="alert('${pccDeatails}')">${pccCleanedValue}</td>
          <td>${formatNumber(item.MARKUP_VALUE)}${valueType}</td>
          <td><i class="btn btn-success fas fa-eye" data-uid='${item.RULES_UID}'></i></td>
          </tr>
          `;
    });
    table.innerHTML = markup.join("");
    const eyeIcons = document.querySelectorAll(".fa-eye");
    eyeIcons.forEach(icon => {
        icon.addEventListener("click", function () {
            const uid = icon.getAttribute('data-uid');
            window.location.href = `markupsDetails.html?uid=${uid}`; // الانتقال إلى صفحة التفاصيل
        });
    });
    document.getElementById(
        "pageInfo"
    ).textContent = `Page Number ${currentPage}`;
    document.getElementById(
        "totalDiscounts"
    ).textContent = `Total: ${markups.length}`;
    document.getElementById("prevButton").disabled = currentPage === 1;
    document.getElementById("nextButton").disabled = currentPage === totalPages;
}
document.getElementById("prevButton").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        drawDisc(markups);
    }
});
document.getElementById("nextButton").addEventListener("click", () => {
    if (currentPage < Math.ceil(markups.length / itemsPerPage)) {
        currentPage++;
        drawDisc(markups);
    }
});
//////////////////////////////////////
window.onload = fetchMarkups;
