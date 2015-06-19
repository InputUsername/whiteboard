require_relative 'web_socket.rb'

if ARGV.size != 2 then
	abort "Usage: #{__FILE__} <domain> <port>"
end

server = WebSocketServer.new(
	:accepted_domains => [ARGV[0]],
	:port => ARGV[1].to_i
)

server.run do |ws|
	puts 'Connection accepted'

	ws.handshake()

	while data = ws.receive()
		puts "Received #{data}"
		ws.send(data)
	end
end
