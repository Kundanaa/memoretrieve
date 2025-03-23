
# RAG Document Backend

This is a simple FastAPI backend for a RAG-based document Q&A system.

## Getting Started

1. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

3. The API will be available at http://localhost:8000

## API Endpoints

- `GET /documents` - Get all documents
- `POST /documents` - Upload a document
- `DELETE /documents/{doc_id}` - Delete a document
- `PUT /documents/{doc_id}/selection` - Toggle document selection
- `POST /chat` - Send a chat message

## Docker

You can also run the application using Docker:

```bash
docker build -t rag-backend .
docker run -p 8000:8000 rag-backend
```
