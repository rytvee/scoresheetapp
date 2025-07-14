
function validateAndCalculate(input) {
    const max = Number(input.max);
    const min = Number(input.min);
    const val = Number(input.value);

    if (val > max) input.value = 0;
    else if (val < min) input.value = 0;

    calculateTotal();
}

function calculateTotal() {
    const rows = document.querySelectorAll("#scoreTable tr");
    let totalSum = 0;
    let count = 0;

    rows.forEach((row, index) => {
        if (index === 0) return;

        const score1Input = row.querySelector(".score1");
        const score2Input = row.querySelector(".score2");
        const totalScore = row.querySelector(".total");

        const score1 = Number(score1Input?.value) || 0;
        const score2 = Number(score2Input?.value) || 0;
        const total = score1 + score2;

        if (totalScore) totalScore.textContent = total;
        totalSum += total;
        count++;
    });
            
    const average = count > 0 ? (totalSum / count).toFixed(2) : 0;
    document.getElementById("average").textContent = average;
    document.getElementById("candidateCount").textContent = count;  
}

function deleteRow(button) {
    const row = button.closest("tr");
    row.remove();
    calculateTotal();
}

function addRow() {
    const table = document.getElementById("scoreTable");
    const newRow = document.createElement("tr");
            
    newRow.innerHTML = `
    <td><input type="text" placeholder="Candidate Name"></td>
    <td><input type="number" class="score1" max="30" min="0" oninput="validateAndCalculate(this)"></td>
    <td><input type="number" class="score2" max="70" min="0" oninput="validateAndCalculate(this)"></td>
    <td class="total">0</td>
    <td><button class="delete-btn" onclick="deleteRow(this)">Delete</button></td>
    `;

    table.appendChild(newRow);
    calculateTotal();
}
