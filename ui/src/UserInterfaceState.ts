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

/* eslint-disable @typescript-eslint/no-explicit-any */

export class UserInterfaceState {

  widgetStateGrid: WidgetState[][] = [];
  dimensionFilterModel: Map<string, boolean>;
  readonly name = "default";

  static toJson(state: UserInterfaceState): { widgetStateGrid: any, dimensionFilterModel: any } {
    const ret = {
      widgetStateGrid: JSON.parse(JSON.stringify(state.widgetStateGrid)),
      dimensionFilterModel: state.dimensionFilterModel ? UserInterfaceState.serializeMap(state.dimensionFilterModel) : undefined,
      name: state.name
    };
    return ret;
  }

  static fromJson(json: { widgetStateGrid: any, dimensionFilterModel: any }): UserInterfaceState {
    const ret = new UserInterfaceState();
    ret.widgetStateGrid = json.widgetStateGrid as WidgetState[][];
    ret.dimensionFilterModel = json.dimensionFilterModel ? UserInterfaceState.deserializeMap(json.dimensionFilterModel) : undefined;
    return ret;
  }

  private static serializeMap(map: Map<string, boolean>): any {
    const ret = new Object();
    [...map.keys()].forEach((key: string): void => {
      ret[key] = map.get(key);
    });
    return ret;
  }

  private static deserializeMap(map: any): Map<string, boolean> {
    const ret = new Map<string, boolean>();
      Object.keys(map).forEach((key: string): void => {
        ret.set(key, map[key]);
      });
    return ret;
  }

}

export class WidgetState {
  vizId: string;
  constructor(vizId: string = null) {
    this.vizId = vizId;
  }
  static fromJson(json: { vizId: string }): WidgetState {
    const ret = new WidgetState();
    ret.vizId = json.vizId;
    return ret;
  }
  toJson(): { vizId: string } {
    return {
      vizId: this.vizId,
    };
  }
}