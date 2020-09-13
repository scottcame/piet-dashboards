import * as testConfig from './test-config.json';

export class TestData {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static TEST_CONFIG: any = testConfig;

  /* mondrian rest message for the 1D query
  {
    "connectionName" : "foodmart",
    "tidy": {
      "enabled": true,
      "simplifyNames": false
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
      "simplifyNames": false
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

  /* foodmart doesn't really have anything we can use for this, so we make something up */

  static TEST_QUERY_LINE_SIMPLE = "TEST_QUERY_LINE_SIMPLE";

  static TEST_RESULTS_LINE_SIMPLE = {
    "values":[
      { "x": 10, "y": 200 },
      { "x": 12, "y": 220 },
      { "x": 13, "y": 250 },
      { "x": 16, "y": 110 }
    ]
  };

  static TEST_QUERY_LINE_2_MEASURES = "TEST_QUERY_LINE_2_MEASURES";

  static TEST_RESULTS_LINE_2_MEASURES = {
    "values":[
      { "x": 10, "y": 200, "z": 150 },
      { "x": 12, "y": 220, "z": 180 },
      { "x": 13, "y": 250, "z": 175 },
      { "x": 16, "y": 110, "z": 110 }
    ]
  };

  static TEST_QUERY_LINE_TEMPORAL_1_MEASURE_YEAR = "TEST_QUERY_LINE_TEMPORAL_1_MEASURE_YEAR";

  static TEST_RESULTS_LINE_TEMPORAL_1_MEASURE_YEAR = {
    "values":[
      { "x": "2015", "y": 200 },
      { "x": "2016", "y": 220 },
      { "x": "2017", "y": 250 },
      { "x": "2018", "y": 110 }
    ]
  };

  static TEST_QUERY_LINE_TEMPORAL_1_MEASURE_YEAR_MONTH = "TEST_QUERY_LINE_TEMPORAL_1_MEASURE_YEAR_MONTH";

  static TEST_RESULTS_LINE_TEMPORAL_1_MEASURE_YEAR_MONTH = {
    "values":[
      { "yr": "2015", "month": "3", "y": 200 },
      { "yr": "2015", "month": "9", "y": 220 },
      { "yr": "2016", "month": "1", "y": 250 },
      { "yr": "2016", "month": "2", "y": 110 }
    ]
  };

  static TEST_QUERY_LINE_TEMPORAL_1_MEASURE_YEAR_MONTH_DAY = "TEST_QUERY_LINE_TEMPORAL_1_MEASURE_YEAR_MONTH_DAY";

  static TEST_RESULTS_LINE_TEMPORAL_1_MEASURE_YEAR_MONTH_DAY = {
    "values":[
      { "yr": "2015", "month": "3", "da day": "3", "y": 200 },
      { "yr": "2015", "month": "3", "da day": "4", "y": 230 },
      { "yr": "2015", "month": "3", "da day": "5", "y": 191 },
      { "yr": "2015", "month": "3", "da day": "6", "y": 220 },
      { "yr": "2015", "month": "3", "da day": "7", "y": 213 },
      { "yr": "2015", "month": "3", "da day": "11", "y": 201 },
      { "yr": "2015", "month": "3", "da day": "12", "y": 240 },
      { "yr": "2015", "month": "3", "da day": "13", "y": 237 }
    ]
  };

  static TEST_QUERY_LINE_TEMPORAL_1_MEASURE_DATE = "TEST_QUERY_LINE_TEMPORAL_1_MEASURE_DATE";

  static TEST_RESULTS_LINE_TEMPORAL_1_MEASURE_DATE = {
    "values":[
      { "date": "2015-3-3", "y": 200 },
      { "date": "2015-3-4", "y": 230 },
      { "date": "2015-3-5", "y": 191 },
      { "date": "2015-3-6", "y": 220 },
      { "date": "2015-3-7", "y": 213 },
      { "date": "2015-3-11", "y": 201 },
      { "date": "2015-3-12", "y": 240 },
      { "date": "2015-3-13", "y": 237 }
    ]
  };


}