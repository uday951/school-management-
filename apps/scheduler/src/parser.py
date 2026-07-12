import urllib.request
import json
from config import Config

class AIConstraintParser:
    @staticmethod
    def parse(prompt: str) -> dict:
        api_key = Config.GEMINI_API_KEY
        if not api_key:
            return {
                "success": False,
                "error": "Gemini API key is not configured in environmental variables."
            }
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        
        system_instruction = (
            "You are an AI scheduling assistant. Convert the user's natural language constraint "
            "into a structured JSON configuration representing timetable constraints. "
            "Output ONLY valid JSON matching this schema:\n"
            "{\n"
            "  \"targetEntity\": \"TEACHER\" | \"ROOM\" | \"SUBJECT\" | \"GLOBAL\",\n"
            "  \"identifierName\": \"string name (e.g. Mr. John, Physics Lab)\",\n"
            "  \"constraintType\": \"UNAVAILABILITY\" | \"PREFERRED_HOURS\",\n"
            "  \"scheduleTimes\": [\n"
            "    { \"dayOfWeek\": 1-5, \"periods\": [0-7] }\n"
            "  ]\n"
            "}"
        )

        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": f"{system_instruction}\n\nUser input: {prompt}"
                        }
                    ]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }
        
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={'Content-Type': 'application/json'},
                method='POST'
            )
            
            with urllib.request.urlopen(req, timeout=10) as response:
                res_data = json.loads(response.read().decode('utf-8'))
                text_output = res_data['candidates'][0]['content']['parts'][0]['text']
                parsed_json = json.loads(text_output.strip())
                return {
                    "success": True,
                    "data": parsed_json
                }
        except Exception as e:
            return {
                "success": False,
                "error": f"AI Parsing Exception: {str(e)}"
            }
export_parser = AIConstraintParser
