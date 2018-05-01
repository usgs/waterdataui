"""
Jinja2 filters. Must be imported (via waterdata.__init__) for them to register
via the `app.template_filter` decorator.
"""
import datetime
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


@app.template_filter('data_start_year')
def data_start_year(parameter_group_series):
    """
    Determine the earliest year that was collected for a
    list of parameters.

    :param list parameter_group_series: dictionary of parameter series grouped by parameter group
    :return: earliest year of data collection if available
    :rtype: str or None

    """
    series = chain.from_iterable([x['parameters'] for x in parameter_group_series])
    all_start_dates = [s['start_date'] for s in series]
    try:
        start_year = str(min(all_start_dates).year)
    except ValueError:
        start_year = None
    return start_year


@app.template_filter('readable_param_list')
def readable_param_list(parameter_group_series):
    """
    Generate text for a list of parameters in the description meta tag.

    :param list parameter_group_series: list of parameter series grouped by parameter group
    :return: human readable string for the parameters in the series if available
    :rtype: str or None

    """
    # need to use a set -- there might be multiple variants for a measurements
    # (e.g. "nitrite, water as N" vs "nitrite, water as NO3-")
    series = chain.from_iterable([x['parameters'] for x in parameter_group_series])
    # include only real-time parameters that have recent data
    short_names = set(
        [
            s['parameter_name'].split(',')[0].upper() for s in series if 'Unit Values' in s['data_types'] and
            (datetime.datetime.now().date() - datetime.timedelta(days=8) <=
             s['end_date'].date() <= datetime.datetime.now().date() + datetime.timedelta(days=1))
        ]
    )
    sorted_names = sorted(short_names)
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
        parameters = None
    return parameters


@app.template_filter('date_to_string')
def date_to_string(dt_obj):
    """
    Given a datetime, provide a string.

    :param dt_obj: convert datetime to string
    :type: datetime.datetime or pendulum.Pendulum
    :return: datetime as a string
    :rtype: str

    """
    return dt_obj.strftime('%Y-%m-%d')


@app.template_filter('tooltip_content_id')
def tooltip_content_id(some_text):
    """
    Generate a tooltip ID.

    :param str some_text: some text for the id suffix
    :return: tooltip id

    """
    return 'tooltip-{}'.format(some_text.lower().replace('_', '-'))
