import logging
import sys

_logger = None

def setup_logger(name: str, level: int = logging.INFO) -> logging.Logger:
    global _logger
    if _logger is None:
        _logger = logging.getLogger(name)
        _logger.setLevel(level)

        # Create console handler and set level
        ch = logging.StreamHandler(sys.stdout)
        ch.setLevel(level)

        # Create formatter
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

        # Add formatter to console handler
        ch.setFormatter(formatter)

        # Add console handler to logger
        if not _logger.handlers:
            _logger.addHandler(ch)

    return _logger

# Example usage
app_logger = setup_logger("app")