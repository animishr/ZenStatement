# Use Python 3.11 slim image as base
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FLASK_APP=app.py \
    FLASK_ENV=production

# Install UV package manager
RUN pip install --no-cache-dir uv

# Copy requirements file
COPY requirements.txt .

# Install dependencies using UV
RUN uv pip install --system --no-cache --requirement requirements.txt

# Copy application code
COPY app.py .
COPY templates/ ./templates/
COPY static/ ./static/
COPY utils/ ./utils/

# Create necessary directories
RUN mkdir -p out/not_found out/resolved out/unresolved uploads 

# Expose port
EXPOSE 8000

# Run the application
CMD ["flask", "run", "-h", "0.0.0.0", "-p", "8000"]