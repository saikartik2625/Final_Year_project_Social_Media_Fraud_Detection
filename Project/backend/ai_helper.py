import requests
import os
import json
from dotenv import load_dotenv

load_dotenv()

# Setup Groq Config
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL_NAME = "qwen/qwen3.8-27b" # Ultra-fast and high performance on Groq
API_URL = "https://api.groq.com/openai/v1/chat/completions"

def get_fraud_insight(prediction_data, risk_level, probability):
    """
    Generate expert insight using Groq Llama-3 (High Speed).
    """
    if not GROQ_API_KEY:
        return "Insight unavailable: Missing API Key."

    prompt = f"""
    Internal ML Model Result for a Social Media Account:
    - Risk Level: {risk_level}
    - Fraud Probability: {probability}%
    - Features Provided: {prediction_data}

    As a cybersecurity expert, explain this result based ONLY on the provided features.
    
    STRICT CONSTRAINTS:
    1. DO NOT mention 'email' or 'email address'. The system DOES NOT take email as a feature for prediction.
    2. Stick only to: Username, Fullname, Post Count, Followers, Following, Bio/Description, Profile Pic, and Privacy State.
    3. If 'Likely Genuine', provide a 2-3 sentence positive observation.
    4. If 'Suspicious' or 'Fraudulent', provide a 2-3 sentence analysis and warning.
    
    Be professional, direct, and concise. Avoid complex jargon.
    """

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": "You are a cybersecurity expert specialized in social media fraud detection. You provide insights based strictly on user metadata like post counts, follower ratios, and profile completeness. You never speculate on emails or hidden data."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.4, # Lower temperature for higher accuracy
        "max_tokens": 150
    }

    try:
        response = requests.post(API_URL, json=payload, headers=headers)
        response_data = response.json()
        
        if response.status_code == 200:
            insight = response_data['choices'][0]['message']['content']
            print(f"✅ Groq AI Insight generated successfully.")
            return insight.strip()
        else:
            print(f"⚠️ Groq API Error ({response.status_code}): {response.text}")
            return "Manual verification recommended based on behavioral score patterns."
            
    except Exception as e:
        print(f"❌ Groq Connection Error: {e}")
        return "Manual verification recommended based on current behavioral markers."

def get_chat_response(user_message, chat_history=[], context=None):
    """
    Handle general safety questions using Groq Llama-3.
    """
    if not GROQ_API_KEY:
        return "I'm currently disconnected from the safety network."

    system_prompt = f"""You are the official Safety Assistant for the Social Media Fraud Detection System (developed by Sanyu Paul).
    About this App:
    - It is an AI-powered security platform that detects fake/bot accounts using Deep Behavioral Analysis.
    - It provides a risk level (Genuine, Suspicious, Fraudulent) and a detailed probability score.
    - You are powered by Groq's Llama-3 (70B) model for instantaneous safety advice.
    """
    
    if context:
        input_data = context.get('input', {})
        result_data = context.get('result', {})
        system_prompt += f"""
        CURRENT CONTEXT:
        The user has just analyzed an account with the following details:
        - Username: {input_data.get('username')}
        - Risk Assessment: {result_data.get('risk_level')}
        - Fraud Probability: {result_data.get('probability')}%
        - Key Reason: {result_data.get('message')}
        
        If the user asks about 'this account' or 'my search', answer using the above data.
        """

    system_prompt += "\nInstruction: Help users understand fraud, fake accounts, and online safety. Keep answers brief and professional."
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    messages = [{"role": "system", "content": system_prompt}]
    
    # Add history
    for msg in chat_history:
        role = "user" if msg['role'] == "user" else "assistant"
        text = msg['parts'][0] if isinstance(msg['parts'], list) else msg['text'] if 'text' in msg else ""
        if text:
            messages.append({"role": role, "content": text})
    
    # Add current message
    messages.append({"role": "user", "content": user_message})

    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 300
    }

    try:
        response = requests.post(API_URL, json=payload, headers=headers)
        response_data = response.json()
        
        if response.status_code == 200:
            reply = response_data['choices'][0]['message']['content']
            print(f"✅ Groq AI Chat responded successfully.")
            return reply.strip()
        else:
            print(f"⚠️ Groq API Chat Error ({response.status_code}): {response.text}")
            return "I'm having trouble connecting to the brain. Please try again in a moment."
            
    except Exception as e:
        print(f"❌ Groq Chat Connection Error: {e}")
        return "I'm having trouble connecting to the brain. Please try again in a moment."
