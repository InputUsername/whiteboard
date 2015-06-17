# Whiteboard server.py

import signal, sys
from SimpleWebSocketServer import WebSocket, SimpleWebSocketServer, SimpleSSLWebSocketServer

HOSTNAME = "localhost"
PORT = 16180

BOARD_W = 320
BOARD_H = 240

board = [[0 for x in range(BOARD_W)] for y in range(BOARD_H)]

clients = []

class WhiteboardServer(WebSocket):

	def handleMessage(self):
		print(self.data)

	def handleConnected(self):
		clients.apend(self)

	def handleClose(self):
		clients.remove(self)

if __name__ == "__main__":
	server = SimpleWebSocketServer(HOSTNAME, PORT, WhiteboardServer)

	def close_sig_handler(signal, frame):
		server.close()
		sys.exit()

	signal.signal(signal.SIGINT, close_sig_handler)

	server.serveforever()
