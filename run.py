from config import ProdConfig, DevConfig, TestConfig
from main import create_app


if __name__ == "__main__":
    app = create_app(DevConfig)
    app.run()