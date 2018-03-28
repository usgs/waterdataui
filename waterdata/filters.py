from urllib.parse import urljoin

from . import app


@app.template_filter('asset_url')
def asset_url_filter(asset_src):
    manifest = app.config.get('ASSET_MANIFEST')
    asset_path = manifest[asset_src] if manifest else asset_src
    return urljoin(app.config['STATIC_ROOT'], asset_path)
