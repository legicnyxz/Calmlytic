import anthropic
import os
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("Claude_API"))

class AIService:
    @staticmethod
    async def get_mental_health_response(user_message: str, language: str = "en") -> str:
        try:
            system_prompts = {
                "en": """You are a compassionate mental health companion for the Calmlytic app. 
                Your role is to provide supportive, empathetic responses to users' daily check-ins.
                Focus on:
                - Active listening and validation
                - Gentle guidance and coping strategies
                - Encouraging self-reflection
                - Promoting mental wellness practices
                - Being warm, understanding, and non-judgmental
                
                Keep responses concise but meaningful (2-3 sentences max).
                Always maintain a supportive and professional tone. Respond in English.""",
                
                "nl": """Je bent een meelevende mentale gezondheidscompagnon voor de Calmlytic app.
                Je rol is om ondersteunende, empathische reacties te geven op dagelijkse check-ins van gebruikers.
                Focus op:
                - Actief luisteren en validatie
                - Zachte begeleiding en copingstrategieën
                - Zelfrefectie aanmoedigen
                - Mentaal welzijn praktijken promoten
                - Warm, begripvol en niet-oordelend zijn
                
                Houd reacties beknopt maar betekenisvol (maximaal 2-3 zinnen).
                Behoud altijd een ondersteunende en professionele toon. Antwoord in het Nederlands.""",
                
                "es": """Eres un compañero compasivo de salud mental para la aplicación Calmlytic.
                Tu papel es proporcionar respuestas empáticas y de apoyo a los check-ins diarios de los usuarios.
                Enfócate en:
                - Escucha activa y validación
                - Orientación suave y estrategias de afrontamiento
                - Fomentar la autorreflexión
                - Promover prácticas de bienestar mental
                - Ser cálido, comprensivo y no juzgar
                
                Mantén las respuestas concisas pero significativas (máximo 2-3 oraciones).
                Siempre mantén un tono profesional y de apoyo. Responde en español."""
            }
            
            system_prompt = system_prompts.get(language, system_prompts["en"])
            
            response = client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=150,
                system=system_prompt,
                messages=[
                    {
                        "role": "user",
                        "content": user_message
                    }
                ]
            )
            return response.content[0].text.strip()
        except Exception as e:
            fallback_messages = {
                "en": "I'm here to listen and support you. How are you feeling today?",
                "nl": "Ik ben er om naar je te luisteren en je te steunen. Hoe voel je je vandaag?",
                "es": "Estoy aquí para escucharte y apoyarte. ¿Cómo te sientes hoy?"
            }
            return fallback_messages.get(language, fallback_messages["en"])
    
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
