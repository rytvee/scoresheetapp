let rowToDelete = null;

function validateAndCalculate(input) {
  const max = Number(input.max);
  const min = Number(input.min);
  const val = Number(input.value);
  if (val > max || val < min) input.value = '';
  calculateTotal();
}

function calculateTotal() {
  const rows = document.querySelectorAll("#scoreTable tbody tr");
  let totalSum = 0;
  let validCount = 0;

  rows.forEach(row => {
    const nameEl = row.querySelector("td:nth-child(1) input");
    const score1El = row.querySelector(".score1");
    const score2El = row.querySelector(".score2");

    const name = nameEl?.value.trim();
    const score1 = Number(score1El?.value) || 0;
    const score2 = Number(score2El?.value) || 0;

    const hasValidScore = score1El?.value !== "" || score2El?.value !== "";
    const total = score1 + score2;

    row.querySelector(".total").textContent = total;

    if (name && hasValidScore) {
      totalSum += total;
      validCount++;
    }
  });

  document.getElementById("candidateCount").textContent = validCount;
  document.getElementById("average").textContent = validCount ? (totalSum / validCount).toFixed(2) : 0;
}

function deleteRow(button) {
  rowToDelete = button.closest("tr");
  document.getElementById("confirmModal").style.display = "flex";
}

document.getElementById("confirmOk").addEventListener("click", function () {
  if (rowToDelete) {
    rowToDelete.remove();
    calculateTotal();
    rowToDelete = null;
  }
  document.getElementById("confirmModal").style.display = "none";
});

document.getElementById("confirmCancel").addEventListener("click", function () {
  rowToDelete = null;
  document.getElementById("confirmModal").style.display = "none";
});

function addRow() {
  const tbody = document.querySelector("#scoreTable tbody");
  const newRow = document.createElement("tr");

  newRow.innerHTML = `
    <td data-label="Name">
      <input type="text" placeholder="Candidate Name" oninput="calculateTotal()">
    </td>
    <td data-label="Test Score (Max 30)">
      <input type="number" class="score1" max="30" min="0" oninput="validateAndCalculate(this)">
    </td>
    <td data-label="Exam Score (Max 70)">
      <input type="number" class="score2" max="70" min="0" oninput="validateAndCalculate(this)">
    </td>
    <td data-label="Total" class="total">0</td>
    <td data-label="Action">
      <button class="delete-btn" onclick="deleteRow(this)">Delete</button>
    </td>
  `;
  tbody.appendChild(newRow);
  calculateTotal();
}

function exportToExcel() {
  const rows = document.querySelectorAll("#scoreTable tbody tr");
  const title = document.getElementById("spreadsheetTitle").value.trim() || "Candidate Scores";

  const data = [];
  data.push([title]);
  data.push(["S/N", "Name", "Test Score", "Exam Score", "Total"]);

  rows.forEach((row, index) => {
    const name = row.querySelector("td:nth-child(1) input")?.value || "";
    const test = row.querySelector(".score1")?.value || "0";
    const exam = row.querySelector(".score2")?.value || "0";
    const total = row.querySelector(".total")?.textContent || "0";
    data.push([index + 1, name, parseFloat(test), parseFloat(exam), parseFloat(total)]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(data);

  const totalCols = 5;
  worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");

  XLSX.writeFile(workbook, `${title}.xlsx`);
}

function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const title = document.getElementById("spreadsheetTitle").value.trim() || "Candidate Scores";

  const rows = [];
  const tableRows = document.querySelectorAll("#scoreTable tbody tr");

  tableRows.forEach((row, index) => {
    const name = row.querySelector("td:nth-child(1) input")?.value.trim();
    const test = row.querySelector(".score1")?.value || "0";
    const exam = row.querySelector(".score2")?.value || "0";
    const total = row.querySelector(".total")?.textContent || "0";

    if (name && (test !== "0" || exam !== "0")) {
      rows.push([index + 1, name, parseFloat(test), parseFloat(exam), parseFloat(total)]);
    }
  });

  const now = new Date();
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  const dateStr = now.toLocaleDateString('en-GB', options).replace(/ /g, '-');
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const timeStr = `${hours}:${minutes} ${ampm}`;
  const timestampText = `${dateStr} ${timeStr}`;

  doc.setFontSize(16);
  doc.text(title, 14, 15);

  doc.autoTable({
    startY: 20,
    head: [["S/N", "Name", "Test Score", "Exam Score", "Total"]],
    body: rows,
    styles: { halign: 'center' }
  });

  doc.setFontSize(10);
  doc.text(`Generated on: ${timestampText}`, 14, doc.lastAutoTable.finalY + 10);

  doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
}
