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
    
    // Set up search
    document.getElementById('searchInput').addEventListener('input', filterComplaints);
    
    // Set up status filter
    document.getElementById('statusFilter').addEventListener('change', filterComplaints);
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
    
    if (event.target === detailsModal) {
        closeDetailsModal();
    }
    if (event.target === deleteModal) {
        closeDeleteModal();
    }
});