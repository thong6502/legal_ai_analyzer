// ===== UPLOAD FUNCTIONALITY FOR LEGAL AI ANALYZER =====

document.addEventListener('DOMContentLoaded', function() {
    initializeUploadPage();
});

function initializeUploadPage() {
    const uploadForm = document.getElementById('upload-form');
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    
    if (!uploadForm || !uploadArea || !fileInput) {
        return;
    }
    
    setupDragAndDrop();
    setupFileSelection();
    setupFormSubmission();
}

// ===== DRAG AND DROP SETUP =====
function setupDragAndDrop() {
    const uploadArea = document.getElementById('upload-area');
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
    uploadArea.addEventListener('drop', handleDrop, false);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    const uploadArea = document.getElementById('upload-area');
    uploadArea.classList.add('dragover');
}

function unhighlight(e) {
    const uploadArea = document.getElementById('upload-area');
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        const fileInput = document.getElementById('file-input');
        fileInput.files = files;
        handleFileSelection(files[0]);
    }
}

// ===== FILE SELECTION SETUP =====
function setupFileSelection() {
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    
    // File input change event
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    });
    
    // Click to select file
    uploadArea.addEventListener('click', function(e) {
        // Don't trigger if clicking on the button itself
        if (!e.target.closest('.btn')) {
            fileInput.click();
        }
    });
    
    // Button click
    const selectButton = uploadArea.querySelector('.btn');
    if (selectButton) {
        selectButton.addEventListener('click', function(e) {
            e.stopPropagation();
            fileInput.click();
        });
    }
}

// ===== FORM SUBMISSION SETUP =====
function setupFormSubmission() {
    const uploadForm = document.getElementById('upload-form');
    
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const fileInput = document.getElementById('file-input');
        if (fileInput.files.length > 0) {
            handleFileSelection(fileInput.files[0]);
        } else {
            showError('Vui lòng chọn file để tải lên.');
        }
    });
}

// ===== FILE HANDLING =====
function handleFileSelection(file) {
    if (!validateFile(file)) {
        return;
    }
    
    updateUploadUI(file);
    startUploadProcess(file);
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
        showError('Định dạng file không được hỗ trợ. Vui lòng chọn file PDF, DOCX hoặc hình ảnh (JPG, PNG).');
        return false;
    }
    
    if (file.size > maxSize) {
        showError('File quá lớn. Vui lòng chọn file nhỏ hơn 10MB.');
        return false;
    }
    
    return true;
}

function updateUploadUI(file) {
    const uploadArea = document.getElementById('upload-area');
    const uploadIcon = uploadArea.querySelector('.upload-icon');
    const uploadTitle = uploadArea.querySelector('.upload-title');
    const uploadDescription = uploadArea.querySelector('.upload-description');
    
    // Update UI to show selected file
    if (uploadIcon) {
        uploadIcon.className = 'fas fa-file-alt upload-icon';
    }
    
    if (uploadTitle) {
        uploadTitle.textContent = file.name;
    }
    
    if (uploadDescription) {
        uploadDescription.textContent = `${formatFileSize(file.size)} • ${getFileTypeDisplay(file.type)}`;
    }
    
    // Show progress section
    const progressSection = document.getElementById('progress-section');
    if (progressSection) {
        progressSection.style.display = 'block';
    }
}

// ===== UPLOAD PROCESS =====
function startUploadProcess(file) {
    updateProgress(0, 'upload', 'Đang tải lên file...');
    
    const formData = new FormData();
    formData.append('document', file);
    
    // Simulate upload progress
    simulateProgress(0, 25, 2000, () => {
        uploadToServer(formData);
    });
}

function uploadToServer(formData) {
    fetch('/upload/document', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        updateProgress(25, 'extract', 'Đang trích xuất nội dung...');
        return processDocument(data.document_id);
    })
    .catch(error => {
        console.error('Upload error:', error);
        showError('Lỗi khi tải file lên server. Vui lòng thử lại.');
        resetUploadForm();
    });
}

function processDocument(documentId) {
    // Simulate document processing
    simulateProgress(25, 50, 3000, () => {
        updateProgress(50, 'analyze', 'Đang phân tích với AI...');
        analyzeDocument(documentId);
    });
}

function analyzeDocument(documentId) {
    fetch('/api/analysis', {
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
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        updateProgress(75, 'report', 'Đang tạo báo cáo...');
        return generateReport(data.analysis_id);
    })
    .catch(error => {
        console.error('Analysis error:', error);
        showError('Lỗi khi phân tích tài liệu. Vui lòng thử lại.');
        resetUploadForm();
    });
}

function generateReport(analysisId) {
    // Simulate report generation
    simulateProgress(75, 100, 2000, () => {
        updateProgress(100, 'complete', 'Hoàn thành!');
        
        // Show success message
        showSuccess('Phân tích hoàn tất! Đang chuyển đến báo cáo...');
        
        // Redirect to report page after a short delay
        setTimeout(() => {
            window.location.href = `/report/${analysisId}`;
        }, 1500);
    });
}

// ===== PROGRESS MANAGEMENT =====
function updateProgress(percentage, step, message) {
    const progressFill = document.getElementById('progress-fill');
    const progressPercentage = document.getElementById('progress-percentage');
    const progressTitle = document.querySelector('.progress-title');
    const steps = ['upload', 'extract', 'analyze', 'report'];
    
    // Update progress bar
    if (progressFill) {
        progressFill.style.width = percentage + '%';
    }
    
    if (progressPercentage) {
        progressPercentage.textContent = percentage + '%';
    }
    
    if (progressTitle && message) {
        progressTitle.textContent = message;
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

function simulateProgress(startPercent, endPercent, duration, callback) {
    const startTime = Date.now();
    const progressDiff = endPercent - startPercent;
    
    function updateProgressAnimation() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentPercent = startPercent + (progressDiff * progress);
        
        const progressFill = document.getElementById('progress-fill');
        const progressPercentage = document.getElementById('progress-percentage');
        
        if (progressFill) {
            progressFill.style.width = currentPercent + '%';
        }
        
        if (progressPercentage) {
            progressPercentage.textContent = Math.round(currentPercent) + '%';
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateProgressAnimation);
        } else if (callback) {
            callback();
        }
    }
    
    requestAnimationFrame(updateProgressAnimation);
}

function resetUploadForm() {
    const progressSection = document.getElementById('progress-section');
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    
    // Hide progress section
    if (progressSection) {
        progressSection.style.display = 'none';
    }
    
    // Clear file input
    if (fileInput) {
        fileInput.value = '';
    }
    
    // Reset upload area UI
    if (uploadArea) {
        const uploadIcon = uploadArea.querySelector('.upload-icon');
        const uploadTitle = uploadArea.querySelector('.upload-title');
        const uploadDescription = uploadArea.querySelector('.upload-description');
        
        if (uploadIcon) {
            uploadIcon.className = 'fas fa-cloud-upload-alt upload-icon';
        }
        
        if (uploadTitle) {
            uploadTitle.textContent = 'Kéo thả file vào đây';
        }
        
        if (uploadDescription) {
            uploadDescription.textContent = 'hoặc click để chọn file từ máy tính của bạn';
        }
    }
    
    // Reset progress
    updateProgress(0, 'upload', 'Đang xử lý tài liệu...');
}

// ===== UTILITY FUNCTIONS =====
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileTypeDisplay(mimeType) {
    const typeMap = {
        'application/pdf': 'PDF',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
        'application/msword': 'DOC',
        'image/jpeg': 'JPEG',
        'image/jpg': 'JPG',
        'image/png': 'PNG'
    };
    
    return typeMap[mimeType] || 'Unknown';
}

function showError(message) {
    if (window.LegalAI && window.LegalAI.showFlashMessage) {
        window.LegalAI.showFlashMessage('error', message);
    } else {
        alert(message);
    }
}

function showSuccess(message) {
    if (window.LegalAI && window.LegalAI.showFlashMessage) {
        window.LegalAI.showFlashMessage('success', message);
    } else {
        alert(message);
    }
}

// ===== DEMO MODE =====
// For development/demo purposes, simulate API responses
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Override API calls with mock responses
    window.uploadToServer = function(formData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    document_id: 'demo_doc_' + Date.now()
                });
                updateProgress(25, 'extract', 'Đang trích xuất nội dung...');
                processDocument('demo_doc_' + Date.now());
            }, 2000);
        });
    };
    
    window.analyzeDocument = function(documentId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    analysis_id: 'demo_analysis_' + Date.now()
                });
                updateProgress(75, 'report', 'Đang tạo báo cáo...');
                generateReport('demo_analysis_' + Date.now());
            }, 3000);
        });
    };
}
