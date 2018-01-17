"""
Unit test for HUC-code retrieval module.
"""
# pylint: disable=C0302,W0613,W0621

import pytest
import requests_mock

from waterdata.commands.lookup_generation import huc_lookups


@pytest.fixture(scope='module')
def huc_mock():
    """Mock data for HUC service call."""
    with requests_mock.mock() as mock_req:
        yield mock_req.get(huc_lookups.SOURCE_URL, text=MOCK_DATA)


def test_huc_lookup(huc_mock):
    huc_data = huc_lookups.get_huc_data()
    hucs = huc_data['hucs']
    classes = huc_data['classes']

    assert len(hucs) == 35, 'Unexpected number of HUCs returned.'

    for key, value in hucs.items():
        assert key == value['huc_cd'], 'Dict key does not equal HUC'
        parent_cd = key[:len(key) - 2] or None
        assert parent_cd == value['parent'], 'Bad parent HUC reference'
        if parent_cd:
            assert key in hucs[parent_cd]['children'], 'No child reference for %s' % key

        huc_class = 'HUC%s' % len(key)
        assert key in classes[huc_class], 'Expected %s to be categorized as %s' % (key, huc_class)


def test_huc_import(app):
    assert 'classes' in app.config['HUC_LOOKUP'], 'Expected HUC_LOOKUP on app config object'
    assert 'hucs' in app.config['HUC_LOOKUP'], 'Expected HUC_LOOKUP on app config object'


MOCK_DATA = """#
# National Water Information System
# 2018/01/12
#
#
# Date Retrieved: USGS Water Data for the Nation Help System
#
huc_cd\thuc_class_cd\thuc_nm
8s\t15s\t51s
01\tRegion\tNew England Region
0101\tSubregion\tSt. John
010100\tAccounting Unit\tSt. John
01010001\tCataloging Unit\tUpper St. John
01010002\tCataloging Unit\tAllagash
01010003\tCataloging Unit\tFish
01010004\tCataloging Unit\tAroostook
01010005\tCataloging Unit\tMeduxnekeag
0102\tSubregion\tPenobscot
010200\tAccounting Unit\tPenobscot
01020001\tCataloging Unit\tWest Branch Penobscot
01020002\tCataloging Unit\tEast Branch Penobscot
01020003\tCataloging Unit\tMattawamkeag
01020004\tCataloging Unit\tPiscataquis
01020005\tCataloging Unit\tLower Penobscot
0103\tSubregion\tKennebec
010300\tAccounting Unit\tKennebec
01030001\tCataloging Unit\tUpper Kennebec
01030002\tCataloging Unit\tDead
01030003\tCataloging Unit\tLower Kennebec
0104\tSubregion\tAndroscoggin
010400\tAccounting Unit\tAndroscoggin
01040001\tCataloging Unit\tUpper Androscoggin
01040002\tCataloging Unit\tLower Androscoggin
0105\tSubregion\tMaine Coastal
010500\tAccounting Unit\tMaine Coastal
01050001\tCataloging Unit\tSt. Croix
01050002\tCataloging Unit\tMaine Coastal
01050003\tCataloging Unit\tSt. George-Sheepscot
01050004\tCataloging Unit\tPassamaquoddy Bay-Bay of Fundy
0106\tSubregion\tSaco
010600\tAccounting Unit\tSaco
01060001\tCataloging Unit\tPresumpscot
01060002\tCataloging Unit\tSaco
01060003\tCataloging Unit\tPiscataqua-Salmon Falls

"""
