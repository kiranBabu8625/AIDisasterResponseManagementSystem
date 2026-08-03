from pydantic import BaseModel

class ResourceCreate(BaseModel):
    name: str
    quantity: int
    location: str


class ResourceResponse(ResourceCreate):
    id: int

    class Config:
        from_attributes = True