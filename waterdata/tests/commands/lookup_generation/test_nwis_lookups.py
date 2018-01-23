
from unittest import TestCase

from waterdata.commands.lookup_generation.nwis_lookups import (
    translate_to_lookup, translate_codes_by_group)


class TranslateToLookupTestCase(TestCase):

    def setUp(self):
        self.test_dict_iter = [
            {'this_cd': 'value1', 'this_name': 'Name1', 'this_desc': 'Description 1'},
            {'this_cd': 'value2', 'this_name': 'Name2', 'this_desc': 'Description 2'},
            {'this_cd': 'value3', 'this_name': 'Name3', 'this_desc': 'Description 3'}
        ]

    def test_empty_dict(self):
        self.assertEqual(translate_to_lookup([], 'this_cd', 'this_name', ''), {})

    def test_dict_with_unmatched_code_key(self):
        self.assertEqual(translate_to_lookup(self.test_dict_iter, 'that_cd', 'this_name', ''), {})

    def test_dict_matched_code_key(self):
        self.assertEqual(translate_to_lookup(self.test_dict_iter, 'this_cd', 'this_name', ''),
                         {'value1': {'name': 'Name1'},
                          'value2': {'name': 'Name2'},
                          'value3': {'name': 'Name3'}}
                         )

    def test_with_unmatched_name_key(self):
        self.assertEqual(translate_to_lookup(self.test_dict_iter, 'this_cd', 'that_name', ''),
                         {'value1': {'name': None},
                          'value2': {'name': None},
                          'value3': {'name': None}}
                         )

    def test_with_matched_desc_key(self):
        self.assertEqual(translate_to_lookup(self.test_dict_iter, 'this_cd', 'this_name', 'this_desc'),
                         {'value1': {'name': 'Name1', 'desc': 'Description 1'},
                          'value2': {'name': 'Name2', 'desc': 'Description 2'},
                          'value3': {'name': 'Name3', 'desc': 'Description 3'}}
                         )

    def test_with_unmatched_desc_key(self):
        self.assertEqual(translate_to_lookup(self.test_dict_iter, 'this_cd', 'this_name', 'that_desc'),
                         {'value1': {'name': 'Name1', 'desc': None},
                          'value2': {'name': 'Name2', 'desc': None},
                          'value3': {'name': 'Name3', 'desc': None}}
                         )


class TranslateCodesByGroupTestCase(TestCase):

    def setUp(self):
        self.test_dict_iter = [
            {'this_cd': 'value1', 'this_name': 'Name1', 'related_cd': 'rvalue1'},
            {'this_cd': 'value2', 'this_name': 'Name2', 'related_cd': 'rvalue1'},
            {'this_cd': 'value1', 'this_name': 'Name1', 'related_cd': 'rvalue2'},
            {'this_cd': 'value1', 'this_name': 'Name1', 'related_cd': 'rvalue3'},
            {'this_cd': 'value3', 'this_name': 'Name3', 'related_cd': 'rvalue3'},
            {'this_cd': 'value3', 'this_name': 'Name3', 'related_cd': 'rvalue4'}
        ]

    def test_empty_dict(self):
        self.assertEqual(translate_codes_by_group([], 'this_cd', 'this_name'), {})

    def test_unmatched_code_key(self):
        self.assertEqual(translate_codes_by_group(self.test_dict_iter, 'that_cd', 'this_name'), {})

    def test_matched_code_key(self):
        self.assertEqual(translate_codes_by_group(self.test_dict_iter, 'this_cd', 'this_name'),
                         {'value1': {'name': 'Name1'},
                          'value2': {'name': 'Name2'},
                          'value3': {'name': 'Name3'}}
                         )

    def test_unmatched_name_key(self):
        self.assertEqual(translate_codes_by_group(self.test_dict_iter, 'this_cd', 'that_name'),
                         {'value1': {'name': None},
                          'value2': {'name': None},
                          'value3': {'name': None}}
                         )
