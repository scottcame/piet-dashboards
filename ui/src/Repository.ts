import { TestData } from "../test/_data/TestData";
import { Config } from "./Config";
import { UserInterfaceState, WidgetState } from "./UserInterfaceState";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Repository {
  readonly label: string;
  readonly config: Config;
  init(): Promise<Config>;
  executeQuery(mdx: string, connection: string, simplifyNames: boolean, levelNameTranslationMap: any): Promise<any>;
  saveCurrentState(currentState: WidgetState[][]): Promise<void>;
  getSavedState(): Promise<UserInterfaceState>;
 }

abstract class AbstractRepository implements Repository {
  protected _config: Config;
  get config(): Config {
    return this._config;
  }
  abstract init(): Promise<Config>;
  abstract executeQuery(mdx: string, connection: string, simplifyNames: boolean, levelNameTranslationMap: any): Promise<any>;
  abstract saveCurrentState(currentState: WidgetState[][]);
  abstract get label(): string;

  async getSavedState(): Promise<UserInterfaceState> {
    const ret = new UserInterfaceState();
    ret.widgetStateGrid = [];
    return Promise.resolve(ret);
  }
}

export class LocalRepository extends AbstractRepository {

  async init(): Promise<Config> {
    this._config = Config.fromJson(TestData.TEST_CONFIG);
    return Promise.resolve(this._config);
  }

  async executeQuery(mdx: string, _connection: string, _simplifyNames: boolean, _levelNameTranslationMap: any): Promise<any> {
    
    let ret = Promise.resolve(null);

    if (mdx === TestData.TEST_QUERY_1D) {
      ret = Promise.resolve(TestData.TEST_RESULTS_1D);
    } else if (mdx === TestData.TEST_QUERY_1D_EXCLUDES) {
      ret = Promise.resolve(TestData.TEST_RESULTS_1D_EXCLUDES);
    } else if (mdx === TestData.TEST_QUERY_2D) {
      ret = Promise.resolve(TestData.TEST_RESULTS_2D);
    }

    return ret;

  }

  async saveCurrentState(currentState: WidgetState[][]): Promise<void> {
    const uiState = new UserInterfaceState();
    uiState.widgetStateGrid = currentState;
    // eslint-disable-next-line no-console
    console.log("Saving current state");
    // eslint-disable-next-line no-console
    console.log(uiState);
    return Promise.resolve();
  }

  async getSavedState(): Promise<UserInterfaceState> {
    return super.getSavedState();
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

  async executeQuery(mdx: string, connection: string, simplifyNames: boolean, levelNameTranslationMap: any): Promise<any> {

    const request: any = new Object();
		request.connectionName = connection;
		request.query = mdx;
		request.tidy = new Object();
		request.tidy.enabled = true;
		request.tidy.simplifyNames = simplifyNames;
    request.tidy.levelNameTranslationMap = levelNameTranslationMap;
    
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

  async saveCurrentState(currentState: WidgetState[][]): Promise<void> {
    const uiState = new UserInterfaceState();
    uiState.widgetStateGrid = currentState;
    // eslint-disable-next-line no-console
    console.log("Saving current state");
    // eslint-disable-next-line no-console
    console.log(uiState);
    return Promise.resolve();
  }

  async getSavedState(): Promise<UserInterfaceState> {
    return super.getSavedState();
  }

  get label(): string {
    return "remote";
  }

}