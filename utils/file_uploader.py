from werkzeug.utils import secure_filename

from .logging_config import LOGGER


def upload_file(file, upload_dir):

    filename = secure_filename(file.filename)
    file_path = upload_dir / filename
    LOGGER.info("Uploading file: '%s' to filepath: '%s'", filename, file_path)
    file.save(file_path)

    return filename, file_path
