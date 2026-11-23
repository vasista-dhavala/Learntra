from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Allow requests from the React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Item(BaseModel):
    name: str

items = [{"name": "Sample Item"},
         {"name": "Soma Item"},
         {"name": "Prem Hero"}]

@app.get("/api/items")
def get_items():
    return items

@app.post("/api/items")
def create_item(item: Item):
    items.append(item.model_dump())
    return item
