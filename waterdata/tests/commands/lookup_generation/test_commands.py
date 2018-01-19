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


def test_nwis(fs, nwis_mock):
    fs.CreateDirectory(DATA_DIR)

    runner = CliRunner()
    result = runner.invoke(manage.cli, ['generate_lookups', '--nwis'])

    assert result.exit_code == 0
    assert os.path.exists(os.path.join(manage.DEFAULT_DATA_DIR, 'nwis_lookup.json'))


def test_regions(fs, regions_mock):
    fs.CreateDirectory(DATA_DIR)

    runner = CliRunner()
    result = runner.invoke(manage.cli, ['generate_lookups', '--regions'])

    assert result.exit_code == 0
    assert os.path.exists(os.path.join(manage.DEFAULT_DATA_DIR, 'nwis_country_state_lookup.json'))


def test_huc(fs, huc_mock):
    fs.CreateDirectory(DATA_DIR)

    runner = CliRunner()
    result = runner.invoke(manage.cli, ['generate_lookups', '--huc'])

    assert result.exit_code == 0
    assert os.path.exists(os.path.join(manage.DEFAULT_DATA_DIR, 'huc_lookup.json'))
