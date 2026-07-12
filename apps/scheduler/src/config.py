import os
from dotenv import load_dotenv

# Load env variables
load_dotenv()

class Config:
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://127.0.0.1:27017/school-timetable-system')
    REDIS_URL = os.getenv('REDIS_URL', 'redis://127.0.0.1:6379')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    NODE_ENV = os.getenv('NODE_ENV', 'development')
