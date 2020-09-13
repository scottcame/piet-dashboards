import type { Repository } from "./Repository";
import { VegaLiteSpec, SizeByStep, Encoding, Axis, EncodingSpec, Layer, ColorEncodingSpec, Condition, Legend, Scale, RadialMarkSpec, ViewSpec, TextEncodingSpec } from "./VegaLiteSpec";

export abstract class Visualization {

  protected static CHARACTER_WIDTH_IN_PIXELS = 5;
  protected static LEGEND_BAR_WIDTH = 55;
  protected static VEGA_LITE_MAX_LABEL_LENGTH = 43;

  readonly id: string;
  readonly panelTitle: string;
  readonly headerText: string;
  readonly includeGridValueText: boolean;
  readonly connection: string;
  readonly measures: string[];
  readonly measureLabels: string[];
  readonly measureFormats: string[];
  readonly query: string;

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
    measureFormats: string[]
  }) {
    this.id = id;
    this.headerText = json.headerText;
    this.panelTitle = json.panelTitle;
    this.connection = json.connection;
    this.query = json.query;
    this.includeGridValueText = json.includeGridValueText;
    this.measures = json.measures;
    this.measureLabels = json.measureLabels || [];
    this.measureFormats = json.measureFormats || [];
  }

  static fromJson(id: string, json: any): Visualization {

    let ret: Visualization = null;
    
    if (json.vizType === "bar") {
      ret = new BarChartVisualization(id, json);
    } else if (json.vizType === "pie") {
      ret = new PieChartVisualization(id, json);
    } else if (json.vizType === "timeline") {
      ret = new LineChartVisualization(id, json);
    }

    return ret;

  }

  render(repository: Repository, containerHeight: number, containerWidth: number): Promise<VegaLiteSpec> {

    let ret = Promise.resolve(null);

    const query = this.query;
    console.log(query);

    if (query) {
      ret = repository.executeQuery(query, this.connection, true).then((data: { values: any[] }): Promise<any> => {
        let spec: VegaLiteSpec = null;
        if (data) {
          const dataObject = new DataObject();
          dataObject.values = data.values;
          spec = this.makeChart(dataObject, containerHeight, containerWidth);
        }
        return Promise.resolve(spec);
      });
    }

    return ret;

  }

  protected abstract makeChart(data: DataObject, containerHeight: number, containerWidth: number): VegaLiteSpec;

  protected cloneArray(a: any[]): any[] {
    return JSON.parse(JSON.stringify(a));
  }

}

export class BarChartVisualization extends Visualization {

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
    xDimension: string
  }) {
    super(id, json);
    this.xDimension = json.xDimension;
  }

  protected makeChart(data: DataObject, containerHeight: number, containerWidth: number): VegaLiteSpec {

    let ret: VegaLiteSpec = null;

    const verticalAdjustment = 27;

    const longestLabelSize = this.calculateLongestLabelSize(data);
    const penalty = (BarChartVisualization.VEGA_LITE_MAX_LABEL_LENGTH-longestLabelSize)*1.35;

    if (this.measures.length > 1) {
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

      let denom = 0;

      transformedData.values.forEach((o: any): void => {
        denom += o[measure];
      });
  
      transformedData.values.forEach((o: any): void => {
        o.y = o[xDimension];
        o[measure] = denom ? o[measure] / denom : 0;
      });
  
      const spec = new VegaLiteSpec();
      spec.data = transformedData;
      spec.mark = "bar";
      spec.height = containerHeight + verticalAdjustment;
      spec.width = containerWidth - longestLabelSize * Visualization.CHARACTER_WIDTH_IN_PIXELS - penalty - 20;
      spec.encoding = new Encoding();
      spec.encoding.x = new EncodingSpec();
      spec.encoding.x.field = measure;
      spec.encoding.x.type = "quantitative";
      spec.encoding.x.axis = new Axis();
      spec.encoding.x.axis.title = measureLabel;
      spec.encoding.x.axis.grid = false;
      spec.encoding.x.axis.format = ".0%";
      spec.encoding.y = new EncodingSpec();
      spec.encoding.y.field = "y";
      spec.encoding.y.type = "nominal";
      spec.encoding.y.axis = new Axis();
      spec.encoding.y.axis.title = null;

      ret = spec;

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
    xDimension: string
  }) {
    super(id, json);
    this.xDimension = json.xDimension;
  }

  protected makeChart(data: DataObject, containerHeight: number, containerWidth: number): VegaLiteSpec {

    let ret: VegaLiteSpec = null;

    const verticalAdjustment = 27;

    if (this.measures.length > 1) {
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

      transformedData.values.forEach((o: any): void => {
        o.y = o[xDimension];
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
    measureFormats: string[]
  }) {
    super(id, json);
  }

  protected makeChart(data: DataObject, containerHeight: number, containerWidth: number): VegaLiteSpec {
    return null;
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
