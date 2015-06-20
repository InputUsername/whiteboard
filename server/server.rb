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

server.run do |ws|

	begin

		puts('Connection accepted')

		if ws.path == '/whiteboard' then
			ws.handshake()

			while data = ws.receive()
				#puts("Received '#{data}'")
				#ws.send(data)
			end
		else
			ws.handshake('404 not found')
		end

	ensure

		puts('Connection closed by client')

	end
end
