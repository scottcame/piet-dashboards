/*
  Copyright 2020 Scott Came Consulting LLC

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
import * as testConfig from './test-config.json';

/* eslint-disable @typescript-eslint/no-explicit-any */

export class TestData {

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

  static TEST_QUERY_LINE_TEMPORAL_RANDOM1 = "TEST_QUERY_LINE_TEMPORAL_RANDOM1";

  static TEST_RESULTS_LINE_TEMPORAL_RANDOM1 = {
    "values" : [ {
      "M1 Count" : 26.0,
      "[Date.DateYMD].[Year]" : "2014",
      "M2 Count" : 16.0
    }, {
      "M1 Count" : 37.0,
      "[Date.DateYMD].[Year]" : "2015",
      "M2 Count" : 37.0
    }, {
      "M1 Count" : 244.0,
      "[Date.DateYMD].[Year]" : "2016",
      "M2 Count" : 238.0
    }, {
      "M1 Count" : 21348.0,
      "[Date.DateYMD].[Year]" : "2017",
      "M2 Count" : 20520.0
    }, {
      "M1 Count" : 20160.0,
      "[Date.DateYMD].[Year]" : "2018",
      "M2 Count" : 21049.0
    }, {
      "M1 Count" : 22833.0,
      "[Date.DateYMD].[Year]" : "2019",
      "M2 Count" : 22174.0
    }, {
      "M1 Count" : 9996.0,
      "[Date.DateYMD].[Year]" : "2020",
      "M2 Count" : 9571.0
    } ]
  };

  // dimension filter query

  static TEST_QUERY_DIMENSION_FILTER = "WITH MEMBER Measures.Nul as Null SELECT {[Measures].[Nul]}*{[Store].[Stores].[Store State].Members} ON COLUMNS FROM [Warehouse]";

  static TEST_RESULTS_DIMENSION_FILTER = {
    "values": [
      {
        "[Store].[Stores].[Store State]": "BC",
        "[Store].[Stores].[Store Country]": "Canada",
        "Nul": null
      },
      {
        "[Store].[Stores].[Store State]": "DF",
        "[Store].[Stores].[Store Country]": "Mexico",
        "Nul": null
      },
      {
        "[Store].[Stores].[Store State]": "Guerrero",
        "[Store].[Stores].[Store Country]": "Mexico",
        "Nul": null
      },
      {
        "[Store].[Stores].[Store State]": "Jalisco",
        "[Store].[Stores].[Store Country]": "Mexico",
        "Nul": null
      },
      {
        "[Store].[Stores].[Store State]": "Veracruz",
        "[Store].[Stores].[Store Country]": "Mexico",
        "Nul": null
      },
      {
        "[Store].[Stores].[Store State]": "Yucatan",
        "[Store].[Stores].[Store Country]": "Mexico",
        "Nul": null
      },
      {
        "[Store].[Stores].[Store State]": "Zacatecas",
        "[Store].[Stores].[Store Country]": "Mexico",
        "Nul": null
      },
      {
        "[Store].[Stores].[Store State]": "CA",
        "[Store].[Stores].[Store Country]": "USA",
        "Nul": null
      },
      {
        "[Store].[Stores].[Store State]": "OR",
        "[Store].[Stores].[Store Country]": "USA",
        "Nul": null
      },
      {
        "[Store].[Stores].[Store State]": "WA",
        "[Store].[Stores].[Store Country]": "USA",
        "Nul": null
      }
    ]
  };

  static TEST_QUERY_LINE_YZ = "TEST_QUERY_LINE_YZ";

  static TEST_RESULTS_LINE_YZ = {
    "values":[
      { "x": 10, "y": "foo", "z": 150 },
      { "x": 12, "y": "foo", "z": 180 },
      { "x": 13, "y": "foo", "z": 175 },
      { "x": 16, "y": "foo", "z": 110 },
      { "x": 10, "y": "bar", "z": 140 },
      { "x": 12, "y": "bar", "z": 162 },
      { "x": 13, "y": "bar", "z": 195 },
      { "x": 16, "y": "bar", "z": 133 }
    ]
  };

  static TEST_QUERY_FOR_BIGGEST_STATE = "SELECT {[Measures].[Units Ordered]} ON ROWS, NON EMPTY HEAD(ORDER({[Store].[Stores].[Store State].Members}, [Measures].[Units Ordered], DESC)) ON COLUMNS FROM [Warehouse]";

  static TEST_RESULTS_FOR_BIGGEST_STATE = {
    "values": [
      {
        "[Store].[Stores].[Store State]": "WA",
        "[Store].[Stores].[Store Country]": "USA",
        "Units Ordered": 116025.0
      }
    ]
  };

  static TEST_QUERY_FOR_SMALLEST_STATE = "SELECT {[Measures].[Units Ordered]} ON ROWS, NON EMPTY TAIL(ORDER({[Store].[Stores].[Store State].Members}, [Measures].[Units Ordered], DESC)) ON COLUMNS FROM [Warehouse]";

  static TEST_RESULTS_FOR_SMALLEST_STATE = {
    "values": [
      {
        "[Store].[Stores].[Store State]": "OR",
        "[Store].[Stores].[Store Country]": "USA",
        "Units Ordered": 44906.0
      }
    ]
  };

  static getFilteredData(mdx: string): any {

    let ret = null;

    const regex = /^SELECT NON EMPTY {\[Measures\]\.\[Units Ordered\]} \* {(.+)} ON COLUMNS FROM \[Warehouse\]$/;
    if (regex.test(mdx)) {
      const states = mdx.replace(regex, "$1").split(",");
      if (states.length === 1 && states[0] === "[Store].[Stores].[Store State].Members") {
        ret = TestData.TEST_RESULTS_1D;
      } else {
        ret = {
          values: []
        };
        states.forEach((level: string): void => {
          const value = TestData.TEST_RESULTS_1D.values.filter((v: any): boolean => {
            return v["[Store].[Stores].[Store State]"] === level.replace(/\[Store\]\.\[Stores\]\.\[Store State\]\.\[(.+)\]/, "$1");
          });
          if (value.length) {
            ret.values.push(value[0]);
          }
        });
      }
    }

    return ret;

  }

}