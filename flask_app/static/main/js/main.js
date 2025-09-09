// OTP Login Functionality
let currentResumeWorkflowUrl = null;

document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('loginBtn');
    const otpForm = document.getElementById('otpForm');
    const otpInput = document.getElementById('otpInput');
    const verifyBtn = document.getElementById('verifyBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const messageDiv = document.getElementById('message');
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

    // Only initialize OTP functionality if elements exist
    if (loginBtn && otpForm && otpInput && verifyBtn && cancelBtn && messageDiv) {
        // Login button click handler
        loginBtn.addEventListener('click', async function() {
            try {
                loginBtn.disabled = true;
                loginBtn.hidden = true;

                // Make GET request to our proxy endpoint
                const response = await fetch('/api/request-otp', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    // Handle array response from n8n webhook
                    const responseData = Array.isArray(data) ? data[0] : data;
                    currentResumeWorkflowUrl = responseData['resumeWorkflow'];
                    
                    if (currentResumeWorkflowUrl) {
                        showMessage('Authentication link sent! Please check discord.', 'success');
                        otpForm.style.display = 'block';
                        otpInput.focus();
                    } else {
                        showMessage('Error: No authentication link received from server', 'error');
                        loginBtn.disabled = false;
                        loginBtn.textContent = 'Send OTP';
                    }
                } else {
                    showMessage('Error: Failed to request authentication link', 'error');
                    loginBtn.disabled = false;
                    loginBtn.textContent = 'Send OTP';
                }
            } catch (error) {
                console.error('Error requesting OTP:', error);
                showMessage('Error: Failed to connect to server', 'error');
                loginBtn.disabled = false;
                loginBtn.textContent = 'Send OTP';
            }
        });

        // Verify button click handler
        verifyBtn.addEventListener('click', async function() {
            const enteredOTP = otpInput.value.trim();
            
            if (!enteredOTP) {
                showMessage('Please enter the OTP code', 'error');
                return;
            }

            if (!currentResumeWorkflowUrl) {
                showMessage('No authentication link available. Please request a new one.', 'error');
                return;
            }

            try {
                verifyBtn.disabled = true;
                verifyBtn.textContent = 'Verifying...';
                showMessage('Verifying OTP code...', 'info');

                // Make GET request to our proxy endpoint with OTP in header
                const response = await fetch(`/api/verify-otp?url=${encodeURIComponent(currentResumeWorkflowUrl)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'user-attempt': enteredOTP
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    // Handle array response from n8n webhook
                    const responseData = Array.isArray(data) ? data[0] : data;
                    const otpCheck = responseData.OTPCheck;
                    
                           if (otpCheck === true || otpCheck === 'true') {
                               showMessage('Login successful! Redirecting...', 'success');
                               window.location.href = '/home';
                    } else if (otpCheck === false || otpCheck === 'false') {
                        showMessage('Invalid OTP code. Please try again.', 'error');
                        otpInput.value = '';
                        otpInput.focus();
                    } else {
                        showMessage('Unexpected response from server. Please try again.', 'error');
                        otpInput.value = '';
                        otpInput.focus();
                    }
                } else {
                    showMessage('Error: Failed to verify OTP code', 'error');
                    otpInput.value = '';
                    otpInput.focus();
                }
            } catch (error) {
                console.error('Error verifying OTP:', error);
                showMessage('Error: Failed to verify OTP code', 'error');
                otpInput.value = '';
                otpInput.focus();
            } finally {
                verifyBtn.disabled = false;
                verifyBtn.textContent = 'Verify';
            }
        });

        // Cancel button click handler
        cancelBtn.addEventListener('click', function() {
            otpForm.style.display = 'none';
            otpInput.value = '';
            currentResumeWorkflowUrl = null;
            hideMessage();
        });

        // Enter key handler for OTP input
        otpInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                verifyBtn.click();
            }
        });

        function showMessage(text, type) {
            messageDiv.textContent = text;
            messageDiv.className = `message ${type}`;
            messageDiv.style.display = 'block';
        }

        function hideMessage() {
            messageDiv.style.display = 'none';
        }

        // State management functions
        function showLoggedInState() {
            if (loginState) loginState.style.display = 'none';
            if (loggedInState) loggedInState.style.display = 'block';
            hideMessage();
        }

        function showLoginState() {
            if (loginState) loginState.style.display = 'block';
            if (loggedInState) loggedInState.style.display = 'none';
        }




    }

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
                                
                                // Add new prompt line with success status after output is done
                                const isSuccess = responseData.success === true || responseData.success === 'true' || responseData.code === 0;
                                const successText = isSuccess ? 'SUCCESS' : 'FAILED';
                                const successColor = isSuccess ? '#00ff00' : '#ff0000';
                                const promptLine = document.createElement('div');
                                promptLine.className = 'terminal-line';
                                promptLine.innerHTML = `
                                    <span class="terminal-prompt">DeployAssistant@3rdspace:~$</span>
                                    <span style="color: ${successColor};">${successText}</span>
                                `;
                                terminalOutput.appendChild(promptLine);
                                
                                // Add another prompt line at the bottom
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
                        }, 100); // 100ms delay between lines
                    }
                } else {
                    // Handle error response
                    const terminalOutput = document.getElementById('terminalOutput');
                    if (terminalOutput) {
                        terminalOutput.innerHTML += `<div class="terminal-line" style="color: #ff0000;">Error: Failed to execute GCloud init</div>`;
                        terminalOutput.innerHTML += `<div class="terminal-line">
                            <span class="terminal-prompt">DeployAssistant@3rdspace:~$</span>
                            <span style="color: #ff0000;">FAILED</span>
                        </div>`;
                        terminalOutput.scrollTop = terminalOutput.scrollHeight;
                    }
                }
            } catch (error) {
                console.error('Error executing GCloud init:', error);
                const terminalOutput = document.getElementById('terminalOutput');
                if (terminalOutput) {
                    // Check if it's a CORS error
                    if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
                        terminalOutput.innerHTML += `<div class="terminal-line" style="color: #ff0000;">Error: CORS policy blocked the request. The webhook needs to allow requests from localhost:8080</div>`;
                    } else {
                        terminalOutput.innerHTML += `<div class="terminal-line" style="color: #ff0000;">Error: ${error.message}</div>`;
                    }
                    terminalOutput.innerHTML += `<div class="terminal-line">
                        <span class="terminal-prompt">DeployAssistant@3rdspace:~$</span>
                        <span style="color: #ff0000;">FAILED</span>
                    </div>`;
                    terminalOutput.scrollTop = terminalOutput.scrollHeight;
                }
            } finally {
                gcloudBtn.disabled = false;
                gcloudBtn.textContent = 'GCloud init & Git Fetch/Pull';
            }
        });
    }

    // Docker Build button functionality
    const dockerBuildBtn = document.getElementById('actionBtn2');
    console.log('Docker Build button found:', dockerBuildBtn);
    if (dockerBuildBtn) {
        dockerBuildBtn.addEventListener('click', async function() {
            console.log('Docker Build button clicked!');
            try {
                dockerBuildBtn.disabled = true;
                dockerBuildBtn.textContent = 'Running...';
                
                // Make GET request to our proxy endpoint
                const response = await fetch('/api/docker-build', {
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
                                
                                // Add new prompt line with success status after output is done
                                const isSuccess = responseData.success === true || responseData.success === 'true' || responseData.code === 0;
                                const successText = isSuccess ? 'SUCCESS' : 'FAILED';
                                const successColor = isSuccess ? '#00ff00' : '#ff0000';
                                const promptLine = document.createElement('div');
                                promptLine.className = 'terminal-line';
                                promptLine.innerHTML = `
                                    <span class="terminal-prompt">DeployAssistant@3rdspace:~$</span>
                                    <span style="color: ${successColor};">${successText}</span>
                                `;
                                terminalOutput.appendChild(promptLine);
                                
                                // Add another prompt line at the bottom
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
                        }, 100); // 100ms delay between lines
                    }
                } else {
                    // Handle error response
                    const terminalOutput = document.getElementById('terminalOutput');
                    if (terminalOutput) {
                        terminalOutput.innerHTML += `<div class="terminal-line" style="color: #ff0000;">Error: Failed to execute Docker Build</div>`;
                        terminalOutput.innerHTML += `<div class="terminal-line">
                            <span class="terminal-prompt">DeployAssistant@3rdspace:~$</span>
                            <span style="color: #ff0000;">FAILED</span>
                        </div>`;
                        terminalOutput.scrollTop = terminalOutput.scrollHeight;
                    }
                }
            } catch (error) {
                console.error('Error executing Docker Build:', error);
                const terminalOutput = document.getElementById('terminalOutput');
                if (terminalOutput) {
                    // Check if it's a CORS error
                    if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
                        terminalOutput.innerHTML += `<div class="terminal-line" style="color: #ff0000;">Error: CORS policy blocked the request. The webhook needs to allow requests from localhost:8080</div>`;
                    } else {
                        terminalOutput.innerHTML += `<div class="terminal-line" style="color: #ff0000;">Error: ${error.message}</div>`;
                    }
                    terminalOutput.innerHTML += `<div class="terminal-line">
                        <span class="terminal-prompt">DeployAssistant@3rdspace:~$</span>
                        <span style="color: #ff0000;">FAILED</span>
                    </div>`;
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
    console.log('Docker Push button found:', dockerPushBtn);
    if (dockerPushBtn) {
        dockerPushBtn.addEventListener('click', async function() {
            console.log('Docker Push button clicked!');
            try {
                dockerPushBtn.disabled = true;
                dockerPushBtn.textContent = 'Running...';
                
                // Make GET request to our proxy endpoint
                const response = await fetch('/api/docker-push', {
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
                                
                                // Add new prompt line with success status after output is done
                                const isSuccess = responseData.success === true || responseData.success === 'true' || responseData.code === 0;
                                const successText = isSuccess ? 'SUCCESS' : 'FAILED';
                                const successColor = isSuccess ? '#00ff00' : '#ff0000';
                                const promptLine = document.createElement('div');
                                promptLine.className = 'terminal-line';
                                promptLine.innerHTML = `
                                    <span class="terminal-prompt">DeployAssistant@3rdspace:~$</span>
                                    <span style="color: ${successColor};">${successText}</span>
                                `;
                                terminalOutput.appendChild(promptLine);
                                
                                // Add another prompt line at the bottom
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
                        }, 100); // 100ms delay between lines
                    }
                } else {
                    // Handle error response
                    const terminalOutput = document.getElementById('terminalOutput');
                    if (terminalOutput) {
                        terminalOutput.innerHTML += `<div class="terminal-line" style="color: #ff0000;">Error: Failed to execute Docker Push</div>`;
                        terminalOutput.innerHTML += `<div class="terminal-line">
                            <span class="terminal-prompt">DeployAssistant@3rdspace:~$</span>
                            <span style="color: #ff0000;">FAILED</span>
                        </div>`;
                        terminalOutput.scrollTop = terminalOutput.scrollHeight;
                    }
                }
            } catch (error) {
                console.error('Error executing Docker Push:', error);
                const terminalOutput = document.getElementById('terminalOutput');
                if (terminalOutput) {
                    // Check if it's a CORS error
                    if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
                        terminalOutput.innerHTML += `<div class="terminal-line" style="color: #ff0000;">Error: CORS policy blocked the request. The webhook needs to allow requests from localhost:8080</div>`;
                    } else {
                        terminalOutput.innerHTML += `<div class="terminal-line" style="color: #ff0000;">Error: ${error.message}</div>`;
                    }
                    terminalOutput.innerHTML += `<div class="terminal-line">
                        <span class="terminal-prompt">DeployAssistant@3rdspace:~$</span>
                        <span style="color: #ff0000;">FAILED</span>
                    </div>`;
                    terminalOutput.scrollTop = terminalOutput.scrollHeight;
                }
            } finally {
                dockerPushBtn.disabled = false;
                dockerPushBtn.textContent = 'Docker Push';
            }
        });
    }

    // GCloud Run Deploy button functionality
    const gcloudDeployBtn = document.getElementById('actionBtn4');
    console.log('GCloud Deploy button found:', gcloudDeployBtn);
    if (gcloudDeployBtn) {
        gcloudDeployBtn.addEventListener('click', async function() {
            console.log('GCloud Deploy button clicked!');
            try {
                gcloudDeployBtn.disabled = true;
                gcloudDeployBtn.textContent = 'Running...';
                
                // Make GET request to our proxy endpoint
                const response = await fetch('/api/gcloud-deploy', {
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
                                
                                // Check if the line contains a URL and make it clickable
                                const lineText = lines[lineIndex];
                                if (lineText.includes('http')) {
                                    // Extract URL and make it clickable
                                    const urlMatch = lineText.match(/(https?:\/\/[^\s]+)/);
                                    if (urlMatch) {
                                        const url = urlMatch[1];
                                        const beforeUrl = lineText.substring(0, lineText.indexOf(url));
                                        const afterUrl = lineText.substring(lineText.indexOf(url) + url.length);
                                        
                                        outputLine.innerHTML = `${beforeUrl}<a href="${url}" target="_blank" style="color: #00ff00; text-decoration: underline;">${url}</a>${afterUrl}`;
                                    } else {
                                        outputLine.textContent = lineText;
                                    }
                                } else {
                                    outputLine.textContent = lineText;
                                }
                                
                                terminalOutput.appendChild(outputLine);
                                lineIndex++;
                                // Scroll to bottom during typing
                                terminalOutput.scrollTop = terminalOutput.scrollHeight;
                            } else {
                                clearInterval(typeWriter);
                                
                                // Add another prompt line at the bottom
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
                        }, 100); // 100ms delay between lines
                    }
                } else {
                    // Handle error response
                    const terminalOutput = document.getElementById('terminalOutput');
                    if (terminalOutput) {
                        terminalOutput.innerHTML += `<div class="terminal-line" style="color: #ff0000;">Error: Failed to execute GCloud Run Deploy</div>`;
                        terminalOutput.innerHTML += `<div class="terminal-line">
                            <span class="terminal-prompt">DeployAssistant@3rdspace:~$</span>
                            <span style="color: #ff0000;">FAILED</span>
                        </div>`;
                        terminalOutput.scrollTop = terminalOutput.scrollHeight;
                    }
                }
            } catch (error) {
                console.error('Error executing GCloud Run Deploy:', error);
                const terminalOutput = document.getElementById('terminalOutput');
                if (terminalOutput) {
                    // Check if it's a CORS error
                    if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
                        terminalOutput.innerHTML += `<div class="terminal-line" style="color: #ff0000;">Error: CORS policy blocked the request. The webhook needs to allow requests from localhost:8080</div>`;
                    } else {
                        terminalOutput.innerHTML += `<div class="terminal-line" style="color: #ff0000;">Error: ${error.message}</div>`;
                    }
                    terminalOutput.innerHTML += `<div class="terminal-line">
                        <span class="terminal-prompt">DeployAssistant@3rdspace:~$</span>
                        <span style="color: #ff0000;">FAILED</span>
                    </div>`;
                    terminalOutput.scrollTop = terminalOutput.scrollHeight;
                }
            } finally {
                gcloudDeployBtn.disabled = false;
                gcloudDeployBtn.textContent = 'GCloud Run Deploy';
            }
        });
    }

    // Time Management button functionality
    const timeManagementBtn = document.getElementById('timeManagementBtn');
    if (timeManagementBtn) {
        timeManagementBtn.addEventListener('click', function() {
            window.location.href = '/time?view=management';
        });
    }

    // Record Time button functionality
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
                const name = document.getElementById('nameSelect').value;
                const date = document.getElementById('dateInput').value;
                const hours = document.getElementById('hoursInput').value;
                

                // Validate form
                if (!name) {
                    alert('Please select a name');
                    return;
                }
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
                    'name': name,
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
            // Extract the values from the response
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

// Function to update column with chart data (moved outside DOMContentLoaded)
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
