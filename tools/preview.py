#!/usr/bin/env python3
"""Preview the portal at the same kind of project subpath used by GitHub Pages."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8765)
    parser.add_argument('--prefix', default='/sapientia-arcade/')
    args = parser.parse_args()
    prefix = '/' + args.prefix.strip('/') + '/' if args.prefix.strip('/') else '/'
    root = Path(__file__).resolve().parent.parent

    class Handler(SimpleHTTPRequestHandler):
        def handle_route(self, method):
            path = urlsplit(self.path).path
            if path == '/' and prefix != '/' or path == prefix.rstrip('/'):
                self.send_response(302)
                self.send_header('Location', prefix)
                self.end_headers()
                return
            if not path.startswith(prefix):
                self.send_error(404)
                return
            self.path = '/' + self.path[len(prefix):]
            method()

        def do_GET(self):
            self.handle_route(super().do_GET)

        def do_HEAD(self):
            self.handle_route(super().do_HEAD)

        def end_headers(self):
            self.send_header('Cache-Control', 'no-cache')
            super().end_headers()

    server = ThreadingHTTPServer(('127.0.0.1', args.port), partial(Handler, directory=str(root)))
    print(f'Preview: http://127.0.0.1:{args.port}{prefix}', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
