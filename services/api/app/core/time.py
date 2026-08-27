from datetime import datetime, timezone


def utc_now() -> datetime:
    """Returns timezone-aware UTC datetime."""
    return datetime.now(timezone.utc)


def is_expired(dt: datetime) -> bool:
    """Checks if a datetime has expired, handling both timezone-aware and naive SQLite timestamps."""
    if dt is None:
        return False
    now = utc_now()
    if dt.tzinfo is None:
        return dt < now.replace(tzinfo=None)
    return dt < now
