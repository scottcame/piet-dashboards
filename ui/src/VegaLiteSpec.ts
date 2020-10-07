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
  tooltip: EncodingSpec;
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
  padding: number;
  domainMin: number;
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
  mark: Mark|RadialMarkSpec|TextMarkSpec;
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

export class TextMarkSpec {
  type = "text";
  align: "left"|"right";
  baseline: "top"|"middle"|"bottom";
  dx: number;
}

export class TextEncodingSpec extends EncodingSpec {
  format: string;
}