import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;

public class Main {

    public static void main(String[] args) throws IOException {

        HttpServer server = HttpServer.create(
                new InetSocketAddress(8080),
                0
        );

        server.createContext(
                "/api",
                Main::handleRequest
        );

        server.start();

        System.out.println(
                "SpendWise Backend Started!"
        );

        System.out.println(
                "Server running at: http://localhost:8080"
        );
    }

    private static void handleRequest(
            HttpExchange exchange
    ) throws IOException {

        String response =
                "Welcome to SpendWise Backend!";

        exchange.sendResponseHeaders(
                200,
                response.length()
        );

        OutputStream output =
                exchange.getResponseBody();

        output.write(
                response.getBytes()
        );

        output.close();
    }
}