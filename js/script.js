/* js/script.js */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Active Menu Logic
    const currentPath = window.location.pathname;
    const menuLinks = document.querySelectorAll('.menu-btn');
    menuLinks.forEach(link => {
        if (currentPath.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });

    // 3. Mock Data & Workflow Logic
    const mockRequests = [
        { id: 1, employee: "Somchai Jaidee", role: "Software Engineer", type: "Sick Leave", dates: "2025-12-02", days: "1 Day", reason: "Fever and headache", status: "PENDING_MANAGER", submitted: "2025-11-30" },
        { id: 2, employee: "Jane Doe", role: "UX Designer", type: "Vacation", dates: "2025-12-10 to 2025-12-12", days: "3 Days", reason: "Family trip", status: "PENDING_MANAGER", submitted: "2025-11-28" },
        { id: 3, employee: "Peter Parker", role: "Frontend Dev", type: "Personal", dates: "2025-12-05", days: "1 Day", reason: "Personal business", status: "APPROVED", submitted: "2025-11-25" },
        { id: 4, employee: "Bruce Wayne", role: "Manager", type: "Sick Leave", dates: "2025-12-01", days: "1 Day", reason: "Flu", status: "REJECTED", submitted: "2025-11-29" },
        { id: 5, employee: "Clark Kent", role: "Journalist", type: "Vacation", dates: "2025-12-20 to 2025-12-25", days: "5 Days", reason: "Holiday", status: "PENDING_HR", submitted: "2025-11-20" }
    ];

    // Helper to get badge HTML
    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING_MANAGER': return '<span class="status-badge" style="background:#ffeaa7; color:#d35400;">Pending Manager</span>';
            case 'PENDING_HR': return '<span class="status-badge" style="background:#74b9ff; color:#0984e3;">Pending HR</span>';
            case 'APPROVED': return '<span class="status-badge" style="background:#00b894; color:white;">Approved</span>';
            case 'REJECTED': return '<span class="status-badge" style="background:#ff7675; color:white;">Rejected</span>';
            default: return '<span class="status-badge">Unknown</span>';
        }
    };

    // Render Manager Table (Filters PENDING_MANAGER)
    const renderManagerTable = () => {
        const tbody = document.getElementById('managerTableBody');
        if (!tbody) return;

        const pendingRequests = mockRequests.filter(req => req.status === 'PENDING_MANAGER');

        if (pendingRequests.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color: #888;">No pending requests</td></tr>';
            return;
        }

        tbody.innerHTML = pendingRequests.map(req => `
            <tr>
                <td>
                    <div style="font-weight: 500;">${req.employee}</div>
                    <small style="color: #666;">${req.role}</small>
                </td>
                <td>${req.type}</td>
                <td>${req.dates} (${req.days})</td>
                <td>${req.reason}</td>
                <td>
                    <button onclick="updateStatus(${req.id}, 'PENDING_HR')" class="btn" style="background: #00b894; color: white; border: none; padding: 5px 15px; margin-right: 5px;">Approve</button>
                    <button onclick="updateStatus(${req.id}, 'REJECTED')" class="btn" style="background: #ff7675; color: white; border: none; padding: 5px 15px;">Reject</button>
                </td>
            </tr>
        `).join('');
    };

    // Render HR Table (Shows PENDING_HR)
    const renderHRTable = () => {
        const tbody = document.getElementById('hrTableBody');
        if (!tbody) return;

        const pendingRequests = mockRequests.filter(req => req.status === 'PENDING_HR');

        if (pendingRequests.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px; color: #888;">No pending approvals</td></tr>';
            return;
        }

        tbody.innerHTML = pendingRequests.map(req => `
            <tr>
                <td>
                    <div style="font-weight: 500;">${req.employee}</div>
                    <small style="color: #666;">${req.role}</small>
                </td>
                <td>IT</td> <!-- Mock Dept -->
                <td>${req.type}</td>
                <td>${req.dates}</td>
                <td>${req.days}</td>
                <td>${getStatusBadge(req.status)}</td>
                <td>
                    <button onclick="updateStatus(${req.id}, 'APPROVED')" class="btn" style="background: #00b894; color: white; border: none; padding: 5px 10px; margin-right: 5px;">Approve</button>
                    <button onclick="updateStatus(${req.id}, 'REJECTED')" class="btn" style="background: #ff7675; color: white; border: none; padding: 5px 10px;">Reject</button>
                </td>
            </tr>
        `).join('');
    };

    // Render Employee Table (Shows ALL for demo purposes, normally filtered by user)
    const renderEmployeeTable = () => {
        const tbody = document.getElementById('employeeTableBody');
        if (!tbody) return;

        // For demo, we show all requests as if they belong to the logged-in user or team
        tbody.innerHTML = mockRequests.map(req => `
            <tr>
                <td>${req.submitted}</td>
                <td>${req.type}</td>
                <td>${req.dates}</td>
                <td>${getStatusBadge(req.status)}</td>
                <td>
                    <button style="border:none; background:none; cursor:pointer;" title="View"><i class="fa-regular fa-eye"></i></button>
                </td>
            </tr>
        `).join('');
    };

    // Global Status Update Function
    window.updateStatus = (id, newStatus) => {
        const req = mockRequests.find(r => r.id === id);
        if (req) {
            req.status = newStatus;
            alert(`Request ID ${id} status updated to ${newStatus}`);
            // Re-render all tables
            renderManagerTable();
            renderHRTable();
            renderEmployeeTable();
            renderCalendar();
        }
    };

    // 2. Calendar Logic (Global & Dynamic)
    const calendarGrid = document.getElementById('calendarGrid');
    const renderCalendar = () => {
        if (!calendarGrid) return;

        let date = new Date();
        let currYear = date.getFullYear();
        let currMonth = date.getMonth();
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        // Filter APPROVED requests for calendar
        const approvedEvents = mockRequests
            .filter(req => req.status === 'APPROVED')
            .reduce((acc, req) => {
                // Simple parsing for single dates. Range support would need more logic.
                const dateKey = req.dates.split(' to ')[0].trim();
                acc[dateKey] = { label: `${req.employee} (${req.type})`, color: "#00b894" };
                return acc;
            }, {});

        // Merge with static holidays
        const events = {
            ...approvedEvents,
            "2025-12-05": { label: "Father's Day", color: "#dfe6e9" },
            "2025-12-10": { label: "Constitution Day", color: "#dfe6e9" },
            "2025-12-31": { label: "New Year's Eve", color: "#dfe6e9" }
        };

        document.getElementById('currentMonthYear').innerText = `${months[currMonth]} ${currYear}`;
        let firstDay = new Date(currYear, currMonth, 1).getDay();
        let lastDate = new Date(currYear, currMonth + 1, 0).getDate();

        let html = `
            <div class="cal-header-cell">Sun</div><div class="cal-header-cell">Mon</div><div class="cal-header-cell">Tue</div>
            <div class="cal-header-cell">Wed</div><div class="cal-header-cell">Thu</div><div class="cal-header-cell">Fri</div><div class="cal-header-cell">Sat</div>
        `;

        for (let i = 0; i < firstDay; i++) html += `<div class="cal-day" style="background:#fafafa; border:none;"></div>`;

        for (let i = 1; i <= lastDate; i++) {
            let key = `${currYear}-${String(currMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            let evt = events[key] ? `<span class="event-label" style="background:${events[key].color}">${events[key].label}</span>` : '';
            let today = (i === new Date().getDate() && currMonth === new Date().getMonth()) ? 'today' : '';
            html += `<div class="cal-day ${today}"><strong>${i}</strong>${evt}</div>`;
        }
        calendarGrid.innerHTML = html;
    };

    // Initial Render
    renderManagerTable();
    renderHRTable();
    renderEmployeeTable();
    renderCalendar();

    // Calendar Navigation (if exists)
    const prevBtn = document.getElementById('prevMonthBtn');
    const nextBtn = document.getElementById('nextMonthBtn');
    if (prevBtn && nextBtn) {
        // Note: Simple navigation logic would need state management for month/year if we want it fully functional across re-renders
        // For prototype, we stick to current month or simple toggle
    }
});