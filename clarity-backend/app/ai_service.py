import anthropic
import os
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("CLAUDE_API_KEY"))

class AIService:
    @staticmethod
    async def get_mental_health_response(user_message: str) -> str:
        try:
            response = client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=150,
                system="""You are a compassionate mental health companion for the Clarity app. 
                Your role is to provide supportive, empathetic responses to users' daily check-ins.
                Focus on:
                - Active listening and validation
                - Gentle guidance and coping strategies
                - Encouraging self-reflection
                - Promoting mental wellness practices
                - Being warm, understanding, and non-judgmental
                
                Keep responses concise but meaningful (2-3 sentences max).
                Always maintain a supportive and professional tone.""",
                messages=[
                    {
                        "role": "user",
                        "content": user_message
                    }
                ]
            )
            return response.content[0].text.strip()
        except Exception as e:
            return "I'm here to listen and support you. How are you feeling today?"
    
    @staticmethod
    def get_daily_quote() -> str:
        quotes = [
            "The present moment is the only time over which we have dominion. - Thich Nhat Hanh",
            "You are not your thoughts. You are the observer of your thoughts. - Eckhart Tolle",
            "Peace comes from within. Do not seek it without. - Buddha",
            "The mind is everything. What you think you become. - Buddha",
            "Breathe in peace, breathe out stress.",
            "Every moment is a fresh beginning. - T.S. Eliot",
            "You have been assigned this mountain to show others it can be moved.",
            "Progress, not perfection.",
            "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity.",
            "It's okay to not be okay. It's not okay to stay that way."
        ]
        import random
        return random.choice(quotes)
