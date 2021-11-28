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

// update this when there is a non-backwards compatible change to ui state. incrementing the value here
// will trigger a wipe of the user's saved UI state upon next init/refresh.
const APP_VERSION = 2.0;

class UiStateDatabase extends Dexie {

  uiStates: Dexie.Table<any, string>;

  constructor() {
    super(INDEXEDDB_NAME);
    this.version(1).stores({
      uiStates: 'name'
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
  executeQuery(mdx: string, connection: string, simplifyNames: boolean, excludedFilterDimensions: string[]): Promise<{ values: any[] }>;
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
            const potentialUiState = UserInterfaceState.fromJson(uiStates[0]);
            if (potentialUiState.appVersion === null || potentialUiState.appVersion < APP_VERSION) {
              // eslint-disable-next-line no-console
              console.warn("Outdated app detected, saved config app version=" + potentialUiState.appVersion + ", current app version is " + APP_VERSION);
              this._uiState = new UserInterfaceState();
            } else {
              this._uiState = UserInterfaceState.fromJson(uiStates[0]);
            }
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
    if (this._uiState) {
      this.dimensionFilterModel.syncWith(this._uiState.dimensionFilterModel);
      this._uiState.dimensionFilterModel = this.dimensionFilterModel;
    }
    return this.saveCurrentState(this._uiState);
  }

  async saveCurrentState(currentState: UserInterfaceState): Promise<void> {
    this._uiState = currentState;
    this._uiState.appVersion = APP_VERSION;
    return this.uiStateDb.uiStates.put(UserInterfaceState.toJson(this._uiState)).then((_key: string): void => {});
  }

  async getSavedState(): Promise<UserInterfaceState> {
    // todo: if there is ever a way to get the saved state other than at init(), we'll want to implement the query here
    return Promise.resolve(this._uiState);
  }

  get firstVisit(): boolean {
    return this._firstVisit;
  }

  abstract executeQuery(mdx: string, connection: string, simplifyNames: boolean, excludedFilterDimensions: string[]): Promise<{ values: any[] }>;
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
      }).filter((fd: FilterDimension): boolean => {
        return !this._config.excludedDimensions || !this._config.excludedDimensions.includes(fd.dimension);
      });

      const promises: Promise<void>[] = this._filterDimensions.map(async (filterDimension: FilterDimension): Promise<void> => {
        return this.executeQuery(filterDimension.query, filterDimension.connection, false, []).then((results: { values: any[] }): void => {
          const levels: Map<string, boolean> = new Map<string, boolean>();
          if (results) {
            const matchingDimensions: FilterDimension[] = this._config.filterDimensions
              .filter((customDimension: FilterDimension): boolean => {
                return customDimension.dimension === filterDimension.dimension && customDimension.defaultSelectedValues !== null;
              });
            results.values.forEach((value: any): void => {
              const checked = matchingDimensions ? matchingDimensions[0].defaultSelectedValues.includes(value[filterDimension.dimension]) : true;
              levels.set(value[filterDimension.dimension], checked);
            });
          } else {
            // eslint-disable-next-line no-console
            console.warn("No results found for query: " + filterDimension.query);
          }
          this.dimensionFilterModel.addDimensionLevels(filterDimension, levels);
        });
      });

      return Promise.all(promises);

    });
    
  }

  protected applyDimensionFiltersToMdx(mdx: string, excludedFilterDimensions: string[]): string {
    return this.dimensionFilterModel.applyTo(mdx, excludedFilterDimensions);
  }

  private makeDoubleHashRegex(dimension: string): RegExp {
    return new RegExp("#" + dimension.replace(/\[/g, "\\[").replace(/\]/g, "\\]").replace(/\./g, "\\.") + "#", "g");
  }

  private async replacePropertyPlaceholders(config: Config): Promise<Config> {
    // for now, we just replace properties in the dataCaveatText...could do other things later
    const promises: Promise<PropertyPlaceholderReplacement>[] = [];
    config.propertyPlaceholders.forEach((propertyPlaceholder: PropertyPlaceholder): void => {
      promises.push(this.executeQuery(propertyPlaceholder.query, propertyPlaceholder.connection, false, []).then((data: { values: any[] }): Promise<PropertyPlaceholderReplacement> => {
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

  async executeQuery(mdx: string, _connection: string, _simplifyNames: boolean, excludedFilterDimensions: string[]): Promise<{ values: any[] }> {

    mdx = this.applyDimensionFiltersToMdx(mdx, excludedFilterDimensions);
    const data: any = new TestData().queryDataMap.get(mdx);

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
    return fetch(this.config.mondrianRestURL + "/getDimensions?connectionName=" + this._config.connection + "&includeMembers=false&cube=" + this._config.cube, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(async (response: Response) => {
      return response.json().then(async (json: any): Promise<any> => {
        return Promise.resolve(FilterDimension.fromGetDimensionsJson(json, this.config.connection, this.config.cube));
      });
    });
  }

  async executeQuery(mdx: string, connection: string, simplifyNames: boolean, excludedFilterDimensions: string[]): Promise<{ values: any[] }> {

    mdx = this.applyDimensionFiltersToMdx(mdx, excludedFilterDimensions);

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