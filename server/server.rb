require_relative('web_socket.rb')

if ARGV.size < 1 then
	abort "Usage: #{__FILE__} <port>"
end

PORT = ARGV[0].to_i

server = WebSocketServer.new(:accepted_domains => ["*"], :port => PORT)

puts("Hosting Whiteboard server on localhost:#{PORT}")

clients = []

server.run do |ws|

	begin

		puts('Connection accepted')

		if ws.path == '/whiteboard' then

			ws.handshake()

			clients << ws

			n_clients = clients.size

			clients.each do |client|
				client.send("u_" + n_clients.to_s)
			end

			while true

				begin

					data = ws.receive()

					clients.each do |client|
						client.send(data) unless client.object_id() == ws.object_id()
					end

				rescue WebSocket::Error => e
					puts("Something went wrong: #{e.message}")
				rescue
					break
				end

			end

		else

			ws.handshake('404 not found')

		end

	ensure

		clients.reject! {|client| client.object_id() == ws.object_id() }

		n_clients = clients.size

		clients.each do |client|
			client.send("u_" + n_clients.to_s)
		end

		puts('Connection closed by client')
		puts("Active clients: #{n_clients}")

	end

end
