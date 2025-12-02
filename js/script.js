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
        { id: 1, employee: "สมชาย ใจดี", role: "วิศวกรซอฟต์แวร์", type: "ลาป่วย", dates: "2025-12-02", days: "1 วัน", reason: "มีไข้และปวดหัว", status: "PENDING_MANAGER", submitted: "2025-11-30", rejectionReason: "" },
        { id: 2, employee: "วิไล รักดี", role: "UX Designer", type: "ลาพักร้อน", dates: "2025-12-10 ถึง 2025-12-12", days: "3 วัน", reason: "พาครอบครัวไปเที่ยว", status: "PENDING_MANAGER", submitted: "2025-11-28", rejectionReason: "" },
        { id: 3, employee: "ปีเตอร์ ปาร์คเกอร์", role: "Frontend Dev", type: "ลากิจ", dates: "2025-12-05", days: "1 วัน", reason: "ธุระส่วนตัว", status: "APPROVED", submitted: "2025-11-25", rejectionReason: "" },
        { id: 4, employee: "บรูซ เวย์น", role: "ผู้จัดการ", type: "ลาป่วย", dates: "2025-12-01", days: "1 วัน", reason: "ไข้หวัดใหญ่", status: "REJECTED", submitted: "2025-11-29", rejectionReason: "แจ้งกระทันหันเกินไป" },
        { id: 5, employee: "คลาร์ก เคนต์", role: "นักข่าว", type: "ลาพักร้อน", dates: "2025-12-20 ถึง 2025-12-25", days: "5 วัน", reason: "พักผ่อนประจำปี", status: "PENDING_HR", submitted: "2025-11-20", rejectionReason: "" }
    ];

    // Helper to get badge HTML
    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING_MANAGER': return '<span class="status-badge" style="background:#ffeaa7; color:#d35400;">รอหัวหน้าอนุมัติ</span>';
            case 'PENDING_HR': return '<span class="status-badge" style="background:#74b9ff; color:#0984e3;">รอ HR อนุมัติ</span>';
            case 'APPROVED': return '<span class="status-badge" style="background:#00b894; color:white;">อนุมัติแล้ว</span>';
            case 'REJECTED': return '<span class="status-badge" style="background:#ff7675; color:white;">ไม่อนุมัติ</span>';
            default: return '<span class="status-badge">ไม่ทราบสถานะ</span>';
        }
    };

    // Render Manager Table (Filters PENDING_MANAGER)
    const renderManagerTable = () => {
        const tbody = document.getElementById('managerTableBody');
        if (!tbody) return;

        const pendingRequests = mockRequests.filter(req => req.status === 'PENDING_MANAGER');

        if (pendingRequests.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color: #888;">ไม่มีคำขอที่รออนุมัติ</td></tr>';
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
                    <button onclick="showDetails(${req.id})" class="btn" style="padding: 5px 10px; margin-right: 5px;" title="ดูรายละเอียด"><i class="fa-regular fa-eye"></i></button>
                    <button onclick="updateStatus(${req.id}, 'PENDING_HR')" class="btn" style="background: #00b894; color: white; border: none; padding: 5px 15px; margin-right: 5px;">อนุมัติ</button>
                    <button onclick="initiateReject(${req.id})" class="btn" style="background: #ff7675; color: white; border: none; padding: 5px 15px;">ปฏิเสธ</button>
                </td>
            </tr>
        `).join('');
    };

    // Render HR Table (Shows PENDING_HR and PENDING_MANAGER)
    // viewType: 'PENDING' | 'HISTORY' | 'ALL' (default fallback)
    window.renderHRTable = (viewType = 'ALL') => {
        const tbody = document.getElementById(viewType === 'HISTORY' ? 'hrHistoryTableBody' : 'hrTableBody');
        if (!tbody) return;

        let hrRequests = [];
        if (viewType === 'PENDING') {
            hrRequests = mockRequests.filter(req => req.status === 'PENDING_HR' || req.status === 'PENDING_MANAGER');
        } else if (viewType === 'HISTORY') {
            hrRequests = mockRequests.filter(req => req.status === 'APPROVED' || req.status === 'REJECTED');
        } else {
            // Default fallback if needed
            hrRequests = mockRequests.filter(req => req.status === 'PENDING_HR' || req.status === 'PENDING_MANAGER');
        }

        if (hrRequests.length === 0) {
            const colSpan = viewType === 'HISTORY' ? 6 : 6;
            tbody.innerHTML = `<tr><td colspan="${colSpan}" style="text-align:center; padding: 20px; color: #888;">ไม่พบข้อมูล</td></tr>`;
            return;
        }

        tbody.innerHTML = hrRequests.map(req => {
            const isActionable = req.status === 'PENDING_HR';
            // For History table, we don't show Approve/Reject buttons usually, just View
            // For Pending table, we show buttons if actionable

            let actionButtons = '';
            if (viewType === 'PENDING') {
                actionButtons = `
                    <button onclick="showDetails(${req.id})" class="btn" style="padding: 5px 10px; margin-right: 5px;" title="ดูรายละเอียด"><i class="fa-regular fa-eye"></i></button>
                    ${isActionable ? `
                    <button onclick="updateStatus(${req.id}, 'APPROVED')" class="btn" style="background: #00b894; color: white; border: none; padding: 5px 10px; margin-right: 5px;">อนุมัติ</button>
                    <button onclick="initiateReject(${req.id})" class="btn" style="background: #ff7675; color: white; border: none; padding: 5px 10px;">ปฏิเสธ</button>
                    ` : `<span style="color:#999; font-size:12px;">รอหัวหน้างาน</span>`}
                `;
            } else {
                actionButtons = `
                    <button onclick="showDetails(${req.id})" class="btn" style="padding: 5px 10px; margin-right: 5px;" title="ดูรายละเอียด"><i class="fa-regular fa-eye"></i> ดูรายละเอียด</button>
                `;
            }

            return `
            <tr>
                <td>
                    <div style="font-weight: 500;">${req.employee}</div>
                    <small style="color: #666;">${req.role}</small>
                </td>
                <td>${req.type}</td>
                <td>${req.dates}</td>
                <td>${req.reason || '-'}</td>
                <td>${getStatusBadge(req.status)}</td>
                <td>${actionButtons}</td>
            </tr>
            `;
        }).join('');
    };

    // Render Admin Table (Shows ALL)
    window.renderAdminTable = (filter = 'ALL') => {
        const tbody = document.getElementById('adminTableBody');
        if (!tbody) return;

        let filteredRequests = mockRequests;
        if (filter !== 'ALL') {
            // Simple mapping for buttons
            if (filter === 'PENDING') filteredRequests = mockRequests.filter(r => r.status.includes('PENDING'));
            else filteredRequests = mockRequests.filter(r => r.status === filter);
        }

        if (filteredRequests.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px; color: #888;">ไม่พบข้อมูลคำขอ</td></tr>';
            return;
        }

        tbody.innerHTML = filteredRequests.map(req => `
            <tr>
                <td>#${req.id}</td>
                <td>
                    <div style="font-weight: 500;">${req.employee}</div>
                </td>
                <td>${req.role}</td>
                <td>${req.type}</td>
                <td>${req.dates}</td>
                <td>${getStatusBadge(req.status)}</td>
                <td>
                    <button onclick="showDetails(${req.id})" class="btn" style="padding: 5px 10px;" title="ดูรายละเอียด"><i class="fa-regular fa-eye"></i> ดู</button>
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
                    <button onclick="showDetails(${req.id})" style="border:none; background:none; cursor:pointer;" title="ดูรายละเอียด"><i class="fa-regular fa-eye"></i></button>
                </td>
            </tr>
        `).join('');
    };

    // Global Status Update Function
    window.updateStatus = (id, newStatus) => {
        const req = mockRequests.find(r => r.id === id);
        if (req) {
            req.status = newStatus;
            alert(`อัปเดตสถานะคำขอ ID ${id} เป็น ${newStatus} เรียบร้อยแล้ว`);
            // Re-render all tables
            renderManagerTable();
            // Try rendering both views for HR just in case
            renderHRTable('PENDING');
            renderHRTable('HISTORY');

            renderEmployeeTable();
            renderAdminTable(); // Refresh admin table if open
            renderCalendar();
            renderAttendanceTable(); // Refresh attendance
        }
    };

    // --- Modal Logic ---
    let currentRejectId = null;

    window.showDetails = (id) => {
        const req = mockRequests.find(r => r.id === id);
        if (!req) return;

        const modal = document.getElementById('detailsModal');
        const content = document.getElementById('detailsContent');
        if (!modal || !content) return;

        let detailsHtml = `
            <p><strong>พนักงาน:</strong> ${req.employee}</p>
            <p><strong>ตำแหน่ง:</strong> ${req.role}</p>
            <p><strong>ประเภท:</strong> ${req.type}</p>
            <p><strong>วันที่:</strong> ${req.dates} (${req.days})</p>
            <p><strong>เหตุผล:</strong> ${req.reason}</p>
            <p><strong>สถานะ:</strong> ${getStatusBadge(req.status)}</p>
            <p><strong>วันที่ยื่น:</strong> ${req.submitted}</p>
        `;

        if (req.status === 'REJECTED' && req.rejectionReason) {
            detailsHtml += `<p style="color: #ff4d4d; margin-top: 10px;"><strong>เหตุผลที่ปฏิเสธ:</strong> ${req.rejectionReason}</p>`;
        }

        content.innerHTML = detailsHtml;
        modal.classList.add('active');
    };

    window.closeDetailsModal = () => {
        document.getElementById('detailsModal').classList.remove('active');
    };

    window.processRequestFromModal = (status) => {
        // This function needs to know which ID is currently open in modal.
        // Since showDetails doesn't store ID globally, we might need to rely on button context or store it.
        // For simplicity, let's assume we don't have this fully wired in the HTML buttons yet without an ID.
        // BUT, the HTML I wrote calls processRequestFromModal('APPROVED').
        // I need to store the current ID when showDetails is called.
        // Let's add a global variable for currentDetailsId.
        if (window.currentDetailsId) {
            if (status === 'REJECTED') {
                closeDetailsModal();
                initiateReject(window.currentDetailsId);
            } else {
                updateStatus(window.currentDetailsId, status);
                closeDetailsModal();
            }
        }
    };

    // Update showDetails to store ID
    const originalShowDetails = window.showDetails;
    window.showDetails = (id) => {
        window.currentDetailsId = id;
        // ... rest of logic is same as above, but I am rewriting the whole file so I will just include it inline.
        const req = mockRequests.find(r => r.id === id);
        if (!req) return;

        const modal = document.getElementById('detailsModal');
        const content = document.getElementById('detailsContent');
        if (!modal || !content) return;

        let detailsHtml = `
            <p><strong>พนักงาน:</strong> ${req.employee}</p>
            <p><strong>ตำแหน่ง:</strong> ${req.role}</p>
            <p><strong>ประเภท:</strong> ${req.type}</p>
            <p><strong>วันที่:</strong> ${req.dates} (${req.days})</p>
            <p><strong>เหตุผล:</strong> ${req.reason}</p>
            <p><strong>สถานะ:</strong> ${getStatusBadge(req.status)}</p>
            <p><strong>วันที่ยื่น:</strong> ${req.submitted}</p>
        `;

        if (req.status === 'REJECTED' && req.rejectionReason) {
            detailsHtml += `<p style="color: #ff4d4d; margin-top: 10px;"><strong>เหตุผลที่ปฏิเสธ:</strong> ${req.rejectionReason}</p>`;
        }

        content.innerHTML = detailsHtml;
        modal.classList.add('active');
    };


    window.initiateReject = (id) => {
        currentRejectId = id;
        const modal = document.getElementById('rejectModal');
        if (modal) {
            document.getElementById('rejectReason').value = ''; // Clear previous
            modal.classList.add('active');
        } else {
            // Fallback if modal not present in page, just use prompt
            const reason = prompt("กรุณาระบุเหตุผลที่ปฏิเสธ:");
            if (reason) {
                const req = mockRequests.find(r => r.id === id);
                if (req) {
                    req.status = 'REJECTED';
                    req.rejectionReason = reason;
                    alert(`ปฏิเสธคำขอเรียบร้อยแล้ว เหตุผล: ${reason}`);
                    renderManagerTable();
                    renderHRTable('PENDING');
                    renderHRTable('HISTORY');
                    renderEmployeeTable();
                    renderAdminTable();
                    renderCalendar();
                    renderAttendanceTable();
                }
            }
        }
    };

    window.closeRejectModal = () => {
        document.getElementById('rejectModal').classList.remove('active');
        currentRejectId = null;
    };

    window.confirmReject = () => {
        if (!currentRejectId) return;
        const reason = document.getElementById('rejectReason').value;
        if (!reason.trim()) {
            alert("กรุณาระบุเหตุผลที่ปฏิเสธ");
            return;
        }

        const req = mockRequests.find(r => r.id === currentRejectId);
        if (req) {
            req.status = 'REJECTED';
            req.rejectionReason = reason;
            alert(`ปฏิเสธคำขอเรียบร้อยแล้ว เหตุผล: ${reason}`);
            closeRejectModal();
            renderManagerTable();
            renderHRTable('PENDING');
            renderHRTable('HISTORY');
            renderEmployeeTable();
            renderAdminTable();
            renderCalendar();
            renderAttendanceTable();
        }
    };

    // 2. Calendar Logic (Global & Dynamic)
    const calendarGrid = document.getElementById('calendarGrid');
    const renderCalendar = () => {
        if (!calendarGrid) return;

        let date = new Date();
        let currYear = date.getFullYear();
        let currMonth = date.getMonth();
        const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

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
            "2025-12-05": { label: "วันพ่อแห่งชาติ", color: "#dfe6e9" },
            "2025-12-10": { label: "วันรัฐธรรมนูญ", color: "#dfe6e9" },
            "2025-12-31": { label: "วันสิ้นปี", color: "#dfe6e9" }
        };

        const monthYearEl = document.getElementById('currentMonthYear');
        if (monthYearEl) monthYearEl.innerText = `${months[currMonth]} ${currYear}`;

        let firstDay = new Date(currYear, currMonth, 1).getDay();
        let lastDate = new Date(currYear, currMonth + 1, 0).getDate();

        let html = `
            <div class="cal-header-cell">อา</div><div class="cal-header-cell">จ</div><div class="cal-header-cell">อ</div>
            <div class="cal-header-cell">พ</div><div class="cal-header-cell">พฤ</div><div class="cal-header-cell">ศ</div><div class="cal-header-cell">ส</div>
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

    // 4. Mock Employees & Attendance Logic
    const mockEmployees = [
        { id: 101, name: "สมชาย ใจดี", role: "วิศวกรซอฟต์แวร์", dept: "IT", avatar: "ส" },
        { id: 102, name: "วิไล รักดี", role: "UX Designer", dept: "IT", avatar: "ว" },
        { id: 103, name: "ปีเตอร์ ปาร์คเกอร์", role: "Frontend Dev", dept: "IT", avatar: "ป" },
        { id: 104, name: "บรูซ เวย์น", role: "ผู้จัดการ", dept: "Management", avatar: "บ" },
        { id: 105, name: "คลาร์ก เคนต์", role: "นักข่าว", dept: "Media", avatar: "ค" },
        { id: 106, name: "ไดอาน่า ปรินซ์", role: "HR Manager", dept: "HR", avatar: "ด" }
    ];

    window.renderAttendanceTable = () => {
        const tbody = document.getElementById('attendanceTableBody');
        if (!tbody) return;

        // Set Today's Date
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        // Thai date formatting
        const dateStr = today.toLocaleDateString('th-TH', options);
        const dateEl = document.getElementById('todayDate');
        if (dateEl) dateEl.innerText = dateStr;

        let present = 0, late = 0, absent = 0;

        const html = mockEmployees.map(emp => {
            // Simulate status
            let status = 'เข้างานปกติ';
            let checkIn = '08:45 น.';
            let badgeColor = '#00b894'; // Green
            let location = 'ออฟฟิศ (สำนักงานใหญ่)';

            // Hardcode some scenarios based on names
            if (emp.name === 'ปีเตอร์ ปาร์คเกอร์') {
                status = 'ลางาน';
                checkIn = '-';
                badgeColor = '#e74c3c'; // Red
                location = '-';
                absent++;
            } else if (emp.name === 'บรูซ เวย์น') {
                status = 'สาย';
                checkIn = '09:15 น.';
                badgeColor = '#fdcb6e'; // Orange
                location = 'ออฟฟิศ (สำนักงานใหญ่)';
                late++;
            } else if (emp.name === 'คลาร์ก เคนต์') {
                status = 'ทำงานที่บ้าน';
                checkIn = '08:55 น.';
                badgeColor = '#0984e3'; // Blue
                location = 'บ้าน';
                present++;
            } else {
                present++;
            }

            return `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 35px; height: 35px; background: #eee; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #555;">${emp.avatar}</div>
                        <div>
                            <div style="font-weight: 500;">${emp.name}</div>
                            <small style="color: #666;">${emp.role}</small>
                        </div>
                    </div>
                </td>
                <td>${emp.dept}</td>
                <td>${checkIn}</td>
                <td><span class="status-badge" style="background:${badgeColor}; color:white;">${status}</span></td>
                <td>${location}</td>
            </tr>
            `;
        }).join('');

        tbody.innerHTML = html;

        // Update Counts
        if (document.getElementById('countPresent')) document.getElementById('countPresent').innerText = present;
        if (document.getElementById('countLate')) document.getElementById('countLate').innerText = late;
        if (document.getElementById('countAbsent')) document.getElementById('countAbsent').innerText = absent;
        if (document.getElementById('countTotal')) document.getElementById('countTotal').innerText = mockEmployees.length;
    };

    // Initial Render
    renderManagerTable();
    // Default HR table render (might need specific call in HTML for split pages, but safe to call here)
    renderHRTable('PENDING');
    renderEmployeeTable();
    renderAdminTable();
    renderCalendar();
    renderAttendanceTable();

    // Calendar Navigation (if exists)
    const prevBtn = document.getElementById('prevMonthBtn');
    const nextBtn = document.getElementById('nextMonthBtn');
    if (prevBtn && nextBtn) {
        // Note: Simple navigation logic would need state management for month/year if we want it fully functional across re-renders
        // For prototype, we stick to current month or simple toggle
    }
});