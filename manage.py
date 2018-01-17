#!/usr/bin/env python3.6

"""
Entrypoint for Flask development server.
"""

import click
from flask.cli import FlaskGroup

from waterdata import app


cli = FlaskGroup(create_app=lambda script_info: app)


@cli.command()
@click.option('--datadir', type=click.Path(dir_okay=True, file_okay=False),
              default='./data',
              help='Output directory for generation JSON file.')
@click.option('--all', 'gen_all', is_flag=True, default=False,
              help='Generate all lookup files.')
@click.option('--nwis', is_flag=True, default=False,
              help='Generate the NWIS code lookup file.')
@click.option('--regions', is_flag=True, default=False,
              help='Generate the region lookup file.')
@click.option('--huc', is_flag=True, default=False,
              help='Generate the HUC lookup file.')
def generate_lookups(datadir, **lookups):
    """
    Creates lookup file(s) from NWIS web services in the specified directory.
    """

    if not any(lookups.values()):
        click.echo('No lookups specified.')
        return

    if lookups['nwis'] or lookups['gen_all']:
        click.echo('Generating NWIS code lookup file...')
        from waterdata.commands.lookup_generation import generate_lookup_file
        generate_lookup_file(datadir)

    if lookups['regions'] or lookups['gen_all']:
        click.echo('Generating region lookup file...')
        from waterdata.commands.lookup_generation import generate_country_state_county_file
        generate_country_state_county_file(datadir)

    if lookups['huc'] or lookups['gen_all']:
        click.echo('Generating HUC lookup file...')
        from waterdata.commands.lookup_generation.huc_lookups import generate_hucs_file
        generate_hucs_file(datadir)


if __name__ == '__main__':
    cli()
