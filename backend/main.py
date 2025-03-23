
import os
import json
import uuid
import tempfile
from typing import List, Dict, Any, Optional
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException, Query, Body, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field
import uvicorn
from datetime import datetime

# Import LangChain components
from langchain_openai import OpenAIEmbeddings
from langchain_community.document_loaders import TextLoader, PyPDFLoader, Docx2txtLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_openai import ChatOpenAI
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

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
VECTOR_DB_PATH = Path("./data/vectordb")
VECTOR_DB_PATH.mkdir(parents=True, exist_ok=True)
SETTINGS_PATH = Path("./data/settings.json")

# Check for OpenAI API key
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
if not OPENAI_API_KEY:
    print("Warning: OPENAI_API_KEY not set. RAG functionality will be limited to mock responses.")

# Default RAG settings
DEFAULT_RAG_SETTINGS = {
    "chunk_size": 1000,
    "chunk_overlap": 200,
    "retrieval_k": 4,
    "temperature": 0,
    "model": "gpt-3.5-turbo-0125"
}

# Initialize settings if file doesn't exist
if not SETTINGS_PATH.exists():
    with open(SETTINGS_PATH, "w") as f:
        json.dump(DEFAULT_RAG_SETTINGS, f, indent=2)

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

# Load settings
def load_settings():
    with open(SETTINGS_PATH, "r") as f:
        return json.load(f)

# Save settings
def save_settings(settings):
    with open(SETTINGS_PATH, "w") as f:
        json.dump(settings, f, indent=2)

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

class RagSettings(BaseModel):
    chunk_size: int = Field(1000, ge=100, le=8000, description="Size of text chunks for processing")
    chunk_overlap: int = Field(200, ge=0, le=500, description="Overlap between text chunks")
    retrieval_k: int = Field(4, ge=1, le=20, description="Number of chunks to retrieve")
    temperature: float = Field(0, ge=0, le=2, description="Temperature for LLM generation")
    model: str = Field("gpt-3.5-turbo-0125", description="OpenAI model to use")

# Helper function to load a document based on its type
def load_document(file_path, file_type):
    try:
        if file_type.endswith('pdf'):
            return PyPDFLoader(file_path).load()
        elif file_type.endswith('docx') or file_type.endswith('doc'):
            return Docx2txtLoader(file_path).load()
        else:  # Default to text loader for other types
            return TextLoader(file_path).load()
    except Exception as e:
        print(f"Error loading document: {e}")
        return []

# Function to process a document and add it to the vector store
async def process_document(document_id, file_path, file_type):
    try:
        # Load settings
        settings = load_settings()
        
        # Load the document
        docs = load_document(str(file_path), file_type)
        
        if not docs:
            update_document_status(document_id, "error")
            return
        
        # Split the document into chunks using settings
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings["chunk_size"],
            chunk_overlap=settings["chunk_overlap"],
            separators=["\n\n", "\n", " ", ""]
        )
        chunks = text_splitter.split_documents(docs)
        
        # Add document information to chunks
        for chunk in chunks:
            chunk.metadata["document_id"] = document_id
        
        # Create embeddings and store in vector database
        if OPENAI_API_KEY:
            embeddings = OpenAIEmbeddings()
            doc_db_path = VECTOR_DB_PATH / document_id
            
            # Check if vector store already exists for this document
            if doc_db_path.exists():
                # Add to existing vector store
                db = FAISS.load_local(str(doc_db_path), embeddings)
                db.add_documents(chunks)
                db.save_local(str(doc_db_path))
            else:
                # Create new vector store
                db = FAISS.from_documents(chunks, embeddings)
                db.save_local(str(doc_db_path))
        
        # Update document status
        update_document_status(document_id, "completed")
    
    except Exception as e:
        print(f"Error processing document: {e}")
        update_document_status(document_id, "error")

# Helper function to update document status
def update_document_status(document_id, status):
    db = load_db()
    for i, doc in enumerate(db["documents"]):
        if doc["id"] == document_id:
            db["documents"][i]["status"] = status
            save_db(db)
            break

# Function to create combined vector store from selected documents
def get_retriever_for_selected_documents():
    if not OPENAI_API_KEY:
        return None
    
    settings = load_settings()
    db = load_db()
    selected_docs = [doc["id"] for doc in db["documents"] if doc["selected"]]
    
    if not selected_docs:
        return None
    
    try:
        embeddings = OpenAIEmbeddings()
        all_vector_stores = []
        
        for doc_id in selected_docs:
            doc_db_path = VECTOR_DB_PATH / doc_id
            if doc_db_path.exists():
                vector_store = FAISS.load_local(str(doc_db_path), embeddings)
                all_vector_stores.append(vector_store)
        
        if not all_vector_stores:
            return None
            
        # If there's only one vector store, use it directly
        if len(all_vector_stores) == 1:
            return all_vector_stores[0].as_retriever(search_kwargs={"k": settings["retrieval_k"]})
            
        # Otherwise, merge them
        combined_db = all_vector_stores[0]
        for vs in all_vector_stores[1:]:
            combined_db.merge_from(vs)
            
        return combined_db.as_retriever(search_kwargs={"k": settings["retrieval_k"]})
        
    except Exception as e:
        print(f"Error creating retriever: {e}")
        return None

# API Routes
@app.get("/documents")
async def get_documents():
    db = load_db()
    return {"success": True, "data": db["documents"]}

@app.post("/documents")
async def upload_document(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
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
        
        # Process document in background
        background_tasks.add_task(
            process_document, 
            doc_id, 
            file_path, 
            new_doc["type"]
        )
        
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
    
    # Remove vector database for this document
    doc_db_path = VECTOR_DB_PATH / doc_id
    if doc_db_path.exists():
        import shutil
        shutil.rmtree(doc_db_path)
    
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

@app.get("/rag-settings")
async def get_rag_settings():
    settings = load_settings()
    return {"success": True, "data": settings}

@app.put("/rag-settings")
async def update_rag_settings(settings: RagSettings):
    # Get current settings
    current_settings = load_settings()
    
    # Update settings with new values
    updated_settings = {**current_settings, **settings.dict()}
    
    # Save updated settings
    save_settings(updated_settings)
    
    # Note: If chunk size or overlap has changed, documents may need to be reprocessed
    # This could be added as a background task in a more advanced implementation
    
    return {"success": True, "data": updated_settings}

@app.post("/chat")
async def send_chat_message(message: str = Body(...)):
    try:
        db = load_db()
        settings = load_settings()
        selected_docs = [doc for doc in db["documents"] if doc["selected"]]
        
        # If OpenAI API key is not set or there are no selected documents,
        # fall back to mock responses
        if not OPENAI_API_KEY or not selected_docs:
            return generate_mock_response(message, selected_docs)
        
        # Get the retriever for selected documents
        retriever = get_retriever_for_selected_documents()
        
        if not retriever:
            return generate_mock_response(message, selected_docs)
        
        # Define RAG prompt template
        template = """
        You are a helpful assistant that answers questions based on the provided context from documents.
        
        Context:
        {context}
        
        Question: {question}
        
        Answer the question based only on the provided context. If you cannot find the answer in the context, 
        say "I couldn't find specific information about that in the uploaded documents." Don't make up information.
        Provide a comprehensive answer with specific details from the documents.
        """
        
        # Create RAG chain
        llm = ChatOpenAI(
            temperature=settings["temperature"], 
            model=settings["model"]
        )
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            chain_type_kwargs={
                "prompt": PromptTemplate(
                    template=template,
                    input_variables=["context", "question"]
                )
            },
            return_source_documents=True
        )
        
        # Generate response
        result = qa_chain.invoke({"query": message})
        answer = result.get("result", "")
        source_docs = result.get("source_documents", [])
        
        # Process source documents to create references
        sources = []
        seen_doc_ids = set()
        
        for doc in source_docs:
            doc_id = doc.metadata.get("document_id")
            if not doc_id or doc_id in seen_doc_ids:
                continue
                
            seen_doc_ids.add(doc_id)
            
            # Find document name from doc_id
            doc_name = ""
            for document in db["documents"]:
                if document["id"] == doc_id:
                    doc_name = document["name"]
                    break
            
            # Get excerpts from this document
            excerpts = [d.page_content for d in source_docs if d.metadata.get("document_id") == doc_id]
            if excerpts:
                sources.append({
                    "documentId": doc_id,
                    "documentName": doc_name,
                    "excerpts": excerpts[:3],  # Limit to 3 excerpts per document
                    "relevanceScore": 0.95  # Placeholder score
                })
        
        # Create response
        response = {
            "id": str(uuid.uuid4()),
            "role": "assistant",
            "content": answer,
            "timestamp": int(datetime.now().timestamp() * 1000),
            "sources": sources
        }
        
        return {"success": True, "data": response}
    
    except Exception as e:
        print(f"Error in chat: {e}")
        return {
            "success": True,
            "data": {
                "id": str(uuid.uuid4()),
                "role": "assistant",
                "content": "I'm sorry, but I encountered an error processing your question. Please try again.",
                "timestamp": int(datetime.now().timestamp() * 1000)
            }
        }

def generate_mock_response(message, selected_docs):
    """Generate a mock response when RAG functionality is unavailable"""
    # ... keep existing code (mock response generation logic)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
