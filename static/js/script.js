// Update file name display when a file is selected
function updateFileName(input, elementId) {
    const fileName = input.files[0] ? input.files[0].name : 'No file selected';
    document.getElementById(elementId).textContent = fileName;
}

// Create a chart with the provided data
function createChart(canvasId, data) {
    // Get the canvas element
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Check if we have valid data
    if (!data || !data.labels || !data.values || data.labels.length === 0) {
        // Display a message if no data is available
        const wrapper = canvas.parentElement;
        wrapper.innerHTML = '<div class="chart-placeholder">No data available for visualization</div>';
        return;
    }
    
    // Create the horizontal bar chart
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Frequency',
                data: data.values,
                backgroundColor: 'rgba(67, 97, 238, 0.7)',
                borderColor: 'rgba(67, 97, 238, 1)',
                borderWidth: 1,
                borderRadius: 4,
                maxBarThickness: 20 // Reduced from 25
            }]
        },
        options: {
            indexAxis: 'y', // This makes the bars horizontal
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: data.title || 'Word Frequency',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 6,
                    callbacks: {
                        label: function(context) {
                            return `Count: ${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Frequency',
                        font: {
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        precision: 0,
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    // Reduce the width of the x-axis area
                    weight: 1, // Lower weight gives less space to this axis
                    // Limit the maximum width of the x-axis
                    max: function(context) {
                        // Get the maximum value and add a small buffer
                        const max = Math.max(...context.chart.data.datasets[0].data);
                        return Math.ceil(max * 1.1); // 10% buffer
                    }
                },
                y: {
                    title: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12
                        },
                        // Ensure labels are not truncated
                        callback: function(value) {
                            const label = this.getLabelForValue(value);
                            return label; // Return the full label
                        },
                        // Ensure all labels are displayed
                        autoSkip: false,
                        maxRotation: 0,
                        minRotation: 0,
                        // Add padding to the labels
                        padding: 10
                    },
                    // Add more space for y-axis labels
                    afterFit: function(scaleInstance) {
                        // Significantly increase the width of the y-axis
                        scaleInstance.width = 300; // Increased from 250
                    },
                    // Give more weight to the y-axis
                    weight: 8, // Higher weight gives more space to this axis
                    // Reduce the padding inside the chart area
                    afterDataLimits(scale) {
                        scale.max += 0.5; // Add a little space at the top
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            layout: {
                padding: {
                    left: 10, // Reduced from 20
                    right: 20,
                    top: 0,
                    bottom: 10
                }
            }
        }
    });
}

// Load chart data from the API
function loadChartData(fileType, filename, canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    // Create a loading indicator
    const wrapper = canvas.parentElement;
    wrapper.innerHTML = `
        <div class="chart-loading">
            <div class="chart-loading-spinner"></div>
            <div>Loading data...</div>
        </div>
    `;
    
    // Fetch the data from the API
    fetch(`/api/frequency/${fileType}/${filename}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Restore the canvas
            wrapper.innerHTML = `<canvas id="${canvasId}"></canvas>`;
            // Create the chart with the data
            createChart(canvasId, data);
        })
        .catch(error => {
            console.error(`Error loading ${fileType} file data:`, error);
            wrapper.innerHTML = `
                <div class="chart-placeholder">
                    Error loading chart data
                </div>
                <div class="chart-error">
                    ${error.message || 'Failed to load frequency data'}
                </div>
            `;
        });
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
            
            const interval = setInterval(() => {
                // Increment progress
                if (progress < 95) {
                    // Faster at the beginning, slower towards the end
                    const increment = progress < 30 ? 5 : (progress < 60 ? 3 : 1);
                    progress += increment;
                    
                    // Update progress bar
                    progressFill.style.width = `${progress}%`;
                    progressPercentage.textContent = `${progress}%`;
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
            
            const interval = setInterval(() => {
                // Increment progress
                if (progress < 95) {
                    // Faster at the beginning, slower towards the end
                    const increment = progress < 30 ? 5 : (progress < 60 ? 3 : 1);
                    progress += increment;
                    
                    // Update progress bar
                    progressFill.style.width = `${progress}%`;
                    progressPercentage.textContent = `${progress}%`;
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
    
    // Initialize charts if they exist on the page
    const resolvedChart = document.getElementById('resolved-chart');
    const unresolvedChart = document.getElementById('unresolved-chart');
    
    // Get filenames from data attributes if they exist
    if (resolvedChart && unresolvedChart) {
        const resolvedFilename = resolvedChart.getAttribute('data-filename');
        const unresolvedFilename = unresolvedChart.getAttribute('data-filename');
        
        if (resolvedFilename) {
            loadChartData('resolved', resolvedFilename, 'resolved-chart');
        }
        
        if (unresolvedFilename) {
            loadChartData('unresolved', unresolvedFilename, 'unresolved-chart');
        }
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