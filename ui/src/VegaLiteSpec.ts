type Mark = "bar"|"line"|"circle"|"rect"|"text"|"arc";

export class VegaLiteSpec {

  $schema = "https://vega.github.io/schema/vega-lite/v4.json";

  mark: Mark|LineMarkSpec;
  encoding: Encoding;
  layer: Layer[];
  data: DataObject;
  height: number|SizeByStep;
  width: number|SizeByStep;
  view?: ViewSpec;

  get hasData(): boolean {
    return this.data.values.length > 0;
  }

}

export class ViewSpec {
  stroke: string;
}

export class Encoding {
  x: EncodingSpec;
  y: EncodingSpec;
  color: ColorEncodingSpec;
  text: TextEncodingSpec;
  theta: EncodingSpec;
}

export class EncodingSpec {
  field: string;
  type: "quantitative"|"nominal"|"ordinal"|"temporal";
  axis: Axis;
  title: string;
  condition: Condition;
  value: string|number;
  stack: boolean;
  scale: Scale;
}

export class ColorEncodingSpec extends EncodingSpec {
  scale: Scale;
  legend: Legend;
}

export class Scale {
  type: "linear"|"log";
  domain: number[];
  zero: boolean;
}

export class Axis {
  title: string;
  grid: boolean;
  format: string;
  sort: string|string[];
  labelAngle: number;
  tickCount: string;
}

export class DataObject {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: any[];
}

export class SizeByStep {
  step: number;
}

export class Layer {
  mark: Mark|RadialMarkSpec;
  encoding: Encoding;
}

export class Condition {
  test: string;
  value: string;
}

export class Legend {
  title: string;
}

export class RadialMarkSpec {
  type: Mark;
  radius: number;
  outerRadius: number;
  format?: string;
}

export class LineMarkSpec {
  type = "line";
  point: boolean;
}

export class TextEncodingSpec extends EncodingSpec {
  format: string;
}