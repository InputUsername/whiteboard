require_relative 'web_socket.rb'

if ARGV.size < 1 then
	abort 'Usage: #{__FILE__} <port>'
end

server = WebSocketServer.new(
	:accepted_domains => ["*"],
	:port => ARGV[0].to_i
)

server.run do |ws|
	puts 'Connection accepted'

	ws.handshake()

	while data = ws.receive()
		puts "Received #{data}"
		ws.send(data)
	end
end
