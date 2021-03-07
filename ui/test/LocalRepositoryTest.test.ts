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
import { LocalRepository, Repository } from "../src/Repository";
import type { Config, FilterDimension } from "../src/Config";
import { UserInterfaceState, WidgetState } from "../src/UserInterfaceState";
import { TestData } from "./_data/TestData";

let repository: Repository;

beforeEach(() => {
  repository = new LocalRepository();
});

test('init', async () => {
  return repository.init().then(async (_config: Config) => {
    expect(repository.uiState).toBeTruthy();
    expect(repository.uiState.widgetStateGrid).toHaveLength(0);
  });
});

test('ui state save and retrieve', async () => {
  return repository.init().then(async (_config: Config) => {
    const uiState = new UserInterfaceState();
    uiState.widgetStateGrid.push([]);
    uiState.widgetStateGrid[0] = [];
    uiState.widgetStateGrid[0][0] = new WidgetState();
    uiState.widgetStateGrid[0][0].vizId = "viz1";
    return repository.saveCurrentState(uiState).then(async (): Promise<void> => {
      return repository.getSavedState().then(async (restoredState: UserInterfaceState): Promise<void> => {
        expect(restoredState.widgetStateGrid[0][0].vizId).toBe("viz1");
        return repository.init().then(async (_config: Config) => {
          return repository.getSavedState().then(async (restoredState2: UserInterfaceState): Promise<void> => {
            expect(restoredState2.widgetStateGrid[0][0].vizId).toBe("viz1");
          });
        });
      });
    });
  });
});

test('filter dimensions', async () => {
  return repository.init().then(async (_config: Config) => {

    expect(repository.filterDimensions.length).toBe(10);

    const countryDimension = repository.filterDimensions
      .filter((fd: FilterDimension): boolean => { return fd.label==="Store Country"; })[0];

    const countryLevel = TestData.TEST_DIMENSIONS["default"]
      .filter((d: { name: string }): boolean => { return d.name==="Store"; })[0]
      .hierarchies
      .filter((h: { name: string }): boolean => { return h.name==="Store"; })[0]
      .levels
      .filter((level: { name: string }): boolean => { return level.name==="Store Country"; })[0];

    expect(countryDimension.dimension === countryLevel.uniqueName).toBe(true);
    expect(countryDimension.connection).toBe("foodmart");
    expect(countryDimension.hierarchy).toBe('[Store]');
    expect(countryDimension.query).toBe('WITH MEMBER Measures.Nul as Null SELECT {[Measures].[Nul]}*{[Store].[Store Country].Members} ON COLUMNS FROM [Warehouse]');
    
  });
});

test('dimension filters', async () => {
  return repository.init().then(async (_config: Config) => {

    expect(repository.dimensionFilterModel.selectedDimensionIndex).toBe(0);
    expect(repository.dimensionFilterModel.dimensions).toStrictEqual(repository.filterDimensions.map((fd: FilterDimension): string => { return fd.dimension; }));
    expect(repository.dimensionFilterModel.selectedDimension).toBe("[Store].[Store Country]");
    expect(repository.dimensionFilterModel.selectedDimensionLevelValues.get("USA")).toBe(true);

    repository.dimensionFilterModel.toggleSelectedDimensionValue("USA");
    expect(repository.dimensionFilterModel.selectedDimensionLevelValues.get("USA")).toBe(false);

    repository.dimensionFilterModel.selectedDimensionIndex = 1;

    expect(repository.dimensionFilterModel.selectedDimension).toBe("[Store].[Store State]");
    expect(repository.dimensionFilterModel.labels[repository.dimensionFilterModel.selectedDimensionIndex]).toBe("State (Custom)");

  });
});
