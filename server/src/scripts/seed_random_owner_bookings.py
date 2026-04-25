#!/usr/bin/env python3
"""Seed random future booking slots for real OWNER users.

Usage:
    python3 src/scripts/seed_random_owner_bookings.py 25
    python3 src/scripts/seed_random_owner_bookings.py 25 --dry-run
"""

from __future__ import annotations

import argparse
import os
import random
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

try:
    from faker import Faker
    from pymongo import MongoClient
except ImportError as exc:
    missing_package = exc.name
    print(
        f"Missing Python package: {missing_package}\n"
        "Install dependencies with: python3 -m pip install -r requirements.txt",
        file=sys.stderr,
    )
    raise SystemExit(1) from exc


SCRIPT_DIR = Path(__file__).resolve().parent
SERVER_DIR = SCRIPT_DIR.parents[1]
ENV_PATH = SERVER_DIR / ".env"
DEFAULT_DB_NAME = "test"


def load_env_file(path: Path) -> None:
    if not path.exists():
        return

    for raw_line in path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Seed random future public booking slots for real owner ids.",
    )
    parser.add_argument("count", type=int, help="Number of booking slots to create.")
    parser.add_argument(
        "--min-days",
        type=int,
        default=1,
        help="Earliest booking date offset from today. Default: 1.",
    )
    parser.add_argument(
        "--max-days",
        type=int,
        default=45,
        help="Latest booking date offset from today. Default: 45.",
    )
    parser.add_argument(
        "--min-capacity",
        type=int,
        default=1,
        help="Smallest booking capacity. Default: 1.",
    )
    parser.add_argument(
        "--max-capacity",
        type=int,
        default=5,
        help="Largest booking capacity. Default: 5.",
    )
    parser.add_argument(
        "--visibility",
        choices=("public", "private"),
        default="public",
        help="Booking visibility. Default: public.",
    )
    parser.add_argument(
        "--db-name",
        default=os.environ.get("MONGODB_DB_NAME", DEFAULT_DB_NAME),
        help="Database name when the Mongo URI does not include one. Default: test.",
    )
    parser.add_argument("--seed", type=int, default=None)
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print sample bookings without inserting them.",
    )
    return parser.parse_args()


def validate_args(args: argparse.Namespace) -> None:
    if args.count <= 0:
        raise ValueError("count must be greater than 0.")
    if args.min_days < 0:
        raise ValueError("--min-days cannot be negative.")
    if args.max_days < args.min_days:
        raise ValueError("--max-days must be greater than or equal to --min-days.")
    if args.min_capacity <= 0:
        raise ValueError("--min-capacity must be greater than 0.")
    if args.max_capacity < args.min_capacity:
        raise ValueError("--max-capacity must be greater than or equal to --min-capacity.")


def random_future_start(args: argparse.Namespace) -> datetime:
    now = datetime.now(timezone.utc)
    day_offset = random.randint(args.min_days, args.max_days)
    hour = random.randint(8, 17)
    minute = random.choice((0, 30))

    start = now + timedelta(days=day_offset)
    return start.replace(hour=hour, minute=minute, second=0, microsecond=0)


def make_booking(owner_id, fake: Faker, args: argparse.Namespace) -> dict:
    start_time = random_future_start(args)
    duration_minutes = random.choice((30, 45, 60, 90))
    now = datetime.now(timezone.utc)

    return {
        "ownerId": owner_id,
        "title": f"{fake.bs().title()} {fake.random_number(digits=3)}",
        "description": fake.sentence(nb_words=random.randint(8, 16)),
        "startTime": start_time,
        "endTime": start_time + timedelta(minutes=duration_minutes),
        "visibility": args.visibility,
        "status": "open",
        "participants": [],
        "capacity": random.randint(args.min_capacity, args.max_capacity),
        "createdAt": now,
        "updatedAt": now,
    }


def main() -> int:
    load_env_file(ENV_PATH)
    args = parse_args()
    validate_args(args)

    mongo_uri = os.environ.get("MONGODB_URI")
    if not mongo_uri:
        print("MONGODB_URI is required in server/.env or the environment.", file=sys.stderr)
        return 1

    if args.seed is not None:
        random.seed(args.seed)
        Faker.seed(args.seed)

    fake = Faker()
    client = MongoClient(mongo_uri)
    db = client.get_default_database(default=args.db_name)

    owners = list(db.users.find({"role": "OWNER"}, {"_id": 1, "name": 1, "email": 1}))
    if not owners:
        print("No OWNER users found. Create or seed owners first.", file=sys.stderr)
        return 1

    bookings = [
        make_booking(random.choice(owners)["_id"], fake, args)
        for _ in range(args.count)
    ]

    if args.dry_run:
        print(f"Dry run: would insert {len(bookings)} bookings into {db.name}.bookings")
        for booking in bookings[:5]:
            print(
                f"- ownerId={booking['ownerId']} "
                f"startTime={booking['startTime'].isoformat()} "
                f"capacity={booking['capacity']} "
                f"title={booking['title']}"
            )
        return 0

    result = db.bookings.insert_many(bookings)
    print(f"Inserted {len(result.inserted_ids)} bookings into {db.name}.bookings")
    print(f"Used {len(owners)} real owner ids.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except ValueError as error:
        print(error, file=sys.stderr)
        raise SystemExit(1) from error
