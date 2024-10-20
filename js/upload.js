import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js';
import { getDatabase, ref, set } from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-database.js';
//firebase
const firebaseConfig = {
    apiKey: "AIzaSyAPz61fOc5VIlv5FDZ3V1-JrxmFwM2ytK0",
    authDomain: "ndcdiscounts-4a367.firebaseapp.com",
    projectId: "ndcdiscounts-4a367",
    storageBucket: "ndcdiscounts-4a367.appspot.com",
    messagingSenderId: "186499651910",
    appId: "1:186499651910:web:bd575b13c55e8f5f28ed47",
    measurementId: "G-JHDXBP1DEH"
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

///////////////////////////////////////////////////////////
const uploadBtn = document.querySelector('.uploadBtn')
uploadBtn.addEventListener('click', function (stop) {
    stop.preventDefault()
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const json = XLSX.utils.sheet_to_json(worksheet, { raw: false });
            const groupedDiscounts = {};
            json.forEach(row => {
                const uid = row.RULES_UID;
                if (!groupedDiscounts[uid]) {
                    groupedDiscounts[uid] = {
                        RULES_UID: row.RULES_UID,
                        RULE_NAME: row.RULE_NAME,
                        RULE_START_DATE: row.RULE_START_DATE,
                        RULE_END_DATE: row.RULE_END_DATE,
                        MARKUP_VALUE: row.MARKUP_VALUE,
                        COUNTRY_NAMES: row.COUNTRY_NAMES,
                        BRANCHNAMES: row.BRANCHNAMES,
                        MARKUP_TYPE: row.MARKUP_TYPE,
                        Rules: []
                    };
                }
                groupedDiscounts[uid].Rules.push({
                    ATTRIBUTE_NAME: row.ATTRIBUTE_NAME,
                    VALUE: row.VALUE,
                    CLEANED_CRITERIA_VALUE: row.CLEANED_CRITERIA_VALUE
                });
            });
            const resultArray = Object.values(groupedDiscounts);
            resultArray.forEach(row => {
                if (row.RULE_END_DATE) {
                    row.RULE_END_DATE = formatDate(new Date(row.RULE_END_DATE))
                }
                if (row.RULE_START_DATE) {
                    row.RULE_START_DATE = formatDate(new Date(row.RULE_START_DATE))
                }
            });
            console.log(resultArray);
            const dbRef = ref(database, 'discounts');
            set(dbRef, null)
                .then(() => {
                    const filteredResultArray = resultArray.map(row => ({
                        ...row,
                        Rules: row.Rules.filter(rule => rule.VALUE !== undefined)
                    }));

                    return set(dbRef, filteredResultArray);
                })
                .then(() => {
                    alert('Data saved successfully!');
                })
                .catch((error) => {
                    alert('Error saving data:', error);
                });
        };

        reader.readAsArrayBuffer(file);
    } else {
        console.error('Please upload file!');
    }
})
// format date
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}