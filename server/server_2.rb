require_relative 'web_socket.rb'

if ARGV.size < 1 then
	abort "Usage: #{__FILE__} <port>"
end

PORT = ARGV[0].to_i

server = WebSocketServer.new(:accepted_domains => ['*'], :port => PORT)

puts "Hosting Whiteboard server on localhost:#{PORT}"

clients = []

server.run do |ws|
	begin
		puts 'Connection accepted'

		if ws.path == '/whiteboard' then
			ws.handshake

			queue = Queue.new
			clients << queue

			n_clients = clients.size
			clients.each do |client|
				client.push("u_#{n_clients.to_s}")
			end
			puts "Active clients: #{n_clients}"

			thread = Thread.new do
				while true do
					message = queue.pop
					ws.send message
				end
			end

			while true do
				begin
					data = ws.receive
					clients.each do |client|
						client.push data
					end
				rescue Websocket::Error => e
					puts 'Something went wrong:'
					puts ">> #{e.message}"
				rescue
					break
				end
			end
		else
			ws.handshake '404 not found'
		end
	ensure
		puts 'Connection closed by client'
		clients.delete queue
		thread.terminate if thread

		n_clients = clients.size
		clients.each do |client|
			client.push("u_#{n_clients.to_s}")
		end
		puts "Active clients: #{n_clients}"
	end
end
