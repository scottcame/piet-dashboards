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
import { TestData } from "../test/_data/TestData";
import { Config, FilterDimension, PropertyPlaceholder } from "./Config";
import { UserInterfaceState } from "./UserInterfaceState";
import Dexie from 'dexie';
import { DimensionFilterModel } from "./DimensionFilterModel";

/* eslint-disable @typescript-eslint/no-explicit-any */

const INDEXEDDB_NAME = "PietDashboardUiRepository";

class UiStateDatabase extends Dexie {

  uiStates: Dexie.Table<any, string>;

  constructor() {
    super(INDEXEDDB_NAME);
    this.version(1).stores({
      uiStates: 'name',
    });
  }

}

export interface Repository {
  readonly label: string;
  readonly config: Config;
  readonly uiState: UserInterfaceState;
  readonly firstVisit: boolean;
  readonly filterDimensions: FilterDimension[];
  dimensionFilterModel: DimensionFilterModel;
  init(): Promise<Config>;
  executeQuery(mdx: string, connection: string, simplifyNames: boolean): Promise<{ values: any[] }>;
  saveCurrentState(currentState: UserInterfaceState): Promise<void>;
  getSavedState(): Promise<UserInterfaceState>;
  getFilterDimensionLabel(dimension: string): string;
 }

abstract class AbstractRepository implements Repository {

  private uiStateDb: UiStateDatabase = new UiStateDatabase();
  protected _config: Config;
  protected _uiState: UserInterfaceState;
  private _firstVisit = true;
  private _filterDimensions: FilterDimension[] = [];
  dimensionFilterModel = new DimensionFilterModel();
  dimensionFilters: any;

  get config(): Config {
    return this._config;
  }

  get uiState(): UserInterfaceState {
    return this._uiState;
  }

  get filterDimensions(): FilterDimension[] {
    return this._filterDimensions;
  }

  getFilterDimensionLabel(dimension: string): string {
    let ret: string = null;
    this.filterDimensions.forEach((d: FilterDimension): void => {
      if (d.dimension === dimension) {
        ret = d.label;
      }
    });
    return ret;
  }

  async init(): Promise<Config> {
    return Dexie.exists(INDEXEDDB_NAME).then(async (exists: boolean) => {
      let ret = Promise.resolve(null);
      if (exists) {
        ret = this.uiStateDb.uiStates.toArray().then(async uiStates => {
          if (uiStates[0]) {
            this._uiState = UserInterfaceState.fromJson(uiStates[0]);
            this._firstVisit = false;
          }
        });
      } else {
        this._uiState = new UserInterfaceState();
        ret = this.saveCurrentState(this._uiState);
      }
      return ret.then(async () => {
        return this.fetchConfig().then(async (fetchedConfig: Config): Promise<Config> => {
          this._config = fetchedConfig;
          return this.replacePropertyPlaceholders(fetchedConfig).then(async (editedConfig: Config): Promise<Config> => {
            this._config = editedConfig;
            return this.populateDimensionFilters().then(async () => {
              return this.syncDimensionFilterModel().then(async () => {
                return Promise.resolve(this._config);
              });
            });
          });
        });
      }); 
    });
  }

  private syncDimensionFilterModel(): Promise<void> {
    this.dimensionFilterModel.dimensions.forEach((dimension: string, rowIndex: number): void => {
      if (this._uiState && this._uiState.dimensionFilterModel) {
        this._uiState.dimensionFilterModel.dimensions.forEach((savedDimension: string, savedRowIndex: number): void => {
          if (dimension === savedDimension) {
            const savedValueMap = this._uiState.dimensionFilterModel.dimensionLevelValues[savedRowIndex];
            savedValueMap.forEach((value: boolean, key: string): void => {
              if (this.dimensionFilterModel.dimensionLevelValues[rowIndex].has(key)) {
                this.dimensionFilterModel.dimensionLevelValues[rowIndex].set(key, value);
              }
            });
          }
        });
      }
    });
    this._uiState.dimensionFilterModel = this.dimensionFilterModel;
    return this.saveCurrentState(this._uiState);
  }

  async saveCurrentState(currentState: UserInterfaceState): Promise<void> {
    this._uiState = currentState;
    return this.uiStateDb.uiStates.put(UserInterfaceState.toJson(this._uiState)).then((_key: string): void => {});
  }

  async getSavedState(): Promise<UserInterfaceState> {
    // todo: if there is ever a way to get the saved state other than at init(), we'll want to implement the query here
    return Promise.resolve(this._uiState);
  }

  get firstVisit(): boolean {
    return this._firstVisit;
  }

  abstract executeQuery(mdx: string, connection: string, simplifyNames: boolean): Promise<{ values: any[] }>;
  abstract get label(): string;

  protected abstract fetchConfig(): Promise<Config>;

  protected abstract fetchDimensions(): Promise<FilterDimension[]>;

  protected async populateDimensionFilters(): Promise<void[]> {

    return this.fetchDimensions().then((filterDimensions: FilterDimension[]): Promise<void[]> => {
      this._filterDimensions = filterDimensions.map((d: FilterDimension): FilterDimension => {
        const matchingDimensions: FilterDimension[] = this._config.filterDimensions
          .filter((customDimension: FilterDimension): boolean => {
            return customDimension.dimension === d.dimension;
          });
        if (matchingDimensions.length) {
          d.updateFrom(matchingDimensions[0]);
        }
        return d;
      });
      const promises: Promise<void>[] = this._filterDimensions.map(async (filterDimension: FilterDimension): Promise<void> => {
        return this.executeQuery(filterDimension.query, filterDimension.connection, false).then((results: { values: any[] }): void => {
          const levels: Map<string, boolean> = new Map<string, boolean>();
          if (results) {
            results.values.forEach((value: any): void => {
              levels.set(value[filterDimension.dimension], true);
            });
          } else {
            console.warn("No results found for query: " + filterDimension.query);
          }
          this.dimensionFilterModel.addDimensionLevels(filterDimension, levels);
        });
      });
      return Promise.all(promises);
    });
    
  }

  protected replaceDimensionFilterPlaceholders(mdx: string): string {
    // const replacementMap = new Map<string, string>();
    // [...this.dimensionFilters.keys()].forEach((dimension: string): void => {
    //   let allSelected = true;
    //   const selectedLevels: string[] = [];
    //   const selectionMap = this.dimensionFilters.get(dimension);
    //   [...selectionMap.keys()].forEach((level: string): void => {
    //     const value = selectionMap.get(level);
    //     if (value) {
    //       selectedLevels.push(dimension + ".[" + level + "]");
    //     } else {
    //       allSelected = false;
    //     }
    //   });
    //   replacementMap.set(dimension, allSelected ? (dimension + ".Members") : selectedLevels.join(","));
    // });
    // [...replacementMap.keys()].forEach((dimension: string): void => {
    //   const dimensionRegex = this.makeDoubleHashRegex(dimension);
    //   mdx = mdx.replace(dimensionRegex, replacementMap.get(dimension));
    // });
    return mdx;
  }

  private makeDoubleHashRegex(dimension: string): RegExp {
    return new RegExp("#" + dimension.replace(/\[/g, "\\[").replace(/\]/g, "\\]").replace(/\./g, "\\.") + "#", "g")
  }

  private async replacePropertyPlaceholders(config: Config): Promise<Config> {
    // for now, we just replace properties in the dataCaveatText...could do other things later
    const promises: Promise<PropertyPlaceholderReplacement>[] = [];
    config.propertyPlaceholders.forEach((propertyPlaceholder: PropertyPlaceholder): void => {
      promises.push(this.executeQuery(propertyPlaceholder.query, propertyPlaceholder.connection, false).then((data: { values: any[] }): Promise<PropertyPlaceholderReplacement> => {
        if (data) {
          const propertyPlaceholderReplacement: PropertyPlaceholderReplacement = new PropertyPlaceholderReplacement();
          propertyPlaceholderReplacement.values = data.values;
          propertyPlaceholderReplacement.propertyPlaceholder = propertyPlaceholder;
          return Promise.resolve(propertyPlaceholderReplacement);
        }
        return Promise.resolve(null);
      }));
    });
    return Promise.all(promises).then((propertyPlaceholderReplacements: PropertyPlaceholderReplacement[]): Promise<Config> => {
      propertyPlaceholderReplacements.forEach((propertyPlaceholderReplacement: PropertyPlaceholderReplacement): void => {
        if (propertyPlaceholderReplacement) {
          const value = propertyPlaceholderReplacement.values[0][propertyPlaceholderReplacement.propertyPlaceholder.dimension];
          config.dataCaveatText = config.dataCaveatText.replace(this.makeDoubleHashRegex(propertyPlaceholderReplacement.propertyPlaceholder.propertyName), value);
        }
      });
      return Promise.resolve(config);
    });
  }

}

class PropertyPlaceholderReplacement {
  propertyPlaceholder: PropertyPlaceholder;
  values: any[];
}

export class LocalRepository extends AbstractRepository {

  private simulatedDelay: number;

  constructor(simulatedDelay=0) {
    super();
    this.simulatedDelay = simulatedDelay;
  }

  protected fetchConfig(): Promise<Config> {
    return Promise.resolve(Config.fromJson(TestData.TEST_CONFIG));
  }

  protected async fetchDimensions(): Promise<FilterDimension[]> {
    return Promise.resolve(FilterDimension.fromGetDimensionsJson(TestData.TEST_DIMENSIONS, this.config.connection, this.config.cube));
  }

  async executeQuery(mdx: string, _connection: string, _simplifyNames: boolean): Promise<{ values: any[] }> {

    mdx = this.replaceDimensionFilterPlaceholders(mdx);

    let data: any = null;

    if (mdx === TestData.TEST_QUERY_1D) {
      data = TestData.TEST_RESULTS_1D;
    } else if (mdx === TestData.TEST_QUERY_1D_EXCLUDES) {
      data = TestData.TEST_RESULTS_1D_EXCLUDES;
    } else if (mdx === TestData.TEST_QUERY_LINE_SIMPLE) {
      data = TestData.TEST_RESULTS_LINE_SIMPLE;
    } else if (mdx === TestData.TEST_QUERY_LINE_2_MEASURES) {
      data = TestData.TEST_RESULTS_LINE_2_MEASURES;
    } else if (mdx === TestData.TEST_QUERY_LINE_TEMPORAL_1_MEASURE_YEAR) {
      data = TestData.TEST_RESULTS_LINE_TEMPORAL_1_MEASURE_YEAR;
    } else if (mdx === TestData.TEST_QUERY_LINE_TEMPORAL_1_MEASURE_YEAR_MONTH) {
      data = TestData.TEST_RESULTS_LINE_TEMPORAL_1_MEASURE_YEAR_MONTH;
    } else if (mdx === TestData.TEST_QUERY_LINE_TEMPORAL_1_MEASURE_YEAR_MONTH_DAY) {
      data = TestData.TEST_RESULTS_LINE_TEMPORAL_1_MEASURE_YEAR_MONTH_DAY;
    } else if (mdx === TestData.TEST_QUERY_LINE_TEMPORAL_1_MEASURE_DATE) {
      data = TestData.TEST_RESULTS_LINE_TEMPORAL_1_MEASURE_DATE;
    } else if (mdx === TestData.TEST_QUERY_LINE_TEMPORAL_RANDOM1) {
      data = TestData.TEST_RESULTS_LINE_TEMPORAL_RANDOM1;
    } else if (mdx === TestData.TEST_QUERY_LINE_YZ) {
      data = TestData.TEST_RESULTS_LINE_YZ;
    } else if (mdx === TestData.TEST_QUERY_DIMENSION_COUNTRY_FILTER) {
      data = TestData.TEST_RESULTS_DIMENSION_COUNTRY_FILTER;
    } else if (mdx === TestData.TEST_QUERY_DIMENSION_STATE_FILTER) {
      data = TestData.TEST_RESULTS_DIMENSION_STATE_FILTER;
    } else if (mdx === TestData.TEST_QUERY_DIMENSION_CITY_FILTER) {
      data = TestData.TEST_RESULTS_DIMENSION_CITY_FILTER;
    } else if (mdx === TestData.TEST_QUERY_DIMENSION_NAME_FILTER) {
      data = TestData.TEST_RESULTS_DIMENSION_NAME_FILTER;
    } else if (mdx === TestData.TEST_QUERY_DIMENSION_SIZE_FILTER) {
      data = TestData.TEST_RESULTS_DIMENSION_SIZE_FILTER;
    } else if (mdx === TestData.TEST_QUERY_DIMENSION_TIME_YEAR_FILTER) {
      data = TestData.TEST_RESULTS_DIMENSION_TIME_YEAR_FILTER;
    } else if (mdx === TestData.TEST_QUERY_DIMENSION_TIME_QUARTER_FILTER) {
      data = TestData.TEST_RESULTS_DIMENSION_TIME_QUARTER_FILTER;
    } else if (mdx === TestData.TEST_QUERY_DIMENSION_TIME_MONTH_FILTER) {
      data = TestData.TEST_RESULTS_DIMENSION_TIME_MONTH_FILTER;
    } else if (mdx === TestData.TEST_QUERY_DIMENSION_TIME_WEEKLY_YEAR_FILTER) {
      data = TestData.TEST_RESULTS_DIMENSION_TIME_WEEKLY_YEAR_FILTER;
    } else if (mdx === TestData.TEST_QUERY_DIMENSION_TIME_WEEKLY_WEEK_FILTER) {
      data = TestData.TEST_RESULTS_DIMENSION_TIME_WEEKLY_WEEK_FILTER;
    } else if (mdx === TestData.TEST_QUERY_DIMENSION_TIME_WEEKLY_DAY_FILTER) {
      data = TestData.TEST_RESULTS_DIMENSION_TIME_WEEKLY_DAY_FILTER;
    } else if (mdx === TestData.TEST_QUERY_FOR_BIGGEST_STATE) {
      data = TestData.TEST_RESULTS_FOR_BIGGEST_STATE;
    } else if (mdx === TestData.TEST_QUERY_FOR_SMALLEST_STATE) {
      data = TestData.TEST_RESULTS_FOR_SMALLEST_STATE;
    } else {
      data = TestData.getFilteredData(mdx);
    }

    return new Promise((resolve: (value: { values: any[] }) => void) => {
      setTimeout((_handler: TimerHandler): void => {
        resolve(data);
      }, this.simulatedDelay);
    });

  }

  async saveCurrentState(currentState: UserInterfaceState): Promise<void> {
    return super.saveCurrentState(currentState).then(() => {
      // eslint-disable-next-line no-console
      console.log(currentState);
    });
  }

  get label(): string {
    return "local";
  }

}

export class RemoteRepository extends AbstractRepository {

  private remoteApiUrl: string;

  constructor(remoteApiUrl: string) {
    super();
    this.remoteApiUrl = remoteApiUrl;
  }

  protected async fetchConfig(): Promise<Config> {
    const configUrl = this.remoteApiUrl + "config";
    return fetch(configUrl).then(async (response: Response) => {
      return response.json().then(async (json: any): Promise<Config> => {
        return Promise.resolve(Config.fromJson(json));
      });
    });
  }

  protected async fetchDimensions(): Promise<FilterDimension[]> {
    return Promise.resolve([]);
  }

  async executeQuery(mdx: string, connection: string, simplifyNames: boolean): Promise<{ values: any[] }> {

    mdx = this.replaceDimensionFilterPlaceholders(mdx);

    const request: any = new Object();
		request.connectionName = connection;
		request.query = mdx;
		request.tidy = new Object();
		request.tidy.enabled = true;
		request.tidy.simplifyNames = simplifyNames;
    
    let ret = Promise.resolve(null);

    ret = fetch(this.config.mondrianRestURL + "/query", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    }).then(async (response: Response) => {
      return response.json().then(async (vegaLiteSpec: any): Promise<any> => {
        return Promise.resolve(vegaLiteSpec);
      });
    });

    return ret;

  }

  async saveCurrentState(currentState: UserInterfaceState): Promise<void> {
    return super.saveCurrentState(currentState);
  }

  async getSavedState(): Promise<UserInterfaceState> {
    return super.getSavedState();
  }

  get label(): string {
    return "remote";
  }

}