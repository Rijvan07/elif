#!/usr/bin/env python3
"""
Test database connection
"""

from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:root@localhost:3306/elif_healthcare")

def test_connection():
    """Test database connection"""
    
    try:
        print(f"Testing connection to: {DATABASE_URL}")
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1")).fetchone()
            print("Database connection successful!")
            print(f"Test query result: {result}")
            
            # Check if users table exists
            table_result = connection.execute(text("""
                SELECT COUNT(*) as count FROM users
            """)).fetchone()
            print(f"Users table has {table_result[0]} records")
            
    except Exception as e:
        print(f"Database connection failed: {e}")
        print(f"Error type: {type(e).__name__}")

if __name__ == "__main__":
    test_connection()
