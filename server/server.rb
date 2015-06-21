require_relative 'web_socket.rb'

if ARGV.size() < 1 then
	abort 'Usage: #{__FILE__} <port>'
end

PORT = ARGV[0].to_i()

server = WebSocketServer.new(
	:accepted_domains => ["*"],
	:port => PORT
)

puts("Hosting Whiteboard server on localhost:#{PORT}")

SCREEN_W = 1280;
SCREEN_H = 720;

screen_data = []

(0..SCREEN_H).each do |y|
	screen_data << []
	(0..SCREEN_W).each do |x|
		screen_data[-1][x] = 0
	end
end

clients = []

server.run do |ws|

	begin

		puts('Connection accepted')

		if ws.path == '/whiteboard' then
			ws.handshake()
			
			clients << ws

			while data = ws.receive()
				clients.each do |client|
					client.send(data) unless client == ws
				end
			end
		else
			ws.handshake('404 not found')
		end

	ensure

		puts('Connection closed by client')

	end
end
