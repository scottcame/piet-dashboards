import { TestData } from "../test/_data/TestData";
import { Config, FilterDimension } from "./Config";
import { UserInterfaceState } from "./UserInterfaceState";
import Dexie from 'dexie';

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
  dimensionFilters: Map<string, Map<string, boolean>>;
  init(): Promise<Config>;
  executeQuery(mdx: string, connection: string, simplifyNames: boolean): Promise<{ values: any[] }>;
  saveCurrentState(currentState: UserInterfaceState): Promise<void>;
  getSavedState(): Promise<UserInterfaceState>;
 }

abstract class AbstractRepository implements Repository {

  private uiStateDb: UiStateDatabase = new UiStateDatabase();
  protected _config: Config;
  protected _uiState: UserInterfaceState;
  dimensionFilters = new Map<string, Map<string, boolean>>();

  get config(): Config {
    return this._config;
  }

  get uiState(): UserInterfaceState {
    return this._uiState;
  }

  async init(): Promise<Config> {
    return Dexie.exists(INDEXEDDB_NAME).then(async (exists: boolean) => {
      let ret = Promise.resolve(null);
      if (exists) {
        ret = this.uiStateDb.uiStates.toArray().then(async uiStates => {
          if (uiStates[0]) {
            this._uiState = UserInterfaceState.fromJson(uiStates[0]);
          }
        });
      } else {
        this._uiState = new UserInterfaceState();
      }
      return ret.then(async () => {
        return this.fetchConfig().then(async (fetchedConfig: Config) => {
          this._config = fetchedConfig;
          return this.populateDimensionFilters().then(async () => {
            return Promise.resolve(this._config);
          });
        });
      }); 
    });
  }

  async saveCurrentState(currentState: UserInterfaceState): Promise<void> {
    this._uiState = currentState;
    return this.uiStateDb.uiStates.put(UserInterfaceState.toJson(this._uiState)).then((_key: string): void => {});
  }

  async getSavedState(): Promise<UserInterfaceState> {
    // todo: if there is ever a way to get the saved state other than at init(), we'll want to implement the query here
    return Promise.resolve(this._uiState);
  }

  abstract executeQuery(mdx: string, connection: string, simplifyNames: boolean): Promise<{ values: any[] }>;
  abstract get label(): string;

  protected abstract fetchConfig(): Promise<Config>;

  protected async populateDimensionFilters(): Promise<void[]> {
    const promises: Promise<void>[] = this._config.filterDimensions.map(async (filterDimension: FilterDimension): Promise<void> => {
      return this.executeQuery(filterDimension.query, filterDimension.connection, false).then((results: { values: any[] }): void => {
        const levels: Map<string, boolean> = new Map<string, boolean>();
        results.values.forEach((value: any): void => {
          levels.set(value[filterDimension.dimension], true);
        });
        this.dimensionFilters.set(filterDimension.dimension, levels);
      });
    });
    return Promise.all(promises);
  }

  protected replaceDimensionFilterPlaceholders(mdx: string): string {
    const replacementMap = new Map<string, string>();
    [...this.dimensionFilters.keys()].forEach((dimension: string): void => {
      let allSelected = true;
      let selectedLevels: string[] = [];
      const selectionMap = this.dimensionFilters.get(dimension);
      [...selectionMap.keys()].forEach((level: string): void => {
        const value = selectionMap.get(level);
        if (value) {
          selectedLevels.push(dimension + ".[" + level + "]");
        } else {
          allSelected = false;
        }
      });
      replacementMap.set(dimension, allSelected ? (dimension + ".Members") : selectedLevels.join(","));
    });
    [...replacementMap.keys()].forEach((dimension: string): void => {
      const dimensionRegex = dimension.replace(/\[/g, "\\[").replace(/\]/g, "\\]").replace(/\./g, "\\.");
      mdx = mdx.replace(new RegExp("#" + dimensionRegex + "#", "g"), replacementMap.get(dimension));
    });
    return mdx;
  }

}

export class LocalRepository extends AbstractRepository {

  protected fetchConfig(): Promise<Config> {
    return Promise.resolve(Config.fromJson(TestData.TEST_CONFIG));
  }

  async executeQuery(mdx: string, _connection: string, _simplifyNames: boolean): Promise<{ values: any[] }> {

    mdx = this.replaceDimensionFilterPlaceholders(mdx);

    let ret = Promise.resolve(null);

    if (mdx === TestData.TEST_QUERY_1D) {
      ret = Promise.resolve(TestData.TEST_RESULTS_1D);
    } else if (mdx === TestData.TEST_QUERY_1D_EXCLUDES) {
      ret = Promise.resolve(TestData.TEST_RESULTS_1D_EXCLUDES);
    } else if (mdx === TestData.TEST_QUERY_LINE_SIMPLE) {
      ret = Promise.resolve(TestData.TEST_RESULTS_LINE_SIMPLE);
    } else if (mdx === TestData.TEST_QUERY_LINE_2_MEASURES) {
      ret = Promise.resolve(TestData.TEST_RESULTS_LINE_2_MEASURES);
    } else if (mdx === TestData.TEST_QUERY_LINE_TEMPORAL_1_MEASURE_YEAR) {
      ret = Promise.resolve(TestData.TEST_RESULTS_LINE_TEMPORAL_1_MEASURE_YEAR);
    } else if (mdx === TestData.TEST_QUERY_LINE_TEMPORAL_1_MEASURE_YEAR_MONTH) {
      ret = Promise.resolve(TestData.TEST_RESULTS_LINE_TEMPORAL_1_MEASURE_YEAR_MONTH);
    } else if (mdx === TestData.TEST_QUERY_LINE_TEMPORAL_1_MEASURE_YEAR_MONTH_DAY) {
      ret = Promise.resolve(TestData.TEST_RESULTS_LINE_TEMPORAL_1_MEASURE_YEAR_MONTH_DAY);
    } else if (mdx === TestData.TEST_QUERY_LINE_TEMPORAL_1_MEASURE_DATE) {
      ret = Promise.resolve(TestData.TEST_RESULTS_LINE_TEMPORAL_1_MEASURE_DATE);
    } else if (mdx === TestData.TEST_QUERY_LINE_TEMPORAL_RANDOM1) {
      ret = Promise.resolve(TestData.TEST_RESULTS_LINE_TEMPORAL_RANDOM1);
    } else if (mdx === TestData.TEST_QUERY_LINE_YZ) {
      ret = Promise.resolve(TestData.TEST_RESULTS_LINE_YZ);
    } else if (mdx === TestData.TEST_QUERY_DIMENSION_FILTER) {
      ret = Promise.resolve(TestData.TEST_RESULTS_DIMENSION_FILTER);
    } else {
      return Promise.resolve(TestData.getFilteredData(mdx));
    }

    return ret;

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
    return super.saveCurrentState(currentState)
  }

  async getSavedState(): Promise<UserInterfaceState> {
    return super.getSavedState();
  }

  get label(): string {
    return "remote";
  }

}