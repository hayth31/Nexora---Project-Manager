"""Local HTTP development server that wraps the AWS Lambda handler.

Allows running the backend natively with Python + PostgreSQL without LocalStack.
Listens on http://0.0.0.0:3001 (configurable via PORT) and translates HTTP
requests into Lambda Function URL v2.0 events.
"""

from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import os
import threading
from urllib.parse import parse_qsl, urlparse

from function import handler

_HANDLER_LOCK = threading.Lock()


def _cors_headers() -> dict:
    """Return CORS headers.

    In production (IS_LOCAL != true) the ALLOWED_ORIGIN env var limits the
    Access-Control-Allow-Origin to the Vercel frontend URL.  Locally we keep
    the permissive wildcard so the dev proxy works without any config.
    """
    is_local = os.environ.get("IS_LOCAL", "true").strip().lower() == "true"
    origin = "*" if is_local else os.environ.get("ALLOWED_ORIGIN", "*")
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
    }


# Kept for backward-compat references below.
CORS_HEADERS: dict = {}  # resolved per-request via _cors_headers()


class LambdaDevHandler(BaseHTTPRequestHandler):
    """Forwards HTTP requests to ``function.handler`` as Lambda v2.0 events."""

    def _dispatch(self, method: str) -> None:
        parsed = urlparse(self.path)
        content_length = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else None
        query = dict(parse_qsl(parsed.query, keep_blank_values=True))

        event = {
            "version": "2.0",
            "rawPath": parsed.path,
            "queryStringParameters": query or None,
            "headers": {k.lower(): v for k, v in self.headers.items()},
            "body": body,
            "isBase64Encoded": False,
            "requestContext": {
                "http": {"method": method},
                "requestId": "local-dev",
            },
        }

        with _HANDLER_LOCK:
            result = handler(event, None)
        status = int(result.get("statusCode", 200))
        resp_headers = result.get("headers") or {}
        resp_body = (result.get("body") or "").encode("utf-8")

        self.send_response(status)
        for key, value in {**_cors_headers(), **resp_headers}.items():
            self.send_header(key, value)
        self.send_header("Content-Length", str(len(resp_body)))
        self.end_headers()
        if resp_body and status != 204:
            self.wfile.write(resp_body)

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        for key, value in _cors_headers().items():
            self.send_header(key, value)
        self.end_headers()

    def do_GET(self) -> None:
        self._dispatch("GET")

    def do_POST(self) -> None:
        self._dispatch("POST")

    def do_PUT(self) -> None:
        self._dispatch("PUT")

    def do_PATCH(self) -> None:
        self._dispatch("PATCH")

    def do_DELETE(self) -> None:
        self._dispatch("DELETE")


def main() -> None:
    os.environ.setdefault("IS_LOCAL", "true")
    port = int(os.getenv("PORT", "3001"))
    server = ThreadingHTTPServer(("0.0.0.0", port), LambdaDevHandler)  # nosec B104 # local dev server
    print(f"Nexora API dev server listening on http://localhost:{port}/api/pm-service")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down dev server.")
        server.server_close()


if __name__ == "__main__":
    main()
