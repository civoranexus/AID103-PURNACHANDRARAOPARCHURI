async function analyze() {
    const input = document.getElementById("imageInput");
    const formData = new FormData();
    formData.append("image", input.files[0]);

    const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData
    });

    const data = await response.json();

    document.getElementById("resultImage").src =
        "data:image/jpeg;base64," + data.marked_image;

    document.getElementById("report").innerHTML = `
        Disease: <b>${data.disease}</b><br>
        Confidence: <b>${data.confidence}</b><br>
        Severity: <b>${data.severity_level} (${data.severity_percent}%)</b><br>
        Treatment: ${data.treatment}<br>
        Prevention: ${data.prevention}
    `;
}
