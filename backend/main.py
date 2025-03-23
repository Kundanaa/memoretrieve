
import os
import json
import uuid
from typing import List, Dict, Any, Optional
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field
import uvicorn
from datetime import datetime

# Create FastAPI app
app = FastAPI(title="Document RAG API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Storage paths
UPLOAD_DIR = Path("./data/documents")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = Path("./data/db.json")

# Initialize database if it doesn't exist
if not DB_PATH.exists():
    with open(DB_PATH, "w") as f:
        json.dump({"documents": [], "chat_sessions": []}, f)

# Load database
def load_db():
    with open(DB_PATH, "r") as f:
        return json.load(f)

# Save database
def save_db(db):
    with open(DB_PATH, "w") as f:
        json.dump(db, f, indent=2)

# Models
class Document(BaseModel):
    id: str
    name: str
    type: str
    size: int
    uploadedAt: str
    status: str = "pending"
    selected: bool = False

class ChatMessage(BaseModel):
    id: str
    role: str
    content: str
    timestamp: int
    sources: Optional[List[Dict[str, Any]]] = None

class DocumentSource(BaseModel):
    documentId: str
    documentName: str
    excerpts: List[str]
    relevanceScore: float

# API Routes
@app.get("/documents")
async def get_documents():
    db = load_db()
    return {"success": True, "data": db["documents"]}

@app.post("/documents")
async def upload_document(file: UploadFile = File(...)):
    try:
        # Generate unique ID
        doc_id = str(uuid.uuid4())
        
        # Save file
        file_path = UPLOAD_DIR / f"{doc_id}_{file.filename}"
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Create document record
        new_doc = {
            "id": doc_id,
            "name": file.filename,
            "type": file.content_type or "application/octet-stream",
            "size": file.size,
            "uploadedAt": datetime.now().isoformat(),
            "status": "processing",
            "selected": False
        }
        
        # Update database
        db = load_db()
        db["documents"].append(new_doc)
        save_db(db)
        
        # Simulate processing (in a real app, this would be a background task)
        # Here we're just updating the status to "completed" immediately
        new_doc["status"] = "completed"
        for i, doc in enumerate(db["documents"]):
            if doc["id"] == doc_id:
                db["documents"][i] = new_doc
                break
        save_db(db)
        
        return {"success": True, "data": new_doc}
    
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    db = load_db()
    
    # Find document
    found = False
    for i, doc in enumerate(db["documents"]):
        if doc["id"] == doc_id:
            # Remove from database
            db["documents"].pop(i)
            found = True
            break
    
    if not found:
        return {"success": False, "error": "Document not found"}
    
    # Remove file
    for file in UPLOAD_DIR.glob(f"{doc_id}_*"):
        file.unlink()
    
    save_db(db)
    return {"success": True}

@app.put("/documents/{doc_id}/selection")
async def update_document_selection(doc_id: str, selected: bool = Body(...)):
    db = load_db()
    
    # Find and update document
    found = False
    updated_doc = None
    for i, doc in enumerate(db["documents"]):
        if doc["id"] == doc_id:
            db["documents"][i]["selected"] = selected
            updated_doc = db["documents"][i]
            found = True
            break
    
    if not found:
        return {"success": False, "error": "Document not found"}
    
    save_db(db)
    return {"success": True, "data": updated_doc}

@app.post("/chat")
async def send_chat_message(message: str = Body(...)):
    db = load_db()
    
    # Mock response generation based on selected documents
    selected_docs = [doc for doc in db["documents"] if doc["selected"]]
    
    # Generate response based on the query and selected documents
    # In a real implementation, this would use LangChain or similar for RAG
    response_text = ""
    sources = []
    
    # Simple keyword matching for demo purposes
    if "revenue" in message.lower() or "financial" in message.lower():
        response_text = "Based on the documents, revenue increased by 12% in 2023 compared to the previous year. The company is financially stable and planning expansion into European markets."
        if len(selected_docs) > 0:
            sources = [{
                "documentId": selected_docs[0]["id"],
                "documentName": selected_docs[0]["name"],
                "excerpts": ["According to our financial results, revenue increased by 12% in 2023 compared to the previous year."],
                "relevanceScore": 0.92
            }]
            if len(selected_docs) > 1:
                sources.append({
                    "documentId": selected_docs[1]["id"],
                    "documentName": selected_docs[1]["name"], 
                    "excerpts": ["The project timeline estimates completion within 8 months from approval."],
                    "relevanceScore": 0.75
                })
    elif "project" in message.lower() or "timeline" in message.lower():
        response_text = "According to the Project Proposal document, the project timeline estimates completion within 8 months from approval."
        if len(selected_docs) > 0:
            sources = [{
                "documentId": selected_docs[0]["id"],
                "documentName": selected_docs[0]["name"],
                "excerpts": ["The project timeline estimates completion within 8 months from approval."],
                "relevanceScore": 0.75
            }]
    else:
        response_text = "I couldn't find specific information about that in the uploaded documents. Could you please rephrase your question or upload more relevant documents?"
    
    # Prepare response
    response = {
        "id": str(uuid.uuid4()),
        "role": "assistant",
        "content": response_text,
        "timestamp": int(datetime.now().timestamp() * 1000),
        "sources": sources
    }
    
    return {"success": True, "data": response}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
