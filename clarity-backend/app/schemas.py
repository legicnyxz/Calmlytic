from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ChatMessage(BaseModel):
    message: str
    language: str = "en"

class ChatResponse(BaseModel):
    id: int
    message: str
    ai_response: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class TimerSessionCreate(BaseModel):
    session_type: str
    duration_minutes: int

class TimerSessionResponse(BaseModel):
    id: int
    session_type: str
    duration_minutes: int
    completed: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class JournalEntryCreate(BaseModel):
    title: Optional[str] = None
    content: str

class JournalEntryResponse(BaseModel):
    id: int
    title: Optional[str]
    content: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_chat_sessions: int
    total_timer_sessions: int
    completed_timer_sessions: int
    total_journal_entries: int
    current_streak: int
