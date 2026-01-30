async function analyze() {
    const input = document.getElementById("imageInput");
    
    if (!input.files[0]) {
        alert("Please select an image first");
        return;
    }
    
    try {
        // Show loading state
        const reportDiv = document.getElementById("report");
        reportDiv.innerHTML = "Analyzing image... Please wait.";
        
        // Use ML API client to predict disease
        const data = await mlApi.predictDisease(input.files[0]);
        
        // Display results
        if (data.marked_image) {
            document.getElementById("resultImage").src =
                "data:image/jpeg;base64," + data.marked_image;
        }
        
        document.getElementById("report").innerHTML = `
            <div class="analysis-result">
                <div class="result-item">
                    <strong>Disease:</strong> ${data.disease || 'Unknown'}
                </div>
                <div class="result-item">
                    <strong>Confidence:</strong> ${data.confidence ? (data.confidence * 100).toFixed(2) + '%' : 'N/A'}
                </div>
                <div class="result-item">
                    <strong>Severity:</strong> ${data.severity_level || 'N/A'} (${data.severity_percent || 0}%)
                </div>
                <div class="result-item">
                    <strong>Treatment:</strong> ${data.treatment || 'N/A'}
                </div>
                <div class="result-item">
                    <strong>Prevention:</strong> ${data.prevention || 'N/A'}
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Error analyzing image:", error);
        document.getElementById("report").innerHTML = `
            <div class="error-message">
                Error: ${error.message}<br>
                Make sure the Flask ML server is running on http://127.0.0.1:5000
            </div>
        `;
    }
}
