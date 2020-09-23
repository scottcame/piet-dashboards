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
  private _mondrianRestURL: string;
  private _aboutContentURL: string;

  static fromJson(json: any): Config {

    const ret = new Config();

    ret._shortTitle = json.title ? json.title.short : null;
    ret._longTitle = json.title ? json.title.long : null;
    ret._appLogoImageUrl = json.appLogoImageUrl ? json.appLogoImageUrl : "img/app-logo.png";
    ret._disclaimerFooterText = json.disclaimerFooterText ? json.disclaimerFooterText : null;
    ret._allowVizExport = json.allowVizExport;
    ret._mondrianRestURL = json.mondrianRestUrl;
    ret._aboutContentURL = json.aboutContentUrl || "about-content.html";

    ret._groups = json.groups.map((groupJson: any): Group => {
      return Group.fromJson(groupJson, json.allowVizExport);
    });

    if (json.filterDimensions) {
      ret._filterDimensions = json.filterDimensions.map((filterDimension: any): FilterDimension => {
        return FilterDimension.fromJson(filterDimension);
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

  get mondrianRestURL(): string {
    return this._mondrianRestURL;
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

  getFilterDimensionLabel(dimension: string): string {
    let ret: string = null;
    this.filterDimensions.forEach((d: FilterDimension): void => {
      if (d.dimension === dimension) {
        ret = d.label;
      }
    });
    return ret;
  }

}

export class FilterDimension {
  readonly query: string;
  readonly dimension: string;
  readonly connection: string;
  readonly label: string;
  private constructor(query: string, dimension: string, connection: string, label: string) {
    this.query = query;
    this.dimension = dimension;
    this.connection = connection;
    this.label = label;
  }
  static fromJson(json: { query: string, dimension: string, connection: string, label: string }): FilterDimension {
    return new FilterDimension(json.query, json.dimension, json.connection, json.label);
  }
}

export class Group {

  readonly header: string;
  private _vizMap: Map<string, Visualization> = new Map();

  constructor(header: string) {
    this.header = header;
  }

  static fromJson(json: any, embedExport: boolean): Group {
    const ret = new Group(json.header);
    Object.keys(json.visualizations).forEach((key: string): void => {
      ret._vizMap.set(key, Visualization.fromJson(key, json.visualizations[key], embedExport));
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
