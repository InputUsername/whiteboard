require_relative 'web_socket.rb'

if ARGV.size() < 1 then
	abort 'Usage: #{__FILE__} <port>'
end

PORT = ARGV[0].to_i()

server = WebSocketServer.new(:accepted_domains => ["*"], :port => PORT)

puts("Hosting Whiteboard server on localhost:#{PORT}")

clients = []

server.run do |ws|

	begin

		puts('Connection accepted')

		if ws.path == '/whiteboard' then
			ws.handshake()
			
			clients << ws

			while data = ws.receive()
				clients.each do |client|
					client.send(data)
				end
			end
		else
			ws.handshake('404 not found')
		end

	ensure
		
		clients.delete(ws)
		
		puts('Connection closed by client')

	end
	
end
