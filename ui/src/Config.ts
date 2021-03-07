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
import { Visualization } from "./Visualization";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

 export class Config {

  private _groups: Group[] = [];
  private _shortTitle: string;
  private _longTitle: string;
  private _appLogoImageUrl: string;
  private _disclaimerFooterText: string;
  private _allowVizExport: boolean;
  private _filterDimensions: FilterDimension[] = [];
  private _excludedDimensions: string[] = [];
  private _mondrianRestURL: string;
  private _connection: string;
  private _cube: string;
  private _aboutContentURL: string;
  dataCaveatText: string;
  private _propertyPlaceholders: PropertyPlaceholder[] = [];

  static fromJson(json: any): Config {

    const ret = new Config();

    ret._shortTitle = json.title ? json.title.short : null;
    ret._longTitle = json.title ? json.title.long : null;
    ret._appLogoImageUrl = json.appLogoImageUrl ? json.appLogoImageUrl : "img/app-logo.png";
    ret._disclaimerFooterText = json.disclaimerFooterText ? json.disclaimerFooterText : null;
    ret._allowVizExport = json.allowVizExport;
    ret._mondrianRestURL = json.mondrianRestUrl;
    ret._aboutContentURL = json.aboutContentUrl || "about-content.html";
    ret.dataCaveatText = json.dataCaveatText;
    ret._connection = json.connection;
    ret._cube = json.cube;
    ret._excludedDimensions = json.excludedDimensions;

    ret._groups = json.groups.map((groupJson: any): Group => {
      return Group.fromJson(groupJson, json.allowVizExport, json.connection);
    });

    if (json.filterDimensions) {
      ret._filterDimensions = json.filterDimensions.map((filterDimension: any): FilterDimension => {
        return FilterDimension.fromJson(filterDimension, json.connection);
      });
    }

    if (json.initProperties) {
      ret._propertyPlaceholders = Object.keys(json.initProperties).map((propertyName: string): PropertyPlaceholder => {
        return PropertyPlaceholder.fromJson(json.initProperties[propertyName], propertyName, json.connection);
      });
    }

    return ret;

  }

  get groups(): Group[] {
    return this._groups;
  }

  get shortTitle(): string {
    return this._shortTitle;
  }

  get longTitle(): string {
    return this._longTitle;
  }

  get appLogoImageUrl(): string {
    return this._appLogoImageUrl;
  }

  get disclaimerFooterText(): string {
    return this._disclaimerFooterText;
  }

  get allowVizExport(): boolean {
    return this._allowVizExport;
  }

  get filterDimensions(): FilterDimension[] {
    return this._filterDimensions;
  }

  get excludedDimensions(): string[] {
    return this._excludedDimensions;
  }

  get propertyPlaceholders(): PropertyPlaceholder[] {
    return this._propertyPlaceholders;
  }

  get mondrianRestURL(): string {
    return this._mondrianRestURL;
  }

  get connection(): string {
    return this._connection;
  }

  get cube(): string {
    return this._cube;
  }

  get aboutContentURL(): string {
    return this._aboutContentURL;
  }

  findVisualization(id: string): Visualization {
    let ret: Visualization = null;
    this.groups.forEach((group: Group): void => {
      if (!ret) {
        ret = group.getVisualization(id);
      }
    });
    return ret;
  }

}

export class FilterDimension {

  private _query: string;
  readonly dimension: string;
  readonly connection: string;
  private _label: string;
  private _hierarchy: string;

  private constructor(query: string, dimension: string, connection: string, label: string) {
    this._query = query;
    this.dimension = dimension;
    this._label = label;
    this.connection = connection;
    this._hierarchy = dimension.replace(/(.+)\.\[.+\]$/, "$1");
  }

  static fromJson(json: { query: string, dimension: string, label: string }, connection: string): FilterDimension {
    return new FilterDimension(json.query, json.dimension, connection, json.label);
  }

  static fromGetDimensionsJson(json: {name: string, caption: string, hierarchies: [{name: string, caption: string, levels: [{name: string, uniqueName: string, caption: string}]}]}[], connection: string, cube: string): FilterDimension[] {
    const ret: FilterDimension[] = [];
    json.forEach(dimension => {
      if (dimension.name !== "Measures") {
        dimension.hierarchies.forEach(hierarchy => {
          hierarchy.levels.forEach(level => {
            if (level.name !== "(All)") {
              const levelText = level.uniqueName;
              const queryText = "WITH MEMBER Measures.Nul as Null SELECT {[Measures].[Nul]}*{" + levelText + ".Members} ON COLUMNS FROM [" + cube + "]";
              ret.push(new FilterDimension(queryText, levelText, connection, level.caption));
            }
          });
        });
      }
    });
    return ret;
  }

  get label(): string {
    return this._label;
  }

  get query(): string {
    return this._query;
  }

  get hierarchy(): string {
    return this._hierarchy;
  }

  updateFrom(d: FilterDimension): void {
    if (d.label && d.label !== this.label) {
      this._label = d.label;
    }
    if (d.query && d.query !== this.query) {
      this._query = d.query;
    }
  }

}

export class PropertyPlaceholder {
  readonly connection: string;
  readonly query: string;
  readonly dimension: string;
  readonly propertyName: string;
  private constructor(connection: string, query: string, dimension: string, propertyName: string) {
    this.connection = connection;
    this.query = query;
    this.propertyName = propertyName;
    this.dimension = dimension;
  }
  static fromJson(json: {query: string, dimension: string}, propertyName: string, connection: string): PropertyPlaceholder {
    return new PropertyPlaceholder(connection, json.query, json.dimension, propertyName);
  }
}

export class Group {

  readonly header: string;
  private _vizMap: Map<string, Visualization> = new Map();

  constructor(header: string) {
    this.header = header;
  }

  static fromJson(json: any, embedExport: boolean, connection: string): Group {
    const ret = new Group(json.header);
    Object.keys(json.visualizations).forEach((key: string): void => {
      ret._vizMap.set(key, Visualization.fromJson(key, json.visualizations[key], embedExport, connection));
    });
    return ret;
  }

  get visualizationIds(): string[] {
    return [...this._vizMap.keys()];
  }

  getVisualization(id: string): Visualization {
    return this._vizMap.get(id);
  }

}
