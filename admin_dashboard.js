// Mock complaint data
let complaints = [
    {
        id: '1',
        trackingNumber: 'ERK-2024-001234',
        category: 'Infrastructure',
        subcategory: 'Road Damage',
        description: 'Large pothole on Main Street causing traffic issues',
        location: '123 Main Street',
        status: 'in-progress',
        dateSubmitted: '2024-01-15',
        submittedBy: 'juan.delacruz@email.com'
    },
    {
        id: '2',
        trackingNumber: 'ERK-2024-001189',
        category: 'Public Safety',
        subcategory: 'Street Lighting',
        description: 'Broken street light near the park',
        location: '456 Park Avenue',
        status: 'resolved',
        dateSubmitted: '2024-01-10',
        submittedBy: 'maria.santos@email.com'
    },
    {
        id: '3',
        trackingNumber: 'ERK-2024-001298',
        category: 'Sanitation',
        subcategory: 'Waste Collection',
        description: 'Garbage not collected for 3 weeks',
        location: '789 Oak Street',
        status: 'pending',
        dateSubmitted: '2024-01-22',
        submittedBy: 'pedro.reyes@email.com'
    },
    {
        id: '4',
        trackingNumber: 'ERK-2024-001056',
        category: 'Noise Complaint',
        subcategory: 'Construction',
        description: 'Construction noise at night beyond permitted hours',
        location: '321 Elm Street',
        status: 'rejected',
        dateSubmitted: '2024-01-05',
        submittedBy: 'Guest User'
    },
    {
        id: '5',
        trackingNumber: 'ERK-2024-001145',
        category: 'Infrastructure',
        subcategory: 'Drainage',
        description: 'Clogged drainage causing flooding during rain',
        location: '555 River Road',
        status: 'resolved',
        dateSubmitted: '2024-01-08',
        submittedBy: 'ana.garcia@email.com'
    },
    {
        id: '6',
        trackingNumber: 'ERK-2024-001367',
        category: 'Public Safety',
        subcategory: 'Traffic',
        description: 'Missing stop sign at intersection',
        location: 'Main St & 2nd Ave',
        status: 'pending',
        dateSubmitted: '2024-01-25',
        submittedBy: 'carlos.lopez@email.com'
    }
];

let selectedComplaint = null;
let readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
let complaintChart = null;

const statusLabels = {
    'pending': 'Pending',
    'in-progress': 'In Progress',
    'resolved': 'Resolved',
    'rejected': 'Rejected'
};

const statusColors = {
    'pending': 'status-pending',
    'in-progress': 'status-in-progress',
    'resolved': 'status-resolved',
    'rejected': 'status-rejected'
};

// Initialize on page load
window.addEventListener('DOMContentLoaded', function() {
    updateStats();
    renderComplaints(complaints);
    updateNotifications();
    initializeChart();
    
    // Set up search
    document.getElementById('searchInput').addEventListener('input', filterComplaints);
    
    // Set up status filter
    document.getElementById('statusFilter').addEventListener('change', filterComplaints);
    
    // Set up chart period filter
    document.getElementById('chartPeriod').addEventListener('change', function() {
        updateChart(this.value);
    });
});

function updateStats() {
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'pending').length;
    const progress = complaints.filter(c => c.status === 'in-progress').length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;

    document.getElementById('totalCount').textContent = total;
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('progressCount').textContent = progress;
    document.getElementById('resolvedCount').textContent = resolved;
}

function renderComplaints(complaintsToRender) {
    const tbody = document.getElementById('complaintsTableBody');
    const emptyState = document.getElementById('emptyState');
    
    if (complaintsToRender.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'table-row';
        return;
    }
    
    emptyState.style.display = 'none';
    
    tbody.innerHTML = complaintsToRender.map(complaint => `
        <tr>
            <td class="tracking-cell">${complaint.trackingNumber}</td>
            <td>
                <div class="category-cell">
                    <div class="category-main">${complaint.category}</div>
                    <div class="category-sub">${complaint.subcategory}</div>
                </div>
            </td>
            <td>
                <div class="description-cell" title="${complaint.description}">
                    ${complaint.description}
                </div>
            </td>
            <td>${complaint.location}</td>
            <td>${formatDate(complaint.dateSubmitted)}</td>
            <td>
                <select 
                    class="status-select ${statusColors[complaint.status]}"
                    onchange="handleStatusChange('${complaint.id}', this.value)"
                >
                    <option value="pending" ${complaint.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="in-progress" ${complaint.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                    <option value="resolved" ${complaint.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                    <option value="rejected" ${complaint.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                </select>
            </td>
            <td>
                <div class="action-buttons">
                    <button 
                        class="btn-action btn-view" 
                        onclick="viewComplaintDetails('${complaint.id}')"
                        title="View Details"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        View
                    </button>
                    ${complaint.status === 'resolved' ? `
                        <button 
                            class="btn-action btn-delete" 
                            onclick="confirmDelete('${complaint.id}')"
                            title="Delete Resolved Complaint"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

function filterComplaints() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    const filtered = complaints.filter(complaint => {
        const matchesSearch = 
            complaint.trackingNumber.toLowerCase().includes(searchTerm) ||
            complaint.description.toLowerCase().includes(searchTerm) ||
            complaint.location.toLowerCase().includes(searchTerm) ||
            complaint.category.toLowerCase().includes(searchTerm);
        
        const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    renderComplaints(filtered);
}

function handleStatusChange(complaintId, newStatus) {
    complaints = complaints.map(c => 
        c.id === complaintId ? { ...c, status: newStatus } : c
    );
    
    updateStats();
    filterComplaints();
    updateNotifications();
    
    // Update chart with current period
    const currentPeriod = document.getElementById('chartPeriod').value;
    updateChart(currentPeriod);
    
    showToast('Complaint status updated successfully!', 'success');
}

function viewComplaintDetails(complaintId) {
    selectedComplaint = complaints.find(c => c.id === complaintId);
    if (!selectedComplaint) return;
    
    // Populate modal
    document.getElementById('modalTrackingNumber').textContent = selectedComplaint.trackingNumber;
    document.getElementById('modalCategory').textContent = selectedComplaint.category;
    document.getElementById('modalSubcategory').textContent = selectedComplaint.subcategory;
    document.getElementById('modalDescription').textContent = selectedComplaint.description;
    document.getElementById('modalLocation').textContent = selectedComplaint.location;
    document.getElementById('modalSubmittedBy').textContent = selectedComplaint.submittedBy;
    document.getElementById('modalDateSubmitted').textContent = formatDate(selectedComplaint.dateSubmitted);
    
    // Set status dropdown
    const statusSelect = document.getElementById('modalStatusSelect');
    statusSelect.value = selectedComplaint.status;
    statusSelect.className = `status-select ${statusColors[selectedComplaint.status]}`;
    
    // Show/hide delete button
    const deleteSection = document.getElementById('modalDeleteSection');
    if (selectedComplaint.status === 'resolved') {
        deleteSection.style.display = 'block';
    } else {
        deleteSection.style.display = 'none';
    }
    
    // Show modal
    document.getElementById('detailsModal').style.display = 'flex';
}

function closeDetailsModal() {
    document.getElementById('detailsModal').style.display = 'none';
    selectedComplaint = null;
}

function handleModalStatusChange(newStatus) {
    if (selectedComplaint) {
        handleStatusChange(selectedComplaint.id, newStatus);
        selectedComplaint.status = newStatus;
        
        // Update modal display
        const statusSelect = document.getElementById('modalStatusSelect');
        statusSelect.className = `status-select ${statusColors[newStatus]}`;
        
        // Update delete button visibility
        const deleteSection = document.getElementById('modalDeleteSection');
        if (newStatus === 'resolved') {
            deleteSection.style.display = 'block';
        } else {
            deleteSection.style.display = 'none';
        }
    }
}

function confirmDelete(complaintId) {
    const complaint = complaints.find(c => c.id === complaintId);
    if (!complaint) return;
    
    document.getElementById('deleteTrackingNumber').textContent = complaint.trackingNumber;
    document.getElementById('deleteConfirmModal').style.display = 'flex';
    
    // Store complaint ID for deletion
    document.getElementById('deleteConfirmModal').dataset.complaintId = complaintId;
}

function closeDeleteModal() {
    document.getElementById('deleteConfirmModal').style.display = 'none';
}

function executeDelete() {
    const complaintId = document.getElementById('deleteConfirmModal').dataset.complaintId;
    const complaint = complaints.find(c => c.id === complaintId);
    
    if (complaint) {
        complaints = complaints.filter(c => c.id !== complaintId);
        
        updateStats();
        filterComplaints();
        updateNotifications();
        
        // Update chart with current period
        const currentPeriod = document.getElementById('chartPeriod').value;
        updateChart(currentPeriod);
        
        showToast(`Complaint ${complaint.trackingNumber} deleted successfully!`, 'success');
        
        closeDeleteModal();
        closeDetailsModal();
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
    });
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const detailsModal = document.getElementById('detailsModal');
    const deleteModal = document.getElementById('deleteConfirmModal');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const notificationBtn = document.getElementById('notificationBtn');
    
    if (event.target === detailsModal) {
        closeDetailsModal();
    }
    if (event.target === deleteModal) {
        closeDeleteModal();
    }
    
    // Close notification dropdown when clicking outside
    if (notificationDropdown && !notificationDropdown.contains(event.target) && 
        !notificationBtn.contains(event.target)) {
        notificationDropdown.classList.remove('show');
    }
});

// Notification Functions
function updateNotifications() {
    // Get recent complaints (last 5, sorted by date)
    const recentComplaints = [...complaints]
        .sort((a, b) => new Date(b.dateSubmitted) - new Date(a.dateSubmitted))
        .slice(0, 5);
    
    const notificationList = document.getElementById('notificationList');
    const notificationBadge = document.getElementById('notificationBadge');
    
    // Count unread notifications
    const unreadCount = recentComplaints.filter(c => !readNotifications.includes(c.id)).length;
    
    // Update badge
    if (unreadCount > 0) {
        notificationBadge.textContent = unreadCount;
        notificationBadge.style.display = 'flex';
    } else {
        notificationBadge.style.display = 'none';
    }
    
    // Render notifications
    if (recentComplaints.length === 0) {
        notificationList.innerHTML = `
            <div class="notification-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <p>No recent complaints</p>
            </div>
        `;
    } else {
        notificationList.innerHTML = recentComplaints.map(complaint => {
            const isUnread = !readNotifications.includes(complaint.id);
            const timeAgo = getTimeAgo(complaint.dateSubmitted);
            
            return `
                <div class="notification-item ${isUnread ? 'unread' : ''}" onclick="viewComplaintFromNotification('${complaint.id}')">
                    <div class="notification-content">
                        <div class="notification-title">
                            ${isUnread ? '<span class="notification-dot"></span>' : ''}
                            <strong>${complaint.category}</strong> - ${complaint.subcategory}
                        </div>
                        <div class="notification-desc">${truncateText(complaint.description, 60)}</div>
                        <div class="notification-meta">
                            <span class="notification-location">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                ${complaint.location}
                            </span>
                            <span class="notification-time">${timeAgo}</span>
                        </div>
                    </div>
                    <span class="notification-status ${statusColors[complaint.status]}">
                        ${statusLabels[complaint.status]}
                    </span>
                </div>
            `;
        }).join('');
    }
}

function toggleNotifications() {
    const dropdown = document.getElementById('notificationDropdown');
    dropdown.classList.toggle('show');
}

function closeNotifications() {
    const dropdown = document.getElementById('notificationDropdown');
    dropdown.classList.remove('show');
}

function markAllAsRead() {
    const recentComplaints = [...complaints]
        .sort((a, b) => new Date(b.dateSubmitted) - new Date(a.dateSubmitted))
        .slice(0, 5);
    
    readNotifications = [...new Set([...readNotifications, ...recentComplaints.map(c => c.id)])];
    localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
    
    updateNotifications();
}

function viewComplaintFromNotification(complaintId) {
    // Mark as read
    if (!readNotifications.includes(complaintId)) {
        readNotifications.push(complaintId);
        localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
        updateNotifications();
    }
    
    // Close notification dropdown
    closeNotifications();
    
    // View complaint details
    viewComplaintDetails(complaintId);
}

function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
        return formatDate(dateString);
    }
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Chart Functions
function initializeChart() {
    const ctx = document.getElementById('complaintChart').getContext('2d');
    
    complaintChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Number of Complaints',
                data: [],
                backgroundColor: [
                    'rgba(255, 107, 53, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)'
                ],
                borderColor: [
                    'rgba(255, 107, 53, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(236, 72, 153, 1)'
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: 600
                    },
                    bodyFont: {
                        size: 13
                    },
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed.y / total) * 100).toFixed(1);
                            return `${context.parsed.y} complaints (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 12,
                            weight: 500
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    updateChart('all');
}

function updateChart(period) {
    const filteredComplaints = filterComplaintsByPeriod(complaints, period);
    
    // Count complaints by category
    const categoryCounts = {};
    filteredComplaints.forEach(complaint => {
        const category = complaint.category;
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    // Sort by count (descending)
    const sortedCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7); // Show top 7 categories
    
    const labels = sortedCategories.map(([category]) => category);
    const data = sortedCategories.map(([, count]) => count);
    
    // Update chart data
    complaintChart.data.labels = labels;
    complaintChart.data.datasets[0].data = data;
    complaintChart.update();
}

function filterComplaintsByPeriod(complaints, period) {
    if (period === 'all') {
        return complaints;
    }
    
    const now = new Date();
    const filtered = complaints.filter(complaint => {
        const complaintDate = new Date(complaint.dateSubmitted);
        
        if (period === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return complaintDate >= weekAgo;
        } else if (period === 'month') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return complaintDate >= monthAgo;
        }
        
        return true;
    });
    
    return filtered;
}