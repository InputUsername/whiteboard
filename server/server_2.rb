require_relative 'web_socket.rb'

# Class wrapping a WebSocket client
class Client
	attr_reader :ws, :queue, :thread

	def initialize(ws)
		@ws = ws
		@queue = Queue.new
		@thread = Thread.new do
			while true
				data = queue.pop
				ws.send data
			end
		end
	end

	def finish
		thread.terminate if thread
	end

	def ==(other)
		other.is_a?(Client) and other.ws.object_id == ws.object_id
	end

	def msg(data)
		queue.push data
	end

	def direct(data)
		ws.send data
	end
end

if ARGV.size < 1 then
	abort "Usage: #{__FILE__} <port>"
end

PORT = ARGV[0].to_i

# Create server
server = WebSocketServer.new(:accepted_domains => ['*'], :port => PORT)

puts "Hosting Whiteboard server on localhost:#{PORT}"

clients = []

# Run the server
# The block will be run for every connection
# ws represents the WebSocket
server.run do |ws|
	begin
		puts 'Connection accepted'

		# Check requested path
		if ws.path == '/whiteboard' then
			# Perform handshake
			ws.handshake

			puts 'Handshake completed'

			current_client = Client.new ws
			clients << current_client

			# Send user count to all clients' queues
			n_clients = clients.size
			clients.each do |client|
				client.msg "u_#{n_clients}"
			end
			puts "Active clients: #{n_clients}"

			# Main receive loop
			while true do
				begin
					# Receive data and push send it to all clients
					data = ws.receive
					clients.each do |client|
						client.msg data unless client == current_client
					end
				rescue WebSocket::Error => e
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

		current_client.finish
		clients.delete current_client

		# Send user count to all clients' queues
		n_clients = clients.size
		clients.each do |client|
			client.direct "u_#{n_clients}"
		end
		puts "Active clients: #{n_clients}"
	end
end
