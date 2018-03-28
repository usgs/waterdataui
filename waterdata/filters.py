"""
Jinja2 filters. Must be imported (via waterdata.__init__) for them to register
via the `app.template_filter` decorator.
"""
from itertools import chain
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


def _summarize_site_collected_data(rolled_up_dataseries):
    """
    Take dataseries rolled up by parameter group and extract
    the earliest year that data collection occurred and provide
    a list of all distinct properties and species being measured.

    :param dict rolled_up_dataseries: data series rolled-up by parameter group with certain groups we don't care about
        excluded
    :return: earliest year of data collection, list of distinct things being measured
    :rtype: tuple

    """
    all_parms = list(chain.from_iterable([x['parameters'] for x in rolled_up_dataseries.values()]))
    all_start_dates = [parm['start_date'] for parm in all_parms]
    try:
        start_year = min(all_start_dates).year
    except ValueError:
        start_year = None
    # need to use a set -- there might be multiple variants for a measurements
    # (e.g. "nitrite, water as N" vs "nitrite, water as NO3-")
    short_parm_names = set([parm['parameter_name'].split(',')[0].upper() for parm in all_parms])
    sort_top = ('DISCHARGE', 'GAGE HEIGHT', 'TEMPERATURE')
    sorted_parm_names = sorted(short_parm_names, key=lambda x: (x not in sort_top, x))
    return start_year, sorted_parm_names


@app.template_filter('extended_description')
def create_extended_desc(rolled_up_dataseries):
    """
    Generate text for a description meta tag.

    :param rolled_up_dataseries: data series rolled-up by parameter group with certain groups we don't care about
    :type rolled_up_dataseries: dict
    :return: description text for a site
    :rtype: str

    """
    start_date, rt_parms = _summarize_site_collected_data(rolled_up_dataseries)
    if rt_parms:
        if len(rt_parms) == 1:
            parameters = rt_parms[0]
        elif 1 < len(rt_parms) < 4:
            # some code to handle the serial comma appropriately
            # some people like it, some people don't....
            if len(rt_parms) == 2:
                serial_comma = ''
            else:
                serial_comma = ','
            parameters = '{}{} and {}'.format(', '.join(rt_parms[:-1]), serial_comma, rt_parms[-1])
        else:
            parameters = '{}, and MORE'.format(', '.join(rt_parms[:3]))
        extended_desc = (
            'Current conditions of {parameters} are available. '
            'Water data back to {start_date} are available online.'
        ).format(parameters=parameters, start_date=start_date)
    else:
        extended_desc = ''
    return extended_desc
