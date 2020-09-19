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