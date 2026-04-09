#!/usr/bin/env python3
"""
Script to check existing users in database
"""

from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost/elif_db")
engine = create_engine(DATABASE_URL)

def check_users():
    """Check all users in the database"""
    
    with engine.connect() as connection:
        result = connection.execute(text("SELECT id, email, created_at FROM users")).fetchall()
        
        if not result:
            print("No users found in database!")
        else:
            print(f"Found {len(result)} users:")
            for user in result:
                print(f"  ID: {user[0]}, Email: {user[1]}, Created: {user[2]}")

if __name__ == "__main__":
    check_users()
