// Global state
let state = {
    examDays: 0,
    teachersPerSession: { morning: 0, afternoon: 0 },
    teachers: [],
    schedule: [],
    currentTab: 'setup',
    editingTeacherIndex: null
  };
  
  // DOM Elements
  document.addEventListener('DOMContentLoaded', () => {
    // Tab navigation
    const tabTriggers = document.querySelectorAll('.tab-trigger');
    tabTriggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        if (trigger.classList.contains('active')) return;
  
        const tabId = trigger.getAttribute('data-tab');
        setCurrentTab(tabId);
      });
    });
  
    // Exam setup form handling
    const saveSetupBtn = document.getElementById('saveSetupBtn');
    saveSetupBtn.addEventListener('click', handleExamSetup);
  
    // Teacher management handling
    const addTeacherBtn = document.getElementById('addTeacherBtn');
    const newTeacherInput = document.getElementById('newTeacher');
    
    addTeacherBtn.addEventListener('click', () => addTeacher());
    newTeacherInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addTeacher();
    });
  
    // Schedule generation
    const generateScheduleBtn = document.getElementById('generateScheduleBtn');
    generateScheduleBtn.addEventListener('click', generateSchedule);
  
    // Initialize UI
    updateRequiredTeachers();
    renderTeachersList();
  });
  
  // Tab Navigation
  function setCurrentTab(tabId) {
    state.currentTab = tabId;
    
    // Update active tab
    document.querySelectorAll('.tab-trigger').forEach(trigger => {
      trigger.classList.toggle('active', trigger.getAttribute('data-tab') === tabId);
    });
    
    // Show active content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === tabId);
    });
  }
  
  // Toast notifications
  function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
  
  // Exam Setup
  function handleExamSetup() {
    const daysInput = document.getElementById('days');
    const morningTeachersInput = document.getElementById('morningTeachers');
    const afternoonTeachersInput = document.getElementById('afternoonTeachers');
    
    const days = parseInt(daysInput.value) || 0;
    const morningTeachers = parseInt(morningTeachersInput.value) || 0;
    const afternoonTeachers = parseInt(afternoonTeachersInput.value) || 0;
    
    if (days <= 0) {
      showToast('Please enter a valid number of exam days', 'error');
      return;
    }
    
    if (morningTeachers <= 0 || afternoonTeachers <= 0) {
      showToast('Each session must have at least one teacher', 'error');
      return;
    }
    
    state.examDays = days;
    state.teachersPerSession = { morning: morningTeachers, afternoon: afternoonTeachers };
    
    updateRequiredTeachers();
    showToast('Exam setup saved successfully', 'success');
    setCurrentTab('teachers');
  }
  
  function updateRequiredTeachers() {
    const requiredTeachers = document.getElementById('requiredTeachers');
    const required = Math.max(state.teachersPerSession.morning, state.teachersPerSession.afternoon);
    requiredTeachers.textContent = required;
  }
  
  // Teacher Management
  function addTeacher() {
    const newTeacherInput = document.getElementById('newTeacher');
    const teacherName = newTeacherInput.value.trim();
    
    if (!teacherName) {
      showToast('Teacher name cannot be empty', 'error');
      return;
    }
    
    if (state.teachers.includes(teacherName)) {
      showToast('This teacher is already in the list', 'error');
      return;
    }
    
    state.teachers.push(teacherName);
    newTeacherInput.value = '';
    renderTeachersList();
    updateGenerateButton();
    showToast('Teacher added successfully', 'success');
  }
  
  function startEditingTeacher(index) {
    state.editingTeacherIndex = index;
    renderTeachersList();
  }
  
  function saveEditedTeacher() {
    const editInput = document.getElementById('editTeacherInput');
    const newName = editInput.value.trim();
    
    if (!newName) {
      showToast('Teacher name cannot be empty', 'error');
      return;
    }
    
    if (state.teachers.includes(newName) && newName !== state.teachers[state.editingTeacherIndex]) {
      showToast('This teacher name is already in use', 'error');
      return;
    }
    
    state.teachers[state.editingTeacherIndex] = newName;
    state.editingTeacherIndex = null;
    renderTeachersList();
    showToast('Teacher updated successfully', 'success');
  }
  
  function cancelEditingTeacher() {
    state.editingTeacherIndex = null;
    renderTeachersList();
  }
  
  function renderTeachersList() {
    const teachersContainer = document.getElementById('teachersContainer');
    
    if (state.teachers.length === 0) {
      teachersContainer.innerHTML = `
        <div class="empty-state">
          <p>No teachers added yet. Add teachers to create a schedule.</p>
        </div>
      `;
      return;
    }
    
    let html = `
      <table class="teacher-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    state.teachers.forEach((teacher, index) => {
      if (state.editingTeacherIndex === index) {
        html += `
          <tr>
            <td>${index + 1}</td>
            <td>
              <div class="teacher-editing">
                <input id="editTeacherInput" type="text" value="${teacher}" autocomplete="off">
              </div>
            </td>
            <td>
              <div class="action-buttons">
                <button class="btn-icon btn-check" onclick="saveEditedTeacher()" title="Save">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </button>
                <button class="btn-icon btn-x" onclick="cancelEditingTeacher()" title="Cancel">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </td>
          </tr>
        `;
      } else {
        html += `
          <tr>
            <td>${index + 1}</td>
            <td>${teacher}</td>
            <td>
              <div class="action-buttons">
                <button class="btn-icon btn-edit" onclick="startEditingTeacher(${index})" title="Edit">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
              </div>
            </td>
          </tr>
        `;
      }
    });
    
    html += `
        </tbody>
      </table>
    `;
    
    teachersContainer.innerHTML = html;
    
    // If we're editing, focus the input
    if (state.editingTeacherIndex !== null) {
      setTimeout(() => {
        const editInput = document.getElementById('editTeacherInput');
        if (editInput) {
          editInput.focus();
          editInput.select();
          
          editInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              saveEditedTeacher();
            } else if (e.key === 'Escape') {
              cancelEditingTeacher();
            }
          });
        }
      }, 0);
    }
  }
  
  function updateGenerateButton() {
    const generateScheduleBtn = document.getElementById('generateScheduleBtn');
    generateScheduleBtn.disabled = state.teachers.length === 0 || state.examDays === 0;
  }
  
  // Schedule Generation
  function shuffleArray(array) {
    // Fisher-Yates (Knuth) Shuffle algorithm
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  function generateSchedule() {
    if (state.examDays <= 0 || state.teachers.length === 0) {
      showToast('Please set up exam days and add teachers first', 'error');
      return;
    }
  
    const newSchedule = [];
    
    // Track assignments for each teacher to ensure fair distribution
    const teacherAssignments = {};
    state.teachers.forEach(teacher => {
      teacherAssignments[teacher] = 0;
    });
    
    // Generate schedule for each day and session
    for (let day = 1; day <= state.examDays; day++) {
      // For each day, keep track of teachers assigned to morning session
      // so they won't be assigned to afternoon session on the same day
      let assignedTeachersForDay = [];
      
      // Morning session - with randomization
      const morningTeachers = assignTeachers(
        state.teachers,
        teacherAssignments,
        state.teachersPerSession.morning,
        [], // No excluded teachers for morning session
        true // Enable randomization
      );
      
      newSchedule.push({
        day,
        session: "Morning",
        teachers: morningTeachers
      });
      
      // Update assignment count and track these teachers for this day
      morningTeachers.forEach(teacher => {
        teacherAssignments[teacher]++;
      });
      
      // Add morning teachers to the assigned list for this day
      assignedTeachersForDay = [...morningTeachers];
      
      // Afternoon session - exclude teachers who were assigned to morning session
      const afternoonTeachers = assignTeachers(
        state.teachers,
        teacherAssignments,
        state.teachersPerSession.afternoon,
        assignedTeachersForDay, // Exclude teachers who worked in the morning
        true // Enable randomization
      );
      
      newSchedule.push({
        day,
        session: "Afternoon",
        teachers: afternoonTeachers
      });
      
      // Update assignment count
      afternoonTeachers.forEach(teacher => {
        teacherAssignments[teacher]++;
      });
    }
    
    state.schedule = newSchedule;
    renderSchedule();
    
    setCurrentTab('schedule');
    showToast('Schedule generated successfully', 'success');
  }
  
  function assignTeachers(
    allTeachers,
    assignmentCount,
    requiredCount,
    excludeTeachers = [],
    randomize = false
  ) {
    // Filter out excluded teachers
    const availableTeachers = allTeachers.filter(t => !excludeTeachers.includes(t));
    
    if (availableTeachers.length < requiredCount) {
      // Not enough teachers after exclusion, we need to include some from excluded list
      // But prioritize those with fewer assignments
      const shortage = requiredCount - availableTeachers.length;
      
      // Sort excluded teachers by assignment count (ascending)
      const sortedExcluded = [...excludeTeachers]
        .sort((a, b) => assignmentCount[a] - assignmentCount[b])
        .slice(0, shortage);
      
      const selectedTeachers = [...availableTeachers, ...sortedExcluded];
      
      // Apply randomization if requested
      return randomize ? shuffleArray(selectedTeachers).slice(0, requiredCount) : selectedTeachers;
    }
    
    // Group teachers by assignment count to prioritize fair distribution
    const teachersByCount = {};
    availableTeachers.forEach(teacher => {
      const count = assignmentCount[teacher] || 0;
      if (!teachersByCount[count]) teachersByCount[count] = [];
      teachersByCount[count].push(teacher);
    });
    
    // Get all counts, sort them
    const counts = Object.keys(teachersByCount).map(Number).sort((a, b) => a - b);
    
    let selectedTeachers = [];
    let remaining = requiredCount;
    
    // First pick teachers with lowest assignment counts
    for (const count of counts) {
      if (remaining <= 0) break;
      
      // Randomize the teachers within each count group
      const teachersInGroup = randomize ? 
        shuffleArray(teachersByCount[count]) : 
        teachersByCount[count];
        
      const toSelect = Math.min(remaining, teachersInGroup.length);
      selectedTeachers = [...selectedTeachers, ...teachersInGroup.slice(0, toSelect)];
      remaining -= toSelect;
    }
    
    return selectedTeachers;
  }
  
  function renderSchedule() {
    const scheduleContainer = document.getElementById('scheduleContainer');
    
    if (state.schedule.length === 0) {
      scheduleContainer.innerHTML = `
        <div class="empty-state">
          <p>No schedule has been generated yet.</p>
          <p class="empty-state-subtitle">Complete the exam setup and teacher list, then generate a schedule.</p>
        </div>
      `;
      return;
    }
    
    // Get list of unique days for filters
    const days = [...new Set(state.schedule.map(item => item.day))];
    
    let html = `
      <div class="schedule-filters">
        <button class="button button-sm button-outline active" data-filter="all">All Days</button>
    `;
    
    days.forEach(day => {
      html += `<button class="button button-sm button-outline" data-filter="${day}">Day ${day}</button>`;
    });
    
    html += `
      </div>
      
      <div class="teachers-container">
        <table class="schedule-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Session</th>
              <th>Assigned Teachers</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    state.schedule.forEach(item => {
      html += `
        <tr data-day="${item.day}">
          <td>${item.day}</td>
          <td>${item.session}</td>
          <td>${item.teachers.join(', ')}</td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;
    
    // Teacher assignment summary
    const teacherAssignmentCounts = {};
    state.schedule.forEach(item => {
      item.teachers.forEach(teacher => {
        teacherAssignmentCounts[teacher] = (teacherAssignmentCounts[teacher] || 0) + 1;
      });
    });
    
    html += `
      <div class="teacher-summary">
        <h3>Teacher Assignment Summary</h3>
        <div class="teacher-stats">
    `;
    
    Object.keys(teacherAssignmentCounts).sort().forEach(teacher => {
      html += `
        <div class="teacher-stat">
          <span class="font-medium">${teacher}:</span> ${teacherAssignmentCounts[teacher]} sessions
        </div>
      `;
    });
    
    html += `
        </div>
      </div>
      
      <div class="export-buttons">
        <button class="button button-outline btn-with-icon" onclick="exportAsText()">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Export as Text
        </button>
        <button class="button btn-with-icon" onclick="exportAsCSV()">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Export as CSV
        </button>
      </div>
    `;
    
    scheduleContainer.innerHTML = html;
    
    // Add filter functionality
    const filterButtons = scheduleContainer.querySelectorAll('.schedule-filters button');
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const filter = button.getAttribute('data-filter');
        const rows = scheduleContainer.querySelectorAll('.schedule-table tbody tr');
        
        rows.forEach(row => {
          if (filter === 'all') {
            row.style.display = '';
          } else {
            row.style.display = row.getAttribute('data-day') === filter ? '' : 'none';
          }
        });
      });
    });
  }
  
  // Export functions
  function exportAsCSV() {
    if (state.schedule.length === 0) {
      showToast('No schedule to export', 'error');
      return;
    }
    
    // Group by day first
    const dayMap = new Map();
    
    // Initialize data structure
    const days = [...new Set(state.schedule.map(item => item.day))];
    days.forEach(day => {
      dayMap.set(day, { morning: [], afternoon: [] });
    });
    
    // Populate the data
    state.schedule.forEach(item => {
      const dayData = dayMap.get(item.day);
      if (dayData) {
        if (item.session === "Morning") {
          dayData.morning = item.teachers;
        } else {
          dayData.afternoon = item.teachers;
        }
      }
    });
    
    // Generate CSV content with sessions in columns
    let csvContent = "Day,Morning Session,Afternoon Session\n";
    
    days.forEach(day => {
      const dayData = dayMap.get(day);
      if (dayData) {
        csvContent += `${day},"${dayData.morning.join(', ')}","${dayData.afternoon.join(', ')}"\n`;
      }
    });
    
    // Download the CSV file
    downloadFile(csvContent, 'invigilation_schedule.csv', 'text/csv;charset=utf-8');
    showToast('Schedule exported successfully as CSV', 'success');
  }
  
  function exportAsText() {
    if (state.schedule.length === 0) {
      showToast('No schedule to export', 'error');
      return;
    }
    
    // Similar restructuring for text format
    const dayMap = new Map();
    
    // Initialize data structure
    const days = [...new Set(state.schedule.map(item => item.day))];
    days.forEach(day => {
      dayMap.set(day, { morning: [], afternoon: [] });
    });
    
    // Populate the data
    state.schedule.forEach(item => {
      const dayData = dayMap.get(item.day);
      if (dayData) {
        if (item.session === "Morning") {
          dayData.morning = item.teachers;
        } else {
          dayData.afternoon = item.teachers;
        }
      }
    });
    
    let textContent = "INVIGILATION SCHEDULE\n\n";
    
    days.forEach(day => {
      const dayData = dayMap.get(day);
      if (dayData) {
        textContent += `DAY ${day}\n`;
        textContent += `Morning Session: ${dayData.morning.join(', ')}\n`;
        textContent += `Afternoon Session: ${dayData.afternoon.join(', ')}\n\n`;
      }
    });
    
    // Download the text file
    downloadFile(textContent, 'invigilation_schedule.txt', 'text/plain;charset=utf-8');
    showToast('Schedule exported successfully as text', 'success');
  }
  
  function downloadFile(data, filename, type) {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }