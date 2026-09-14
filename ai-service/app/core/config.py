from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "HR Helper AI Service"
    port: int = 8000
    model_name: str = "all-MiniLM-L6-v2"

    class Config:
        env_file = ".env"


settings = Settings()
