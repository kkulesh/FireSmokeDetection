from fastapi import WebSocket
from typing import List

from app.core.logger import logger


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """
        Accept a new WebSocket connection
        """
        await websocket.accept()
        self.active_connections.append(websocket)

        logger.info(
            f"WebSocket connected. Active connections: {len(self.active_connections)}"
        )

    def disconnect(self, websocket: WebSocket):
        """
        Remove disconnected WebSocket
        """
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

        logger.info(
            f"WebSocket disconnected. Active connections: {len(self.active_connections)}"
        )

    async def send_personal_message(self, message: str, websocket: WebSocket):
        """
        Send message to one specific client
        """
        try:
            await websocket.send_text(message)
            logger.info("Personal message sent")
        except Exception as e:
            logger.error(f"Failed to send personal message: {str(e)}")

    async def broadcast(self, message: str):
        """
        Send message to all connected clients
        Useful for fire/smoke alerts in real time
        """
        disconnected = []

        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.append(connection)

        for connection in disconnected:
            self.disconnect(connection)

        logger.info(
            f"Broadcast sent to {len(self.active_connections)} active clients"
        )


manager = ConnectionManager()