#!/usr/bin/env python3
"""
Migration script to add password column to users table
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost/elif_db")
engine = create_engine(DATABASE_URL)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def add_password_column():
    """Add password column to users table and set default password for existing users"""
    
    with engine.connect() as connection:
        # Check if password column exists
        result = connection.execute(text("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'elif_db' 
            AND TABLE_NAME = 'users' 
            AND COLUMN_NAME = 'password'
        """)).fetchone()
        
        if not result:
            print("Adding password column to users table...")
            # Add password column
            connection.execute(text("""
                ALTER TABLE users 
                ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT ''
            """))
            connection.commit()
            print("Password column added successfully!")
            
            # Set default password for existing users (hashed version of "password123")
            default_password = get_password_hash("password123")
            connection.execute(text("""
                UPDATE users 
                SET password = :default_password 
                WHERE password = ''
            """), {"default_password": default_password})
            connection.commit()
            print("Default password set for existing users!")
        else:
            print("Password column already exists!")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

if __name__ == "__main__":
    add_password_column()
    print("Migration completed!")
