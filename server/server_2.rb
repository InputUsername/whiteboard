require_relative 'web_socket.rb'

# Class wrapping a WebSocket client
class Client
	attr_reader :ws, :queue, :thread

	def initialize(ws, queue, thread)
		@ws = ws
		@queue = queue
		@thread = thread
	end

	def ==(other)
		other.ws.object_id == ws.object_id
	end

	def msg(data)
		queue.push(data)
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

			# Create queue
			# Used to synchronise between the main Thread
			# and client threads
			queue = Queue.new

			# Create a Thread that will send messages
			# to the client
			thread = Thread.new do
				while true do
					message = queue.pop
					ws.send message
					puts "Sent #{message}"
				end
			end

			current_client = Client.new(ws, queue, thread)

			# Send user count to all clients' queues
			n_clients = clients.size
			clients.each do |client|
				client.msg "u_#{n_clients}"
			end
			puts "Active clients: #{n_clients}"

			# Main receive loop
			while true do
				begin
					# Receive data and push it to all clients' queues
					data = ws.receive
					clients.each do |client|
						client.push data
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

		# Send user count to all clients' queues
		n_clients = clients.size
		clients.each do |client|
			puts "#{client}: #{client.size}"
			client << "u_#{n_clients}"
			puts "#{client}: #{client.size}"
		end
		puts "Active clients: #{n_clients}"

		clients.delete queue
		thread.terminate if thread
	end
end
