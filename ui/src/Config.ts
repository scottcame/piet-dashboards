import { Visualization } from "./Visualization";

/* eslint-disable @typescript-eslint/no-explicit-any */

 export class Config {

  private _groups: Group[] = [];
  private _shortTitle: string;
  private _longTitle: string;
  private _appLogoImageUrl: string;
  private _disclaimerFooterText: string;
  private _allowVizExport: boolean;

  static fromJson(json: any): Config {

    const ret = new Config();

    ret._shortTitle = json.title ? json.title.short : null;
    ret._longTitle = json.title ? json.title.long : null;
    ret._appLogoImageUrl = json.appLogoImageUrl ? json.appLogoImageUrl : "img/app-logo.png";
    ret._disclaimerFooterText = json.disclaimerFooterText ? json.disclaimerFooterText : null;
    ret._allowVizExport = json.allowVizExport;

    ret._groups = json.groups.map((groupJson: any): Group => {
      return Group.fromJson(groupJson);
    });

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

export class Group {

  readonly header: string;
  private _vizMap: Map<string, Visualization> = new Map();

  constructor(header: string) {
    this.header = header;
  }

  static fromJson(json: any): Group {
    const ret = new Group(json.header);
    Object.keys(json.visualizations).forEach((key: string): void => {
      ret._vizMap.set(key, Visualization.fromJson(key, json.visualizations[key]));
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
