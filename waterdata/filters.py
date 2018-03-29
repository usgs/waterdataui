"""
Jinja2 filters. Must be imported (via waterdata.__init__) for them to register
via the `app.template_filter` decorator.
"""
from urllib.parse import urljoin

from . import app


@app.template_filter('asset_url')
def asset_url_filter(asset_src):
    """
    Filter that produces the URL for this project's static assets.

    :param str asset_src: Static asset location, relative to STATIC_ROOT.
    :return: complete URL, including STATIC_ROOT and hashed file name
    :rtype: str
    """
    manifest = app.config.get('ASSET_MANIFEST')
    asset_path = manifest[asset_src] if manifest else asset_src
    return urljoin(app.config.get('STATIC_ROOT'), asset_path)


@app.template_filter('indefinite_article')
def use_correct_indefinite_article(some_noun):
    """
    Given a noun determine whether 'a' or 'an'
    should be used as an indefinite article.
    There are some exceptions, but this is probably
    good enough.

    :param some_noun:
    :return:
    """
    vowels = ('a', 'e', 'i', 'o', 'u')
    if some_noun.lower()[0] in vowels:
        return 'an'
    return 'a'


@app.template_filter('data_start_year')
def data_start_year(series):
    """
    Take dataseries rolled up by parameter group and extract
    the earliest year that data collection occurred and provide
    a list of all distinct properties and species being measured.

    :param list series: list of data series
    :return: earliest year of data collection, list of distinct things being measured
    :rtype: str

    """
    all_start_dates = [s['start_date'] for s in series]
    try:
        start_year = str(min(all_start_dates).year)
    except ValueError:
        start_year = 'unknown'
    return start_year


@app.template_filter('readable_param_list')
def readable_param_list(series):
    """
    Generate text for a description meta tag.

    :param list series: list of data series
    :return: human readable string for the parameters in the series
    :rtype: str

    """
    SORT_TOP = ('DISCHARGE', 'GAGE HEIGHT', 'TEMPERATURE', 'DEPTH TO WATER LEVEL')
    # need to use a set -- there might be multiple variants for a measurements
    # (e.g. "nitrite, water as N" vs "nitrite, water as NO3-")
    short_names = set([s['parameter_name'].split(',')[0].upper() for s in series])
    sorted_names = sorted(short_names, key=lambda x: (x not in SORT_TOP, x))
    if sorted_names:
        if len(sorted_names) == 1:
            parameters = sorted_names[0]
        elif 1 < len(sorted_names) < 4:
            # some code to handle the serial comma appropriately
            # some people like it, some people don't....
            if len(sorted_names) == 2:
                serial_comma = ''
            else:
                serial_comma = ','
            parameters = '{}{} and {}'.format(', '.join(sorted_names[:-1]), serial_comma, sorted_names[-1])
        else:
            parameters = '{}, and MORE'.format(', '.join(sorted_names[:3]))
    else:
        parameters = 'unknown'
    return parameters
