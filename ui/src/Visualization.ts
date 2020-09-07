import { ArrayUtils } from "./ArrayUtils";
import type { Repository } from "./Repository";

export abstract class Visualization {

  protected static CHARACTER_WIDTH_IN_PIXELS = 5;
  protected static LEGEND_BAR_WIDTH = 55;
  protected static VEGA_LITE_MAX_LABEL_LENGTH = 43;

  private _panelTitle: string;
  private _showEmpty: string;
  private _connection: string;
  private _cube: string;
  private _measure: string;
  private _xDimension: string;
  private _xDimensionLabel: string;
  private _xDimensionExcludes: string[];
  private _xDimensionMembers: string[];
  private _yDimension: string;
  private _yDimensionLabel: string;
  private _yDimensionExcludes: string[];
  private _vizType: "heatgrid"|"bar"|"timeline"|"pie";
  private _text: string;
  private _includeGridValueText: boolean;
  readonly id: string;

  constructor(id: string) {
    this.id = id;
  }

  static fromJson(id: string, json: any): Visualization {

    let ret: Visualization = null;
    
    if (json.vizType === "bar") {
      ret = new BarChartVisualization(id);
    } else if (json.vizType === "pie") {
      ret = new PieChartVisualization(id);
    } else if (json.vizType === "heatgrid") {
      ret = new HeatgridChartVisualization(id);
    } else if (json.vizType === "timeline") {
      ret = new TimelineChartVisualization(id);
    }

    if (ret) {
      ret._panelTitle = json.panelTitle;
      ret._showEmpty = json.showEmpty;
      ret._connection = json.connection;
      ret._cube = json.cube;
      ret._measure = json.measure;
      ret._xDimension = json.xDimension;
      ret._xDimensionLabel = json.xDimensionLabel;
      ret._xDimensionExcludes = json.xDimensionExcludes;
      ret._xDimensionMembers = json.xDimensionMembers;
      ret._yDimension = json.yDimension;
      ret._yDimensionLabel = json.yDimensionLabel;
      ret._yDimensionExcludes = json.yDimensionExcludes;
      ret._vizType = json.vizType;
      ret._text = json.text;
      ret._includeGridValueText = json.includeGridValueText;
    }

    return ret;

  }

  get panelTitle(): string { return this._panelTitle; }
  get showEmpty(): string { return this._showEmpty; }
  get connection(): string { return this._connection; }
  get cube(): string { return this._cube; }
  get measure(): string { return this._measure; }
  get xDimension(): string { return this._xDimension; }
  get xDimensionLabel(): string { return this._xDimensionLabel || null; }
  get xDimensionExcludes(): string[] { return this._xDimensionExcludes; }
  get xDimensionMembers(): string[] { return this._xDimensionMembers; }
  get yDimension(): string { return this._yDimension; }
  get yDimensionLabel(): string { return this._yDimensionLabel || null; }
  get yDimensionExcludes(): string[] { return this._yDimensionExcludes; }
  get vizType(): "heatgrid"|"bar"|"timeline"|"pie" { return this._vizType; }
  get text(): string { return this._text; }
  get includeGridValueText(): boolean { return this._includeGridValueText; }

  private buildLevelNameTranslationMap(): any {

    const levelNameTranslationMap = new Object();

    levelNameTranslationMap[this.xDimension] = "x";

    if (this.yDimension != undefined) {
      levelNameTranslationMap[this.yDimension] = "y";
    }

    return levelNameTranslationMap;

  }

  render(repository: Repository, containerHeight: number, containerWidth: number): Promise<any> {

    const query = this.buildQuery();
    const levelNameTranslationMap = this.buildLevelNameTranslationMap();
    let ret = Promise.resolve(null);

    if (query) {
      ret = repository.executeQuery(query, this.connection, true, levelNameTranslationMap).then((data: any): Promise<any> => {
        let spec = null;
        if (data) {
          const dataObject = new DataObject();
          dataObject.values = data.values;
          spec = this.makeChart("x", this.xDimensionLabel, "y", this.yDimensionLabel, "m", null, containerHeight, containerWidth, dataObject);
        }
        return Promise.resolve(spec);
      });
    }

    return ret;

  }

  protected abstract makeChart(xDimensionName: string, xDimensionLabel: string,
    yDimensionName: string, yDimensionLabel: string,
    measureName: string, measureLabel: string, containerHeight: number, containerWidth: number, data: DataObject): any;

  abstract buildQuery(): string;

  protected buildOneDimensionalQuery(): string {

    let ret = null;
    const showEmptyText = this.showEmpty ? "" : " NON EMPTY ";
    let xDimension = "{" + this.xDimension + ".Members}";

    if (this.xDimensionExcludes != null) {
      xDimension = "Except(" + xDimension + ", {" + this.xDimensionExcludes.join(",") + "})";
    }
  
    ret = "SELECT" + showEmptyText + " {[Measures].[" + this.measure + "]} * " +
      "Union({" + this.xDimension + ".Hierarchy.FirstChild.Parent}, " + xDimension + ") ON COLUMNS FROM " + this.cube;
  
    return ret;
  
  }

  protected buildTwoDimensionalQuery(): string {

    if (!this.yDimension) {
      throw new Error("2D query requested but only one dimension specified in config; viz id = " + this.id);
    }

    let ret = null;
    const showEmptyText = this.showEmpty ? "" : " NON EMPTY ";
    let xDimension = "{" + this.xDimension + ".Members}";
    let yDimension = "{" + this.yDimension + ".Members}";

    if (this.xDimensionExcludes != null) {
      xDimension = "Except(" + xDimension + ", {" + this.xDimensionExcludes.join(",") + "})";
    }
    if (this.yDimensionExcludes != null) {
      yDimension = "Except(" + yDimension + ", {" + this.yDimensionExcludes.join(",") + "})";
    }
  
    ret = "SELECT" + showEmptyText + " {[Measures].[" + this.measure + "]} * " +
      "Union({" + this.xDimension + ".Hierarchy.FirstChild.Parent}, " + xDimension + ") * " +
      "Union({" + this.yDimension + ".Hierarchy.FirstChild.Parent}, " + yDimension + ") ON COLUMNS FROM " + this.cube;
  
    return ret;
  
  }

  protected buildTimelineQuery(): string {

    let ret = null;
    const showEmptyText = this.showEmpty ? "" : " NON EMPTY ";
  
    const rollup = this.xDimensionMembers[0] + ".Hierarchy.FirstChild.Parent";
  
    ret = "SELECT " + showEmptyText + " {[Measures].[" + this.measure + "]} * {" + this.yDimension + ".Members} * " +
      "Hierarchize({Except({" + rollup + "}, {" + this.xDimensionExcludes.join(",") + "}), {" + this.xDimensionMembers.join(",") + "}}) ON COLUMNS FROM " + this.cube;
  
    return ret;
  
  }

  protected fillGrid(data: DataObject): DataObject {

    const FILL_VALUE = 0;

    if (data.values.length > 0 && data.values[0].y != undefined) {

      const xVals = [];
      const yVals = [];

      data.values.forEach(function(v) {
        if (xVals.indexOf(v.x) === -1) {
          xVals.push(v.x);
        }
        if (yVals.indexOf(v.y) === -1) {
          yVals.push(v.y);
        }
        if (v.m === null) {
          v.m = FILL_VALUE;
        }
      });

      const product = [];

      xVals.forEach(function(xv) {
        yVals.forEach(function(yv) {
          product.push({"x": xv, "y": yv});
        });
      });

      product.forEach(function(v) {
        const found = data.values.some(function(vv) {
          if (vv.x === v.x && vv.y === v.y) {
            return true;
          }
          return false;
        });
        if (!found) {
          data.values.push({"x": v.x, "y": v.y, "m": FILL_VALUE});
        }
      });
      
    }

    return data;

  }

}

export class TimelineChartVisualization extends Visualization {
  constructor(id: string) {
    super(id);
  }
  buildQuery(): string{
    return super.buildTimelineQuery();
  }
  protected makeChart(_xDimensionName: string, _xDimensionLabel: string,
    yDimensionName: string, _yDimensionLabel: string,
    measureName: string, measureLabel: string, containerHeight: number, containerWidth: number, data: DataObject): any {

    const s: any = {
      "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
      "mark": "line",
      "encoding": {
        "x": {
            "field": yDimensionName,
            "type": "temporal",
            "axis": {
                "title": null
            }
        },
        "y": {
            "field": measureName,
            "type": "quantitative",
            "axis": {
                "title": measureLabel,
                "format": ".0%"
            }
        },
      }
    };
  
    s.data = this.transform(data);

    s.height = containerHeight * 1.05;
    s.width = containerWidth * .9;
  
    return s;

  }
  private transformTimelineValues(valuesArray: any[]): any[] {

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const viz = this;

    const numer = valuesArray.filter((o: any): boolean => {
      return Object.getOwnPropertyNames(o).includes('x');
    });
    const denom = valuesArray.filter((o: any): boolean => {
      return !Object.getOwnPropertyNames(o).includes('x');
    });
    numer.forEach((o: any): void => {
      delete o.x;
      o.numer = o[viz.measure];
    });
    denom.forEach((o: any): void => {
      o.denom = o[viz.measure];
    });
    const dd = ArrayUtils.outerJoin(numer, denom, ['y'], ['denom']);
    dd.forEach((o: any): void => {
      o.m = o.numer/o.denom;
      o.y += '-1';
    });
    return dd.filter((o: any): boolean => {
      return o.denom && o.numer !== null;
    });

  }
  private transform(data: DataObject): DataObject {
    const ret = new DataObject();
    ret.values = this.transformTimelineValues(data.values);
    return this.fillGrid(ret);
  }
}

export class HeatgridChartVisualization extends Visualization {
  constructor(id: string) {
    super(id);
  }
  buildQuery(): string{
    return super.buildTwoDimensionalQuery();
  }
  protected makeChart(
    xDimensionName: string, xDimensionLabel: string,
    yDimensionName: string, yDimensionLabel: string,
    measureName: string, measureLabel: string, containerHeight: number, containerWidth: number, data: DataObject): any {

    const includeGridValueText = this.includeGridValueText === null || this.includeGridValueText === undefined || this.includeGridValueText;

    data = this.transform(data);

    let longestLabelSize = data.getLongestLabelSize(xDimensionName);
    const height = containerHeight - longestLabelSize * Visualization.CHARACTER_WIDTH_IN_PIXELS * 0.25;

    longestLabelSize = data.getLongestLabelSize(yDimensionName);
    const width = containerWidth - longestLabelSize * Visualization.CHARACTER_WIDTH_IN_PIXELS - HeatgridChartVisualization.LEGEND_BAR_WIDTH;

    const domainMax = data.values.reduce((total: number, currentValue: any[]) => {
      const v = Math.abs(currentValue[measureName]);
      return v > total ? v : total;
    }, 0);

    const s: any = {
      "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
      "encoding": {
          "y": {"field": yDimensionName, "type": "nominal", "axis" : {"title" : yDimensionLabel}, "sort": null},
          "x": {"field": xDimensionName, "type": "nominal", "axis" : {"title" : xDimensionLabel, "labelAngle": -30}, "sort": null},
      },
      "layer": [{
        "mark": "rect",
        "encoding": {
          "color": {
            "condition": {"test": "datum['" + measureName + "'] === null", "value": "#aaa"},
            "field": measureName,
            "type": "quantitative",
            "legend": {"title": measureLabel}
          }
        }
      }]
    };

    const layerArray = s.layer;

    if (includeGridValueText) {
      layerArray.push(
        {
          "mark": "text",
          "encoding": {
            "text": {
              "condition": {"test": "datum['" + measureName + "'] === null", "value": "N/A"},
              "field": measureName,
              "type": "quantitative"
            },
            "color": {
              "value": "black",
              "condition": {"test": "datum.m < " + -0.6*domainMax + " || datum.m > " + 0.6*domainMax, "value": "white"}
            }
          }
        }
      );
    }

    layerArray[0].encoding.color.scale = new Object;
    layerArray[0].encoding.color.scale.type = "linear";
    layerArray[0].encoding.color.scale.domain = [0, domainMax];

    s.data = data;
    s.height = height;
    s.width = width;

    return s;
    
  }
  private transform(data: DataObject): DataObject {

    data.values.forEach((o: any): void => {
      o.m = o[this.measure];
    });
    data.values = data.values.filter((v: any): boolean => {
      return v['x'] !== undefined && v['y'] !== undefined;
    });
    return this.fillGrid(data);

  }
}

export class PieChartVisualization extends Visualization {
  constructor(id: string) {
    super(id);
  }
  buildQuery(): string{
    return super.buildOneDimensionalQuery();
  }
  protected makeChart(xDimensionName: string, xDimensionLabel: string, _yDimensionName: string, _yDimensionLabel: string,measureName: string,measureLabel: string, containerHeight: number, containerWidth: number, data: DataObject): any {
    return null;
  }
}

export class BarChartVisualization extends Visualization {

  constructor(id: string) {
    super(id);
  }
  buildQuery(): string {
    return super.buildOneDimensionalQuery();
  }
  protected makeChart(xDimensionName: string, xDimensionLabel: string, _yDimensionName: string, _yDimensionLabel: string,measureName: string,measureLabel: string, containerHeight: number, containerWidth: number, data: DataObject): any {

    const verticalAdjustment = 27;
    const rangeStep = (containerHeight + verticalAdjustment - (20 / data.values.length)) / data.values.length;

    const longestLabelSize = Math.min(BarChartVisualization.VEGA_LITE_MAX_LABEL_LENGTH, data.getLongestLabelSize(xDimensionName));
    const penalty = (BarChartVisualization.VEGA_LITE_MAX_LABEL_LENGTH-longestLabelSize)*1.35;
    let width = containerWidth - longestLabelSize * Visualization.CHARACTER_WIDTH_IN_PIXELS - penalty;

    const s: any = {
      "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
      "mark": "bar",
      "encoding": {
        "x": {
            "field": measureName,
            "type": "quantitative",
            "axis": {
                "title": measureLabel,
                "grid": false,
                "format": ".0%"
            }
        },
        "y": {
            "field": xDimensionName,
            "type": "nominal",
            "title": xDimensionLabel,
            "sort": null
        },
      },
      "height": {
        "step": rangeStep
      },
      "config": {
        "view": {"stroke": "transparent"},
        "axis": {"domainWidth": 1}
      }
    };
  
    s.encoding.color = {
      "field": "level",
      "type": "nominal",
      "legend": null
    };
    width = width - 20;
  
    s.data = this.transform(data);
    s.width = width;
  
    return s;
  
  }
  private transform(data: DataObject): DataObject {

    let denom = 0;

    data.values = data.values.filter((v: any): boolean => {
      return v['x'] !== undefined;
    });

    data.values.forEach((o: any): void => {
      o.m = o[this.measure];
      denom += o.m;
    });

    data.values.forEach((o: any): void => {
      o.m = denom ? o.m / denom : 0;
    });

    return super.fillGrid(data);

  }
}

class DataObject {
  values: any[];
  getLongestLabelSize(variable: string): number {
    return this.values.reduce((acc: number, v: any[]) => {
      const label = v[variable];
      return Math.max(label ? label.length : 0, acc);
    }, 0);
  }
}