from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
import cv2
import tensorflow as tf
import base64
from PIL import Image
import io

app = Flask(__name__)

# Load model
model = load_model("cropguard_model.h5")

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

@app.route("/predict", methods=["POST"])
def predict():
    file = request.files["image"]
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

if __name__ == "__main__":
    app.run(debug=True)
