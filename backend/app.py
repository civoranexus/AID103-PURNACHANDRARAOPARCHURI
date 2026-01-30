from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
import cv2
import tensorflow as tf
import base64
from PIL import Image
import io
import os

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000", "http://127.0.0.1:8000", "file://"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
    }
})

# Load model with error handling
try:
    model_path = os.path.join(os.path.dirname(__file__), "cropguard_model.h5")
    model = load_model(model_path)
    print(f"✓ Model loaded successfully from {model_path}")
except Exception as e:
    print(f"✗ Error loading model: {e}")
    model = None

CLASS_NAMES = ["Healthy", "Leaf_Blight", "Rust"]

RECOMMENDATIONS = {
    "Leaf_Blight": {
        "treatment": "Apply recommended fungicide and remove infected leaves.",
        "prevention": "Avoid overhead irrigation and ensure proper spacing."
    },
    "Rust": {
        "treatment": "Use sulfur-based fungicide.",
        "prevention": "Grow resistant varieties and improve air circulation."
    },
    "Healthy": {
        "treatment": "No treatment required.",
        "prevention": "Continue regular monitoring."
    }
}

def make_gradcam_heatmap(img_array, model, last_conv_layer_name="Conv_1"):
    grad_model = tf.keras.models.Model(
        [model.inputs],
        [model.get_layer(last_conv_layer_name).output, model.output]
    )

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array)
        class_channel = predictions[:, tf.argmax(predictions[0])]

    grads = tape.gradient(class_channel, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_outputs = conv_outputs[0]
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)

    heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
    return heatmap.numpy()

@app.route("/predict", methods=["POST", "OPTIONS"])
def predict():
    # Handle CORS preflight request
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
    
    if not model:
        return jsonify({"error": "Model not loaded"}), 503
    
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    try:
        file = request.files["image"]
        
        if file.filename == '':
            return jsonify({"error": "No image selected"}), 400
        
        img = Image.open(file).convert("RGB")
        img_resized = img.resize((224, 224))

        img_array = image.img_to_array(img_resized)
        img_array = np.expand_dims(img_array, axis=0) / 255.0

        preds = model.predict(img_array)
        confidence = float(np.max(preds))
        class_index = np.argmax(preds)
        disease = CLASS_NAMES[class_index]

        heatmap = make_gradcam_heatmap(img_array, model)

        img_cv = cv2.cvtColor(np.array(img_resized), cv2.COLOR_RGB2BGR)
        heatmap = cv2.resize(heatmap, (224, 224))
        heatmap_color = cv2.applyColorMap(np.uint8(255 * heatmap), cv2.COLORMAP_JET)

        overlay = cv2.addWeighted(img_cv, 0.6, heatmap_color, 0.4, 0)

        severity_percent = round(float(np.mean(heatmap) * 100), 2)
        if severity_percent < 30:
            severity_level = "Low"
        elif severity_percent < 60:
            severity_level = "Medium"
        else:
            severity_level = "High"

        _, buffer = cv2.imencode(".jpg", overlay)
        encoded_image = base64.b64encode(buffer).decode("utf-8")

        return jsonify({
            "disease": disease,
            "confidence": round(confidence, 2),
            "severity_level": severity_level,
            "severity_percent": severity_percent,
            "treatment": RECOMMENDATIONS[disease]["treatment"],
            "prevention": RECOMMENDATIONS[disease]["prevention"],
            "marked_image": encoded_image
        })
    
    except Exception as e:
        print(f"Error in prediction: {e}")
        return jsonify({"error": f"Prediction error: {str(e)}"}), 500

if __name__ == "__main__":
    print("\n" + "="*50)
    print("CropGuard AI - ML Service Starting")
    print("="*50)
    print(f"Flask API: http://127.0.0.1:5000")
    print(f"Disease Classes: {CLASS_NAMES}")
    print("="*50 + "\n")
    app.run(debug=True, host='0.0.0.0', port=5000)

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "CropGuard AI ML Service",
        "model_loaded": model is not None,
        "api_version": "1.0"
    }), 200 if model else 503
