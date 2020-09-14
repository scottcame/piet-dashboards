import { TestData } from "../test/_data/TestData";
import { Config } from "./Config";
import { UserInterfaceState, WidgetState } from "./UserInterfaceState";
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
  init(): Promise<Config>;
  executeQuery(mdx: string, connection: string, simplifyNames: boolean): Promise<{ values: any[] }>;
  saveCurrentState(currentState: UserInterfaceState): Promise<void>;
  getSavedState(): Promise<UserInterfaceState>;
 }

abstract class AbstractRepository implements Repository {

  private uiStateDb: UiStateDatabase = new UiStateDatabase();
  protected _config: Config;
  protected _uiState: UserInterfaceState;

  get config(): Config {
    return this._config;
  }

  get uiState(): UserInterfaceState {
    return this._uiState;
  }

  async init(): Promise<Config> {
    return Dexie.exists(INDEXEDDB_NAME).then(async exists => {
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
      return ret;
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

}

export class LocalRepository extends AbstractRepository {

  async init(): Promise<Config> {
    return super.init().then(async () => {
      this._config = Config.fromJson(TestData.TEST_CONFIG);
      return Promise.resolve(this._config);
    });
  }

  async executeQuery(mdx: string, _connection: string, _simplifyNames: boolean): Promise<{ values: any[] }> {
    
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

  async init(): Promise<Config> {
    let ret = Promise.resolve(null);
    const configUrl = this.remoteApiUrl + "config";
    ret = fetch(configUrl).then(async (response: Response) => {
      if (response.redirected) {
        location.reload(true);
        return Promise.resolve(null);
      }
      return response.json().then(async (json: any): Promise<Config> => {
        this._config = Config.fromJson(json);
        return Promise.resolve(this._config);
      });
    }).catch((reason: any) => {
      throw new Error(reason);
    });
    return ret;
  }

  async executeQuery(mdx: string, connection: string, simplifyNames: boolean): Promise<{ values: any[] }> {

    const request: any = new Object();
		request.connectionName = connection;
		request.query = mdx;
		request.tidy = new Object();
		request.tidy.enabled = true;
		request.tidy.simplifyNames = simplifyNames;
    
    let ret = Promise.resolve(null);

    ret = fetch("/mondrian-rest-dashboard/query", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    }).then(async (response: Response) => {
      if (response.redirected) {
        location.reload(true);
        return Promise.resolve(null);
      }
      return response.json().then(async (vegaLiteSpec: any): Promise<any> => {
        return Promise.resolve(vegaLiteSpec);
      });
    });

    return ret;

  }

  async saveCurrentState(currentState: UserInterfaceState): Promise<void> {
    // eslint-disable-next-line no-console
    console.log("Saving current state");
    // eslint-disable-next-line no-console
    console.log(currentState);
    return Promise.resolve();
  }

  async getSavedState(): Promise<UserInterfaceState> {
    return super.getSavedState();
  }

  get label(): string {
    return "remote";
  }

}