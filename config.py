import os
from dotenv import load_dotenv


load_dotenv()


class Config:
    SECRET_KEY: str = os.getenv("SECRET_KEY", "secret") ### Change
    SQLALCHEMY_DATABASE_URI: str = os.getenv("DATABASE_URI")
    DEBUG: bool = False


class ProdConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URI", "sqlite:///prod.db")

class DevConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URI", "sqlite:///dev.db")
    DEBUG = os.getenv("DEBUG", True)

class TestConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URI", "sqlite:///test.db")