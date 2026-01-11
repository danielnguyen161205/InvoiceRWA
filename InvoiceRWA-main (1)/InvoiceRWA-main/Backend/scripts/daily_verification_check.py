"""
Daily script to check and reset expired organization verifications
Run this script daily via cron job or task scheduler
"""

import sys
import os
from datetime import datetime

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.services.verification_service import VerificationService
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('verification_check.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)


def main():
    """
    Main function to check and reset expired verifications
    """
    logger.info("Starting daily verification expiry check...")
    
    db = SessionLocal()
    try:
        reset_count = VerificationService.check_expired_verifications(db)
        
        if reset_count > 0:
            logger.info(f"Successfully reset {reset_count} expired verifications")
        else:
            logger.info("No expired verifications found")
            
    except Exception as e:
        logger.error(f"Error during verification check: {str(e)}")
        raise
    finally:
        db.close()
        
    logger.info("Daily verification expiry check completed")


if __name__ == "__main__":
    main()