// List of teacher names
const teacherNames = [
    "Dr. V.K. Bhamare", "Dr. P.B. Wadikar", "Dr. D.S. Chauhan", "Dr. V.S. Jagtap",
    "Dr. P.N. Karanjikar", "Dr. D.G. More", "Dr. S.P. Pole", "Dr. A.T. Shinde",
    "Dr. V.N. Shinde", "Shri.S.B. Suryawanshi", "Dr. J.M. Deshmukh", "Dr.D.D. Suradkar",
    "Dr. R.D. Shelke", "Dr. S.H. Kamble", "Dr. S.J. Magar", "Dr. S.V.Waghmare",
    "Dr. A. M. Kamble", "Dr. N.M.Tamboli", "Shri V.B. Jadhav", "Dr. P.B. Adsul",
    "Dr. A.N. Puri", "Prof. B.G. Kamble", "Dr. S.S. Shrangare"
  ];

  // Function to generate the teacher checkboxes in a table
  function generateTeacherCheckboxes() {
    var teacherCheckboxesTable = document.getElementById("teacherCheckboxesTable");
    teacherCheckboxesTable.innerHTML = "";

    let row;
    teacherNames.forEach((name, index) => {
      if (index % 3 === 0) {
        row = document.createElement("tr");
        teacherCheckboxesTable.appendChild(row);
      }
      var cell = document.createElement("td");

      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = "teacher" + (index + 1);
      checkbox.value = name;
      checkbox.className = "teacher-checkbox";
      
      var label = document.createElement("label");
      label.htmlFor = "teacher" + (index + 1);
      label.textContent = name;

      cell.appendChild(checkbox);
      cell.appendChild(label);
      row.appendChild(cell);
    });
  }

  // Call the function to generate the teacher checkboxes on page load
  generateTeacherCheckboxes();

  // Function to generate the subject input fields based on the number of days
  function generateSubjectInputs() {
    var numDays = document.getElementById("numDays").value;
    var subjectInputs = document.getElementById("subjectInputs");
    subjectInputs.innerHTML = "";
    
    for (var i = 1; i <= numDays; i++) {
      var label = document.createElement("label");
      label.textContent = "Subject for Day " + i + ": ";
      
      var input = document.createElement("input");
      input.type = "text";
      input.name = "subject" + i;
      input.required = true;
      
      subjectInputs.appendChild(label);
      subjectInputs.appendChild(input);
      subjectInputs.appendChild(document.createElement("br"));
    }
  }

  // Function to generate the schedule table
  function generateSchedule() {
    var numDays = document.getElementById("numDays").value;
    var numTeachers = document.getElementById("numTeachers").value;
    var scheduleBody = document.getElementById("scheduleBody");
    scheduleBody.innerHTML = "";

    var selectedTeachers = Array.from(document.querySelectorAll(".teacher-checkbox:checked")).map(cb => cb.value);

    if (selectedTeachers.length < numTeachers * 2) {
      alert(`Please select at least ${numTeachers * 2} teachers for invigilation.`);
      return;
    }

    for (var i = 1; i <= numDays; i++) {
      var row = document.createElement("tr");
      
      var dayCell = document.createElement("td");
      dayCell.textContent = "Day " + i;
      
      var morningCell = document.createElement("td");
      var morningInvigilators = getRandomInvigilators(selectedTeachers, numTeachers);
      morningCell.textContent = morningInvigilators.join(", ");
      
      var afternoonCell = document.createElement("td");
      var afternoonInvigilators = getRandomInvigilators(selectedTeachers, numTeachers);
      afternoonCell.textContent = afternoonInvigilators.join(", ");
      
      var subjectCell = document.createElement("td");
      var subjectInput = document.querySelector("input[name='subject" + i + "']");
      subjectCell.textContent = subjectInput.value;

      row.appendChild(dayCell);
      row.appendChild(morningCell);
      row.appendChild(afternoonCell);
      row.appendChild(subjectCell);

      scheduleBody.appendChild(row);
    }
    
    document.getElementById("scheduleTable").style.display = "table";
    document.getElementById("downloadBtn").style.display = "block";
    document.getElementById("downloadExcelBtn").style.display = "block";
  }

  // Function to get random invigilators from the list of selected teachers
  function getRandomInvigilators(teachers, numInvigilators) {
    var invigilators = [];
    var teachersCopy = [...teachers];
    for (var i = 0; i < numInvigilators; i++) {
      var index = Math.floor(Math.random() * teachersCopy.length);
      invigilators.push(teachersCopy[index]);
      teachersCopy.splice(index, 1);
    }
    return invigilators;
  }

  // Event listeners to generate input fields dynamically
  document.getElementById("numDays").addEventListener("input", generateSubjectInputs);

   // Function to download the schedule as a PDF
   document.getElementById("downloadBtn").addEventListener("click", function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    var columns = ["Day", "Morning Invigilators", "Afternoon Invigilators", "Subject"];
    var rows = Array.from(document.querySelectorAll("#scheduleTable tbody tr")).map(row => {
      return Array.from(row.querySelectorAll("td")).map(cell => cell.textContent);
    });

    doc.autoTable(columns, rows);

    doc.save('invigilation_schedule.pdf');
  });

  // Modified event listener for the "Download Excel" button
  document.getElementById("downloadExcelBtn").addEventListener("click", function() {
    var scheduleTable = document.getElementById("scheduleTable");
    var wb = XLSX.utils.table_to_book(scheduleTable, {sheet: "Sheet JS"});
    
    // Set the printing options to fit the table in A4 size
    if (!wb.Workbook) wb.Workbook = {};
    if (!wb.Workbook.Views) wb.Workbook.Views = [];
    wb.Workbook.Views[0] = {
      RTL: false,
      showGridLines: false,
      view: "pageLayout",
      scale: 85, // Adjust scale to fit content
      fitToWidth: 1,
      fitToHeight: 1
    };

    XLSX.writeFile(wb, 'schedule.xlsx');
  });
