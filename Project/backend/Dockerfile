# Use Python 3.10 slim image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies for TensorFlow
RUN apt-get update && apt-get install -y \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies first (for Docker layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend files
COPY . .

# Hugging Face Spaces requires port 7860
EXPOSE 7860

# Start the Flask app using Gunicorn on port 7860
CMD ["gunicorn", "-b", "0.0.0.0:7860", "--timeout", "120", "--workers", "2", "app:app"]
