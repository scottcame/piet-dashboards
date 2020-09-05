export class UserInterfaceState {
  widgetStateGrid: WidgetState[][];
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