import * as testConfig from './test-config.json';

export class TestData {

  /* eslint-disable @typescript-eslint/no-explicit-any */
  static TEST_CONFIG: any = testConfig;

  /* mondrian rest message for the 1D query
  {
    "connectionName" : "foodmart",
    "tidy": {
      "enabled": true,
      "simplifyNames": true,
      "levelNameTranslationMap": { "[Store].[Stores].[Store State]": "x" }
    },
    "query" : "SELECT NON EMPTY {[Measures].[Units Ordered]} * Union({[Store].[Stores].[Store State].Hierarchy.FirstChild.Parent}, Except({[Store].[Stores].[Store State].Members}, {})) ON COLUMNS FROM [Warehouse]"
  }
  */

  static TEST_QUERY_1D = "SELECT NON EMPTY {[Measures].[Units Ordered]} * Union({[Store].[Stores].[Store State].Hierarchy.FirstChild.Parent}, Except({[Store].[Stores].[Store State].Members}, {})) ON COLUMNS FROM [Warehouse]";

  static TEST_RESULTS_1D = {
    "values": [
      {
        "Units Ordered": 227238.0
      },
      {
        "[Store].[Stores].[Store State]": "CA",
        "[Store].[Stores].[Store Country]": "USA",
        "Units Ordered": 66307.0
      },
      {
        "[Store].[Stores].[Store State]": "OR",
        "[Store].[Stores].[Store Country]": "USA",
        "Units Ordered": 44906.0
      },
      {
        "[Store].[Stores].[Store State]": "WA",
        "[Store].[Stores].[Store Country]": "USA",
        "Units Ordered": 116025.0
      }
    ]
  };

  /* mondrian rest message for the 1D query w an excludes
  {
    "connectionName" : "foodmart",
    "tidy": {
      "enabled": true,
      "simplifyNames": true,
      "levelNameTranslationMap": { "[Store].[Stores].[Store State]": "x" }
    },
    "query" : "SELECT NON EMPTY {[Measures].[Units Ordered]} * Union({[Store].[Stores].[Store State].Hierarchy.FirstChild.Parent}, Except({[Store].[Stores].[Store State].Members}, {[Store].[Stores].[Store State].[OR]})) ON COLUMNS FROM [Warehouse]"
  }
  */

  static TEST_QUERY_1D_EXCLUDES = "SELECT NON EMPTY {[Measures].[Units Ordered]} * Union({[Store].[Stores].[Store State].Hierarchy.FirstChild.Parent}, Except({[Store].[Stores].[Store State].Members}, {[Store].[Stores].[Store State].[OR]})) ON COLUMNS FROM [Warehouse]";

  static TEST_RESULTS_1D_EXCLUDES = {
    "values": [
      {
        "Units Ordered": 227238.0
      },
      {
        "[Store].[Stores].[Store State]": "CA",
        "[Store].[Stores].[Store Country]": "USA",
        "Units Ordered": 66307.0
      },
      {
        "[Store].[Stores].[Store State]": "WA",
        "[Store].[Stores].[Store Country]": "USA",
        "Units Ordered": 116025.0
      }
    ]
  };

  /* mondrian rest message for 2D query
  {
    "connectionName" : "foodmart",
    "tidy": {
      "enabled": true,
      "simplifyNames": true,
      "levelNameTranslationMap": { "[Store].[Stores].[Store Country]": "x", "[Store Type].[Store Type].[Store Type]": "y" }
    },
    "query" : "SELECT {[Measures].[Store Sqft]} * Union({[Store Type].[Store Type].[Store Type].Hierarchy.FirstChild.Parent}, Except({[Store Type].[Store Type].[Store Type].Members}, {})) * Union({[Store].[Stores].[Store Country].Hierarchy.FirstChild.Parent}, Except({[Store].[Stores].[Store Country].Members}, {})) ON COLUMNS FROM [Store]"
  }
  */

  static TEST_QUERY_2D = "SELECT {[Measures].[Store Sqft]} * Union({[Store Type].[Store Type].[Store Type].Hierarchy.FirstChild.Parent}, Except({[Store Type].[Store Type].[Store Type].Members}, {})) * Union({[Store].[Stores].[Store Country].Hierarchy.FirstChild.Parent}, Except({[Store].[Stores].[Store Country].Members}, {})) ON COLUMNS FROM [Store]";

  static TEST_RESULTS_2D = {
    "values": [
      {
        "Store Sqft": 571596.0
      },
      {
        "Store Sqft": 57564,
        "x": "Canada"
      },
      {
        "Store Sqft": 243012,
        "x": "Mexico"
      },
      {
        "Store Sqft": 271020,
        "x": "USA"
      },
      {
        "Store Sqft": 146045.0,
        "y": "Deluxe Supermarket"
      },
      {
        "Store Sqft": 23112.0,
        "x": "Canada",
        "y": "Deluxe Supermarket"
      },
      {
        "Store Sqft": 61381.0,
        "x": "Mexico",
        "y": "Deluxe Supermarket"
      },
      {
        "Store Sqft": 61552.0,
        "x": "USA",
        "y": "Deluxe Supermarket"
      },
      {
        "Store Sqft": 47447.0,
        "y": "Gourmet Supermarket"
      },
      {
        "Store Sqft": null,
        "x": "Canada",
        "y": "Gourmet Supermarket"
      },
      {
        "Store Sqft": 23759.0,
        "x": "Mexico",
        "y": "Gourmet Supermarket"
      },
      {
        "Store Sqft": 23688.0,
        "x": "USA",
        "y": "Gourmet Supermarket"
      },
      {
        "Store Sqft": null,
        "y": "HeadQuarters"
      },
      {
        "Store Sqft": null,
        "x": "Canada",
        "y": "HeadQuarters"
      },
      {
        "Store Sqft": null,
        "x": "Mexico",
        "y": "HeadQuarters"
      },
      {
        "Store Sqft": null,
        "x": "USA",
        "y": "HeadQuarters"
      },
      {
        "Store Sqft": 109343.0,
        "y": "Mid-Size Grocery"
      },
      {
        "Store Sqft": 34452.0,
        "x": "Canada",
        "y": "Mid-Size Grocery"
      },
      {
        "Store Sqft": 74891.0,
        "x": "Mexico",
        "y": "Mid-Size Grocery"
      },
      {
        "Store Sqft": null,
        "x": "USA",
        "y": "Mid-Size Grocery"
      },
      {
        "Store Sqft": 75281.0,
        "y": "Small Grocery"
      },
      {
        "Store Sqft": null,
        "x": "Canada",
        "y": "Small Grocery"
      },
      {
        "Store Sqft": 24597.0,
        "x": "Mexico",
        "y": "Small Grocery"
      },
      {
        "Store Sqft": 50684.0,
        "x": "USA",
        "y": "Small Grocery"
      },
      {
        "Store Sqft": 193480.0,
        "y": "Supermarket"
      },
      {
        "Store Sqft": null,
        "x": "Canada",
        "y": "Supermarket"
      },
      {
        "Store Sqft": 58384.0,
        "x": "Mexico",
        "y": "Supermarket"
      },
      {
        "Store Sqft": 135096.0,
        "x": "USA",
        "y": "Supermarket"
      }
    ]
  };

}