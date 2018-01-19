"""
Unit test for HUC-code retrieval module.
"""
# pylint: disable=C0302,W0613,W0621

from waterdata.commands.lookup_generation import huc_lookups


def test_huc_lookup(huc_mock):
    huc_data = huc_lookups.get_huc_data()
    hucs = huc_data['hucs']
    classes = huc_data['classes']

    assert len(hucs) == 35, 'Unexpected number of HUCs returned.'

    for key, value in hucs.items():
        assert key == value['huc_cd'], 'Dict key does not equal HUC'
        parent_cd = key[:len(key) - 2] or None
        assert parent_cd == value['parent'], 'Bad parent HUC reference'
        assert value['kind'] == 'HUC{}'.format(len(key)), 'Wrong HUC classification'
        if parent_cd:
            assert key in hucs[parent_cd]['children'], 'No child reference for %s' % key

        huc_class = 'HUC%s' % len(key)
        assert key in classes[huc_class], 'Expected %s to be categorized as %s' % (key, huc_class)


def test_huc_import(app):
    assert 'classes' in app.config['HUC_LOOKUP'], 'Expected HUC_LOOKUP on app config object'
    assert 'hucs' in app.config['HUC_LOOKUP'], 'Expected HUC_LOOKUP on app config object'
