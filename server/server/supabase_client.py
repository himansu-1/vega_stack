import os
import requests
import json
from typing import Dict, Any


class SupabaseClient:
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_KEY")
        self.service_key = os.getenv("SUPABASE_SERVICE_KEY")
        
        if not all([self.url, self.key]):
            raise ValueError("Supabase URL and KEY must be set in environment variables")
    
    def _get_headers(self, use_service_key=False):
        key = self.service_key if use_service_key else self.key
        return {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        }
    
    def insert_notification(self, notification_data: Dict[str, Any]) -> bool:
        """Insert a notification into Supabase for real-time updates"""
        try:
            url = f"{self.url}/rest/v1/notifications"
            headers = self._get_headers(use_service_key=True)
            
            response = requests.post(url, headers=headers, json=notification_data)
            return response.status_code in [200, 201]
        except Exception as e:
            print(f"Error inserting notification to Supabase: {e}")
            return False
    
    def upload_image(self, file_data: bytes, filename: str, folder: str = "posts") -> str:
        """Upload image to Supabase Storage"""
        try:
            url = f"{self.url}/storage/v1/object/{folder}/{filename}"
            headers = {
                "apikey": self.service_key,
                "Authorization": f"Bearer {self.service_key}",
            }
            
            response = requests.post(url, headers=headers, data=file_data)
            if response.status_code in [200, 201]:
                return f"{self.url}/storage/v1/object/public/{folder}/{filename}"
            else:
                raise Exception(f"Upload failed: {response.text}")
        except Exception as e:
            print(f"Error uploading image to Supabase: {e}")
            raise


# Global instance
supabase_client = SupabaseClient()
