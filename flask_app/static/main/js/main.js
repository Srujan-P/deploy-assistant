// Main Application Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Logged-in state elements
    const loginState = document.getElementById('loginState');
    const loggedInState = document.getElementById('loggedInState');
    const actionBtns = [
        document.getElementById('actionBtn1'),
        document.getElementById('actionBtn2'),
        document.getElementById('actionBtn3'),
        document.getElementById('actionBtn4')
    ];
    const logoutBtn = document.getElementById('logoutBtn');

    // Logout button functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            try {
                const response = await fetch('/api/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        window.location.href = data.redirect;
                    }
                } else {
                    console.error('Logout failed');
                }
            } catch (error) {
                console.error('Error during logout:', error);
            }
        });
    }

    // Auto-set current date for time recording form
    const dateInput = document.getElementById('dateInput');
    if (dateInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayString = `${year}-${month}-${day}`;
        dateInput.value = todayString;
    }

    // Google OAuth Login functionality
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', function() {
            // Redirect to Google OAuth endpoint
            window.location.href = '/auth/google';
        });
    }

    // Load user profile information
    async function loadUserProfile() {
        try {
            const response = await fetch('/api/user-info', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const userInfo = await response.json();
                
                // Update username
                const usernameElement = document.getElementById('username');
                if (usernameElement) {
                    usernameElement.textContent = userInfo.name || 'User';
                }
                
                // Update email
                const userEmailElement = document.getElementById('userEmail');
                if (userEmailElement) {
                    userEmailElement.textContent = userInfo.email || 'user@example.com';
                }
                
                // Handle clock in/out access control
                handleClockAccess(userInfo.can_use_clock);
                
                // Handle record time access control
                handleRecordTimeAccess(userInfo.can_record_time);
            } else {
                console.error('Failed to load user profile');
                // Set default values
                const usernameElement = document.getElementById('username');
                const userEmailElement = document.getElementById('userEmail');
                if (usernameElement) usernameElement.textContent = 'User';
                if (userEmailElement) userEmailElement.textContent = 'user@example.com';
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
            // Set default values
            const usernameElement = document.getElementById('username');
            const userEmailElement = document.getElementById('userEmail');
            if (usernameElement) usernameElement.textContent = 'User';
            if (userEmailElement) userEmailElement.textContent = 'user@example.com';
        }
    }
    
    
    function handleClockAccess(canUseClock) {
        const clockBtn = document.getElementById('clockBtn');
        
        if (!canUseClock) {
            // Hide the clock button for restricted users
            if (clockBtn) {
                clockBtn.style.display = 'none';
            }
        } else {
            // Ensure clock button is visible for authorized users
            if (clockBtn) {
                clockBtn.style.display = 'block';
            }
        }
    }
    
    function handleRecordTimeAccess(canRecordTime) {
        const recordTimeBtn = document.getElementById('recordTimeBtn');
        
        if (!canRecordTime) {
            // Hide the record time button for restricted users
            if (recordTimeBtn) {
                recordTimeBtn.style.display = 'none';
            }
        } else {
            // Ensure record time button is visible for authorized users
            if (recordTimeBtn) {
                recordTimeBtn.style.display = 'block';
            }
        }
    }

    // Load user profile when page loads
    loadUserProfile();

    // GCloud init button functionality
    const gcloudBtn = document.getElementById('actionBtn1');
    console.log('GCloud button found:', gcloudBtn);
    if (gcloudBtn) {
        gcloudBtn.addEventListener('click', async function() {
            console.log('GCloud button clicked!');
            try {
                gcloudBtn.disabled = true;
                gcloudBtn.textContent = 'Running...';
                
                // Make GET request to our proxy endpoint
                const response = await fetch('/api/gcloud-init', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    // Handle array response - get first item if it's an array
                    const responseData = Array.isArray(data) ? data[0] : data;
                    
                    // Display output in terminal
                    const terminalOutput = document.getElementById('terminalOutput');
                    if (terminalOutput) {
                        // Hide the blinking cursor
                        const cursor = document.querySelector('.terminal-cursor');
                        if (cursor) {
                            cursor.style.display = 'none';
                        }
                        
                        // Add output content (handle both stderr and output fields)
                        const outputContent = responseData.stderr || responseData.output || 'No output available';
                        
                        // Add output content directly to terminal output without extra spacing
                        terminalOutput.innerHTML = '';
                        
                        // Typewriter effect for output - line by line
                        const lines = outputContent.split('\n');
                        let lineIndex = 0;
                        
                        const typeWriter = setInterval(() => {
                            if (lineIndex < lines.length) {
                                // Create a new line for each output line
                                const outputLine = document.createElement('div');
                                outputLine.className = 'terminal-line';
                                outputLine.textContent = lines[lineIndex];
                                terminalOutput.appendChild(outputLine);
                                lineIndex++;
                                // Scroll to bottom during typing
                                terminalOutput.scrollTop = terminalOutput.scrollHeight;
                            } else {
                                clearInterval(typeWriter);
                                
                                // Add new prompt line at the bottom
                                const bottomPromptLine = document.createElement('div');
                                bottomPromptLine.className = 'terminal-line';
                                bottomPromptLine.innerHTML = `
                                    <span class="terminal-prompt">DeployAssistant@3rdspace:~$</span>
                                    <span class="terminal-cursor">_</span>
                                `;
                                terminalOutput.appendChild(bottomPromptLine);
                                
                                // Show cursor again at the end
                                if (cursor) {
                                    cursor.style.display = 'inline';
                                }
                                
                                // Final scroll to bottom
                                terminalOutput.scrollTop = terminalOutput.scrollHeight;
                            }
                        }, 50); // Adjust speed as needed
                    }
                } else {
                    console.error('GCloud init failed:', response.status);
                    const terminalOutput = document.getElementById('terminalOutput');
                    if (terminalOutput) {
                        terminalOutput.innerHTML += `<div class="terminal-line" style="color: #ff0000;">Error: GCloud init failed with status ${response.status}</div>`;
                        terminalOutput.scrollTop = terminalOutput.scrollHeight;
                    }
                }
            } catch (error) {
                console.error('Error during GCloud init:', error);
                const terminalOutput = document.getElementById('terminalOutput');
                if (terminalOutput) {
                    terminalOutput.innerHTML += `<div class="terminal-line" style="color: #ff0000;">Error: ${error.message}</div>`;
                    terminalOutput.scrollTop = terminalOutput.scrollHeight;
                }
            } finally {
                gcloudBtn.disabled = false;
                gcloudBtn.textContent = 'GCloud Init';
            }
        });
    }

    // Docker Build button functionality
    const dockerBuildBtn = document.getElementById('actionBtn2');
    if (dockerBuildBtn) {
        dockerBuildBtn.addEventListener('click', async function() {
            try {
                dockerBuildBtn.disabled = true;
                dockerBuildBtn.textContent = 'Building...';
                
                const response = await fetch('/api/docker-build', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const responseData = Array.isArray(data) ? data[0] : data;
                    
                    const terminalOutput = document.getElementById('terminalOutput');
                    if (terminalOutput) {
                        const cursor = document.querySelector('.terminal-cursor');
                        if (cursor) {
                            cursor.style.display = 'none';
                        }
                        
                        const outputContent = responseData.stderr || responseData.output || 'No output available';
                        terminalOutput.innerHTML = '';
                        
                        const lines = outputContent.split('\n');
                        let lineIndex = 0;
                        
                        const typeWriter = setInterval(() => {
                            if (lineIndex < lines.length) {
                                const outputLine = document.createElement('div');
                                outputLine.className = 'terminal-line';
                                outputLine.textContent = lines[lineIndex];
                                terminalOutput.appendChild(outputLine);
                                lineIndex++;
                                terminalOutput.scrollTop = terminalOutput.scrollHeight;
                            } else {
                                clearInterval(typeWriter);
                                
                                const bottomPromptLine = document.createElement('div');
                                bottomPromptLine.className = 'terminal-line';
                                bottomPromptLine.innerHTML = `
                                    <span class="terminal-prompt">DeployAssistant@3rdspace:~$</span>
                                    <span class="terminal-cursor">_</span>
                                `;
                                terminalOutput.appendChild(bottomPromptLine);
                                
                                if (cursor) {
                                    cursor.style.display = 'inline';
                                }
                                
                                terminalOutput.scrollTop = terminalOutput.scrollHeight;
                            }
                        }, 50);
                    }
                } else {
                    console.error('Docker build failed:', response.status);
                    const terminalOutput = document.getElementById('terminalOutput');
                    if (terminalOutput) {
                        terminalOutput.innerHTML += `<div class="terminal-line" style="color: #ff0000;">Error: Docker build failed with status ${response.status}</div>`;
                        terminalOutput.scrollTop = terminalOutput.scrollHeight;
                    }
                }
            } catch (error) {
                console.error('Error during Docker build:', error);
                const terminalOutput = document.getElementById('terminalOutput');
                if (terminalOutput) {
                    terminalOutput.innerHTML += `<div class="terminal-line" style="color: #ff0000;">Error: ${error.message}</div>`;
                    terminalOutput.scrollTop = terminalOutput.scrollHeight;
                }
            } finally {
                dockerBuildBtn.disabled = false;
                dockerBuildBtn.textContent = 'Docker Build';
            }
        });
    }

    // Docker Push button functionality
    const dockerPushBtn = document.getElementById('actionBtn3');
    if (dockerPushBtn) {
        dockerPushBtn.addEventListener('click', async function() {
            try {
                dockerPushBtn.disabled = true;
                dockerPushBtn.textContent = 'Pushing...';
                
                const response = await fetch('/api/docker-push', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const responseData = Array.isArray(data) ? data[0] : data;
                    
                    const terminalOutput = document.getElementById('terminalOutput');
                    if (terminalOutput) {
                        const cursor = document.querySelector('.terminal-cursor');
                        if (cursor) {
                            cursor.style.display = 'none';
                        }
                        
                        const outputContent = responseData.stderr || responseData.output || 'No output available';
                        terminalOutput.innerHTML = '';
                        
                        const lines = outputContent.split('\n');
                        let lineIndex = 0;
                        
                        const typeWriter = setInterval(() => {
                            if (lineIndex < lines.length) {
                                const outputLine = document.createElement('div');
                                outputLine.className = 'terminal-line';
                                outputLine.textContent = lines[lineIndex];
                                terminalOutput.appendChild(outputLine);
                                lineIndex++;
                                terminalOutput.scrollTop = terminalOutput.scrollHeight;
                            } else {
                                clearInterval(typeWriter);
                                
                                const bottomPromptLine = document.createElement('div');
                                bottomPromptLine.className = 'terminal-line';
                                bottomPromptLine.innerHTML = `
                                    <span class="terminal-prompt">DeployAssistant@3rdspace:~$</span>
                                    <span class="terminal-cursor">_</span>
                                `;
                                terminalOutput.appendChild(bottomPromptLine);
                                
                                if (cursor) {
                                    cursor.style.display = 'inline';
                                }
                                
                                terminalOutput.scrollTop = terminalOutput.scrollHeight;
                            }
                        }, 50);
                    }
                } else {
                    console.error('Docker push failed:', response.status);
                    const terminalOutput = document.getElementById('terminalOutput');
                    if (terminalOutput) {
                        terminalOutput.innerHTML += `<div class="terminal-line" style="color: #ff0000;">Error: Docker push failed with status ${response.status}</div>`;
                        terminalOutput.scrollTop = terminalOutput.scrollHeight;
                    }
                }
            } catch (error) {
                console.error('Error during Docker push:', error);
                const terminalOutput = document.getElementById('terminalOutput');
                if (terminalOutput) {
                    terminalOutput.innerHTML += `<div class="terminal-line" style="color: #ff0000;">Error: ${error.message}</div>`;
                    terminalOutput.scrollTop = terminalOutput.scrollHeight;
                }
            } finally {
                dockerPushBtn.disabled = false;
                dockerPushBtn.textContent = 'Docker Push';
            }
        });
    }

    // GCloud Deploy button functionality
    const gcloudDeployBtn = document.getElementById('actionBtn4');
    if (gcloudDeployBtn) {
        gcloudDeployBtn.addEventListener('click', async function() {
            try {
                gcloudDeployBtn.disabled = true;
                gcloudDeployBtn.textContent = 'Deploying...';
                
                const response = await fetch('/api/gcloud-deploy', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const responseData = Array.isArray(data) ? data[0] : data;
                    
                    const terminalOutput = document.getElementById('terminalOutput');
                    if (terminalOutput) {
                        const cursor = document.querySelector('.terminal-cursor');
                        if (cursor) {
                            cursor.style.display = 'none';
                        }
                        
                        const outputContent = responseData.stderr || responseData.output || 'No output available';
                        terminalOutput.innerHTML = '';
                        
                        const lines = outputContent.split('\n');
                        let lineIndex = 0;
                        
                        const typeWriter = setInterval(() => {
                            if (lineIndex < lines.length) {
                                const outputLine = document.createElement('div');
                                outputLine.className = 'terminal-line';
                                outputLine.textContent = lines[lineIndex];
                                terminalOutput.appendChild(outputLine);
                                lineIndex++;
                                terminalOutput.scrollTop = terminalOutput.scrollHeight;
                            } else {
                                clearInterval(typeWriter);
                                
                                const bottomPromptLine = document.createElement('div');
                                bottomPromptLine.className = 'terminal-line';
                                bottomPromptLine.innerHTML = `
                                    <span class="terminal-prompt">DeployAssistant@3rdspace:~$</span>
                                    <span class="terminal-cursor">_</span>
                                `;
                                terminalOutput.appendChild(bottomPromptLine);
                                
                                if (cursor) {
                                    cursor.style.display = 'inline';
                                }
                                
                                terminalOutput.scrollTop = terminalOutput.scrollHeight;
                            }
                        }, 50);
                    }
                } else {
                    console.error('GCloud deploy failed:', response.status);
                    const terminalOutput = document.getElementById('terminalOutput');
                    if (terminalOutput) {
                        terminalOutput.innerHTML += `<div class="terminal-line" style="color: #ff0000;">Error: GCloud deploy failed with status ${response.status}</div>`;
                        terminalOutput.scrollTop = terminalOutput.scrollHeight;
                    }
                }
            } catch (error) {
                console.error('Error during GCloud deploy:', error);
                const terminalOutput = document.getElementById('terminalOutput');
                if (terminalOutput) {
                    terminalOutput.innerHTML += `<div class="terminal-line" style="color: #ff0000;">Error: ${error.message}</div>`;
                    terminalOutput.scrollTop = terminalOutput.scrollHeight;
                }
            } finally {
                gcloudDeployBtn.disabled = false;
                gcloudDeployBtn.textContent = 'GCloud Deploy';
            }
        });
    }

    // Time management button functionality
    const timeManagementBtn = document.getElementById('timeManagementBtn');
    if (timeManagementBtn) {
        timeManagementBtn.addEventListener('click', function() {
            window.location.href = '/time?view=management';
        });
    }

    // Record time button functionality
    const recordTimeBtn = document.getElementById('recordTimeBtn');
    if (recordTimeBtn) {
        recordTimeBtn.addEventListener('click', function() {
            window.location.href = '/time?view=record';
        });
    }

    // Clock in/out button functionality
    const clockBtn = document.getElementById('clockBtn');
    if (clockBtn) {
        // Load initial clock status
        loadClockStatus();
        
        clockBtn.addEventListener('click', function() {
            const isClockedIn = clockBtn.textContent === 'Clock Out';
            
            if (isClockedIn) {
                clockOut();
            } else {
                clockIn();
            }
        });
    }

    // Time entry form submission functionality
    const submitTimeBtn = document.getElementById('submitTimeBtn');
    if (submitTimeBtn) {
        submitTimeBtn.addEventListener('click', async function() {
            try {
                // Get form values
                const date = document.getElementById('dateInput').value;
                const hours = document.getElementById('hoursInput').value;
                

                // Validate form
                if (!date || date.trim() === '') {
                    alert('Please select a date');
                    return;
                }
                if (!hours || hours <= 0) {
                    alert('Please enter valid hours worked');
                    return;
                }

                // Disable button and show loading
                submitTimeBtn.disabled = true;
                submitTimeBtn.textContent = 'Submitting...';

                // Make GET request to our proxy endpoint with data in query parameters
                const params = new URLSearchParams({
                    'date': date,
                    'hours': hours
                });
                
                console.log('Submitting time entry:', { date, hours });
                
                const response = await fetch(`/api/submit-time?${params}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('Response status:', response.status);

                if (response.ok) {
                    const data = await response.json();
                    alert('Time entry submitted successfully!');
                    
                    // Clear form
                    document.getElementById('dateInput').value = '';
                    document.getElementById('hoursInput').value = '';
                } else {
                    const errorData = await response.json();
                    console.error('Time entry submission error:', errorData);
                    alert(`Error submitting time entry: ${errorData.error || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Error submitting time entry:', error);
                alert('Error submitting time entry. Please try again.');
            } finally {
                // Re-enable button
                submitTimeBtn.disabled = false;
                submitTimeBtn.textContent = 'Submit Time Entry';
            }
        });
    }

    // Time filter dropdown functionality
    const timeFilterDropdown = document.getElementById('timeFilterDropdown');
    const monthInput = document.getElementById('monthInput');
    const filterBtn = document.getElementById('filterBtn');
    
    if (timeFilterDropdown && monthInput) {
        timeFilterDropdown.addEventListener('change', function() {
            if (this.value === 'pick-month') {
                monthInput.classList.add('show');
            } else {
                monthInput.classList.remove('show');
            }
        });
    }

    // Filter button functionality
    if (filterBtn) {
        filterBtn.addEventListener('click', function() {
            const selectedFilter = timeFilterDropdown.value;
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();
            
            // Get month input value if pick-month is selected
            let monthValue = currentMonth;
            let yearValue = currentYear;
            
            if (selectedFilter === 'pick-month' && monthInput.value) {
                const parts = monthInput.value.split('-');
                const parsedYear = parseInt(parts[0], 10);
                const parsedMonth = parseInt(parts[1], 10);
                if (!isNaN(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12) {
                    monthValue = parsedMonth;
                }
                if (!isNaN(parsedYear)) {
                    yearValue = parsedYear;
                }
            }
            
            // Disable button during request
            filterBtn.disabled = true;
            filterBtn.textContent = 'Loading...';
            
            const webhookUrl = 'https://n8n.fphn8n.online/webhook/ed324838-d471-46d1-8667-660b6fe3164b';
            
            fetch(webhookUrl, {
                method: 'GET',
                headers: {
                    'month': monthValue.toString(),
                    'year': yearValue.toString(),
                    'cur-month': currentMonth.toString()
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    const responseData = data[0];
                    
                    // Map dropdown values to response data keys
                    const keyMapping = {
                        'pick-month': 'pick-month',
                        'current-month': 'cur-month',
                        'past-3-months': 'past-3-moths',
                        'past-year': 'past-year'
                    };
                    
                    const keySuffix = keyMapping[selectedFilter] || 'cur-month';
                    
                    const srujValue = responseData[`sruj-${keySuffix}`] || 0;
                    const jacobValue = responseData[`jacob-${keySuffix}`] || 0;
                    const trevorValue = responseData[`trevor-${keySuffix}`] || 0;
                    
                    // Update the columns with chart data
                    updateColumnChart(1, srujValue, 'Srujan');
                    updateColumnChart(2, jacobValue, 'Jacob');
                    updateColumnChart(3, trevorValue, 'Trevor');
                }
            })
            .catch(error => {
                console.log('Filter request failed:', error);
            })
            .finally(() => {
                // Re-enable button
                filterBtn.disabled = false;
                filterBtn.textContent = 'Filter';
            });
        });
    }

    // Send webhook request when management view loads
    if (window.location.pathname === '/time' && new URLSearchParams(window.location.search).get('view') === 'management') {
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11, so add 1
        const currentYear = now.getFullYear();

        const webhookUrl = 'https://n8n.fphn8n.online/webhook/ed324838-d471-46d1-8667-660b6fe3164b';
        
        fetch(webhookUrl, {
            method: 'GET',
            headers: {
                'month': currentMonth.toString(),
                'year': currentYear.toString(),
                'cur-month': currentMonth.toString()
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const responseData = data[0];
                
                const srujValue = responseData['sruj-cur-month'] || 0;
                const jacobValue = responseData['jacob-cur-month'] || 0;
                const trevorValue = responseData['trevor-cur-month'] || 0;
                
                // Update the columns with chart data
                updateColumnChart(1, srujValue);
                updateColumnChart(2, jacobValue);
                updateColumnChart(3, trevorValue);
            }
        })
        .catch(error => {
            console.log('Webhook request completed (may have failed):', error);
        });
    }
});

// Clock in/out functions
async function loadClockStatus() {
    try {
        const response = await fetch('/api/clock-status', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            updateClockButton(data.status);
        }
    } catch (error) {
        console.error('Error loading clock status:', error);
    }
}

async function clockIn() {
    const clockBtn = document.getElementById('clockBtn');
    if (!clockBtn) return;
    
    try {
        clockBtn.disabled = true;
        clockBtn.textContent = 'Clocking In...';
        
        const response = await fetch('/api/clock-in', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            updateClockButton('in');
            showMessage(data.message, 'success');
        } else {
            showMessage(data.error, 'error');
        }
    } catch (error) {
        console.error('Clock in error:', error);
        showMessage('Clock in failed', 'error');
    } finally {
        clockBtn.disabled = false;
    }
}

async function clockOut() {
    const clockBtn = document.getElementById('clockBtn');
    if (!clockBtn) return;
    
    try {
        clockBtn.disabled = true;
        clockBtn.textContent = 'Clocking Out...';
        
        const response = await fetch('/api/clock-out', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            updateClockButton('out');
            showMessage(data.message, 'success');
            
            // Automatically submit time entry to n8n server
            await submitTimeEntry(data.clock_in_date, data.hours_worked);
        } else {
            showMessage(data.error, 'error');
        }
    } catch (error) {
        console.error('Clock out error:', error);
        showMessage('Clock out failed', 'error');
    } finally {
        clockBtn.disabled = false;
    }
}

function updateClockButton(status) {
    const clockBtn = document.getElementById('clockBtn');
    if (!clockBtn) return;
    
    if (status === 'in') {
        clockBtn.textContent = 'Clock Out';
        clockBtn.className = 'action-btn clock-btn clocked-in';
    } else {
        clockBtn.textContent = 'Clock In';
        clockBtn.className = 'action-btn clock-btn clocked-out';
    }
}

function showMessage(message, type) {
    // Create a temporary message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `clock-message ${type}`;
    
    // Format message to look like terminal output
    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = `[${timestamp}] ${message}`;
    messageDiv.textContent = formattedMessage;
    
    // Add to terminal output
    const terminalOutput = document.getElementById('terminalOutput');
    if (terminalOutput) {
        terminalOutput.appendChild(messageDiv);
        
        // Auto-remove after 8 seconds (longer for terminal style)
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 8000);
    }
}

async function submitTimeEntry(date, hours) {
    try {
        // Make GET request to submit-time endpoint with date and hours
        const params = new URLSearchParams({
            'date': date,
            'hours': hours.toString()
        });
        
        const response = await fetch(`/api/submit-time?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            showMessage(`Time entry submitted to n8n: ${hours} hours on ${date}`, 'success');
        } else {
            const errorData = await response.json();
            showMessage(`n8n submission failed: ${errorData.error}`, 'error');
        }
    } catch (error) {
        console.error('Time entry submission error:', error);
        showMessage('Failed to submit time entry to server', 'error');
    }
}

// Function to update column with chart data
function updateColumnChart(columnNumber, value) {
    const column = document.querySelector(`.management-column:nth-child(${columnNumber})`);
    if (column) {
        // Create a simple bar chart visualization
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.innerHTML = `
            <div class="chart-bar">
                <div class="chart-fill" style="width: ${Math.min(value * 5, 100)}%"></div>
            </div>
            <div class="chart-value">${value} hours</div>
        `;
        
        // Clear existing content except title
        const title = column.querySelector('.column-title');
        column.innerHTML = '';
        column.appendChild(title);
        column.appendChild(chartContainer);
    }
}
