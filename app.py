import os
import pandas as pd

from pathlib import Path
from flask import Flask, render_template, request, redirect, url_for, flash, send_from_directory, jsonify

from utils.file_uploader import upload_file
from utils.logging_config import LOGGER
from utils.parse_transactions import get_missing_transactions
from utils.status_parser import parse_comments


app = Flask(__name__)
app.secret_key = 'your_secret_key'


UPLOADS_DIR = Path("uploads")
OUT_DIR = Path("out")

NOT_FOUND_DIR = OUT_DIR / "not_found"
RESOLVED_DIR = OUT_DIR / "resolved"
UNRESOLVED_DIR = OUT_DIR / "unresolved"

# Create necessary directories if they don't exist
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(NOT_FOUND_DIR, exist_ok=True)
os.makedirs(RESOLVED_DIR, exist_ok=True)
os.makedirs(UNRESOLVED_DIR, exist_ok=True)


# Custom function to split a file into two parts
def split_file(filename):
    """
    Splits a "Resolution Statuses" file into two parts:
    - Resolved Issues identified by a LLM to be saved to 'out/resolved' folder
    - Remaining Issues go to 'out/unresolved' folder
    """
    try:
        # Construct file paths
        original_path = UPLOADS_DIR / filename
        resolved_filename = f"resolved_{filename}"
        unresolved_filename = f"unresolved_{filename}"

        resolved_path = RESOLVED_DIR / resolved_filename
        unresolved_path = UNRESOLVED_DIR / unresolved_filename
        
        comments = pd.read_csv(original_path, encoding="latin-1")

        # Get List of Resolved/Unresolved Issues
        resolved, unresolved = parse_comments(comments)
        
        pd.DataFrame(resolved).to_csv(resolved_path, index=False)
        pd.DataFrame(unresolved).to_csv(unresolved_path, index=False)
        
        return resolved_filename, unresolved_filename
    except Exception as e:
        print(f"Error in split_file: {e}")
        raise


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/process_csv', methods=['POST'])
def process_csv():
    if 'file' not in request.files:
        flash('No file part')
        return redirect(request.url)
    
    file = request.files['file']
    
    if file.filename == '':
        flash('No selected file')
        return redirect(request.url)
    
    if file and file.filename.endswith(".csv"):
        try:
            # Save file to Uploads Folder
            _, file_path = upload_file(file, UPLOADS_DIR)
            
            # Process CSV with pandas
            LOGGER.info("Extracting missing record(s) from file: '%s'...", file.filename)
            df_ = get_missing_transactions(file_path)
            
            # Generate processed filename
            processed_filename = "not_found_txns.csv"
            processed_path = NOT_FOUND_DIR / processed_filename
            
            # Save processed DataFrame
            LOGGER.info("Writing extracted missing record(s) to csv file: '%s'...", processed_filename)
            df_.to_csv(processed_path, index=False)
            
            # Clean up the uploaded file
            LOGGER.info("Cleaning up temporary file: '%s'...", file_path)
            os.remove(file_path)
            
            return render_template('index.html', 
                                  csv_processed=True, 
                                  processed_file=processed_filename)
        except Exception as e:
            flash(f'Error processing CSV: {str(e)}')
            return redirect(url_for('index'))
    else:
        flash('File must be a CSV')
        return redirect(url_for('index'))


@app.route('/split_file', methods=['POST'])
def process_split_file():
    if 'file' not in request.files:
        flash('No file part')
        return redirect(request.url)
    
    file = request.files['file']
    
    if file.filename == '':
        flash('No selected file')
        return redirect(request.url)
    
    if file:
        try:
            # Save file to Uploads Folder
            filename, file_path = upload_file(file, UPLOADS_DIR)
            
            # Split the file
            resolved_filename, unresolved_filename = split_file(filename)
            
            # Clean up the uploaded file
            os.remove(file_path)
            
            return render_template('index.html', 
                                  file_split=True, 
                                  resolved_file=resolved_filename,
                                  unresolved_file=unresolved_filename,
                                  show_charts=True)
        except Exception as e:
            flash(f'Error splitting file: {str(e)}')
            return redirect(url_for('index'))


def analyze_issue_frequency(file_path):
    """
    Analyze the frequency of issue types in a file.
    """
    try:
        data = pd.read_csv(file_path)
        
        comments = data[["comment"]] \
                        .reset_index() \
                        .groupby("comment") \
                        .count() \
                        .reset_index() \
                        .sort_values(by="index", ascending=False) \
                        .values.tolist()

        # Prepare data for the chart
        labels = [comment for comment, _ in comments]
        values = [count for _, count in comments]
        
        return {
            "labels": labels,
            "values": values,
            "title": f"Issues"
        }
    
    except Exception as e:
        LOGGER.error(f"Error analyzing word frequency: {e}")
        return {
            "labels": [],
            "values": [],
            "title": "Error analyzing frequency"
        }


@app.route('/api/frequency/<file_type>/<filename>')
def get_frequency_data(file_type: str, filename: str):
    try:
        if file_type not in ['resolved', 'unresolved']:
            return jsonify({"error": "Invalid file type"}), 400
        
        # Construct file path
        folder = RESOLVED_DIR if file_type == 'resolved' else UNRESOLVED_DIR
        file_path = os.path.join(folder, filename)
        
        # Check if file exists
        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404
        
        # Analyze issue frequency
        frequency_data = analyze_issue_frequency(file_path)
        
        return jsonify(frequency_data)
    except Exception as e:
        LOGGER.error(f"Error getting frequency data: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/processed/<filename>')
def download_processed_csv(filename):
    return send_from_directory(NOT_FOUND_DIR, filename)


@app.route('/resolved/<filename>')
def download_resolved(filename):
    return send_from_directory(RESOLVED_DIR, filename)


@app.route('/unresolved/<filename>')
def download_unresolved(filename):
    return send_from_directory(UNRESOLVED_DIR, filename)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
