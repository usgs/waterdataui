"""
Tests to confirm that manage.py entrypoints of the lookup generation tools
run without failure. The correctness of generation JSON is handled by other
unit tests.
"""
# pylint: disable=C0103,W0613

import os

from click.testing import CliRunner

import manage


DATA_DIR = os.path.join(os.path.dirname(manage.__file__), 'data')


def test_help():
    runner = CliRunner()
    result = runner.invoke(manage.cli, ['generate_lookups', '--help'])
    assert result.exit_code == 0


# def test_nwis(app, fs, nwis_mock):
#     fs.CreateDirectory(DATA_DIR)
#
#     runner = CliRunner()
#     result = runner.invoke(manage.cli, ['generate_lookups', '--nwis'])
#
#     assert result.exit_code == 0
#     assert os.path.exists(os.path.join(app.config['DATA_DIR'], 'nwis_lookup.json'))


def test_regions(app, fs, regions_mock):
    fs.CreateDirectory(DATA_DIR)

    runner = CliRunner()
    result = runner.invoke(manage.cli, ['generate_lookups', '--regions'])

    assert result.exit_code == 0
    assert os.path.exists(os.path.join(app.config['DATA_DIR'], 'nwis_country_state_lookup.json'))


def test_huc(app, fs, huc_mock):
    fs.CreateDirectory(DATA_DIR)

    runner = CliRunner()
    result = runner.invoke(manage.cli, ['generate_lookups', '--huc'])

    assert result.exit_code == 0
    assert os.path.exists(os.path.join(app.config['DATA_DIR'], 'huc_lookup.json'))
