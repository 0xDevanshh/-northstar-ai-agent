# app/services/booking.py

import random

def attempt_booking(date: str, time: str) -> dict:
    """
    Simulates a site-visit booking attempt.
    ~80% success rate to demonstrate both success and failure handling.
    """
    success = random.random() < 0.8

    if success:
        return {
            "status": "confirmed",
            "date": date,
            "time": time,
            "project": "Project Northstar One",
            "location": "Sector 79, Gurugram",
        }
    else:
        return {
            "status": "failed",
            "reason": "Slot unavailable or booking system error",
        }