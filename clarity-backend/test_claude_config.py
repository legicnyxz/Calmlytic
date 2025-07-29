import os
import anthropic
from dotenv import load_dotenv

load_dotenv()

print("=== Environment Variable Check ===")
claude_api_key = os.getenv("CLAUDE_API_KEY")
if claude_api_key:
    print(f"CLAUDE_API_KEY found: {claude_api_key[:10]}...{claude_api_key[-4:] if len(claude_api_key) > 14 else 'short'}")
else:
    print("CLAUDE_API_KEY not found in environment")

claude_api_secret = os.getenv("Claude_API")
if claude_api_secret:
    print(f"Claude_API secret found: {claude_api_secret[:10]}...{claude_api_secret[-4:] if len(claude_api_secret) > 14 else 'short'}")
else:
    print("Claude_API secret not found in environment")

print("\n=== Testing Claude API Connection ===")
try:
    if claude_api_key:
        client = anthropic.Anthropic(api_key=claude_api_key)
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=50,
            system="You are a test assistant. Respond with 'Claude API is working correctly!'",
            messages=[{"role": "user", "content": "Test message"}]
        )
        print(f"✅ Claude API test successful with CLAUDE_API_KEY: {response.content[0].text}")
    else:
        print("❌ Cannot test Claude API - CLAUDE_API_KEY not found")
        
    if claude_api_secret:
        client2 = anthropic.Anthropic(api_key=claude_api_secret)
        response2 = client2.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=50,
            system="You are a test assistant. Respond with 'Claude API is working correctly!'",
            messages=[{"role": "user", "content": "Test message"}]
        )
        print(f"✅ Claude API test successful with Claude_API secret: {response2.content[0].text}")
    else:
        print("❌ Cannot test Claude API - Claude_API secret not found")
        
except Exception as e:
    print(f"❌ Claude API test failed: {str(e)}")

print("\n=== Current Backend Configuration ===")
backend_env_path = "/home/ubuntu/clarity-app/clarity-backend/.env"
if os.path.exists(backend_env_path):
    print(f"Backend .env file exists at: {backend_env_path}")
    with open(backend_env_path, 'r') as f:
        content = f.read()
        print("Backend .env contents:")
        for line in content.split('\n'):
            if line.strip():
                if 'API' in line:
                    key, value = line.split('=', 1) if '=' in line else (line, '')
                    if value and len(value) > 10:
                        print(f"  {key}={value[:10]}...{value[-4:]}")
                    else:
                        print(f"  {line}")
                else:
                    print(f"  {line}")
else:
    print("Backend .env file not found")
