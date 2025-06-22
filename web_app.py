from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from scrapling.fetchers import StealthyFetcher
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
import uuid
import asyncio
from typing import Dict, List, Any
import os

if hasattr(asyncio, 'WindowsProactorEventLoopPolicy'):
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

StealthyFetcher.auto_match = True

app = FastAPI(title="AqlMind API", description="AI-Powered Website Chat API")

app.mount("/static", StaticFiles(directory="static"), name="static")

sessions: Dict[str, Dict[str, Any]] = {}

class LoadUrlRequest(BaseModel):
    api_key: str
    url: str

class ChatRequest(BaseModel):
    session_id: str
    message: str

class LoadUrlResponse(BaseModel):
    session_id: str
    message: str

class ChatResponse(BaseModel):
    response: str

@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Serve the main HTML page"""
    with open("index.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.post("/api/load-url", response_model=LoadUrlResponse)
def load_url(request: LoadUrlRequest):
    """Load and process a website URL"""
    try:
        session_id = str(uuid.uuid4())
        
        page = StealthyFetcher.fetch(
            request.url, 
            headless=True, 
            network_idle=True
        )
        
        sessions[session_id] = {
            "api_key": request.api_key,
            "url": request.url,
            "page_content": page.html_content,
            "conversation": [],
            "llm_messages": [
                SystemMessage(
                    content=f"You have to answer the question based on the content of the page: {page.html_content}"
                )
            ]
        }
        
        return LoadUrlResponse(
            session_id=session_id,
            message="Website loaded successfully"
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching URL: {str(e)}")

@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    """Process a chat message"""
    if request.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[request.session_id]
    
    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-exp",
            google_api_key=session["api_key"]
        )
        
        session["conversation"].append({
            "role": "user", 
            "content": request.message
        })
        session["llm_messages"].append(HumanMessage(content=request.message))
        
        response = llm.invoke(session["llm_messages"])
        response_content = response.content
        
        session["conversation"].append({
            "role": "assistant", 
            "content": response_content
        })
        session["llm_messages"].append(response)
        
        return ChatResponse(response=response_content)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting response: {str(e)}")

@app.delete("/api/session/{session_id}")
def clear_session(session_id: str):
    """Clear a session"""
    if session_id in sessions:
        session = sessions[session_id]
        session["conversation"] = []
        session["llm_messages"] = [
            SystemMessage(
                content=f"You have to answer the question based on the content of the page: {session['page_content']}"
            )
        ]
        return {"message": "Session cleared"}
    else:
        raise HTTPException(status_code=404, detail="Session not found")

@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "AqlMind API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
