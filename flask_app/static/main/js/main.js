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
                
                // Handle time entry access control
                handleTimeEntryAccess(userInfo.can_submit_time);
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
    
    function handleTimeEntryAccess(canSubmitTime) {
        // Find time entry form elements
        const recordTimeForm = document.querySelector('.record-time-form');
        const submitTimeBtn = document.getElementById('submitTimeBtn');
        const timeEntrySection = document.querySelector('.time-entry-section');
        
        if (!canSubmitTime) {
            // Hide the time entry form and show access denied message
            if (recordTimeForm) {
                recordTimeForm.style.display = 'none';
            }
            
            if (timeEntrySection) {
                // Create access denied message
                const accessDeniedMsg = document.createElement('div');
                accessDeniedMsg.className = 'access-denied-message';
                accessDeniedMsg.innerHTML = `
                    <div class="access-denied-content">
                        <h3>Access Restricted</h3>
                        <p>You don't have permission to submit time entries.</p>
                        <p>Please contact an administrator if you believe this is an error.</p>
                    </div>
                `;
                
                // Insert the message after the page header
                const pageHeader = timeEntrySection.querySelector('.page-header');
                if (pageHeader) {
                    pageHeader.insertAdjacentElement('afterend', accessDeniedMsg);
                }
            }
        } else {
            // Ensure form is visible for authorized users
            if (recordTimeForm) {
                recordTimeForm.style.display = 'block';
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
                
                
                const response = await fetch(`/api/submit-time?${params}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    alert('Time entry submitted successfully!');
                    
                    // Clear form
                    document.getElementById('nameSelect').value = '';
                    document.getElementById('dateInput').value = '';
                    document.getElementById('hoursInput').value = '';
                } else {
                    alert('Error submitting time entry. Please try again.');
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
            
            if (selectedFilter === 'pick-month') {
                const monthInputValue = monthInput.value;
                if (monthInputValue) {
                    const [year, month] = monthInputValue.split('-');
                    monthValue = parseInt(month);
                    yearValue = parseInt(year);
                }
            }
            
            // Calculate date ranges based on filter
            let startDate, endDate;
            
            switch (selectedFilter) {
                case 'current-month':
                    startDate = new Date(currentYear, currentMonth - 1, 1);
                    endDate = new Date(currentYear, currentMonth, 0);
                    break;
                case 'past-3-months':
                    startDate = new Date(currentYear, currentMonth - 3, 1);
                    endDate = new Date(currentYear, currentMonth, 0);
                    break;
                case 'past-year':
                    startDate = new Date(currentYear - 1, currentMonth - 1, 1);
                    endDate = new Date(currentYear, currentMonth, 0);
                    break;
                case 'pick-month':
                    startDate = new Date(yearValue, monthValue - 1, 1);
                    endDate = new Date(yearValue, monthValue, 0);
                    break;
                default:
                    return;
            }
            
            // Format dates for display
            const formatDate = (date) => {
                return date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
            };
            
            // Display filter results (placeholder - you can implement actual data loading here)
            console.log(`Filtering from ${formatDate(startDate)} to ${formatDate(endDate)}`);
            
            // You can add actual data loading logic here
            // For now, just show a message
            alert(`Filter applied: ${formatDate(startDate)} to ${formatDate(endDate)}`);
        });
    }
});
