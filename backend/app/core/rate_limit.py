"""
setup for rate limiting using slowapi. The limiter is configured in main.py and applied to the chat 
    endpoints in chat.py. 
The real_ip function is used to get the client's IP address for rate limiting, which is important 
    when the app is behind a proxy or load balancer.

load testing the rate limits can be done using tools like locust or artillery, simulating multiple 
    requests to the chat endpoints and verifying that the limits are enforced correctly.
load test results (if available) can be added here to demonstrate the effectiveness of the rate 
    limiting in preventing abuse while allowing legitimate traffic.
"""

from fastapi import Request
from slowapi import Limiter

def real_ip(request: Request):
    return request.headers.get("X-Forwarded-For", request.client.host)

limiter = Limiter(key_func=real_ip, default_limits=["100/hour"])