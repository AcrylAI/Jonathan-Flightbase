import settings
import utils.db
from utils.common import get_args
import uwsgi_app

#uwsgi_app.main()
port = get_args().jf_master_port if get_args().jf_master_port is not None else settings.FLASK_SERVER_PORT
uwsgi_app.application.run(debug=settings.FLASK_DEBUG, host=settings.FLASK_SERVER_IP, port=port, threaded=True)
