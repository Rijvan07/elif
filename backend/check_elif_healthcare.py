#!/usr/bin/env python3
"""
Script to check users in elif_healthcare database
"""

from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection with elif_healthcare database
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost/elif_healthcare")
engine = create_engine(DATABASE_URL)

def check_users():
    """Check all users in elif_healthcare database"""
    
    with engine.connect() as connection:
        result = connection.execute(text("SELECT id, email, created_at FROM users")).fetchall()
        
        if not result:
            print("No users found in elif_healthcare database!")
        else:
            print(f"Found {len(result)} users in elif_healthcare database:")
            for user in result:
                print(f"  ID: {user[0]}, Email: {user[1]}, Created: {user[2]}")

def check_specific_user():
    """Check specific user in elif_healthcare database"""
    
    with engine.connect() as connection:
        result = connection.execute(text("SELECT email FROM users WHERE email = 'rijvan07@example.com'")).fetchall()
        
        if not result:
            print("User 'rijvan07@example.com' NOT found in elif_healthcare database")
        else:
            print("User 'rijvan07@example.com' ALREADY EXISTS in elif_healthcare database")

if __name__ == "__main__":
    check_users()
    print("\n--- Checking specific user ---")
    check_specific_user()
