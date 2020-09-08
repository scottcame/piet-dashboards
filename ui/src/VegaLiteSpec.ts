type Mark = "bar"|"line"|"circle"|"rect"|"text";

export class VegaLiteSpec {

  $schema = "https://vega.github.io/schema/vega-lite/v4.json";

  mark: Mark;
  encoding: Encoding;
  layer: Layer[];
  data: DataObject;
  height: number|SizeByStep;
  width: number|SizeByStep;

}

export class Encoding {
  x: EncodingSpec;
  y: EncodingSpec;
  color: ColorEncodingSpec;
  text: EncodingSpec;
}

export class EncodingSpec {
  field: string;
  type: "quantitative"|"nominal"|"ordinal";
  axis: Axis;
  title: string;
  condition: Condition;
  value: string|number;
}

export class ColorEncodingSpec extends EncodingSpec {
  scale: Scale;
  legend: Legend;
}

export class Scale {
  type: "linear";
  domain: number[];
}

export class Axis {
  title: string;
  grid: boolean;
  format: string;
  sort: string|string[];
  labelAngle: number;
}

export class DataObject {
  values: any[];
}

export class SizeByStep {
  step: number;
}

export class Layer {
  mark: Mark;
  encoding: Encoding;
}

export class Condition {
  test: string;
  value: string;
}

export class Legend {
  title: string;
}