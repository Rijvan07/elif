#!/usr/bin/env python3
"""
Script to check specific user in database
"""

from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost/elif_db")
engine = create_engine(DATABASE_URL)

def check_specific_user():
    """Check specific user in database"""
    
    with engine.connect() as connection:
        result = connection.execute(text("SELECT email FROM users WHERE email = 'rijvan07@example.com'")).fetchall()
        
        if not result:
            print("User 'rijvan07@example.com' NOT found in database")
        else:
            print("User 'rijvan07@example.com' ALREADY EXISTS in database")

if __name__ == "__main__":
    check_specific_user()
