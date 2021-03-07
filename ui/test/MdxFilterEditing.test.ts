/*
  Copyright 2021 Scott Came Consulting LLC

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

import type { Config, FilterDimension } from "../src/Config";
import { DimensionFilterModel } from "../src/DimensionFilterModel";
import { LocalRepository } from "../src/Repository";

const repository = new LocalRepository();

test('no editing', () => {
  const model: DimensionFilterModel = new DimensionFilterModel();
  const inputMdx = "SELECT NON EMPTY {[Measures].[Units Ordered]} * {[Store].[Store State].Members} ON COLUMNS FROM [Warehouse]";
  const mdx = model.applyTo(inputMdx);
  expect(mdx).toBe(inputMdx);
});

test('editing', async () => {
  return repository.init().then(async (_config: Config) => {

    const stateDimension = repository.filterDimensions
      .filter((fd: FilterDimension): boolean => { return fd.label==="State (Custom)"; })[0];

    const stateLevelValues: Map<string, boolean> = new Map();
    stateLevelValues.set("OH", true);
    stateLevelValues.set("MI", true);
    stateLevelValues.set("VT", true);
    repository.dimensionFilterModel.addDimensionLevels(stateDimension, stateLevelValues);

    const inputMdx = "SELECT NON EMPTY {[Measures].[Units Ordered]} * {[Store].[Store State].Members} ON COLUMNS FROM [Warehouse]";
    
    expect(repository.dimensionFilterModel.applyTo(inputMdx)).toBe(inputMdx);

    stateLevelValues.set("MI", false);
    expect(repository.dimensionFilterModel.applyTo(inputMdx))
      .toBe("SELECT NON EMPTY {[Measures].[Units Ordered]} * {Except([Store].[Store State].Members, {[Store].[Store State].[MI]})} ON COLUMNS FROM [Warehouse]");

    stateLevelValues.set("VT", false);
    expect(repository.dimensionFilterModel.applyTo(inputMdx))
      .toBe("SELECT NON EMPTY {[Measures].[Units Ordered]} * {Intersect([Store].[Store State].Members, {[Store].[Store State].[OH]})} ON COLUMNS FROM [Warehouse]");

    const yearDimension = repository.filterDimensions
      .filter((fd: FilterDimension): boolean => { return fd.dimension==="[Time].[Year]"; })[0];

    const yearLevelValues: Map<string, boolean> = new Map();
    yearLevelValues.set("2018", true);
    yearLevelValues.set("2019", true);
    yearLevelValues.set("2020", true);
    repository.dimensionFilterModel.addDimensionLevels(yearDimension, yearLevelValues);

    expect(repository.dimensionFilterModel.applyTo(inputMdx))
      .toBe("SELECT NON EMPTY {[Measures].[Units Ordered]} * {Intersect([Store].[Store State].Members, {[Store].[Store State].[OH]})} ON COLUMNS FROM [Warehouse]");

    yearLevelValues.set("2019", false);

    expect(repository.dimensionFilterModel.applyTo(inputMdx))
      .toBe("SELECT NON EMPTY {[Measures].[Units Ordered]} * {Intersect([Store].[Store State].Members, {[Store].[Store State].[OH]})} ON COLUMNS FROM [Warehouse] where Except([Time].[Year].Members, {[Time].[Year].[2019]})");

    yearLevelValues.set("2018", false);

    expect(repository.dimensionFilterModel.applyTo(inputMdx))
    .toBe("SELECT NON EMPTY {[Measures].[Units Ordered]} * {Intersect([Store].[Store State].Members, {[Store].[Store State].[OH]})} ON COLUMNS FROM [Warehouse] where Intersect([Time].[Year].Members, {[Time].[Year].[2020]})");

    });
});