// Update file name display when a file is selected
function updateFileName(input, elementId) {
    const fileName = input.files[0] ? input.files[0].name : 'No file selected';
    document.getElementById(elementId).textContent = fileName;
}

// Initialize progress bars and form submission handlers when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Progress bar simulation for CSV processing
    const csvForm = document.getElementById('csv-form');
    if (csvForm) {
        csvForm.addEventListener('submit', function(e) {
            const button = document.getElementById('csv-submit-btn');
            const progressContainer = document.getElementById('csv-progress-container');
            const progressFill = document.getElementById('csv-progress-fill');
            const progressPercentage = document.getElementById('csv-progress-percentage');
            const progressMessage = document.getElementById('csv-progress-message');
            
            // Only show progress if a file is selected
            if (document.getElementById('csv-file').files.length === 0) {
                return;
            }
            
            // Disable button and show progress
            button.innerHTML = 'Processing...';
            button.disabled = true;
            progressContainer.style.display = 'block';
            
            // Simulate progress
            let progress = 0;
            const messages = [
                'Reading CSV file...',
                'Analyzing data structure...',
                'Adding "Processed" column...',
                'Formatting output...',
                'Saving processed file...'
            ];
            
            const interval = setInterval(() => {
                // Increment progress
                if (progress < 95) {
                    // Faster at the beginning, slower towards the end
                    const increment = progress < 30 ? 5 : (progress < 60 ? 3 : 1);
                    progress += increment;
                    
                    // Update progress bar
                    progressFill.style.width = `${progress}%`;
                    progressPercentage.textContent = `${progress}%`;
                    
                    // Update message based on progress
                    const messageIndex = Math.floor(progress / 20);
                    if (messageIndex < messages.length) {
                        progressMessage.textContent = messages[messageIndex];
                    }
                } else {
                    // Stop the interval when we reach 95%
                    // The remaining 5% will be completed when the server responds
                    clearInterval(interval);
                }
            }, 200);
            
            // Store the interval ID in a data attribute so we can clear it if needed
            this.dataset.progressInterval = interval;
        });
    }
    
    // Progress bar simulation for file splitting
    const splitForm = document.getElementById('split-form');
    if (splitForm) {
        splitForm.addEventListener('submit', function(e) {
            const button = document.getElementById('split-submit-btn');
            const progressContainer = document.getElementById('split-progress-container');
            const progressFill = document.getElementById('split-progress-fill');
            const progressPercentage = document.getElementById('split-progress-percentage');
            const progressMessage = document.getElementById('split-progress-message');
            
            // Only show progress if a file is selected
            if (document.getElementById('split-file').files.length === 0) {
                return;
            }
            
            // Disable button and show progress
            button.innerHTML = 'Processing...';
            button.disabled = true;
            progressContainer.style.display = 'block';
            
            // Simulate progress
            let progress = 0;
            const messages = [
                'Reading file contents...',
                'Analyzing file structure...',
                'Splitting content...',
                'Creating resolved file...',
                'Creating unresolved file...'
            ];
            
            const interval = setInterval(() => {
                // Increment progress
                if (progress < 95) {
                    // Faster at the beginning, slower towards the end
                    const increment = progress < 30 ? 5 : (progress < 60 ? 3 : 1);
                    progress += increment;
                    
                    // Update progress bar
                    progressFill.style.width = `${progress}%`;
                    progressPercentage.textContent = `${progress}%`;
                    
                    // Update message based on progress
                    const messageIndex = Math.floor(progress / 20);
                    if (messageIndex < messages.length) {
                        progressMessage.textContent = messages[messageIndex];
                    }
                } else {
                    // Stop the interval when we reach 95%
                    // The remaining 5% will be completed when the server responds
                    clearInterval(interval);
                }
            }, 200);
            
            // Store the interval ID in a data attribute so we can clear it if needed
            this.dataset.progressInterval = interval;
        });
    }
    
    // Check if results are already present and hide progress bars if needed
    if (document.querySelector('.result-section')) {
        const csvProgressContainer = document.getElementById('csv-progress-container');
        const splitProgressContainer = document.getElementById('split-progress-container');
        
        if (csvProgressContainer) csvProgressContainer.style.display = 'none';
        if (splitProgressContainer) splitProgressContainer.style.display = 'none';
        
        const csvSubmitBtn = document.getElementById('csv-submit-btn');
        const splitSubmitBtn = document.getElementById('split-submit-btn');
        
        if (csvSubmitBtn) {
            csvSubmitBtn.disabled = false;
            csvSubmitBtn.innerHTML = 'Process CSV';
        }
        
        if (splitSubmitBtn) {
            splitSubmitBtn.disabled = false;
            splitSubmitBtn.innerHTML = 'Split File';
        }
    }
});

// Clear progress intervals if the page is unloaded
window.addEventListener('beforeunload', function() {
    const csvForm = document.getElementById('csv-form');
    const splitForm = document.getElementById('split-form');
    
    if (csvForm && csvForm.dataset.progressInterval) {
        clearInterval(parseInt(csvForm.dataset.progressInterval));
    }
    
    if (splitForm && splitForm.dataset.progressInterval) {
        clearInterval(parseInt(splitForm.dataset.progressInterval));
    }
});