"""Serve the generated site locally without stale rebuilds or burst-load failures."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class PreviewServer(ThreadingHTTPServer):
    # A page can request many code chunks at once; Python 3.10 defaults to five.
    request_queue_size = 128


class PreviewHandler(SimpleHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def do_GET(self):
        if 'If-Modified-Since' in self.headers:
            del self.headers['If-Modified-Since']
        super().do_GET()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=4173)
    args = parser.parse_args()
    directory = Path(__file__).resolve().parent.parent / '.output' / 'public'
    if not (directory / 'index.html').is_file():
        parser.error('Run npm run generate before starting the preview.')
    server = PreviewServer(('127.0.0.1', args.port), partial(PreviewHandler, directory=str(directory)))
    print(f'Preview: http://127.0.0.1:{args.port}', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
