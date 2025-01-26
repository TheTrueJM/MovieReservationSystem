from config import ProdConfig, DevConfig, TestConfig
from main import create_app

from models import *

if __name__ == "__main__":
    app = create_app(DevConfig)
    app.run()