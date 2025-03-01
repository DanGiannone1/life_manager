# Use Node.js as build stage for frontend
FROM node:20-alpine AS frontend-build

# Set working directory for frontend
WORKDIR /app/frontend

# Copy frontend dependencies
COPY frontend/package*.json ./

# Install frontend dependencies with legacy-peer-deps flag
RUN npm ci --legacy-peer-deps

# Copy frontend source code
COPY frontend/ ./

# Build frontend
RUN npm run build

# Use Python for final stage
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Create a non-root user and group
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy Python requirements
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Copy frontend build from the frontend-build stage
COPY --from=frontend-build /app/frontend/dist ./dist

# Set ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"] 