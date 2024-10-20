const urlParams = new URLSearchParams(window.location.search);
const rulesUid = urlParams.get('uid');

if (!rulesUid) {
  console.error("No RULES_UID provided in the URL");
}
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-database.js";

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

function fetchDiscountDetailsByUid(rulesUid) {
    console.log("Fetching discount for UID:", rulesUid);
    const dbRef = ref(database, 'discounts');
  
    get(dbRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const discounts = snapshot.val();
          const discount = Object.values(discounts).find(d => d.RULES_UID === rulesUid);
  
          if (discount) {
            displayDiscountDetails(discount);
          } else {
            console.log("No discount found for the given RULES_UID");
          }
        } else {
          console.log("No discounts available");
        }
      })
      .catch((error) => {
        console.error("Error fetching discount details:", error);
      });
  }
  

function displayDiscountDetails(details) {
    const discountDetailsform=document.querySelector('.discount-details-form .container')
    const valueType = details.MARKUP_TYPE == 0 ? '%' : ""
    const rulesHTML = details.Rules.map((rule) => `
    <div class="col-12 mt-2">
      <div class="row">
      <div class="col-3">
      <input type="text" class="form-control border border-dark" value="${rule.ATTRIBUTE_NAME}" readonly>
      </div>
      <div class="col-2">
      <input type="text" class="form-control border border-dark" value="${rule.VALUE}" readonly>
      </div>
      <div class="col-7">
      <input type="text" class="form-control border border-dark" value="${rule.CLEANED_CRITERIA_VALUE}" readonly>
      </div>
      </div>
    </div>
    `).join('');
    discountDetailsform.innerHTML=`
    <div class="row">
    <div class="col-6 mt-4">
    <label class="form-label">Product:</label>
      <input type="text" class="form-control border border-dark" value="Flight" readonly>
    </div>
    <div class="col-6 mt-4">
    <label class="form-label">Discount Name</label>
      <input type="text" class="form-control border border-dark" value="${details.RULE_NAME}" readonly>
    </div>
    <div class="col-6 mt-4">
    <label class="form-label">Validity To:</label>
      <input type="text" class="form-control border border-dark" value="${details.RULE_START_DATE}" readonly>
    </div>
    <div class="col-6 mt-4">
    <label class="form-label">Validity From:</label>
      <input type="text" class="form-control border border-dark" value="${details.RULE_END_DATE}" readonly>
    </div>
    <div class="col-6 mt-4">
    <label class="form-label">Country:</label>
      <textarea class="form-control border border-dark" rows="5" readonly>${details.COUNTRY_NAMES}</textarea>
    </div>
    <div class="col-6 mt-4">
    <label class="form-label">Branch:</label>
      <textarea class="form-control border border-dark" rows="5" readonly>${details.BRANCHNAMES}</textarea>
    </div>
    <div class="col-6 mt-4">
    <label class="form-label">Agancies:</label>
      <textarea class="form-control border border-dark" rows="5" readonly>All</textarea>
    </div>
    <div class="col-6 mt-4">
    <label class="form-label">Amount:</label>
      <input type="text" class="form-control border border-dark" value="${formatNumber(details.MARKUP_VALUE)}${valueType}" readonly>
    </div>
    <div class="col-12 mt-4">
      <label class="form-label">Rules:</label>
      <div class="row">
        ${rulesHTML}
      </div>
    </div>
  </div>
    `
}
function formatNumber(num) {
    const parsedNum = parseFloat(num);
    if (isNaN(parsedNum)) return ''; // إذا لم يكن رقمًا، ارجع سلسلة فارغة
  
    // استخدم toString() لتحويل الرقم إلى سلسلة، ثم أزل الأصفار الزائدة
    return parsedNum.toString().replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
  }

// Fetch the discount details on page load
window.onload = () => {
  if (rulesUid) {
    fetchDiscountDetailsByUid(rulesUid)
  }
};
