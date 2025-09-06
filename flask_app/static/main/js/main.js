// OTP Login Functionality
let currentOTP = null;
let currentTTL = null;
let timerInterval = null;

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

    // Only initialize OTP functionality if elements exist
    if (loginBtn && otpForm && otpInput && verifyBtn && cancelBtn && messageDiv) {
        // Login button click handler
        loginBtn.addEventListener('click', async function() {
            try {
                loginBtn.disabled = true;
                loginBtn.textContent = 'Requesting OTP...';
                showMessage('Requesting OTP code...', 'info');

                // Make GET request to the webhook
                const response = await fetch('https://n8n.fphn8n.online/webhook/deploy-assistant-otp', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    currentOTP = data.OTP;
                    currentTTL = data.TTL;
                    
                    if (currentOTP) {
                        showMessage('OTP code sent! Please check discord. Request another code in ' + currentTTL + ' seconds', 'success');
                        otpForm.style.display = 'block';
                        otpInput.focus();
                        
                        // Start the timer
                        startTimer();
                    } else {
                        showMessage('Error: No OTP code received from server', 'error');
                        loginBtn.disabled = false;
                        loginBtn.textContent = 'Login';
                    }
                } else {
                    showMessage('Error: Failed to request OTP code', 'error');
                    loginBtn.disabled = false;
                    loginBtn.textContent = 'Login';
                }
            } catch (error) {
                console.error('Error requesting OTP:', error);
                showMessage('Error: Failed to connect to server', 'error');
                loginBtn.disabled = false;
                loginBtn.textContent = 'Login';
            }
        });

        // Verify button click handler
        verifyBtn.addEventListener('click', function() {
            const enteredOTP = otpInput.value.trim();
            
            if (!enteredOTP) {
                showMessage('Please enter the OTP code', 'error');
                return;
            }

            if (currentOTP && enteredOTP === currentOTP.toString()) {
                showMessage('Login successful! Welcome!', 'success');
                otpForm.style.display = 'none';
                otpInput.value = '';
                currentOTP = null;
                stopTimer();
                showLoggedInState();
            } else {
                showMessage('Invalid OTP code. Please try again.', 'error');
                otpInput.value = '';
                otpInput.focus();
            }
        });

        // Cancel button click handler
        cancelBtn.addEventListener('click', function() {
            otpForm.style.display = 'none';
            otpInput.value = '';
            currentOTP = null;
            stopTimer();
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

        function startTimer() {
            // Clear any existing timer
            if (timerInterval) {
                clearInterval(timerInterval);
            }
            
            // Keep the button disabled and show countdown
            loginBtn.disabled = true;
            loginBtn.textContent = `Request another code in ${currentTTL}s`;
            
            // Start countdown
            timerInterval = setInterval(() => {
                currentTTL--;
                loginBtn.textContent = `Request another code in ${currentTTL}s`;
                
                if (currentTTL <= 0) {
                    // Timer finished, enable button
                    clearInterval(timerInterval);
                    timerInterval = null;
                    loginBtn.disabled = false;
                    loginBtn.textContent = 'Send OTP';
                    currentTTL = null;
                }
            }, 1000);
        }

        function stopTimer() {
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
            loginBtn.disabled = false;
            loginBtn.textContent = 'Send OTP';
            currentTTL = null;
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

        // GCloud init button functionality
        const gcloudBtn = document.getElementById('actionBtn1');
        if (gcloudBtn) {
            gcloudBtn.addEventListener('click', async function() {
                try {
                    gcloudBtn.disabled = true;
                    gcloudBtn.textContent = 'Running...';
                    
                    // Make GET request to the webhook
                    const response = await fetch('https://n8n.fphn8n.online/webhook/073a03d9-00e5-45a5-9323-50afc82eee83', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        
                        // Handle array response - get first item if it's an array
                        const responseData = Array.isArray(data) ? data[0] : data;
                        
                        // Display stderr in terminal
                        const terminalOutput = document.getElementById('terminalOutput');
                        if (terminalOutput) {
                            // Hide the blinking cursor
                            const cursor = document.querySelector('.terminal-cursor');
                            if (cursor) {
                                cursor.style.display = 'none';
                            }
                            
                            // Add stderr output (handle undefined case)
                            const stderrContent = responseData.stderr || responseData.stderr === '' ? responseData.stderr : 'No stderr output';
                            
                            // Add stderr content directly to terminal output without extra spacing
                            terminalOutput.innerHTML = '';
                            
                            // Typewriter effect for stderr - line by line
                            const lines = stderrContent.split('\n');
                            let lineIndex = 0;
                            
                            const typeWriter = setInterval(() => {
                                if (lineIndex < lines.length) {
                                    // Create a new line for each stderr line
                                    const stderrLine = document.createElement('div');
                                    stderrLine.className = 'terminal-line';
                                    stderrLine.textContent = lines[lineIndex];
                                    terminalOutput.appendChild(stderrLine);
                                    lineIndex++;
                                    // Scroll to bottom during typing
                                    terminalOutput.scrollTop = terminalOutput.scrollHeight;
                                } else {
                                    clearInterval(typeWriter);
                                    
                                    // Add new prompt line with success status after stderr is done
                                    const successText = responseData.success ? 'SUCCESS' : 'FAILED';
                                    const successColor = responseData.success ? '#00ff00' : '#ff0000';
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
                    gcloudBtn.textContent = 'GCloud init';
                }
            });
        }

        // Docker Build button functionality
        const dockerBuildBtn = document.getElementById('actionBtn2');
        if (dockerBuildBtn) {
            dockerBuildBtn.addEventListener('click', async function() {
                try {
                    dockerBuildBtn.disabled = true;
                    dockerBuildBtn.textContent = 'Running...';
                    
                    // Make GET request to the webhook
                    const response = await fetch('https://n8n.fphn8n.online/webhook/1c9ceed1-750f-48de-b3c9-15e3a31beb6d', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        
                        // Handle array response - get first item if it's an array
                        const responseData = Array.isArray(data) ? data[0] : data;
                        
                        // Display stderr in terminal
                        const terminalOutput = document.getElementById('terminalOutput');
                        if (terminalOutput) {
                            // Hide the blinking cursor
                            const cursor = document.querySelector('.terminal-cursor');
                            if (cursor) {
                                cursor.style.display = 'none';
                            }
                            
                            // Add stderr output (handle undefined case)
                            const stderrContent = responseData.stderr || responseData.stderr === '' ? responseData.stderr : 'No stderr output';
                            
                            // Add stderr content directly to terminal output without extra spacing
                            terminalOutput.innerHTML = '';
                            
                            // Typewriter effect for stderr - line by line
                            const lines = stderrContent.split('\n');
                            let lineIndex = 0;
                            
                            const typeWriter = setInterval(() => {
                                if (lineIndex < lines.length) {
                                    // Create a new line for each stderr line
                                    const stderrLine = document.createElement('div');
                                    stderrLine.className = 'terminal-line';
                                    stderrLine.textContent = lines[lineIndex];
                                    terminalOutput.appendChild(stderrLine);
                                    lineIndex++;
                                    // Scroll to bottom during typing
                                    terminalOutput.scrollTop = terminalOutput.scrollHeight;
                                } else {
                                    clearInterval(typeWriter);
                                    
                                    // Add new prompt line with success status after stderr is done
                                    const successText = responseData.success ? 'SUCCESS' : 'FAILED';
                                    const successColor = responseData.success ? '#00ff00' : '#ff0000';
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
        if (dockerPushBtn) {
            dockerPushBtn.addEventListener('click', async function() {
                try {
                    dockerPushBtn.disabled = true;
                    dockerPushBtn.textContent = 'Running...';
                    
                    // Make GET request to the webhook
                    const response = await fetch('https://n8n.fphn8n.online/webhook/799c704a-b2c3-4448-a70d-28a554a03d16', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        
                        // Handle array response - get first item if it's an array
                        const responseData = Array.isArray(data) ? data[0] : data;
                        
                        // Display stdout in terminal
                        const terminalOutput = document.getElementById('terminalOutput');
                        if (terminalOutput) {
                            // Hide the blinking cursor
                            const cursor = document.querySelector('.terminal-cursor');
                            if (cursor) {
                                cursor.style.display = 'none';
                            }
                            
                            // Add stdout output (handle undefined case)
                            const stdoutContent = responseData.stdout || responseData.stdout === '' ? responseData.stdout : 'No stdout output';
                            
                            // Add stdout content directly to terminal output without extra spacing
                            terminalOutput.innerHTML = '';
                            
                            // Typewriter effect for stdout - line by line
                            const lines = stdoutContent.split('\n');
                            let lineIndex = 0;
                            
                            const typeWriter = setInterval(() => {
                                if (lineIndex < lines.length) {
                                    // Create a new line for each stdout line
                                    const stdoutLine = document.createElement('div');
                                    stdoutLine.className = 'terminal-line';
                                    stdoutLine.textContent = lines[lineIndex];
                                    terminalOutput.appendChild(stdoutLine);
                                    lineIndex++;
                                    // Scroll to bottom during typing
                                    terminalOutput.scrollTop = terminalOutput.scrollHeight;
                                } else {
                                    clearInterval(typeWriter);
                                    
                                    // Add new prompt line with success status after stdout is done
                                    const successText = responseData.success ? 'SUCCESS' : 'FAILED';
                                    const successColor = responseData.success ? '#00ff00' : '#ff0000';
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
        if (gcloudDeployBtn) {
            gcloudDeployBtn.addEventListener('click', async function() {
                try {
                    gcloudDeployBtn.disabled = true;
                    gcloudDeployBtn.textContent = 'Running...';
                    
                    // Make GET request to the webhook
                    const response = await fetch('https://n8n.fphn8n.online/webhook/77435c44-958c-43e0-8421-601a7e113188', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        
                        // Handle array response - get first item if it's an array
                        const responseData = Array.isArray(data) ? data[0] : data;
                        
                        // Display stderr in terminal
                        const terminalOutput = document.getElementById('terminalOutput');
                        if (terminalOutput) {
                            // Hide the blinking cursor
                            const cursor = document.querySelector('.terminal-cursor');
                            if (cursor) {
                                cursor.style.display = 'none';
                            }
                            
                            // Add stderr output (handle undefined case)
                            const stderrContent = responseData.stderr || responseData.stderr === '' ? responseData.stderr : 'No stderr output';
                            
                            // Add stderr content directly to terminal output without extra spacing
                            terminalOutput.innerHTML = '';
                            
                            // Typewriter effect for stderr - line by line
                            const lines = stderrContent.split('\n');
                            let lineIndex = 0;
                            
                            const typeWriter = setInterval(() => {
                                if (lineIndex < lines.length) {
                                    // Create a new line for each stderr line
                                    const stderrLine = document.createElement('div');
                                    stderrLine.className = 'terminal-line';
                                    
                                    // Check if the line contains a URL and make it clickable
                                    const lineText = lines[lineIndex];
                                    if (lineText.includes('http')) {
                                        // Extract URL and make it clickable
                                        const urlMatch = lineText.match(/(https?:\/\/[^\s]+)/);
                                        if (urlMatch) {
                                            const url = urlMatch[1];
                                            const beforeUrl = lineText.substring(0, lineText.indexOf(url));
                                            const afterUrl = lineText.substring(lineText.indexOf(url) + url.length);
                                            
                                            stderrLine.innerHTML = `${beforeUrl}<a href="${url}" target="_blank" style="color: #00ff00; text-decoration: underline;">${url}</a>${afterUrl}`;
                                        } else {
                                            stderrLine.textContent = lineText;
                                        }
                                    } else {
                                        stderrLine.textContent = lineText;
                                    }
                                    
                                    terminalOutput.appendChild(stderrLine);
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
    }
});
