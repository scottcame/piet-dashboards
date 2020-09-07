import * as testConfig from './test-config.json';

export class TestData {

  static TEST_CONFIG: any = testConfig;

  /* mondrian rest message for the 1D query
  {
    "connectionName" : "foodmart",
    "tidy": {
      "enabled": true,
      "simplifyNames": true,
      "levelNameTranslationMap": { "[Store].[Stores].[Store State]": "x" }
    },
    "query" : "SELECT NON EMPTY  {[Measures].[Units Ordered]} * Union({[Store].[Stores].[Store State].Hierarchy.FirstChild.Parent}, Except({[Store].[Stores].[Store State].Members}, {})) ON COLUMNS FROM [Warehouse]"
  }
  */

  static TEST_QUERY_1D = "SELECT NON EMPTY  {[Measures].[Units Ordered]} * Union({[Store].[Stores].[Store State].Hierarchy.FirstChild.Parent}, Except({[Store].[Stores].[Store State].Members}, {})) ON COLUMNS FROM [Warehouse]";

  static TEST_RESULTS_1D = {
    "values": [
      {
        "Units Ordered": 227238.0
      },
      {
        "x": "CA",
        "Store Country": "USA",
        "Units Ordered": 66307.0
      },
      {
        "x": "OR",
        "Store Country": "USA",
        "Units Ordered": 44906.0
      },
      {
        "x": "WA",
        "Store Country": "USA",
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
    "query" : "SELECT NON EMPTY  {[Measures].[Units Ordered]} * Union({[Store].[Stores].[Store State].Hierarchy.FirstChild.Parent}, Except({[Store].[Stores].[Store State].Members}, {[Store].[Stores].[Store State].[OR]})) ON COLUMNS FROM [Warehouse]"
  }
  */

 static TEST_QUERY_1D_EXCLUDES = "SELECT NON EMPTY  {[Measures].[Units Ordered]} * Union({[Store].[Stores].[Store State].Hierarchy.FirstChild.Parent}, Except({[Store].[Stores].[Store State].Members}, {[Store].[Stores].[Store State].[OR]})) ON COLUMNS FROM [Warehouse]";

 static TEST_RESULTS_1D_EXCLUDES = {
   "values": [
     {
       "Units Ordered": 227238.0
     },
     {
       "x": "CA",
       "Store Country": "USA",
       "Units Ordered": 66307.0
     },
     {
       "x": "WA",
       "Store Country": "USA",
       "Units Ordered": 116025.0
     }
   ]
 };



}