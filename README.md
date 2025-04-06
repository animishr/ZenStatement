# File Processing Application

A Flask web application for processing CSV files and splitting text files.

## Features

- CSV Processing: Upload a CSV file, add a "Processed" column, and download the result
- File Splitting: Upload any text file and split it into two parts (first N lines and the rest)
- Modern UI with progress indicators
- Containerized with Docker for easy deployment
- Built with Python 3.11 for improved performance

## Python 3.11 Benefits

This application uses Python 3.11, which offers several advantages:

- **Performance**: 10-60% faster than previous Python versions
- **Better Error Messages**: More precise traceback information
- **Enhanced Typing**: Improved type annotations and checking
- **Exception Groups**: Better handling of multiple exceptions
- **TOML Support**: Built-in support for TOML configuration files

## Development Setup

### Using UV (Recommended)

This project uses UV, a fast Python package installer and resolver.

1. Install UV:
```bash
pip install uv
```

2. Create a virtual environment and install dependencies:
```bash
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -e .
```

3. Run the application:
```bash
flask run
```

### Using Docker

1. Development mode:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

2. Production mode:

```bash
docker-compose up --build
```

## Configuration

Configuration is managed through environment variables and the `.env` file:

- Copy `.env.example` to `.env` and adjust settings as needed
- For production, create a `.env.production` file with secure settings


## License

MIT