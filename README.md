# ZenStatement Assignment

A Flask web application for extracting missing transactions from orders data CSV files and splitting issues into resolved and unresolved issues CSV files using LLM API calls.

## Dependencies
- flask==3.1.0
- gunicorn==21.2.0
- langchain==0.3.23
- langchain-community==0.3.21
- langchain-core==0.3.51
- langchain-google-genai==2.1.2
- pandas==2.2.3
- python-dotenv==1.1.0
- werkzeug==3.1.3

## Functionalities

- **Extract Missing Transactions:** Upload a transactions CSV file, and download the output CSV with missing transaction details
- **Parse Resolution Statuses:** Upload Resolution Statuses CSV file and split it following files and download them:
    - **Resolved issues**
    - **Unresolved issues** with *issue summary* and *next steps*
- **Issue Frequency Analysis:** Display the Resolved and Unresolved Issues sorted in descending order of frequency as *horizontal bar charts* respectively

## Setup using Docker

1. Docker Build:

```bash
docker build -t zen-statement-app .
```

2. Run Service:

```bash
docker run -d -p 8000:8000 --env-file .env zen-statement-app
```

## Configuration

Configuration is managed through environment variables and the `.env` file:

Create `.env` file and adjust settings as needed

### Sample `.env` file

```bash
GEMINI_API_KEY=API_Key
GOOGLE_API_KEY=API_Key
USE_GOOGLE_AUTH=true
```