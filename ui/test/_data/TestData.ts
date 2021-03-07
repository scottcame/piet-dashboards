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
import * as testDimensions from './get-dimensions.json';

/* eslint-disable @typescript-eslint/no-explicit-any */

export class TestData {

  static TEST_CONFIG: any = testConfig;
  static TEST_DIMENSIONS: any = testDimensions;

  readonly queryDataMap: Map<string, {values: any[]}> = new Map();

  constructor() {
    this.addTestQuery1d();
    this.addTestQuery1dExcludes();
    this.addTimelineQueries();
    this.addStateFilterQuery();
    this.addStoreNameFilterQuery();
    this.addCityFilterQuery();
    this.addCountryFilterQuery();
    this.addTimeYearFilterQuery();
    this.addTimeQuarterFilterQuery();
    this.addTimeMonthFilterQuery();
    this.addTimeWeeklyYearFilterQuery();
    this.addTimeWeeklyWeekFilterQuery();
    this.addTimeWeeklyDayFilterQuery();
    this.addSizeFilterQuery();
    this.addLineYZQuery();
    this.addBiggestStateQuery();
    this.addSmallestStateQuery();
    this.addMinusOregonQuery();
    this.addMinusWashingtonQuery();
    this.addMinusOregonWashingtonQuery();
    this.addAllStatesQuery();
  }

  private addTestQuery1d(): void {

    /* mondrian rest message for the 1D query
      {
        "connectionName" : "foodmart",
        "tidy": {
          "enabled": true,
          "simplifyNames": false
        },
        "query" : "SELECT NON EMPTY {[Measures].[Units Ordered]} * Union({[Store].[Store State].Hierarchy.FirstChild.Parent}, Except({[Store].[Store State].Members}, {})) ON COLUMNS FROM [Warehouse]"
      }
    */

    this.queryDataMap.set(
      "SELECT NON EMPTY {[Measures].[Units Ordered]} * Union({[Store].[Store State].Hierarchy.FirstChild.Parent}, Except({[Store].[Store State].Members}, {})) ON COLUMNS FROM [Warehouse]",
      {
        "values": [
          {
            "Units Ordered": 227238.0
          },
          {
            "[Store].[Store State]": "CA",
            "[Store].[Stores].[Store Country]": "USA",
            "Units Ordered": 66307.0
          },
          {
            "[Store].[Store State]": "OR",
            "[Store].[Stores].[Store Country]": "USA",
            "Units Ordered": 44906.0
          },
          {
            "[Store].[Store State]": "WA",
            "[Store].[Stores].[Store Country]": "USA",
            "Units Ordered": 116025.0
          }
        ]
      });

  }

  private addTestQuery1dExcludes(): void {

    /* mondrian rest message for the 1D query w an excludes
    {
      "connectionName" : "foodmart",
      "tidy": {
        "enabled": true,
        "simplifyNames": false
      },
      "query" : "SELECT NON EMPTY {[Measures].[Units Ordered]} * Union({[Store].[Store State].Hierarchy.FirstChild.Parent}, Except({[Store].[Store State].Members}, {[Store].[Store State].[OR]})) ON COLUMNS FROM [Warehouse]"
    }
    */

    this.queryDataMap.set(
      "SELECT NON EMPTY {[Measures].[Units Ordered]} * Union({[Store].[Store State].Hierarchy.FirstChild.Parent}, Except({[Store].[Store State].Members}, {[Store].[Store State].[OR]})) ON COLUMNS FROM [Warehouse]",
      {
        "values": [
          {
            "Units Ordered": 227238.0
          },
          {
            "[Store].[Store State]": "CA",
            "[Store].[Stores].[Store Country]": "USA",
            "Units Ordered": 66307.0
          },
          {
            "[Store].[Store State]": "WA",
            "[Store].[Stores].[Store Country]": "USA",
            "Units Ordered": 116025.0
          }
        ]
      });

  }

  private addTimelineQueries(): void {

    /* foodmart doesn't really have anything we can use for these timeline queries, so we make something up */

    this.queryDataMap.set(
      "TEST_QUERY_LINE_SIMPLE",
      {
        "values":[
          { "x": 10, "y": 200 },
          { "x": 12, "y": 220 },
          { "x": 13, "y": 250 },
          { "x": 16, "y": 110 }
        ]
      });

    this.queryDataMap.set(
      "TEST_QUERY_LINE_2_MEASURES",
      {
        "values":[
          { "x": 10, "y": 200, "z": 150 },
          { "x": 12, "y": 220, "z": 180 },
          { "x": 13, "y": 250, "z": 175 },
          { "x": 16, "y": 110, "z": 110 }
        ]
      });

    this.queryDataMap.set(
      "TEST_QUERY_LINE_TEMPORAL_1_MEASURE_YEAR",
      {
        "values":[
          { "x": "2015", "y": 200 },
          { "x": "2016", "y": 220 },
          { "x": "2017", "y": 250 },
          { "x": "2018", "y": 110 }
        ]
      });

    this.queryDataMap.set(
      "TEST_QUERY_LINE_TEMPORAL_1_MEASURE_YEAR_MONTH",
      {
        "values":[
          { "yr": "2015", "month": "3", "y": 200 },
          { "yr": "2015", "month": "9", "y": 220 },
          { "yr": "2016", "month": "1", "y": 250 },
          { "yr": "2016", "month": "2", "y": 110 }
        ]
      });

    this.queryDataMap.set(
      "TEST_QUERY_LINE_TEMPORAL_1_MEASURE_YEAR_MONTH_DAY",
      {
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
      });

    this.queryDataMap.set(
      "TEST_QUERY_LINE_TEMPORAL_1_MEASURE_DATE",
      {
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
      });

    this.queryDataMap.set(
      "TEST_QUERY_LINE_TEMPORAL_RANDOM1",
      {
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
      });

  }

  private addStateFilterQuery(): void {

    this.queryDataMap.set(
      "WITH MEMBER Measures.Nul as Null SELECT {[Measures].[Nul]}*{[Store].[Store State].Members} ON COLUMNS FROM [Warehouse]",
      {
        "values": [
          {
            "[Store].[Store State]": "BC",
            "[Store].[Stores].[Store Country]": "Canada",
            "Nul": null
          },
          {
            "[Store].[Store State]": "DF",
            "[Store].[Stores].[Store Country]": "Mexico",
            "Nul": null
          },
          {
            "[Store].[Store State]": "Guerrero",
            "[Store].[Stores].[Store Country]": "Mexico",
            "Nul": null
          },
          {
            "[Store].[Store State]": "Jalisco",
            "[Store].[Stores].[Store Country]": "Mexico",
            "Nul": null
          },
          {
            "[Store].[Store State]": "Veracruz",
            "[Store].[Stores].[Store Country]": "Mexico",
            "Nul": null
          },
          {
            "[Store].[Store State]": "Yucatan",
            "[Store].[Stores].[Store Country]": "Mexico",
            "Nul": null
          },
          {
            "[Store].[Store State]": "Zacatecas",
            "[Store].[Stores].[Store Country]": "Mexico",
            "Nul": null
          },
          {
            "[Store].[Store State]": "CA",
            "[Store].[Stores].[Store Country]": "USA",
            "Nul": null
          },
          {
            "[Store].[Store State]": "OR",
            "[Store].[Stores].[Store Country]": "USA",
            "Nul": null
          },
          {
            "[Store].[Store State]": "WA",
            "[Store].[Stores].[Store Country]": "USA",
            "Nul": null
          }
        ]
      });

  }

  private addStoreNameFilterQuery(): void {

    this.queryDataMap.set(
      "WITH MEMBER Measures.Nul as Null SELECT {[Measures].[Nul]}*{[Store].[Store Name].Members} ON COLUMNS FROM [Warehouse]",
      {
        "values": [
            {
                "[Store].[Store Country]": "Canada",
                "[Store].[Store State]": "BC",
                "Nul": null,
                "[Store].[Store Name]": "Store 19",
                "[Store].[Store City]": "Vancouver"
            },
            {
                "[Store].[Store Country]": "Canada",
                "[Store].[Store State]": "BC",
                "Nul": null,
                "[Store].[Store Name]": "Store 20",
                "[Store].[Store City]": "Victoria"
            },
            {
                "[Store].[Store Country]": "Mexico",
                "[Store].[Store State]": "DF",
                "Nul": null,
                "[Store].[Store Name]": "Store 9",
                "[Store].[Store City]": "Mexico City"
            },
            {
                "[Store].[Store Country]": "Mexico",
                "[Store].[Store State]": "DF",
                "Nul": null,
                "[Store].[Store Name]": "Store 21",
                "[Store].[Store City]": "San Andres"
            },
            {
                "[Store].[Store Country]": "Mexico",
                "[Store].[Store State]": "Guerrero",
                "Nul": null,
                "[Store].[Store Name]": "Store 1",
                "[Store].[Store City]": "Acapulco"
            },
            {
                "[Store].[Store Country]": "Mexico",
                "[Store].[Store State]": "Jalisco",
                "Nul": null,
                "[Store].[Store Name]": "Store 5",
                "[Store].[Store City]": "Guadalajara"
            },
            {
                "[Store].[Store Country]": "Mexico",
                "[Store].[Store State]": "Veracruz",
                "Nul": null,
                "[Store].[Store Name]": "Store 10",
                "[Store].[Store City]": "Orizaba"
            },
            {
                "[Store].[Store Country]": "Mexico",
                "[Store].[Store State]": "Yucatan",
                "Nul": null,
                "[Store].[Store Name]": "Store 8",
                "[Store].[Store City]": "Merida"
            },
            {
                "[Store].[Store Country]": "Mexico",
                "[Store].[Store State]": "Zacatecas",
                "Nul": null,
                "[Store].[Store Name]": "Store 4",
                "[Store].[Store City]": "Camacho"
            },
            {
                "[Store].[Store Country]": "Mexico",
                "[Store].[Store State]": "Zacatecas",
                "Nul": null,
                "[Store].[Store Name]": "Store 12",
                "[Store].[Store City]": "Hidalgo"
            },
            {
                "[Store].[Store Country]": "Mexico",
                "[Store].[Store State]": "Zacatecas",
                "Nul": null,
                "[Store].[Store Name]": "Store 18",
                "[Store].[Store City]": "Hidalgo"
            },
            {
                "[Store].[Store Country]": "USA",
                "[Store].[Store State]": "CA",
                "Nul": null,
                "[Store].[Store Name]": "HQ",
                "[Store].[Store City]": "Alameda"
            },
            {
                "[Store].[Store Country]": "USA",
                "[Store].[Store State]": "CA",
                "Nul": null,
                "[Store].[Store Name]": "Store 6",
                "[Store].[Store City]": "Beverly Hills"
            },
            {
                "[Store].[Store Country]": "USA",
                "[Store].[Store State]": "CA",
                "Nul": null,
                "[Store].[Store Name]": "Store 7",
                "[Store].[Store City]": "Los Angeles"
            },
            {
                "[Store].[Store Country]": "USA",
                "[Store].[Store State]": "CA",
                "Nul": null,
                "[Store].[Store Name]": "Store 24",
                "[Store].[Store City]": "San Diego"
            },
            {
                "[Store].[Store Country]": "USA",
                "[Store].[Store State]": "CA",
                "Nul": null,
                "[Store].[Store Name]": "Store 14",
                "[Store].[Store City]": "San Francisco"
            },
            {
                "[Store].[Store Country]": "USA",
                "[Store].[Store State]": "OR",
                "Nul": null,
                "[Store].[Store Name]": "Store 11",
                "[Store].[Store City]": "Portland"
            },
            {
                "[Store].[Store Country]": "USA",
                "[Store].[Store State]": "OR",
                "Nul": null,
                "[Store].[Store Name]": "Store 13",
                "[Store].[Store City]": "Salem"
            },
            {
                "[Store].[Store Country]": "USA",
                "[Store].[Store State]": "WA",
                "Nul": null,
                "[Store].[Store Name]": "Store 2",
                "[Store].[Store City]": "Bellingham"
            },
            {
                "[Store].[Store Country]": "USA",
                "[Store].[Store State]": "WA",
                "Nul": null,
                "[Store].[Store Name]": "Store 3",
                "[Store].[Store City]": "Bremerton"
            },
            {
                "[Store].[Store Country]": "USA",
                "[Store].[Store State]": "WA",
                "Nul": null,
                "[Store].[Store Name]": "Store 15",
                "[Store].[Store City]": "Seattle"
            },
            {
                "[Store].[Store Country]": "USA",
                "[Store].[Store State]": "WA",
                "Nul": null,
                "[Store].[Store Name]": "Store 16",
                "[Store].[Store City]": "Spokane"
            },
            {
                "[Store].[Store Country]": "USA",
                "[Store].[Store State]": "WA",
                "Nul": null,
                "[Store].[Store Name]": "Store 17",
                "[Store].[Store City]": "Tacoma"
            },
            {
                "[Store].[Store Country]": "USA",
                "[Store].[Store State]": "WA",
                "Nul": null,
                "[Store].[Store Name]": "Store 22",
                "[Store].[Store City]": "Walla Walla"
            },
            {
                "[Store].[Store Country]": "USA",
                "[Store].[Store State]": "WA",
                "Nul": null,
                "[Store].[Store Name]": "Store 23",
                "[Store].[Store City]": "Yakima"
            }
        ]
      });

  }

  private addCityFilterQuery(): void {

    this.queryDataMap.set(
      "WITH MEMBER Measures.Nul as Null SELECT {[Measures].[Nul]}*{[Store].[Store City].Members} ON COLUMNS FROM [Warehouse]",
      {
        "values": [
          {
              "[Store].[Store Country]": "Canada",
              "[Store].[Store State]": "BC",
              "Nul": null,
              "[Store].[Store City]": "Vancouver"
          },
          {
              "[Store].[Store Country]": "Canada",
              "[Store].[Store State]": "BC",
              "Nul": null,
              "[Store].[Store City]": "Victoria"
          },
          {
              "[Store].[Store Country]": "Mexico",
              "[Store].[Store State]": "DF",
              "Nul": null,
              "[Store].[Store City]": "Mexico City"
          },
          {
              "[Store].[Store Country]": "Mexico",
              "[Store].[Store State]": "DF",
              "Nul": null,
              "[Store].[Store City]": "San Andres"
          },
          {
              "[Store].[Store Country]": "Mexico",
              "[Store].[Store State]": "Guerrero",
              "Nul": null,
              "[Store].[Store City]": "Acapulco"
          },
          {
              "[Store].[Store Country]": "Mexico",
              "[Store].[Store State]": "Jalisco",
              "Nul": null,
              "[Store].[Store City]": "Guadalajara"
          },
          {
              "[Store].[Store Country]": "Mexico",
              "[Store].[Store State]": "Veracruz",
              "Nul": null,
              "[Store].[Store City]": "Orizaba"
          },
          {
              "[Store].[Store Country]": "Mexico",
              "[Store].[Store State]": "Yucatan",
              "Nul": null,
              "[Store].[Store City]": "Merida"
          },
          {
              "[Store].[Store Country]": "Mexico",
              "[Store].[Store State]": "Zacatecas",
              "Nul": null,
              "[Store].[Store City]": "Camacho"
          },
          {
              "[Store].[Store Country]": "Mexico",
              "[Store].[Store State]": "Zacatecas",
              "Nul": null,
              "[Store].[Store City]": "Hidalgo"
          },
          {
              "[Store].[Store Country]": "USA",
              "[Store].[Store State]": "CA",
              "Nul": null,
              "[Store].[Store City]": "Alameda"
          },
          {
              "[Store].[Store Country]": "USA",
              "[Store].[Store State]": "CA",
              "Nul": null,
              "[Store].[Store City]": "Beverly Hills"
          },
          {
              "[Store].[Store Country]": "USA",
              "[Store].[Store State]": "CA",
              "Nul": null,
              "[Store].[Store City]": "Los Angeles"
          },
          {
              "[Store].[Store Country]": "USA",
              "[Store].[Store State]": "CA",
              "Nul": null,
              "[Store].[Store City]": "San Diego"
          },
          {
              "[Store].[Store Country]": "USA",
              "[Store].[Store State]": "CA",
              "Nul": null,
              "[Store].[Store City]": "San Francisco"
          },
          {
              "[Store].[Store Country]": "USA",
              "[Store].[Store State]": "OR",
              "Nul": null,
              "[Store].[Store City]": "Portland"
          },
          {
              "[Store].[Store Country]": "USA",
              "[Store].[Store State]": "OR",
              "Nul": null,
              "[Store].[Store City]": "Salem"
          },
          {
              "[Store].[Store Country]": "USA",
              "[Store].[Store State]": "WA",
              "Nul": null,
              "[Store].[Store City]": "Bellingham"
          },
          {
              "[Store].[Store Country]": "USA",
              "[Store].[Store State]": "WA",
              "Nul": null,
              "[Store].[Store City]": "Bremerton"
          },
          {
              "[Store].[Store Country]": "USA",
              "[Store].[Store State]": "WA",
              "Nul": null,
              "[Store].[Store City]": "Seattle"
          },
          {
              "[Store].[Store Country]": "USA",
              "[Store].[Store State]": "WA",
              "Nul": null,
              "[Store].[Store City]": "Spokane"
          },
          {
              "[Store].[Store Country]": "USA",
              "[Store].[Store State]": "WA",
              "Nul": null,
              "[Store].[Store City]": "Tacoma"
          },
          {
              "[Store].[Store Country]": "USA",
              "[Store].[Store State]": "WA",
              "Nul": null,
              "[Store].[Store City]": "Walla Walla"
          },
          {
              "[Store].[Store Country]": "USA",
              "[Store].[Store State]": "WA",
              "Nul": null,
              "[Store].[Store City]": "Yakima"
          }
        ]
      });

  }

  private addCountryFilterQuery(): void {

    this.queryDataMap.set(
      "WITH MEMBER Measures.Nul as Null SELECT {[Measures].[Nul]}*{[Store].[Store Country].Members} ON COLUMNS FROM [Warehouse]",
      {
        "values": [
          {
              "[Store].[Store Country]": "Canada",
              "Nul": null
          },
          {
              "[Store].[Store Country]": "Mexico",
              "Nul": null
          },
          {
              "[Store].[Store Country]": "USA",
              "Nul": null
          }
        ]
      });

  }

  private addTimeYearFilterQuery(): void {

    this.queryDataMap.set(
      "WITH MEMBER Measures.Nul as Null SELECT {[Measures].[Nul]}*{[Time].[Year].Members} ON COLUMNS FROM [Warehouse]",
      {
        "values": [
          {
              "[Time].[Year]": "1997",
              "Nul": null
          },
          {
              "[Time].[Year]": "1998",
              "Nul": null
          }
        ]
      });

  }

  private addTimeQuarterFilterQuery(): void {

    this.queryDataMap.set(
      "WITH MEMBER Measures.Nul as Null SELECT {[Measures].[Nul]}*{[Time].[Quarter].Members} ON COLUMNS FROM [Warehouse]",
      {
        "values": [
            {
                "[Time].[Year]": "1997",
                "Nul": null,
                "[Time].[Quarter]": "Q1"
            },
            {
                "[Time].[Year]": "1997",
                "Nul": null,
                "[Time].[Quarter]": "Q2"
            },
            {
                "[Time].[Year]": "1997",
                "Nul": null,
                "[Time].[Quarter]": "Q3"
            },
            {
                "[Time].[Year]": "1997",
                "Nul": null,
                "[Time].[Quarter]": "Q4"
            },
            {
                "[Time].[Year]": "1998",
                "Nul": null,
                "[Time].[Quarter]": "Q1"
            }
        ]
      });

  }

  private addTimeMonthFilterQuery(): void {

    this.queryDataMap.set(
      "WITH MEMBER Measures.Nul as Null SELECT {[Measures].[Nul]}*{[Time].[Month].Members} ON COLUMNS FROM [Warehouse]",
      {
        "values": [
            {
                "[Time].[Year]": "1997",
                "Nul": null,
                "[Time].[Quarter]": "Q1",
                "[Time].[Month]": "1"
            },
            {
                "[Time].[Year]": "1997",
                "Nul": null,
                "[Time].[Quarter]": "Q1",
                "[Time].[Month]": "2"
            },
            {
                "[Time].[Year]": "1997",
                "Nul": null,
                "[Time].[Quarter]": "Q1",
                "[Time].[Month]": "3"
            },
            {
                "[Time].[Year]": "1997",
                "Nul": null,
                "[Time].[Quarter]": "Q2",
                "[Time].[Month]": "4"
            },
            {
                "[Time].[Year]": "1997",
                "Nul": null,
                "[Time].[Quarter]": "Q2",
                "[Time].[Month]": "5"
            },
            {
                "[Time].[Year]": "1997",
                "Nul": null,
                "[Time].[Quarter]": "Q2",
                "[Time].[Month]": "6"
            },
            {
                "[Time].[Year]": "1997",
                "Nul": null,
                "[Time].[Quarter]": "Q3",
                "[Time].[Month]": "7"
            },
            {
                "[Time].[Year]": "1997",
                "Nul": null,
                "[Time].[Quarter]": "Q3",
                "[Time].[Month]": "8"
            },
            {
                "[Time].[Year]": "1997",
                "Nul": null,
                "[Time].[Quarter]": "Q3",
                "[Time].[Month]": "9"
            },
            {
                "[Time].[Year]": "1997",
                "Nul": null,
                "[Time].[Quarter]": "Q4",
                "[Time].[Month]": "10"
            },
            {
                "[Time].[Year]": "1997",
                "Nul": null,
                "[Time].[Quarter]": "Q4",
                "[Time].[Month]": "11"
            },
            {
                "[Time].[Year]": "1997",
                "Nul": null,
                "[Time].[Quarter]": "Q4",
                "[Time].[Month]": "12"
            },
            {
                "[Time].[Year]": "1998",
                "Nul": null,
                "[Time].[Quarter]": "Q1",
                "[Time].[Month]": "1"
            },
            {
                "[Time].[Year]": "1998",
                "Nul": null,
                "[Time].[Quarter]": "Q2",
                "[Time].[Month]": "4"
            },
            {
                "[Time].[Year]": "1998",
                "Nul": null,
                "[Time].[Quarter]": "Q3",
                "[Time].[Month]": "7"
            },
            {
                "[Time].[Year]": "1998",
                "Nul": null,
                "[Time].[Quarter]": "Q4",
                "[Time].[Month]": "10"
            }
        ]
      });

  }

  private addTimeWeeklyYearFilterQuery(): void {

    this.queryDataMap.set(
      "WITH MEMBER Measures.Nul as Null SELECT {[Measures].[Nul]}*{[Time.Weekly].[Year].Members} ON COLUMNS FROM [Warehouse]",
      {
        "values": [
            {
                "[Time.Weekly].[Year]": "1997",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "Nul": null
            }
        ]
      });

  }

  private addTimeWeeklyWeekFilterQuery(): void {

    this.queryDataMap.set(
      "WITH MEMBER Measures.Nul as Null SELECT {[Measures].[Nul]}*{[Time.Weekly].[Week].Members} ON COLUMNS FROM [Warehouse]",
      {
        "values": [
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "1",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "2",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "3",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "4",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "5",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "6",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "7",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "8",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "9",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "10",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "11",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "12",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "13",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "14",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "15",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "16",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "17",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "18",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "19",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "20",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "21",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "22",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "23",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "24",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "25",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "26",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "27",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "28",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "29",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "30",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "31",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "32",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "33",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "34",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "35",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "36",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "37",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "38",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "39",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "40",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "41",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "42",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "43",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "44",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "45",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "46",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "47",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "48",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "49",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "50",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "51",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "52",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "1",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "6",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "8",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "10",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "17",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "19",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "20",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "28",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "30",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "31",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "37",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "39",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "42",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "48",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "50",
                "Nul": null
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "51",
                "Nul": null
            }
        ]
      });

  }

  private addTimeWeeklyDayFilterQuery(): void {

    this.queryDataMap.set(
      "WITH MEMBER Measures.Nul as Null SELECT {[Measures].[Nul]}*{[Time.Weekly].[Day].Members} ON COLUMNS FROM [Warehouse]",
      {
        "values": [
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "1",
                "Nul": null,
                "[Time.Weekly].[Day]": "15"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "1",
                "Nul": null,
                "[Time.Weekly].[Day]": "16"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "1",
                "Nul": null,
                "[Time.Weekly].[Day]": "17"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "1",
                "Nul": null,
                "[Time.Weekly].[Day]": "18"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "1",
                "Nul": null,
                "[Time.Weekly].[Day]": "19"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "1",
                "Nul": null,
                "[Time.Weekly].[Day]": "20"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "2",
                "Nul": null,
                "[Time.Weekly].[Day]": "1"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "2",
                "Nul": null,
                "[Time.Weekly].[Day]": "2"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "2",
                "Nul": null,
                "[Time.Weekly].[Day]": "3"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "2",
                "Nul": null,
                "[Time.Weekly].[Day]": "4"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "2",
                "Nul": null,
                "[Time.Weekly].[Day]": "21"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "2",
                "Nul": null,
                "[Time.Weekly].[Day]": "22"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "2",
                "Nul": null,
                "[Time.Weekly].[Day]": "23"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "2",
                "Nul": null,
                "[Time.Weekly].[Day]": "24"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "2",
                "Nul": null,
                "[Time.Weekly].[Day]": "25"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "2",
                "Nul": null,
                "[Time.Weekly].[Day]": "26"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "2",
                "Nul": null,
                "[Time.Weekly].[Day]": "27"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "3",
                "Nul": null,
                "[Time.Weekly].[Day]": "5"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "3",
                "Nul": null,
                "[Time.Weekly].[Day]": "6"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "3",
                "Nul": null,
                "[Time.Weekly].[Day]": "7"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "3",
                "Nul": null,
                "[Time.Weekly].[Day]": "8"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "3",
                "Nul": null,
                "[Time.Weekly].[Day]": "9"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "3",
                "Nul": null,
                "[Time.Weekly].[Day]": "10"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "3",
                "Nul": null,
                "[Time.Weekly].[Day]": "28"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "3",
                "Nul": null,
                "[Time.Weekly].[Day]": "30"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "3",
                "Nul": null,
                "[Time.Weekly].[Day]": "31"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "4",
                "Nul": null,
                "[Time.Weekly].[Day]": "15"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "4",
                "Nul": null,
                "[Time.Weekly].[Day]": "16"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "4",
                "Nul": null,
                "[Time.Weekly].[Day]": "17"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "4",
                "Nul": null,
                "[Time.Weekly].[Day]": "18"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "5",
                "Nul": null,
                "[Time.Weekly].[Day]": "19"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "5",
                "Nul": null,
                "[Time.Weekly].[Day]": "20"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "5",
                "Nul": null,
                "[Time.Weekly].[Day]": "21"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "6",
                "Nul": null,
                "[Time.Weekly].[Day]": "1"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "6",
                "Nul": null,
                "[Time.Weekly].[Day]": "26"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "6",
                "Nul": null,
                "[Time.Weekly].[Day]": "28"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "6",
                "Nul": null,
                "[Time.Weekly].[Day]": "29"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "6",
                "Nul": null,
                "[Time.Weekly].[Day]": "30"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "6",
                "Nul": null,
                "[Time.Weekly].[Day]": "31"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "7",
                "Nul": null,
                "[Time.Weekly].[Day]": "4"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "7",
                "Nul": null,
                "[Time.Weekly].[Day]": "5"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "7",
                "Nul": null,
                "[Time.Weekly].[Day]": "6"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "7",
                "Nul": null,
                "[Time.Weekly].[Day]": "8"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "8",
                "Nul": null,
                "[Time.Weekly].[Day]": "9"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "8",
                "Nul": null,
                "[Time.Weekly].[Day]": "11"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "8",
                "Nul": null,
                "[Time.Weekly].[Day]": "13"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "8",
                "Nul": null,
                "[Time.Weekly].[Day]": "14"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "8",
                "Nul": null,
                "[Time.Weekly].[Day]": "15"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "9",
                "Nul": null,
                "[Time.Weekly].[Day]": "16"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "9",
                "Nul": null,
                "[Time.Weekly].[Day]": "17"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "9",
                "Nul": null,
                "[Time.Weekly].[Day]": "19"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "9",
                "Nul": null,
                "[Time.Weekly].[Day]": "22"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "10",
                "Nul": null,
                "[Time.Weekly].[Day]": "1"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "10",
                "Nul": null,
                "[Time.Weekly].[Day]": "23"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "10",
                "Nul": null,
                "[Time.Weekly].[Day]": "24"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "10",
                "Nul": null,
                "[Time.Weekly].[Day]": "25"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "10",
                "Nul": null,
                "[Time.Weekly].[Day]": "26"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "10",
                "Nul": null,
                "[Time.Weekly].[Day]": "27"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "10",
                "Nul": null,
                "[Time.Weekly].[Day]": "28"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "11",
                "Nul": null,
                "[Time.Weekly].[Day]": "2"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "11",
                "Nul": null,
                "[Time.Weekly].[Day]": "3"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "11",
                "Nul": null,
                "[Time.Weekly].[Day]": "4"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "11",
                "Nul": null,
                "[Time.Weekly].[Day]": "5"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "11",
                "Nul": null,
                "[Time.Weekly].[Day]": "6"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "11",
                "Nul": null,
                "[Time.Weekly].[Day]": "7"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "11",
                "Nul": null,
                "[Time.Weekly].[Day]": "8"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "12",
                "Nul": null,
                "[Time.Weekly].[Day]": "9"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "12",
                "Nul": null,
                "[Time.Weekly].[Day]": "10"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "12",
                "Nul": null,
                "[Time.Weekly].[Day]": "11"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "12",
                "Nul": null,
                "[Time.Weekly].[Day]": "12"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "12",
                "Nul": null,
                "[Time.Weekly].[Day]": "13"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "12",
                "Nul": null,
                "[Time.Weekly].[Day]": "14"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "12",
                "Nul": null,
                "[Time.Weekly].[Day]": "15"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "13",
                "Nul": null,
                "[Time.Weekly].[Day]": "16"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "13",
                "Nul": null,
                "[Time.Weekly].[Day]": "17"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "13",
                "Nul": null,
                "[Time.Weekly].[Day]": "19"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "14",
                "Nul": null,
                "[Time.Weekly].[Day]": "25"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "15",
                "Nul": null,
                "[Time.Weekly].[Day]": "4"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "15",
                "Nul": null,
                "[Time.Weekly].[Day]": "5"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "15",
                "Nul": null,
                "[Time.Weekly].[Day]": "31"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "16",
                "Nul": null,
                "[Time.Weekly].[Day]": "6"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "16",
                "Nul": null,
                "[Time.Weekly].[Day]": "8"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "16",
                "Nul": null,
                "[Time.Weekly].[Day]": "9"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "16",
                "Nul": null,
                "[Time.Weekly].[Day]": "10"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "16",
                "Nul": null,
                "[Time.Weekly].[Day]": "12"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "17",
                "Nul": null,
                "[Time.Weekly].[Day]": "15"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "17",
                "Nul": null,
                "[Time.Weekly].[Day]": "16"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "17",
                "Nul": null,
                "[Time.Weekly].[Day]": "18"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "18",
                "Nul": null,
                "[Time.Weekly].[Day]": "21"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "19",
                "Nul": null,
                "[Time.Weekly].[Day]": "1"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "19",
                "Nul": null,
                "[Time.Weekly].[Day]": "3"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "19",
                "Nul": null,
                "[Time.Weekly].[Day]": "27"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "19",
                "Nul": null,
                "[Time.Weekly].[Day]": "28"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "19",
                "Nul": null,
                "[Time.Weekly].[Day]": "30"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "20",
                "Nul": null,
                "[Time.Weekly].[Day]": "4"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "20",
                "Nul": null,
                "[Time.Weekly].[Day]": "5"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "20",
                "Nul": null,
                "[Time.Weekly].[Day]": "6"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "20",
                "Nul": null,
                "[Time.Weekly].[Day]": "7"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "20",
                "Nul": null,
                "[Time.Weekly].[Day]": "8"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "20",
                "Nul": null,
                "[Time.Weekly].[Day]": "9"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "20",
                "Nul": null,
                "[Time.Weekly].[Day]": "10"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "21",
                "Nul": null,
                "[Time.Weekly].[Day]": "11"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "22",
                "Nul": null,
                "[Time.Weekly].[Day]": "20"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "22",
                "Nul": null,
                "[Time.Weekly].[Day]": "21"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "22",
                "Nul": null,
                "[Time.Weekly].[Day]": "22"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "22",
                "Nul": null,
                "[Time.Weekly].[Day]": "23"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "22",
                "Nul": null,
                "[Time.Weekly].[Day]": "24"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "23",
                "Nul": null,
                "[Time.Weekly].[Day]": "25"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "23",
                "Nul": null,
                "[Time.Weekly].[Day]": "27"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "23",
                "Nul": null,
                "[Time.Weekly].[Day]": "28"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "23",
                "Nul": null,
                "[Time.Weekly].[Day]": "30"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "23",
                "Nul": null,
                "[Time.Weekly].[Day]": "31"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "24",
                "Nul": null,
                "[Time.Weekly].[Day]": "1"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "24",
                "Nul": null,
                "[Time.Weekly].[Day]": "2"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "24",
                "Nul": null,
                "[Time.Weekly].[Day]": "3"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "24",
                "Nul": null,
                "[Time.Weekly].[Day]": "6"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "24",
                "Nul": null,
                "[Time.Weekly].[Day]": "7"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "25",
                "Nul": null,
                "[Time.Weekly].[Day]": "8"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "25",
                "Nul": null,
                "[Time.Weekly].[Day]": "9"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "26",
                "Nul": null,
                "[Time.Weekly].[Day]": "19"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "26",
                "Nul": null,
                "[Time.Weekly].[Day]": "21"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "27",
                "Nul": null,
                "[Time.Weekly].[Day]": "26"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "27",
                "Nul": null,
                "[Time.Weekly].[Day]": "27"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "27",
                "Nul": null,
                "[Time.Weekly].[Day]": "28"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "28",
                "Nul": null,
                "[Time.Weekly].[Day]": "4"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "28",
                "Nul": null,
                "[Time.Weekly].[Day]": "5"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "28",
                "Nul": null,
                "[Time.Weekly].[Day]": "30"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "29",
                "Nul": null,
                "[Time.Weekly].[Day]": "6"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "29",
                "Nul": null,
                "[Time.Weekly].[Day]": "8"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "29",
                "Nul": null,
                "[Time.Weekly].[Day]": "9"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "30",
                "Nul": null,
                "[Time.Weekly].[Day]": "14"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "30",
                "Nul": null,
                "[Time.Weekly].[Day]": "18"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "31",
                "Nul": null,
                "[Time.Weekly].[Day]": "20"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "31",
                "Nul": null,
                "[Time.Weekly].[Day]": "21"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "31",
                "Nul": null,
                "[Time.Weekly].[Day]": "22"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "31",
                "Nul": null,
                "[Time.Weekly].[Day]": "23"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "31",
                "Nul": null,
                "[Time.Weekly].[Day]": "24"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "31",
                "Nul": null,
                "[Time.Weekly].[Day]": "25"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "31",
                "Nul": null,
                "[Time.Weekly].[Day]": "26"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "32",
                "Nul": null,
                "[Time.Weekly].[Day]": "1"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "32",
                "Nul": null,
                "[Time.Weekly].[Day]": "2"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "32",
                "Nul": null,
                "[Time.Weekly].[Day]": "27"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "32",
                "Nul": null,
                "[Time.Weekly].[Day]": "28"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "32",
                "Nul": null,
                "[Time.Weekly].[Day]": "30"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "32",
                "Nul": null,
                "[Time.Weekly].[Day]": "31"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "33",
                "Nul": null,
                "[Time.Weekly].[Day]": "3"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "33",
                "Nul": null,
                "[Time.Weekly].[Day]": "4"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "33",
                "Nul": null,
                "[Time.Weekly].[Day]": "5"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "33",
                "Nul": null,
                "[Time.Weekly].[Day]": "6"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "33",
                "Nul": null,
                "[Time.Weekly].[Day]": "7"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "33",
                "Nul": null,
                "[Time.Weekly].[Day]": "8"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "33",
                "Nul": null,
                "[Time.Weekly].[Day]": "9"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "34",
                "Nul": null,
                "[Time.Weekly].[Day]": "13"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "35",
                "Nul": null,
                "[Time.Weekly].[Day]": "17"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "35",
                "Nul": null,
                "[Time.Weekly].[Day]": "19"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "35",
                "Nul": null,
                "[Time.Weekly].[Day]": "22"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "35",
                "Nul": null,
                "[Time.Weekly].[Day]": "23"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "36",
                "Nul": null,
                "[Time.Weekly].[Day]": "24"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "36",
                "Nul": null,
                "[Time.Weekly].[Day]": "25"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "36",
                "Nul": null,
                "[Time.Weekly].[Day]": "26"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "36",
                "Nul": null,
                "[Time.Weekly].[Day]": "27"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "36",
                "Nul": null,
                "[Time.Weekly].[Day]": "28"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "36",
                "Nul": null,
                "[Time.Weekly].[Day]": "30"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "37",
                "Nul": null,
                "[Time.Weekly].[Day]": "4"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "37",
                "Nul": null,
                "[Time.Weekly].[Day]": "5"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "37",
                "Nul": null,
                "[Time.Weekly].[Day]": "6"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "37",
                "Nul": null,
                "[Time.Weekly].[Day]": "31"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "38",
                "Nul": null,
                "[Time.Weekly].[Day]": "8"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "38",
                "Nul": null,
                "[Time.Weekly].[Day]": "9"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "40",
                "Nul": null,
                "[Time.Weekly].[Day]": "21"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "40",
                "Nul": null,
                "[Time.Weekly].[Day]": "23"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "40",
                "Nul": null,
                "[Time.Weekly].[Day]": "24"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "40",
                "Nul": null,
                "[Time.Weekly].[Day]": "25"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "40",
                "Nul": null,
                "[Time.Weekly].[Day]": "26"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "40",
                "Nul": null,
                "[Time.Weekly].[Day]": "27"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "41",
                "Nul": null,
                "[Time.Weekly].[Day]": "1"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "41",
                "Nul": null,
                "[Time.Weekly].[Day]": "2"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "41",
                "Nul": null,
                "[Time.Weekly].[Day]": "3"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "41",
                "Nul": null,
                "[Time.Weekly].[Day]": "4"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "41",
                "Nul": null,
                "[Time.Weekly].[Day]": "28"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "41",
                "Nul": null,
                "[Time.Weekly].[Day]": "30"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "42",
                "Nul": null,
                "[Time.Weekly].[Day]": "5"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "42",
                "Nul": null,
                "[Time.Weekly].[Day]": "6"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "42",
                "Nul": null,
                "[Time.Weekly].[Day]": "8"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "42",
                "Nul": null,
                "[Time.Weekly].[Day]": "9"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "44",
                "Nul": null,
                "[Time.Weekly].[Day]": "19"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "44",
                "Nul": null,
                "[Time.Weekly].[Day]": "20"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "44",
                "Nul": null,
                "[Time.Weekly].[Day]": "21"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "44",
                "Nul": null,
                "[Time.Weekly].[Day]": "22"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "44",
                "Nul": null,
                "[Time.Weekly].[Day]": "23"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "44",
                "Nul": null,
                "[Time.Weekly].[Day]": "24"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "44",
                "Nul": null,
                "[Time.Weekly].[Day]": "25"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "45",
                "Nul": null,
                "[Time.Weekly].[Day]": "1"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "45",
                "Nul": null,
                "[Time.Weekly].[Day]": "26"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "45",
                "Nul": null,
                "[Time.Weekly].[Day]": "27"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "45",
                "Nul": null,
                "[Time.Weekly].[Day]": "28"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "45",
                "Nul": null,
                "[Time.Weekly].[Day]": "30"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "45",
                "Nul": null,
                "[Time.Weekly].[Day]": "31"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "46",
                "Nul": null,
                "[Time.Weekly].[Day]": "2"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "46",
                "Nul": null,
                "[Time.Weekly].[Day]": "3"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "46",
                "Nul": null,
                "[Time.Weekly].[Day]": "4"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "46",
                "Nul": null,
                "[Time.Weekly].[Day]": "5"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "46",
                "Nul": null,
                "[Time.Weekly].[Day]": "6"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "46",
                "Nul": null,
                "[Time.Weekly].[Day]": "7"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "46",
                "Nul": null,
                "[Time.Weekly].[Day]": "8"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "47",
                "Nul": null,
                "[Time.Weekly].[Day]": "9"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "47",
                "Nul": null,
                "[Time.Weekly].[Day]": "10"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "47",
                "Nul": null,
                "[Time.Weekly].[Day]": "11"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "47",
                "Nul": null,
                "[Time.Weekly].[Day]": "12"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "47",
                "Nul": null,
                "[Time.Weekly].[Day]": "13"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "47",
                "Nul": null,
                "[Time.Weekly].[Day]": "14"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "47",
                "Nul": null,
                "[Time.Weekly].[Day]": "15"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "48",
                "Nul": null,
                "[Time.Weekly].[Day]": "16"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "48",
                "Nul": null,
                "[Time.Weekly].[Day]": "17"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "48",
                "Nul": null,
                "[Time.Weekly].[Day]": "19"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "48",
                "Nul": null,
                "[Time.Weekly].[Day]": "20"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "48",
                "Nul": null,
                "[Time.Weekly].[Day]": "21"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "48",
                "Nul": null,
                "[Time.Weekly].[Day]": "22"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "49",
                "Nul": null,
                "[Time.Weekly].[Day]": "26"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "49",
                "Nul": null,
                "[Time.Weekly].[Day]": "27"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "49",
                "Nul": null,
                "[Time.Weekly].[Day]": "28"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "50",
                "Nul": null,
                "[Time.Weekly].[Day]": "1"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "50",
                "Nul": null,
                "[Time.Weekly].[Day]": "2"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "50",
                "Nul": null,
                "[Time.Weekly].[Day]": "3"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "50",
                "Nul": null,
                "[Time.Weekly].[Day]": "4"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "50",
                "Nul": null,
                "[Time.Weekly].[Day]": "5"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "50",
                "Nul": null,
                "[Time.Weekly].[Day]": "6"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "50",
                "Nul": null,
                "[Time.Weekly].[Day]": "30"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "51",
                "Nul": null,
                "[Time.Weekly].[Day]": "8"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "51",
                "Nul": null,
                "[Time.Weekly].[Day]": "9"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "51",
                "Nul": null,
                "[Time.Weekly].[Day]": "10"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "51",
                "Nul": null,
                "[Time.Weekly].[Day]": "11"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "51",
                "Nul": null,
                "[Time.Weekly].[Day]": "12"
            },
            {
                "[Time.Weekly].[Year]": "1997",
                "[Time.Weekly].[Week]": "52",
                "Nul": null,
                "[Time.Weekly].[Day]": "14"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "1",
                "Nul": null,
                "[Time.Weekly].[Day]": "9"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "1",
                "Nul": null,
                "[Time.Weekly].[Day]": "10"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "1",
                "Nul": null,
                "[Time.Weekly].[Day]": "12"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "2",
                "Nul": null,
                "[Time.Weekly].[Day]": "18"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "4",
                "Nul": null,
                "[Time.Weekly].[Day]": "10"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "4",
                "Nul": null,
                "[Time.Weekly].[Day]": "31"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "6",
                "Nul": null,
                "[Time.Weekly].[Day]": "20"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "6",
                "Nul": null,
                "[Time.Weekly].[Day]": "21"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "8",
                "Nul": null,
                "[Time.Weekly].[Day]": "3"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "9",
                "Nul": null,
                "[Time.Weekly].[Day]": "8"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "10",
                "Nul": null,
                "[Time.Weekly].[Day]": "15"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "10",
                "Nul": null,
                "[Time.Weekly].[Day]": "16"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "10",
                "Nul": null,
                "[Time.Weekly].[Day]": "17"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "10",
                "Nul": null,
                "[Time.Weekly].[Day]": "18"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "10",
                "Nul": null,
                "[Time.Weekly].[Day]": "19"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "10",
                "Nul": null,
                "[Time.Weekly].[Day]": "20"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "12",
                "Nul": null,
                "[Time.Weekly].[Day]": "1"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "13",
                "Nul": null,
                "[Time.Weekly].[Day]": "13"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "13",
                "Nul": null,
                "[Time.Weekly].[Day]": "14"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "17",
                "Nul": null,
                "[Time.Weekly].[Day]": "5"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "17",
                "Nul": null,
                "[Time.Weekly].[Day]": "6"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "20",
                "Nul": null,
                "[Time.Weekly].[Day]": "1"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "20",
                "Nul": null,
                "[Time.Weekly].[Day]": "2"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "20",
                "Nul": null,
                "[Time.Weekly].[Day]": "26"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "20",
                "Nul": null,
                "[Time.Weekly].[Day]": "27"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "20",
                "Nul": null,
                "[Time.Weekly].[Day]": "28"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "21",
                "Nul": null,
                "[Time.Weekly].[Day]": "3"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "28",
                "Nul": null,
                "[Time.Weekly].[Day]": "26"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "30",
                "Nul": null,
                "[Time.Weekly].[Day]": "5"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "30",
                "Nul": null,
                "[Time.Weekly].[Day]": "6"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "30",
                "Nul": null,
                "[Time.Weekly].[Day]": "7"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "30",
                "Nul": null,
                "[Time.Weekly].[Day]": "10"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "33",
                "Nul": null,
                "[Time.Weekly].[Day]": "1"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "34",
                "Nul": null,
                "[Time.Weekly].[Day]": "2"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "37",
                "Nul": null,
                "[Time.Weekly].[Day]": "27"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "37",
                "Nul": null,
                "[Time.Weekly].[Day]": "28"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "37",
                "Nul": null,
                "[Time.Weekly].[Day]": "29"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "39",
                "Nul": null,
                "[Time.Weekly].[Day]": "6"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "39",
                "Nul": null,
                "[Time.Weekly].[Day]": "8"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "41",
                "Nul": null,
                "[Time.Weekly].[Day]": "20"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "42",
                "Nul": null,
                "[Time.Weekly].[Day]": "1"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "42",
                "Nul": null,
                "[Time.Weekly].[Day]": "2"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "42",
                "Nul": null,
                "[Time.Weekly].[Day]": "3"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "42",
                "Nul": null,
                "[Time.Weekly].[Day]": "27"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "42",
                "Nul": null,
                "[Time.Weekly].[Day]": "28"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "42",
                "Nul": null,
                "[Time.Weekly].[Day]": "30"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "43",
                "Nul": null,
                "[Time.Weekly].[Day]": "4"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "44",
                "Nul": null,
                "[Time.Weekly].[Day]": "16"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "44",
                "Nul": null,
                "[Time.Weekly].[Day]": "17"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "46",
                "Nul": null,
                "[Time.Weekly].[Day]": "30"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "46",
                "Nul": null,
                "[Time.Weekly].[Day]": "31"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "47",
                "Nul": null,
                "[Time.Weekly].[Day]": "1"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "48",
                "Nul": null,
                "[Time.Weekly].[Day]": "8"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "48",
                "Nul": null,
                "[Time.Weekly].[Day]": "9"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "48",
                "Nul": null,
                "[Time.Weekly].[Day]": "10"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "48",
                "Nul": null,
                "[Time.Weekly].[Day]": "14"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "49",
                "Nul": null,
                "[Time.Weekly].[Day]": "15"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "50",
                "Nul": null,
                "[Time.Weekly].[Day]": "24"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "50",
                "Nul": null,
                "[Time.Weekly].[Day]": "25"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "50",
                "Nul": null,
                "[Time.Weekly].[Day]": "28"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "51",
                "Nul": null,
                "[Time.Weekly].[Day]": "3"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "51",
                "Nul": null,
                "[Time.Weekly].[Day]": "4"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "51",
                "Nul": null,
                "[Time.Weekly].[Day]": "5"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "51",
                "Nul": null,
                "[Time.Weekly].[Day]": "30"
            },
            {
                "[Time.Weekly].[Year]": "1998",
                "[Time.Weekly].[Week]": "52",
                "Nul": null,
                "[Time.Weekly].[Day]": "6"
            }
        ]
      });

  }

  private addSizeFilterQuery(): void {

    this.queryDataMap.set(
      "WITH MEMBER Measures.Nul as Null SELECT {[Measures].[Nul]}*{[Store Size in SQFT].[Store Sqft].Members} ON COLUMNS FROM [Warehouse]",
      {
        "values": [
            {
                "[Store Size in SQFT].[Store Sqft]": "#null",
                "Nul": null
            },
            {
                "[Store Size in SQFT].[Store Sqft]": "20319",
                "Nul": null
            },
            {
                "[Store Size in SQFT].[Store Sqft]": "21215",
                "Nul": null
            },
            {
                "[Store Size in SQFT].[Store Sqft]": "22478",
                "Nul": null
            },
            {
                "[Store Size in SQFT].[Store Sqft]": "23112",
                "Nul": null
            },
            {
                "[Store Size in SQFT].[Store Sqft]": "23593",
                "Nul": null
            },
            {
                "[Store Size in SQFT].[Store Sqft]": "23598",
                "Nul": null
            },
            {
                "[Store Size in SQFT].[Store Sqft]": "23688",
                "Nul": null
            },
            {
                "[Store Size in SQFT].[Store Sqft]": "23759",
                "Nul": null
            },
            {
                "[Store Size in SQFT].[Store Sqft]": "24597",
                "Nul": null
            },
            {
                "[Store Size in SQFT].[Store Sqft]": "27694",
                "Nul": null
            },
            {
                "[Store Size in SQFT].[Store Sqft]": "28206",
                "Nul": null
            },
            {
                "[Store Size in SQFT].[Store Sqft]": "30268",
                "Nul": null
            },
            {
                "[Store Size in SQFT].[Store Sqft]": "30584",
                "Nul": null
            },
            {
                "[Store Size in SQFT].[Store Sqft]": "30797",
                "Nul": null
            },
            {
                "[Store Size in SQFT].[Store Sqft]": "33858",
                "Nul": null
            },
            {
                "[Store Size in SQFT].[Store Sqft]": "34452",
                "Nul": null
            },
            {
                "[Store Size in SQFT].[Store Sqft]": "34791",
                "Nul": null
            },
            {
                "[Store Size in SQFT].[Store Sqft]": "36509",
                "Nul": null
            },
            {
                "[Store Size in SQFT].[Store Sqft]": "38382",
                "Nul": null
            },
            {
                "[Store Size in SQFT].[Store Sqft]": "39696",
                "Nul": null
            }
        ]
      });

  }

  private addLineYZQuery(): void {

    this.queryDataMap.set(
      "TEST_QUERY_LINE_YZ",
      {
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
      });

  }

  private addBiggestStateQuery(): void {

    this.queryDataMap.set(
      "SELECT {[Measures].[Units Ordered]} ON ROWS, NON EMPTY HEAD(ORDER({[Store].[Store State].Members}, [Measures].[Units Ordered], DESC)) ON COLUMNS FROM [Warehouse]",
      {
        "values": [
          {
            "[Store].[Store State]": "WA",
            "[Store].[Stores].[Store Country]": "USA",
            "Units Ordered": 116025.0
          }
        ]
      });

  }

  private addSmallestStateQuery(): void {

    this.queryDataMap.set(
      "SELECT {[Measures].[Units Ordered]} ON ROWS, NON EMPTY TAIL(ORDER({[Store].[Store State].Members}, [Measures].[Units Ordered], DESC)) ON COLUMNS FROM [Warehouse]",
      {
        "values": [
          {
            "[Store].[Store State]": "OR",
            "[Store].[Stores].[Store Country]": "USA",
            "Units Ordered": 44906.0
          }
        ]
      });

  }

  private addMinusOregonQuery(): void {

    this.queryDataMap.set(
      "SELECT NON EMPTY {[Measures].[Units Ordered]} * {Except([Store].[Store State].Members, {[Store].[Store State].[OR]})} ON COLUMNS FROM [Warehouse]",
      {
        "values": [
            {
                "[Store].[Store Country]": "USA",
                "[Store].[Store State]": "CA",
                "Units Ordered": 66307.0
            },
            {
                "[Store].[Store Country]": "USA",
                "[Store].[Store State]": "WA",
                "Units Ordered": 116025.0
            }
        ]
      });

  }

  private addMinusWashingtonQuery(): void {

    this.queryDataMap.set(
      "SELECT NON EMPTY {[Measures].[Units Ordered]} * {Except([Store].[Store State].Members, {[Store].[Store State].[WA]})} ON COLUMNS FROM [Warehouse]",
      {
        "values": [
          {
            "[Store].[Store Country]": "USA",
            "[Store].[Store State]": "CA",
            "Units Ordered": 66307.0
          },
          {
            "[Store].[Store Country]": "USA",
            "[Store].[Store State]": "OR",
            "Units Ordered": 44906.0
          }
        ]
      });

  }

  private addMinusOregonWashingtonQuery(): void {

    this.queryDataMap.set(
      "SELECT NON EMPTY {[Measures].[Units Ordered]} * {Except([Store].[Store State].Members, {[Store].[Store State].[OR],[Store].[Store State].[WA]})} ON COLUMNS FROM [Warehouse]",
      {
        "values": [
          {
            "[Store].[Store Country]": "USA",
            "[Store].[Store State]": "CA",
            "Units Ordered": 66307.0
          }
        ]
      });

  }

  private addAllStatesQuery(): void {

    this.queryDataMap.set(
      "SELECT NON EMPTY {[Measures].[Units Ordered]} * {[Store].[Store State].Members} ON COLUMNS FROM [Warehouse]",
      {
        "values": [
          {
            "[Store].[Store Country]": "USA",
            "[Store].[Store State]": "CA",
            "Units Ordered": 66307.0
          },
          {
            "[Store].[Store Country]": "USA",
            "[Store].[Store State]": "OR",
            "Units Ordered": 44906.0
          },
          {
            "[Store].[Store Country]": "USA",
            "[Store].[Store State]": "WA",
            "Units Ordered": 116025.0
          }
        ]
      });

  }

}