"""
Structured JSON Logging for ZION.CITY API
==========================================
Provides structured JSON logging for better log analysis and monitoring.

Usage:
    from core.logging import setup_logging, get_logger

    # At application startup
    setup_logging()

    # In your modules
    logger = get_logger(__name__)
    logger.info("Processing request", extra={"user_id": user_id, "action": "login"})
"""

import logging
import json
import sys
import traceback
from datetime import datetime, timezone
from typing import Optional, Dict, Any


class JSONFormatter(logging.Formatter):
    """
    Custom formatter that outputs logs as JSON for easy parsing by log aggregators.
    """

    def __init__(self, include_extras: bool = True):
        super().__init__()
        self.include_extras = include_extras
        # Fields that are part of standard LogRecord and shouldn't be included in extras
        self.reserved_attrs = {
            'name', 'msg', 'args', 'created', 'filename', 'funcName',
            'levelname', 'levelno', 'lineno', 'module', 'msecs',
            'pathname', 'process', 'processName', 'relativeCreated',
            'stack_info', 'exc_info', 'exc_text', 'thread', 'threadName',
            'taskName', 'message'
        }

    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON string."""
        log_record: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Add process/thread info for debugging concurrency issues
        log_record["process"] = {
            "id": record.process,
            "name": record.processName,
        }
        log_record["thread"] = {
            "id": record.thread,
            "name": record.threadName,
        }

        # Add exception info if present
        if record.exc_info:
            log_record["exception"] = {
                "type": record.exc_info[0].__name__ if record.exc_info[0] else None,
                "message": str(record.exc_info[1]) if record.exc_info[1] else None,
                "traceback": self.formatException(record.exc_info),
            }

        # Add any extra fields passed to the logger
        if self.include_extras:
            extras = {}
            for key, value in record.__dict__.items():
                if key not in self.reserved_attrs and not key.startswith('_'):
                    try:
                        # Ensure value is JSON serializable
                        json.dumps(value)
                        extras[key] = value
                    except (TypeError, ValueError):
                        extras[key] = str(value)
            if extras:
                log_record["extra"] = extras

        return json.dumps(log_record, default=str, ensure_ascii=False)


class RequestContextFilter(logging.Filter):
    """
    Filter that adds request context to log records.
    Can be used with middleware to add request_id, user_id, etc.
    """

    def __init__(self):
        super().__init__()
        self.context: Dict[str, Any] = {}

    def set_context(self, **kwargs):
        """Set context fields that will be added to all log records."""
        self.context.update(kwargs)

    def clear_context(self):
        """Clear the current context."""
        self.context.clear()

    def filter(self, record: logging.LogRecord) -> bool:
        """Add context to the log record."""
        for key, value in self.context.items():
            setattr(record, key, value)
        return True


# Global request context filter instance
request_context = RequestContextFilter()


def setup_logging(
    level: str = "INFO",
    json_output: bool = True,
    log_file: Optional[str] = None,
    include_access_logs: bool = False
) -> None:
    """
    Setup structured logging for the application.

    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        json_output: If True, output logs as JSON. If False, use standard format.
        log_file: Optional path to write logs to a file
        include_access_logs: If True, include uvicorn access logs
    """
    # Get root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, level.upper()))

    # Remove existing handlers
    root_logger.handlers.clear()

    # Create handler(s)
    handlers = []

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, level.upper()))
    handlers.append(console_handler)

    # File handler (optional)
    if log_file:
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(getattr(logging, level.upper()))
        handlers.append(file_handler)

    # Set formatter
    if json_output:
        formatter = JSONFormatter()
    else:
        formatter = logging.Formatter(
            '%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )

    # Apply formatter and filters to all handlers
    for handler in handlers:
        handler.setFormatter(formatter)
        handler.addFilter(request_context)
        root_logger.addHandler(handler)

    # Configure third-party loggers
    # Reduce noise from uvicorn
    if not include_access_logs:
        logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

    # Reduce noise from other libraries
    logging.getLogger("uvicorn.error").setLevel(logging.WARNING)
    logging.getLogger("motor").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("websockets").setLevel(logging.WARNING)

    # Log startup message
    logger = logging.getLogger(__name__)
    logger.info(
        "Logging initialized",
        extra={
            "config": {
                "level": level,
                "json_output": json_output,
                "log_file": log_file,
                "include_access_logs": include_access_logs
            }
        }
    )


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger with the specified name.

    Args:
        name: Logger name (usually __name__)

    Returns:
        Configured logger instance
    """
    return logging.getLogger(name)


# Convenience logging functions with context support
class ContextLogger:
    """
    Logger wrapper that allows easy context injection.

    Usage:
        logger = ContextLogger(__name__)
        logger.with_context(user_id="123").info("User logged in")
    """

    def __init__(self, name: str):
        self._logger = logging.getLogger(name)
        self._extra: Dict[str, Any] = {}

    def with_context(self, **kwargs) -> 'ContextLogger':
        """Return a new logger with additional context."""
        new_logger = ContextLogger(self._logger.name)
        new_logger._extra = {**self._extra, **kwargs}
        return new_logger

    def _log(self, level: int, msg: str, *args, **kwargs):
        extra = kwargs.pop('extra', {})
        extra.update(self._extra)
        self._logger.log(level, msg, *args, extra=extra, **kwargs)

    def debug(self, msg: str, *args, **kwargs):
        self._log(logging.DEBUG, msg, *args, **kwargs)

    def info(self, msg: str, *args, **kwargs):
        self._log(logging.INFO, msg, *args, **kwargs)

    def warning(self, msg: str, *args, **kwargs):
        self._log(logging.WARNING, msg, *args, **kwargs)

    def error(self, msg: str, *args, **kwargs):
        self._log(logging.ERROR, msg, *args, **kwargs)

    def critical(self, msg: str, *args, **kwargs):
        self._log(logging.CRITICAL, msg, *args, **kwargs)

    def exception(self, msg: str, *args, **kwargs):
        kwargs['exc_info'] = True
        self._log(logging.ERROR, msg, *args, **kwargs)
