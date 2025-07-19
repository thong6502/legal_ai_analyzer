// ===== DASHBOARD FUNCTIONALITY FOR LEGAL AI ANALYZER =====

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    setupFilters();
    setupSearch();
    setupReportActions();
    setupStatsRefresh();
    loadReports();
}

// ===== FILTERS SETUP =====
function setupFilters() {
    const statusFilter = document.getElementById('status-filter');
    const riskFilter = document.getElementById('risk-filter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }
    
    if (riskFilter) {
        riskFilter.addEventListener('change', applyFilters);
    }
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 300));
        
        // Clear search functionality
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                applyFilters();
            }
        });
    }
}

// ===== REPORT ACTIONS SETUP =====
function setupReportActions() {
    const reportsGrid = document.getElementById('reports-grid');
    
    if (reportsGrid) {
        // Event delegation for report actions
        reportsGrid.addEventListener('click', function(e) {
            const target = e.target.closest('button, a');
            if (!target) return;
            
            const reportCard = target.closest('.report-card');
            const reportId = reportCard ? reportCard.dataset.reportId : null;
            
            if (target.classList.contains('btn-primary')) {
                // View report
                e.preventDefault();
                viewReport(reportId);
            } else if (target.textContent.includes('Tải')) {
                // Download report
                e.preventDefault();
                downloadReport(reportId);
            } else if (target.textContent.includes('Chat')) {
                // Open chat
                e.preventDefault();
                openChat(reportId);
            }
        });
    }
}

// ===== STATS REFRESH =====
function setupStatsRefresh() {
    // Auto-refresh stats every 30 seconds
    setInterval(refreshStats, 30000);
    
    // Manual refresh on click
    const statsCards = document.querySelectorAll('.stat-card');
    statsCards.forEach(card => {
        card.addEventListener('click', refreshStats);
    });
}

// ===== FILTERING FUNCTIONALITY =====
function applyFilters() {
    const searchTerm = getSearchTerm();
    const statusFilter = getStatusFilter();
    const riskFilter = getRiskFilter();
    
    const reportCards = document.querySelectorAll('.report-card');
    let visibleCount = 0;
    
    reportCards.forEach(card => {
        const isVisible = shouldShowReport(card, searchTerm, statusFilter, riskFilter);
        
        if (isVisible) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    updateEmptyState(visibleCount);
    updateFilterStats(visibleCount, reportCards.length);
}

function shouldShowReport(card, searchTerm, statusFilter, riskFilter) {
    const title = card.querySelector('.report-title')?.textContent.toLowerCase() || '';
    const riskBadge = card.querySelector('.risk-badge')?.textContent.toLowerCase() || '';
    const status = card.dataset.status || '';
    
    const matchesSearch = !searchTerm || title.includes(searchTerm);
    const matchesStatus = !statusFilter || status === statusFilter;
    const matchesRisk = !riskFilter || riskBadge.includes(riskFilter);
    
    return matchesSearch && matchesStatus && matchesRisk;
}

function getSearchTerm() {
    const searchInput = document.getElementById('search-input');
    return searchInput ? searchInput.value.toLowerCase().trim() : '';
}

function getStatusFilter() {
    const statusFilter = document.getElementById('status-filter');
    return statusFilter ? statusFilter.value : '';
}

function getRiskFilter() {
    const riskFilter = document.getElementById('risk-filter');
    return riskFilter ? riskFilter.value : '';
}

function updateEmptyState(visibleCount) {
    const emptyState = document.getElementById('empty-state');
    const reportsGrid = document.getElementById('reports-grid');
    
    if (visibleCount === 0) {
        if (emptyState) {
            emptyState.classList.remove('hidden');
            updateEmptyStateMessage();
        }
        if (reportsGrid) {
            reportsGrid.style.display = 'none';
        }
    } else {
        if (emptyState) {
            emptyState.classList.add('hidden');
        }
        if (reportsGrid) {
            reportsGrid.style.display = 'grid';
        }
    }
}

function updateEmptyStateMessage() {
    const emptyState = document.getElementById('empty-state');
    const emptyTitle = emptyState?.querySelector('.empty-title');
    const emptyDescription = emptyState?.querySelector('.empty-description');
    
    const hasFilters = getSearchTerm() || getStatusFilter() || getRiskFilter();
    
    if (hasFilters && emptyTitle && emptyDescription) {
        emptyTitle.textContent = 'Không tìm thấy báo cáo';
        emptyDescription.textContent = 'Không có báo cáo nào phù hợp với bộ lọc hiện tại. Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm khác.';
    }
}

function updateFilterStats(visibleCount, totalCount) {
    // Update filter results indicator
    let indicator = document.getElementById('filter-indicator');
    
    if (visibleCount < totalCount) {
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'filter-indicator';
            indicator.className = 'filter-indicator';
            
            const filtersContainer = document.querySelector('.filters');
            if (filtersContainer) {
                filtersContainer.appendChild(indicator);
            }
        }
        
        indicator.textContent = `Hiển thị ${visibleCount} / ${totalCount} báo cáo`;
        indicator.style.display = 'block';
    } else if (indicator) {
        indicator.style.display = 'none';
    }
}

// ===== REPORT ACTIONS =====
function viewReport(reportId) {
    if (reportId) {
        window.location.href = `/report/${reportId}`;
    } else {
        // Demo mode - redirect to sample report
        window.location.href = '/report/sample';
    }
}

function downloadReport(reportId) {
    if (!reportId) {
        showMessage('error', 'Không thể tải báo cáo. Vui lòng thử lại.');
        return;
    }
    
    // Show loading
    showLoading('Đang chuẩn bị file tải xuống...');
    
    fetch(`/api/reports/${reportId}/download`, {
        method: 'GET'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Download failed');
        }
        return response.blob();
    })
    .then(blob => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bao-cao-${reportId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showMessage('success', 'Tải báo cáo thành công!');
    })
    .catch(error => {
        console.error('Download error:', error);
        showMessage('error', 'Lỗi khi tải báo cáo. Vui lòng thử lại.');
    })
    .finally(() => {
        hideLoading();
    });
}

function openChat(reportId) {
    if (reportId) {
        window.location.href = `/report/${reportId}#chat`;
    } else {
        window.location.href = '/report/sample#chat';
    }
}

// ===== DATA LOADING =====
function loadReports() {
    // In a real application, this would fetch from API
    // For demo, we'll just add some sample data attributes
    const reportCards = document.querySelectorAll('.report-card');
    
    reportCards.forEach((card, index) => {
        card.dataset.reportId = `report_${index + 1}`;
        card.dataset.status = 'completed';
    });
}

function refreshStats() {
    const statCards = document.querySelectorAll('.stat-card');
    
    statCards.forEach(card => {
        card.style.opacity = '0.7';
    });
    
    // Simulate API call
    setTimeout(() => {
        statCards.forEach(card => {
            card.style.opacity = '1';
            
            // Add a subtle animation to show refresh
            card.style.transform = 'scale(1.02)';
            setTimeout(() => {
                card.style.transform = 'scale(1)';
            }, 200);
        });
        
        showMessage('success', 'Thống kê đã được cập nhật!');
    }, 1000);
}

// ===== UTILITY FUNCTIONS =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showMessage(type, message) {
    if (window.LegalAI && window.LegalAI.showFlashMessage) {
        window.LegalAI.showFlashMessage(type, message);
    }
}

function showLoading(message) {
    if (window.LegalAI && window.LegalAI.showLoading) {
        window.LegalAI.showLoading(message);
    }
}

function hideLoading() {
    if (window.LegalAI && window.LegalAI.hideLoading) {
        window.LegalAI.hideLoading();
    }
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
    
    // Escape to clear search
    if (e.key === 'Escape') {
        const searchInput = document.getElementById('search-input');
        if (searchInput && searchInput === document.activeElement) {
            searchInput.value = '';
            applyFilters();
            searchInput.blur();
        }
    }
});

// ===== EXPORT FUNCTIONALITY =====
function exportReports() {
    const visibleReports = Array.from(document.querySelectorAll('.report-card'))
        .filter(card => card.style.display !== 'none');
    
    if (visibleReports.length === 0) {
        showMessage('warning', 'Không có báo cáo nào để xuất.');
        return;
    }
    
    showLoading('Đang chuẩn bị file xuất...');
    
    // Simulate export process
    setTimeout(() => {
        hideLoading();
        showMessage('success', `Đã xuất ${visibleReports.length} báo cáo thành công!`);
    }, 2000);
}

// ===== GLOBAL DASHBOARD FUNCTIONS =====
window.DashboardManager = {
    applyFilters,
    refreshStats,
    exportReports,
    viewReport,
    downloadReport,
    openChat
};

// Add CSS for filter indicator
const style = document.createElement('style');
style.textContent = `
    .filter-indicator {
        background: var(--accent-100);
        color: var(--accent-600);
        padding: var(--space-xs) var(--space-sm);
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        font-weight: 500;
        display: none;
    }
`;
document.head.appendChild(style);
