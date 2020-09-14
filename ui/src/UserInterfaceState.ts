export class UserInterfaceState {

  widgetStateGrid: WidgetState[][] = [];
  readonly name = "default";

  static toJson(state: UserInterfaceState): any {
    return JSON.parse(JSON.stringify(state));
  }

  static fromJson(json: any): UserInterfaceState {
    return json as UserInterfaceState;
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