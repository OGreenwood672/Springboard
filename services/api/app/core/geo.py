import math
from typing import Optional, Tuple, Any
from geoalchemy2.elements import WKTElement

# Common UK Outward Postcodes and town/city coordinates (approximate centroids)
UK_POSTCODE_COORDINATES = {
    # Greater London
    "SW1A": (51.5014, -0.1419),
    "EC1A": (51.5190, -0.1000),
    "WC2N": (51.5080, -0.1281),
    "E1": (51.5170, -0.0570),
    "N1": (51.5380, -0.1020),
    "SE1": (51.5010, -0.0930),
    "W1": (51.5150, -0.1420),
    "W2": (51.5130, -0.1770),
    # Buckinghamshire & Home Counties
    "HP5": (51.7050, -0.6120),  # Chesham
    "HP6": (51.6740, -0.6080),  # Amersham
    "HP7": (51.6500, -0.6200),  # Amersham Old Town
    "HP9": (51.6020, -0.6390),  # Beaconsfield
    "HP11": (51.6285, -0.7480), # High Wycombe Central
    "HP12": (51.6320, -0.7750), # High Wycombe West
    "HP19": (51.8220, -0.8200), # Aylesbury North / Gatehouse
    "HP20": (51.8150, -0.8100), # Aylesbury Central
    "HP21": (51.8050, -0.8000), # Aylesbury South
    "HP22": (51.7630, -0.7400), # Wendover
    "SL7": (51.5710, -0.7760),  # Marlow
    "SL1": (51.5100, -0.5950),   # Slough
    "RG1": (51.4540, -0.9780),   # Reading
    "MK9": (52.0406, -0.7594),   # Milton Keynes
    "AL1": (51.7520, -0.3390),   # St Albans
    "OX1": (51.7520, -1.2577),   # Oxford
    "CB1": (52.2053, 0.1218),    # Cambridge
    # Midlands
    "B1": (52.4862, -1.8904),    # Birmingham
    "B2": (52.4797, -1.8986),
    "CV1": (52.4068, -1.5197),   # Coventry
    "LE1": (52.6369, -1.1398),   # Leicester
    "NG1": (52.9548, -1.1581),   # Nottingham
    # North
    "M1": (53.4808, -2.2426),    # Manchester
    "M2": (53.4815, -2.2446),
    "M4": (53.4840, -2.2330),
    "L1": (53.4084, -2.9916),    # Liverpool
    "LS1": (53.7960, -1.5470),   # Leeds
    "S1": (53.3811, -1.4701),    # Sheffield
    "NE1": (54.9783, -1.6178),   # Newcastle
    # South & South West
    "BS1": (51.4545, -2.5879),   # Bristol
    "BA1": (51.3811, -2.3590),   # Bath
    "BN1": (50.8225, -0.1372),   # Brighton
    "SO14": (50.9097, -1.4044),  # Southampton
    "PO1": (50.7989, -1.0912),   # Portsmouth
    "EX1": (50.7184, -3.5339),   # Exeter
    "PL1": (50.3755, -4.1427),   # Plymouth
    # Wales & Scotland
    "CF10": (51.4816, -3.1791),  # Cardiff
    "EH1": (55.9533, -3.1883),   # Edinburgh
    "G1": (55.8642, -4.2518),    # Glasgow
    "BT1": (54.5973, -5.9301),   # Belfast
}


def extract_outcode(postcode: Optional[str]) -> Optional[str]:
    """Extract outward code (e.g. 'HP5' from 'HP5 1AA' or 'HP5') in uppercase."""
    if not postcode:
        return None
    cleaned = postcode.strip().upper()
    parts = cleaned.split()
    if len(parts) >= 2:
        return parts[0]
    return cleaned


def geocode_uk_postcode(postcode: Optional[str]) -> Tuple[Optional[float], Optional[float]]:
    """
    Return (latitude, longitude) for a UK postcode/outcode.
    Returns (None, None) if not found.
    """
    if not postcode:
        return None, None

    outcode = extract_outcode(postcode)
    if not outcode:
        return None, None

    # Check exact outcode match
    if outcode in UK_POSTCODE_COORDINATES:
        return UK_POSTCODE_COORDINATES[outcode]

    # Check prefix (e.g. "HP5 1AA" -> "HP5")
    for key, coords in UK_POSTCODE_COORDINATES.items():
        if outcode.startswith(key):
            return coords

    return None, None


def create_point_geom(lat: Optional[float], lon: Optional[float], is_postgres: bool = True) -> Any:
    """Create PostGIS WKTElement point geometry if postgres is active."""
    if lat is None or lon is None or not is_postgres:
        return None
    return WKTElement(f"POINT({lon} {lat})", srid=4326)


def calculate_haversine_distance_km(
    lat1: Optional[float], lon1: Optional[float],
    lat2: Optional[float], lon2: Optional[float]
) -> Optional[float]:
    """
    Calculate geodesic distance in kilometres between two coordinate pairs using Haversine formula.
    """
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return None

    # Earth radius in kilometers
    R = 6371.0

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    distance = R * c
    return round(distance, 2)

