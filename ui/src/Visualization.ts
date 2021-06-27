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
import type { Repository } from "./Repository";
import { VegaLiteSpec, Encoding, Axis, EncodingSpec, Layer, ColorEncodingSpec, RadialMarkSpec, ViewSpec, TextEncodingSpec, LineMarkSpec, Scale, TextMarkSpec } from "./VegaLiteSpec";

/* eslint-disable @typescript-eslint/no-explicit-any */

export abstract class Visualization {

  protected static CHARACTER_WIDTH_IN_PIXELS = 5;
  protected static LEGEND_BAR_WIDTH = 55;
  protected static VEGA_LITE_MAX_LABEL_LENGTH = 43;

  readonly id: string;
  readonly panelTitle: string;
  readonly headerText: string;
  readonly includeGridValueText: boolean;
  private _connection: string;
  readonly measures: string[];
  readonly measureLabels: string[];
  readonly measureFormats: string[];
  readonly query: string;
  readonly debug: boolean;
  readonly embedExport: boolean;
  
  protected _totalN: number = null;

  constructor(id: string, json: {
    id: string,
    vizType: string,
    headerText: string,
    panelTitle: string,
    query: string,
    includeGridValueText: boolean,
    measures: string[],
    measureLabels: string[],
    measureFormats: string[],
    debug: boolean
  }, embedExport: boolean) {
    this.id = id;
    this.embedExport = embedExport;
    this.headerText = json.headerText;
    this.panelTitle = json.panelTitle;
    this.query = json.query;
    this.includeGridValueText = json.includeGridValueText;
    this.measures = json.measures;
    this.measureLabels = json.measureLabels || [];
    this.measureFormats = json.measureFormats || [];
    this.debug = json.debug || false;
  }

  get hasFilteredQuery(): boolean {
    return true;
  }

  get connection(): string {
    return this._connection;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static fromJson(id: string, json: any, embedExport: boolean, connection: string): Visualization {

    let ret: Visualization = null;
    
    if (json.vizType === "bar") {
      ret = new BarChartVisualization(id, json, embedExport);
    } else if (json.vizType === "pie") {
      ret = new PieChartVisualization(id, json, embedExport);
    } else if (json.vizType === "line") {
      ret = new LineChartVisualization(id, json, embedExport);
    }

    ret._connection = connection;

    return ret;

  }

  render(repository: Repository, containerHeight: number, containerWidth: number): Promise<RenderedVisualization> {

    let ret = Promise.resolve(new RenderedVisualization(this, null));

    const query = this.query;

    if (query) {
      ret = repository.executeQuery(query, this.connection, false).then((data: { values: any[] }): Promise<any> => {
        let spec: VegaLiteSpec = null;
        if (data) {
          const dataObject = new DataObject();
          dataObject.values = data.values;
          spec = this.makeChart(dataObject, containerHeight, containerWidth);
          if (this.debug) {
            // eslint-disable-next-line no-console
            console.log(JSON.stringify(spec, null, 2));
          }
        }
        return Promise.resolve(new RenderedVisualization(this, spec));
      });
    }

    return ret;

  }

  protected abstract makeChart(data: DataObject, containerHeight: number, containerWidth: number): VegaLiteSpec;

  protected cloneArray(a: any[]): any[] {
    return JSON.parse(JSON.stringify(a));
  }

  get totalN(): number {
    return this._totalN;
  }

  get exceedsCellLimit(): boolean {
    return false;
  }

}

export class RenderedVisualization {

  readonly visualization: Visualization = null;
  readonly spec: VegaLiteSpec = null;

  constructor(visualization: Visualization, spec: VegaLiteSpec) {
    this.visualization = visualization;
    this.spec = spec;
  }

  get exceedsCellLimit(): boolean {
    return this.visualization.exceedsCellLimit;
  }

}

export class BarChartVisualization extends Visualization {

  readonly xDimension: string;
  readonly xAxisPercentages: boolean;
  readonly magnitudeLabels: boolean;
  readonly xDimensionMaxCellLimit: number;

  private xDimensionCellCount: number;

  constructor(id: string, json: {
    id: string,
    vizType: string,
    headerText: string,
    panelTitle: string,
    connection: string,
    query: string,
    includeGridValueText: boolean,
    measures: string[],
    measureLabels: string[],
    measureFormats: string[],
    xDimension: string,
    debug: boolean,
    xAxisPercentages: boolean,
    magnitudeLabels: boolean,
    xDimensionMaxCellLimit: number
  }, embedExport: boolean) {
    super(id, json, embedExport);
    this.xDimension = json.xDimension;
    this.xAxisPercentages = json.xAxisPercentages || false;
    this.magnitudeLabels = json.magnitudeLabels !== undefined && json.magnitudeLabels;
    this.xDimensionMaxCellLimit = json.xDimensionMaxCellLimit || Number.MAX_VALUE;
  }

  get exceedsCellLimit(): boolean {
    return this.xDimensionCellCount > this.xDimensionMaxCellLimit;
  }

  protected makeChart(data: DataObject, containerHeight: number, containerWidth: number): VegaLiteSpec {

    let ret: VegaLiteSpec = null;

    const verticalAdjustment = 27;

    const longestLabelSize = this.calculateLongestLabelSize(data);
    const penalty = (BarChartVisualization.VEGA_LITE_MAX_LABEL_LENGTH-longestLabelSize)*1.35;

    const exportSymbolPenalty = this.embedExport ? 30 : 0;

    if (this.measures.length > 1) {
      // eslint-disable-next-line no-console
      console.warn("We don't support multiple bar chart measures yet.");
    } else {

      const measure = this.measures[0];
      const measureLabel = this.measureLabels[0] || null;
      const xDimension = this.xDimension;

      const transformedData = new DataObject();

      transformedData.values = this.cloneArray(data.values);
      
      transformedData.values = transformedData.values.filter((v: any): boolean => {
        return v[xDimension] !== undefined;
      });

      this.xDimensionCellCount = transformedData.values.length;

      let denom = 0;

      transformedData.values.forEach((o: any): void => {
        denom += o[measure];
      });
  
      transformedData.values.forEach((o: any): void => {
        o.y = o[xDimension];
        if (this.xAxisPercentages) {
          o[measure] = denom ? o[measure] / denom : 0;
        }
      });

      let xScale: Scale = undefined;

      if (this.magnitudeLabels) {
        const labelRadix = transformedData.values.reduce((accum: number, o: any): number => {
          const radix = Math.ceil(Math.log10(o[measure]));
          return radix > accum ? radix : accum;
        }, 1);
        xScale = new Scale();
        xScale.padding = labelRadix * 8;
        xScale.domainMin = 0; // weird that we need to specify this. perhaps investigate.
      }

      const spec = new VegaLiteSpec();
      spec.data = transformedData;
      spec.mark = this.magnitudeLabels ? undefined : "bar";
      spec.height = containerHeight + verticalAdjustment;
      spec.width = containerWidth - longestLabelSize * Visualization.CHARACTER_WIDTH_IN_PIXELS - penalty - 20 - exportSymbolPenalty;
      spec.encoding = new Encoding();
      spec.encoding.x = new EncodingSpec();
      spec.encoding.x.field = measure;
      spec.encoding.x.type = "quantitative";
      spec.encoding.x.axis = new Axis();
      spec.encoding.x.axis.title = measureLabel;
      spec.encoding.x.axis.format = (this.xAxisPercentages ? ".0%" : undefined);
      spec.encoding.x.scale = xScale;
      spec.encoding.y = new EncodingSpec();
      spec.encoding.y.field = "y";
      spec.encoding.y.type = "nominal";
      spec.encoding.y.axis = new Axis();
      spec.encoding.y.axis.title = null;

      if (this.magnitudeLabels) {
        spec.layer = [];
        spec.layer[0] = new Layer();
        spec.layer[0].mark = "bar";
        spec.layer[1] = new Layer();
        spec.layer[1].mark = new TextMarkSpec();
        spec.layer[1].mark.align = "left";
        spec.layer[1].mark.baseline = "middle";
        spec.layer[1].mark.dx = 5;
        spec.layer[1].encoding = new Encoding();
        spec.layer[1].encoding.text = new TextEncodingSpec();
        spec.layer[1].encoding.text.field = measure;
        spec.layer[1].encoding.text.type = "quantitative";
        spec.layer[1].encoding.text.format = (this.xAxisPercentages ? ".0%" : ",");
      }

      ret = spec;

      this._totalN = denom;

    }

    return ret;

  }

  private calculateLongestLabelSize(data: DataObject): number {
    return Math.min(BarChartVisualization.VEGA_LITE_MAX_LABEL_LENGTH, data.getLongestLabelSize(this.xDimension));
  }

}

export class PieChartVisualization extends Visualization {

  readonly xDimension: string;

  constructor(id: string, json: {
    id: string,
    vizType: string,
    headerText: string,
    panelTitle: string,
    connection: string,
    query: string,
    includeGridValueText: boolean,
    measures: string[],
    measureLabels: string[],
    measureFormats: string[],
    xDimension: string,
    debug: boolean
  }, embedExport: boolean) {
    super(id, json, embedExport);
    this.xDimension = json.xDimension;
  }

  protected makeChart(data: DataObject, containerHeight: number, containerWidth: number): VegaLiteSpec {

    let ret: VegaLiteSpec = null;

    if (this.measures.length > 1) {
      // eslint-disable-next-line no-console
      console.warn("We don't support multiple pie chart measures yet.");
    } else {

      const measure = this.measures[0];
      const measureFormat = this.measureFormats.length ? this.measureFormats[0] : null;
      const xDimension = this.xDimension;

      const transformedData = new DataObject();

      transformedData.values = this.cloneArray(data.values);

      transformedData.values = transformedData.values.filter((v: any): boolean => {
        return v[xDimension] !== undefined;
      });

      this._totalN = 0;

      transformedData.values.forEach((o: any): void => {
        o.y = o[xDimension];
        this._totalN += o[measure];
      });
  
      const spec = new VegaLiteSpec();
      spec.data = transformedData;
      spec.height = containerHeight * .7;
      spec.width = containerWidth * .7;
      spec.encoding = new Encoding();
      spec.encoding.theta = new EncodingSpec();
      spec.encoding.theta.field = measure;
      spec.encoding.theta.type = "quantitative";
      spec.encoding.theta.stack = true;
      spec.encoding.color = new ColorEncodingSpec();
      spec.encoding.color.field = "y";
      spec.encoding.color.type = "nominal";
      spec.encoding.color.title = null;
      spec.layer = [];
      spec.layer[0] = new Layer();
      spec.layer[0].mark = new RadialMarkSpec();
      spec.layer[0].mark.type = "arc";
      spec.layer[0].mark.outerRadius = spec.height - 35;
      spec.layer[1] = new Layer();
      spec.layer[1].mark = new RadialMarkSpec();
      spec.layer[1].mark.type = "text";
      spec.layer[1].mark.radius = spec.height - 10;
      spec.layer[1].encoding = new Encoding();
      spec.layer[1].encoding.text = new TextEncodingSpec();
      spec.layer[1].encoding.text.field = measure;
      spec.layer[1].encoding.text.format = measureFormat;
      spec.layer[1].encoding.text.type = "quantitative";
      spec.view = new ViewSpec();
      spec.view.stroke = null;

      ret = spec;

    }

    return ret;

  }

}

export class LineChartVisualization extends Visualization {
  
  readonly xDimension: string|TemporalAxis;
  readonly yDimension: string;
  readonly yDimensionLabel: string;
  readonly showPoints: boolean;
  readonly dateFormat: string;
  readonly tickCount: string;
  readonly zeroMeasureAxisOrigin: boolean;

  constructor(id: string, json: {
    id: string,
    vizType: string,
    headerText: string,
    panelTitle: string,
    connection: string,
    query: string,
    includeGridValueText: boolean,
    measures: string[],
    measureLabels: string[],
    measureFormats: string[],
    xDimension: string|TemporalAxis,
    yDimension: string,
    yDimensionLabel: string,
    showPoints: boolean,
    dateFormat: string,
    tickCount: string,
    zeroMeasureAxisOrigin: boolean,
    debug: boolean
  }, embedExport: boolean) {
    super(id, json, embedExport);
    this.xDimension = typeof json.xDimension === "object" ? TemporalAxis.fromJson(json.xDimension) : json.xDimension;
    this.showPoints = json.showPoints || false;
    this.dateFormat = json.dateFormat;
    this.tickCount = json.tickCount;
    this.zeroMeasureAxisOrigin = json.zeroMeasureAxisOrigin;
    this.yDimension = json.yDimension;
    this.yDimensionLabel = json.yDimensionLabel;
  }

  protected makeChart(data: DataObject, containerHeight: number, containerWidth: number): VegaLiteSpec {

    let spec: VegaLiteSpec = null;

    const widthAdjustment = .9;
    let xDimension: string;

    const dataValues = this.cloneArray(data.values);

    const xValueExtractor = (row: any): any => {
      return row[xDimension];
    };

    let xAxisType: "quantitative"|"temporal" = "quantitative";
    let xAxisTitle = undefined;
    const xAxisFormat = this.dateFormat || undefined;
    const xAxisTickCount = this.tickCount || undefined;

    if (this.xDimension instanceof TemporalAxis) {

      const temporalAxis = this.xDimension as TemporalAxis;

      xAxisType = "temporal";
      xDimension = "temporalx";
      xAxisTitle = null;

      dataValues.forEach((v: any): void => {
        if (temporalAxis.dateDimension) {
          v.temporalx = v[temporalAxis.dateDimension];
        } else {
          v.temporalx = v[temporalAxis.yearDimension];
          if (temporalAxis.monthDimension) {
            let monthVal: string = v[temporalAxis.monthDimension];
            // obvs not locale-aware, but works for now
            // this is to work around non-Chrome browsers' inability to parse dates like "2018-March". Seems
            // to have to be YYYY-MM-DD.
            if (!/[0-9]+/.test(monthVal)) {
              if (/^Jan.*/.test(monthVal)) {
                monthVal = "1";
              } else if (/^Feb.*/.test(monthVal)) {
                monthVal = "2";
              } else if (/^Mar.*/.test(monthVal)) {
                monthVal = "3";
              } else if (/^Apr.*/.test(monthVal)) {
                monthVal = "4";
              } else if (/^May$/.test(monthVal)) {
                monthVal = "5";
              } else if (/^Jun.*/.test(monthVal)) {
                monthVal = "6";
              } else if (/^Jul.*/.test(monthVal)) {
                monthVal = "7";
              } else if (/^Aug.*/.test(monthVal)) {
                monthVal = "8";
              } else if (/^Sep.*/.test(monthVal)) {
                monthVal = "9";
              } else if (/^Oct.*/.test(monthVal)) {
                monthVal = "10";
              } else if (/^Nov.*/.test(monthVal)) {
                monthVal = "11";
              } else if (/^Dec.*/.test(monthVal)) {
                monthVal = "12";
              }
            }
            if (monthVal.length == 1) {
              monthVal = "0" + monthVal;
            }
            v.temporalx += ("-" + monthVal);
            if (temporalAxis.dayDimension) {
              let dayVal: string = v[temporalAxis.dayDimension];
              if (dayVal.length == 1) {
                dayVal = "0" + dayVal;
              }
              v.temporalx += ("-" + dayVal);
            } else {
              v.temporalx += "-01";
            }
          } else {
            v.temporalx += "-01-01";
          }
        }
      });

    } else {
      xDimension = this.xDimension as string;
    }

    let legendPenalty = 0;

    if (this.measures.length === 1) {

      const measure = this.measures[0];
      const measureLabel = this.measureLabels.length ? this.measureLabels[0] : undefined;

      const transformedData = new DataObject();

      transformedData.values = dataValues.filter((v: any): boolean => {
        return v[xDimension] !== undefined;
      });

      transformedData.values.forEach((o: any): void => {
        o.x = xValueExtractor(o);
        if (this.yDimension) {
          o.y = o[this.yDimension];
        }
      });

      spec = new VegaLiteSpec();

      spec.data = transformedData;

      spec.mark = new LineMarkSpec();
      spec.mark.point = this.showPoints;
      spec.encoding = new Encoding();
      spec.encoding.x = new EncodingSpec();
      spec.encoding.x.field = "x";
      spec.encoding.x.type = xAxisType;
      spec.encoding.x.axis = new Axis();
      spec.encoding.x.axis.title = xAxisTitle;
      spec.encoding.x.axis.format = xAxisFormat;
      spec.encoding.x.axis.tickCount = xAxisTickCount;
      spec.encoding.y = new EncodingSpec();
      spec.encoding.y.field = measure;
      spec.encoding.y.type = "quantitative";
      spec.encoding.y.title = measureLabel;

      if (this.zeroMeasureAxisOrigin !== undefined) {
        spec.encoding.y.scale = new Scale();
        spec.encoding.y.scale.zero = this.zeroMeasureAxisOrigin;
      }

      if (this.yDimension) {
        spec.encoding.color = new ColorEncodingSpec();
        spec.encoding.color.field = "y";
        spec.encoding.color.title = this.yDimensionLabel || null;
        spec.encoding.color.type = "nominal";
        const titleLength = this.yDimensionLabel ? this.yDimensionLabel.length : 0;
        legendPenalty = Math.max(.08, titleLength*.01);
      }

      if (this.showPoints) {
        spec.encoding.tooltip = new EncodingSpec();
        spec.encoding.tooltip.field = measure;
        spec.encoding.tooltip.type = "quantitative";
      }

    } else {

      if (this.yDimension) {
        throw new Error("Error in configuration: you cannot have a y dimension with more than one measure");
      }

      const transformedData = new DataObject();
      transformedData.values = [];

      const measureLabelMap = new Map<string, string>();

      this.measures.forEach((measure: string, idx: number): void => {
        measureLabelMap.set(measure, this.measureLabels.length ? this.measureLabels[idx] : measure);
      });

      dataValues.forEach((o: any): void => {
        this.measures.forEach((m: string): void => {
          const row: any = {};
          row.x = xValueExtractor(o);
          row.measure = measureLabelMap.get(m);
          row.y = o[m];
          transformedData.values.push(row);
        });
      });

      spec = new VegaLiteSpec();

      spec.data = transformedData;

      spec.mark = new LineMarkSpec();
      spec.mark.point = this.showPoints;
      spec.encoding = new Encoding();
      spec.encoding.x = new EncodingSpec();
      spec.encoding.x.field = "x";
      spec.encoding.x.type = xAxisType;
      spec.encoding.x.axis = new Axis();
      spec.encoding.x.axis.title = xAxisTitle;
      spec.encoding.x.axis.format = xAxisFormat;
      spec.encoding.x.axis.tickCount = xAxisTickCount;
      spec.encoding.y = new EncodingSpec();
      spec.encoding.y.field = "y";
      spec.encoding.y.type = "quantitative";
      spec.encoding.y.title = null;
      spec.encoding.color = new ColorEncodingSpec();
      spec.encoding.color.field = "measure";
      spec.encoding.color.title = null;
      spec.encoding.color.type = "nominal";

      if (this.zeroMeasureAxisOrigin !== undefined) {
        spec.encoding.y.scale = new Scale();
        spec.encoding.y.scale.zero = this.zeroMeasureAxisOrigin;
      }

      if (this.showPoints) {
        spec.encoding.tooltip = new EncodingSpec();
        spec.encoding.tooltip.field = "y";
        spec.encoding.tooltip.type = "quantitative";
      }

      legendPenalty = .08;

    }

    const exportSymbolPenalty = this.embedExport ? 30 : 0;
    const extraHeight = xAxisTitle === null ? 25 : 8;

    if (spec) {
      spec.width = containerWidth * (widthAdjustment-legendPenalty) - exportSymbolPenalty;
      spec.height = containerHeight + extraHeight;
    }

    return spec;

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

export class TemporalAxis {
  readonly yearDimension: string;
  readonly monthDimension: string;
  readonly dayDimension: string;
  readonly dateDimension: string;
  private constructor(json: {
    yearDimension: string,
    monthDimension: string,
    dayDimension: string,
    dateDimension: string
  }) {
    this.yearDimension = json.yearDimension;
    this.monthDimension = json.monthDimension;
    this.dayDimension = json.dayDimension;
    this.dateDimension = json.dateDimension;
  }
  static fromJson(json: {
    yearDimension: string,
    monthDimension: string,
    dayDimension: string,
    dateDimension: string
  }): TemporalAxis {
    return new TemporalAxis(json);
  }
}
