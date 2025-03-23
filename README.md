
# Document Management with RAG Q&A

A full-stack application for document management with Retrieval-Augmented Generation (RAG) for question answering.

## Features

- Document upload, management, and selection
- Chat interface for asking questions about your documents
- Source references for answers
- Basic RAG implementation with document retrieval

## Technology Stack

- **Frontend**: React, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, Python
- **RAG**: Basic document retrieval with keyword matching (can be extended with LangChain/LlamaIndex)

## Getting Started

### Using Docker (Recommended)

1. Make sure you have Docker and Docker Compose installed.
2. Run the application stack:
   ```bash
   docker-compose up
   ```
3. Visit `http://localhost:3000` in your browser.

### Manual Setup

#### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the backend server:
   ```bash
   uvicorn main:app --reload
   ```

#### Frontend

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Visit `http://localhost:3000` in your browser.

## Development

- The backend serves as a basic RAG implementation with document storage.
- The frontend allows document management and chat interactions.
- Documents are stored in the `backend/data/documents` directory.
- Document metadata is stored in `backend/data/db.json`.

## Future Improvements

- Add proper document embedding and vector storage
- Implement LangChain or LlamaIndex for advanced RAG capabilities
- Add user authentication and document permissions
- Implement real-time chat updates
- Support more document types and formats
