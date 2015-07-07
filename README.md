# Whiteboard
A simple client/server whiteboard app using WebSockets.
Run the server, connect through your browser.

## Server usage
1. Download the server (server_2.rb) and put it somewhere on your computer.
2. Download the Ruby WebSocket library from [here](https://github.com/gimite/web-socket-ruby).
3. Put it in the same folder as the server file.
4. Run the following command on your command line of choice:
    `ruby server_2.rb <port>`
5. To stop the server, use Ctrl+C or exit the command line.

You can use the old server, which supports fewer features (not recommended):

`ruby server.rb <port>`

## Client usage
1. Open `index.html` in your browser.
2. Type the address and port.
3. Click connect.
4. To disconnect, click the "disconnect" button.

## Proof that it works
![It works!](https://raw.githubusercontent.com/InputUsername/Whiteboard/master/IT_WORKS.png)

## License and credits
Licensed under the Unlicense, see [LICENSE](https://github.com/InputUsername/Whiteboard/blob/master/LICENSE)
and http://unlicense.org/. Uses https://github.com/gimite/web-socket-ruby.
