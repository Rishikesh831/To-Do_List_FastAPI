from fastapi import FastAPI, HTTPException
from typing import Optional
from pydantic import BaseModel

app = FastAPI(title="Mini To Do App")

# Models
class Task(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    deadline: Optional[int] = None
    done: bool = False

class Request(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: Optional[int] = None

# In-memory "database"
tasks: list[dict] = [
    {
        "id": 1,
        "title": "Buy groceries",
        "description": "Milk, Bread, Eggs",
        "deadline": 10,
        "done": False
    },
    {
        "id": 2,
        "title": "Walk the dog",
        "description": None,
        "deadline": None,
        "done": True
    }
]

# Helper
def get_next_id() -> int:
    return max((task["id"] for task in tasks), default=0) + 1

# Routes
@app.get("/")
def root():
    return {"message": "Todo API up. Next: POST /tasks (create)"}

@app.post("/tasks", response_model=Task)
def create_task(request: Request):
    new_task = {
        "id": get_next_id(),
        "title": request.title,
        "description": request.description,
        "deadline": request.deadline,
        "done": False
    }
    tasks.append(new_task)
    return new_task

@app.get("/tasks", response_model=list[Task])
def get_tasks():
    return tasks

@app.get("/tasks/{task_id}", response_model=Task)
def get_task(task_id: int):
    for task in tasks:
        if task["id"] == task_id:
            return task
    raise HTTPException(status_code=404, detail="Task not found")

@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, request: Request):
    for task in tasks:
        if task["id"] == task_id:
            task["title"] = request.title
            task["description"] = request.description
            task["deadline"] = request.deadline
            return task
    raise HTTPException(status_code=404, detail="Task not found")

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    global tasks
    if any(task["id"] == task_id for task in tasks):
        tasks = [task for task in tasks if task["id"] != task_id]
        return {"message": "Task deleted successfully"}
    raise HTTPException(status_code=404, detail="Task not found")
