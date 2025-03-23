
# Document Management with RAG Q&A

A full-stack application for document management with Retrieval-Augmented Generation (RAG) for question answering.

## Features

- Document upload, management, and selection
- Chat interface for asking questions about your documents
- Source references for answers
- Advanced RAG implementation with LangChain and OpenAI
- Vector database (FAISS) for efficient semantic search

## Technology Stack

- **Frontend**: React, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, Python
- **RAG**: LangChain, OpenAI, FAISS vector database
- **Document Processing**: PDF, DOCX, and text document support

## Getting Started

### Environment Setup

1. Copy the example environment file and set your OpenAI API key:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

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

3. Set your OpenAI API key:
   ```bash
   export OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Run the backend server:
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

- The backend implements RAG using LangChain and OpenAI.
- Documents are processed to extract text, split into chunks, and stored in a vector database (FAISS).
- When a question is asked, the system retrieves relevant document chunks and uses them to generate an answer.
- Documents are stored in the `backend/data/documents` directory.
- Document embeddings are stored in the `backend/data/vectordb` directory.
- Document metadata is stored in `backend/data/db.json`.

## Future Improvements

- Add user authentication and document permissions
- Implement real-time chat updates
- Support more document types and formats
- Add document chunking options and chunk size configuration
- Add pre-processing options for better document extraction
