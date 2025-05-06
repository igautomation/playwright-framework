/**
 * Dashboard JavaScript
 */

// Initialize Socket.IO connection
const socket = io();

// Socket.IO event listeners
socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

// Error handling function
function handleError(error, container) {
  console.error(error);
  if (container) {
    container.innerHTML = `
      <div class="alert alert-danger">
        <i class="bi bi-exclamation-triangle me-2"></i> ${error.message || 'An error occurred'}
      </div>
    `;
  }
}

// Format number with commas
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

// Show loading spinner
function showLoading(container, message = 'Loading...') {
  container.innerHTML = `
    <div class="text-center p-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading</span>
      </div>
      <p class="mt-2">${message}</p>
    </div>
  `;
}

// Create toast notification
function showToast(message, type = 'success') {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toastId = `toast-${Date.now()}`;
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-white bg-${type} border-0`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  toast.setAttribute('id', toastId);
  
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;
  
  toastContainer.appendChild(toast);
  
  // Initialize and show toast
  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();
  
  // Remove toast after it's hidden
  toast.addEventListener('hidden.bs.toast', () => {
    toast.remove();
  });
}

// Upload file function
function uploadFile(file, onProgress, onComplete, onError) {
  const formData = new FormData();
  formData.append('dataFile', file);
  
  const xhr = new XMLHttpRequest();
  
  xhr.upload.addEventListener('progress', (event) => {
    if (event.lengthComputable && onProgress) {
      const percentComplete = Math.round((event.loaded / event.total) * 100);
      onProgress(percentComplete);
    }
  });
  
  xhr.addEventListener('load', () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const response = JSON.parse(xhr.responseText);
        if (onComplete) onComplete(response);
      } catch (error) {
        if (onError) onError(new Error('Invalid response format'));
      }
    } else {
      if (onError) onError(new Error(`Upload failed: ${xhr.statusText}`));
    }
  });
  
  xhr.addEventListener('error', () => {
    if (onError) onError(new Error('Upload failed'));
  });
  
  xhr.open('POST', '/api/upload');
  xhr.send(formData);
}

// Generate chart function
async function generateChart(type, data, options) {
  try {
    const response = await fetch('/api/visualize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type, data, options })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate chart');
    }
    
    const result = await response.json();
    return result.chart;
  } catch (error) {
    console.error('Error generating chart:', error);
    throw error;
  }
}

// Generate report function
async function generateReport(charts, title) {
  try {
    const response = await fetch('/api/generate-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ charts, title })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate report');
    }
    
    const result = await response.json();
    return result.report;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
}

// Document ready function
document.addEventListener('DOMContentLoaded', () => {
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  
  // Initialize popovers
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });
});