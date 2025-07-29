from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List

from .database import SessionLocal, engine, get_db
from .models import User, ChatSession, TimerSession, JournalEntry, Base
from .schemas import (
    UserCreate, UserResponse, Token, ChatMessage, ChatResponse,
    TimerSessionCreate, TimerSessionResponse, JournalEntryCreate, 
    JournalEntryResponse, DashboardStats
)
from .auth import (
    authenticate_user, create_access_token, get_current_user,
    get_password_hash, get_user_by_email, ACCESS_TOKEN_EXPIRE_MINUTES
)
from .ai_service import AIService

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Calmlytic API", description="Mental Reset App API")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    hashed_password = get_password_hash(user.password)
    db_user = User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.post("/chat", response_model=ChatResponse)
async def create_chat_session(
    chat_message: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ai_response = await AIService.get_mental_health_response(chat_message.message, chat_message.language)
    
    db_chat = ChatSession(
        user_id=current_user.id,
        message=chat_message.message,
        ai_response=ai_response
    )
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)
    return db_chat

@app.get("/chat/history", response_model=List[ChatResponse])
async def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(ChatSession).filter(ChatSession.user_id == current_user.id).order_by(ChatSession.created_at.desc()).limit(20).all()

@app.post("/timer", response_model=TimerSessionResponse)
async def create_timer_session(
    timer_data: TimerSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_timer = TimerSession(
        user_id=current_user.id,
        session_type=timer_data.session_type,
        duration_minutes=timer_data.duration_minutes
    )
    db.add(db_timer)
    db.commit()
    db.refresh(db_timer)
    return db_timer

@app.put("/timer/{timer_id}/complete")
async def complete_timer_session(
    timer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    timer = db.query(TimerSession).filter(
        TimerSession.id == timer_id,
        TimerSession.user_id == current_user.id
    ).first()
    if not timer:
        raise HTTPException(status_code=404, detail="Timer session not found")
    
    timer.completed = True
    db.commit()
    return {"message": "Timer session completed"}

@app.get("/timer/history", response_model=List[TimerSessionResponse])
async def get_timer_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(TimerSession).filter(TimerSession.user_id == current_user.id).order_by(TimerSession.created_at.desc()).limit(20).all()

@app.post("/journal", response_model=JournalEntryResponse)
async def create_journal_entry(
    journal_data: JournalEntryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_journal = JournalEntry(
        user_id=current_user.id,
        title=journal_data.title,
        content=journal_data.content
    )
    db.add(db_journal)
    db.commit()
    db.refresh(db_journal)
    return db_journal

@app.get("/journal", response_model=List[JournalEntryResponse])
async def get_journal_entries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(JournalEntry).filter(JournalEntry.user_id == current_user.id).order_by(JournalEntry.created_at.desc()).all()

@app.get("/quote")
async def get_daily_quote():
    return {"quote": AIService.get_daily_quote()}

@app.get("/breathing-exercise")
async def get_breathing_exercise():
    return {
        "title": "4-7-8 Breathing Exercise",
        "instructions": [
            "Sit comfortably with your back straight",
            "Exhale completely through your mouth",
            "Close your mouth and inhale through your nose for 4 counts",
            "Hold your breath for 7 counts",
            "Exhale through your mouth for 8 counts",
            "Repeat this cycle 3-4 times"
        ],
        "duration_seconds": 60
    }

@app.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_chat_sessions = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).count()
    total_timer_sessions = db.query(TimerSession).filter(TimerSession.user_id == current_user.id).count()
    completed_timer_sessions = db.query(TimerSession).filter(
        TimerSession.user_id == current_user.id,
        TimerSession.completed == True
    ).count()
    total_journal_entries = db.query(JournalEntry).filter(JournalEntry.user_id == current_user.id).count()
    
    from sqlalchemy import func, or_
    from datetime import datetime, timedelta
    
    current_streak = 0
    check_date = datetime.now().date()
    
    while True:
        day_activity = db.query(
            or_(
                ChatSession.created_at >= check_date,
                TimerSession.created_at >= check_date,
                JournalEntry.created_at >= check_date
            )
        ).filter(
            or_(
                ChatSession.user_id == current_user.id,
                TimerSession.user_id == current_user.id,
                JournalEntry.user_id == current_user.id
            )
        ).first()
        
        if day_activity:
            current_streak += 1
            check_date -= timedelta(days=1)
        else:
            break
    
    return DashboardStats(
        total_chat_sessions=total_chat_sessions,
        total_timer_sessions=total_timer_sessions,
        completed_timer_sessions=completed_timer_sessions,
        total_journal_entries=total_journal_entries,
        current_streak=current_streak
    )
