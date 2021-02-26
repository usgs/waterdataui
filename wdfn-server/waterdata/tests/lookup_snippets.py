"""
Lookup snippets for unit testing
"""

SAMPLE_COUNTRY_STATE_COUNTY_LOOKUP = {
    "US": {
        "state_cd": {
            "01": {
                "name": "Alabama",
                "county_cd": {
                    "001": {
                        "name": "Autauga County"
                    }
                }
            },
            "48": {
                "name": "Texas",
                "county_cd": {
                    "061": {
                        "name": "Cameron County"
                    }
                }
            },
            "23": {
                "name": "Mainw",
                "county_cd": {
                    "003": {
                        "name": "Aroostook County"
                    }
                }
            }
        }
    }
}

HUC_LOOKUP = {
    "hucs": {
        "010100": {
            "children": [
                "01010001"
            ],
            "parent": "0101",
            "kind": "HUC6",
            "huc_cd": "010100",
            "huc_class_cd": "Accounting Unit",
            "huc_nm": "St. John"
        },
        "01010001": {
            "children": [],
            "parent": "010100",
            "kind": "HUC8",
            "huc_cd": "01010001",
            "huc_class_cd": "Cataloging Unit",
            "huc_nm": "Upper St. John"
        }
    },
    "classes": {
        "HUC2": [],
        "HUC8": ["01010001"]
    }
}

NWIS_CODE_LOOKUP = {
    "site_tp_cd": {
        "AT": {
            "name": "Atmosphere",
            "desc": "A site established primarily to measure meteorological properties or atmospheric deposition."
        },
        "GW": {
            "name": "Well",
            "desc": "A hole or shaft constructed in the earth intended to be used to locate, sample, or develop groundwater, oil, gas, or some other subsurface material. The diameter of a well is typically much smaller than the depth. Wells are also used to artificially recharge groundwater or to pressurize oil and gas production zones.  Additional information about specific kinds of wells should be recorded under the secondary site types or the Use of Site field. Underground waste-disposal wells should be classified as waste-injection wells."
        },
        "ST": {
            "name": "Stream",
            "desc": "\"A body of running water moving under gravity flow in a defined channel. The channel may be entirely natural, or altered by engineering practices through straightening, dredging, and (or) lining. An entirely artificial channel should be qualified with the \"\"canal\"\" or \"\"ditch\"\" secondary site type.\""
        },
        "SP": {
            "name": "Spring",
            "desc": "A location at which the water table intersects the land surface, resulting in a natural flow of groundwater to the surface. Springs may be perennial, intermittent, or ephemeral."
        },
        "LK": {
            "name": "Lake, Reservoir, Impoundment",
            "desc": "An inland body of standing fresh or saline water that is generally too deep to permit submerged aquatic vegetation to take root across the entire body (cf: wetland). This site type includes an expanded part of a river, a reservoir behind a dam, and a natural or excavated depression containing a water body without surface-water inlet and/or outlet."
        },
        "FA-OF": {
            "name": "Outfall",
            "desc": "A site where water or wastewater is returned to a surface-water body, e.g. the point where wastewater is returned to a stream. Typically, the discharge end of an effluent pipe."
        },
        "GW-TH": {
            "name": "Test hole not completed as a well",
            "desc": "An uncased hole (or one cased only temporarily) that was drilled for water, or for geologic or hydrogeologic testing. It may be equipped temporarily with a pump in order to make a pumping test, but if the hole is destroyed after testing is completed, it is still a test hole. A core hole drilled as a part of mining or quarrying exploration work should be in this class."
        },
        "ST-DCH": {
            "name": "Ditch",
            "desc": "An excavation artificially dug in the ground, either lined or unlined, for conveying water for drainage or irrigation; it is smaller than a canal."
        },
    }
}
