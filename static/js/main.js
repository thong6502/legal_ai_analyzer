// ===== MAIN JAVASCRIPT FOR LEGAL AI ANALYZER =====

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeNavigation();
    initializeFlashMessages();
    initializeLoadingOverlay();
    
    // Page-specific initializations
    if (document.getElementById('upload-form')) {
        initializeUploadForm();
    }
    
    if (document.getElementById('reports-grid')) {
        initializeDashboard();
    }
});

// ===== NAVIGATION =====
function initializeNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
        
        // Close menu when clicking on nav links (mobile)
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// ===== FLASH MESSAGES =====
function initializeFlashMessages() {
    const flashMessages = document.querySelectorAll('.flash-message');
    
    flashMessages.forEach(message => {
        // Auto-hide after 5 seconds
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => {
                message.remove();
            }, 300);
        }, 5000);
    });
}

// ===== LOADING OVERLAY =====
function initializeLoadingOverlay() {
    window.showLoading = function(text = 'Đang xử lý...') {
        const overlay = document.getElementById('loading-overlay');
        const loadingText = overlay.querySelector('.loading-text');
        
        if (loadingText) {
            loadingText.textContent = text;
        }
        
        overlay.classList.add('active');
    };
    
    window.hideLoading = function() {
        const overlay = document.getElementById('loading-overlay');
        overlay.classList.remove('active');
    };
}

// ===== UPLOAD FORM =====
function initializeUploadForm() {
    const uploadForm = document.getElementById('upload-form');
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const progressSection = document.getElementById('progress-section');
    
    // Drag and drop functionality
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleFileUpload(files[0]);
        }
    });
    
    // File input change
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
    
    // Click to select file
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });
}

// ===== FILE UPLOAD HANDLER =====
function handleFileUpload(file) {
    // Validate file
    if (!validateFile(file)) {
        return;
    }
    
    // Show progress section
    const progressSection = document.getElementById('progress-section');
    progressSection.style.display = 'block';
    
    // Start upload process
    uploadFile(file);
}

function validateFile(file) {
    const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'image/jpeg',
        'image/jpg',
        'image/png'
    ];
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(file.type)) {
        showFlashMessage('error', 'Định dạng file không được hỗ trợ. Vui lòng chọn file PDF, DOCX hoặc hình ảnh.');
        return false;
    }
    
    if (file.size > maxSize) {
        showFlashMessage('error', 'File quá lớn. Vui lòng chọn file nhỏ hơn 10MB.');
        return false;
    }
    
    return true;
}

function uploadFile(file) {
    const formData = new FormData();
    formData.append('document', file);
    
    // Update progress
    updateProgress(0, 'upload');
    
    fetch('/upload/document', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        return response.json();
    })
    .then(data => {
        updateProgress(25, 'extract');
        
        // Start analysis
        return analyzeDocument(data.document_id);
    })
    .catch(error => {
        console.error('Upload error:', error);
        showFlashMessage('error', 'Lỗi khi tải file. Vui lòng thử lại.');
        resetUploadForm();
    });
}

function analyzeDocument(documentId) {
    updateProgress(50, 'analyze');
    
    return fetch('/api/analysis', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            document_id: documentId
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Analysis failed');
        }
        return response.json();
    })
    .then(data => {
        updateProgress(75, 'report');
        
        // Generate report
        return generateReport(data.analysis_id);
    })
    .catch(error => {
        console.error('Analysis error:', error);
        showFlashMessage('error', 'Lỗi khi phân tích tài liệu. Vui lòng thử lại.');
        resetUploadForm();
    });
}

function generateReport(analysisId) {
    updateProgress(90, 'report');
    
    setTimeout(() => {
        updateProgress(100, 'complete');
        
        // Redirect to report page
        setTimeout(() => {
            window.location.href = `/report/${analysisId}`;
        }, 1000);
    }, 1000);
}

function updateProgress(percentage, step) {
    const progressFill = document.getElementById('progress-fill');
    const progressPercentage = document.getElementById('progress-percentage');
    const steps = ['upload', 'extract', 'analyze', 'report'];
    
    // Update progress bar
    if (progressFill) {
        progressFill.style.width = percentage + '%';
    }
    
    if (progressPercentage) {
        progressPercentage.textContent = percentage + '%';
    }
    
    // Update step indicators
    steps.forEach((stepName, index) => {
        const stepElement = document.getElementById(`step-${stepName}`);
        if (stepElement) {
            stepElement.classList.remove('active', 'completed');
            
            if (stepName === step) {
                stepElement.classList.add('active');
            } else if (steps.indexOf(stepName) < steps.indexOf(step)) {
                stepElement.classList.add('completed');
            }
        }
    });
}

function resetUploadForm() {
    const progressSection = document.getElementById('progress-section');
    const fileInput = document.getElementById('file-input');
    
    if (progressSection) {
        progressSection.style.display = 'none';
    }
    
    if (fileInput) {
        fileInput.value = '';
    }
    
    updateProgress(0, 'upload');
}

// ===== DASHBOARD =====
function initializeDashboard() {
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    const riskFilter = document.getElementById('risk-filter');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterReports, 300));
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterReports);
    }
    
    if (riskFilter) {
        riskFilter.addEventListener('change', filterReports);
    }
}

function filterReports() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('status-filter')?.value || '';
    const riskFilter = document.getElementById('risk-filter')?.value || '';
    
    const reportCards = document.querySelectorAll('.report-card');
    let visibleCount = 0;
    
    reportCards.forEach(card => {
        const title = card.querySelector('.report-title')?.textContent.toLowerCase() || '';
        const riskBadge = card.querySelector('.risk-badge')?.textContent.toLowerCase() || '';
        
        const matchesSearch = title.includes(searchTerm);
        const matchesRisk = !riskFilter || riskBadge.includes(riskFilter);
        
        if (matchesSearch && matchesRisk) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show/hide empty state
    const emptyState = document.getElementById('empty-state');
    const reportsGrid = document.getElementById('reports-grid');
    
    if (visibleCount === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        if (reportsGrid) reportsGrid.style.display = 'none';
    } else {
        if (emptyState) emptyState.classList.add('hidden');
        if (reportsGrid) reportsGrid.style.display = 'grid';
    }
}

// ===== UTILITY FUNCTIONS =====
function showFlashMessage(type, message) {
    const flashContainer = document.querySelector('.flash-messages') || createFlashContainer();
    
    const flashMessage = document.createElement('div');
    flashMessage.className = `flash-message flash-${type}`;
    flashMessage.innerHTML = `
        <i class="fas fa-${getFlashIcon(type)}"></i>
        <span>${message}</span>
        <button class="flash-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    flashContainer.appendChild(flashMessage);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        flashMessage.style.opacity = '0';
        setTimeout(() => {
            flashMessage.remove();
        }, 300);
    }, 5000);
}

function createFlashContainer() {
    const container = document.createElement('div');
    container.className = 'flash-messages';
    document.body.appendChild(container);
    return container;
}

function getFlashIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-triangle',
        'info': 'info-circle',
        'warning': 'exclamation-triangle'
    };
    return icons[type] || 'info-circle';
}

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

// ===== GLOBAL UTILITIES =====
window.LegalAI = {
    showLoading,
    hideLoading,
    showFlashMessage,
    debounce
};
