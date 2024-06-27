import waitress
import app

waitress.serve(app.app, host="127.0.0.1", port=58673)