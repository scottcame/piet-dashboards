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

import { DimensionFilterModel } from "./DimensionFilterModel";

/* eslint-disable @typescript-eslint/no-explicit-any */

export class UserInterfaceState {

  widgetStateGrid: WidgetState[][] = [];
  dimensionFilterModel: DimensionFilterModel;
  appVersion: number;
  readonly name = "default";

  static toJson(state: UserInterfaceState): { widgetStateGrid: any, dimensionFilterModel: DimensionFilterModel, appVersion: number } {
    const ret = {
      widgetStateGrid: JSON.parse(JSON.stringify(state.widgetStateGrid)),
      dimensionFilterModel: state.dimensionFilterModel ? state.dimensionFilterModel.toJson() : undefined,
      name: state.name,
      appVersion: state.appVersion
    };
    return ret;
  }

  static fromJson(json: { widgetStateGrid: any, dimensionFilterModel: any, appVersion: number }): UserInterfaceState {
    const ret = new UserInterfaceState();
    ret.widgetStateGrid = json.widgetStateGrid as WidgetState[][];
    ret.dimensionFilterModel = json.dimensionFilterModel ? DimensionFilterModel.fromJson(json.dimensionFilterModel) : undefined;
    ret.appVersion = json.appVersion ? json.appVersion : null;
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