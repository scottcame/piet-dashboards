import type { FilterDimension } from "./Config";

export class DimensionFilterModel {

  selectedDimensionIndex = 0;
  private toggleAllValue = false;
  private _dimensions: FilterDimension[] = [];
  private _dimensionLevelValues: Map<string, boolean>[] = [];

  get selectedDimension(): string {
    return this.dimensions.length ? this.dimensions[this.selectedDimensionIndex] : undefined;
  }

  get selectedDimensionLevelValues(): Map<string, boolean> {
    return this._dimensionLevelValues[this.selectedDimensionIndex];
  }

  addDimensionLevels(dimension: FilterDimension, levelValues: Map<string, boolean>) {
    this._dimensions.push(dimension);
    this._dimensionLevelValues.push(levelValues);
  }

  toggleAllSelectedDimensionLevelValues(): void {
    [...this.selectedDimensionLevelValues.keys()].forEach((level: string): void => {
      this.selectedDimensionLevelValues.set(level, !this.toggleAllValue);
    });
    this.toggleAllValue = !this.toggleAllValue;
  }

  toggleSelectedDimensionValue(level: string) : boolean {
    const currentValue = this.selectedDimensionLevelValues.get(level);
    this.selectedDimensionLevelValues.set(level, !currentValue);
    return !currentValue;
  }

  get dimensions(): string[] {
    return this._dimensions.map((d: FilterDimension): string => {
      return d.dimension;
    });
  }

  get labels(): string[] {
    return this._dimensions.map((d: FilterDimension): string => {
      return d.label;
    });
  }

  get dimensionStateDescriptions(): string[] {
    return this.labels.map((label: string, rowIndex: number): string => {

      const valueMap = this._dimensionLevelValues[rowIndex];
      const selectedMembers = [...valueMap.entries()].filter(entry => {
        return entry[1];
      }).map(entry => { return entry[0]; });

      return label + ": " + (selectedMembers.length == valueMap.size ? "All values selected" : selectedMembers.join(","));

    });
  }

  syncWith(model: DimensionFilterModel): void {
    this.dimensions.forEach((dimension: string, rowIndex: number): void => {
      if (model) {
        model.dimensions.forEach((savedDimension: string, savedRowIndex: number): void => {
          if (dimension === savedDimension) {
            const savedValueMap = model._dimensionLevelValues[savedRowIndex];
            savedValueMap.forEach((value: boolean, key: string): void => {
              if (this._dimensionLevelValues[rowIndex].has(key)) {
                this._dimensionLevelValues[rowIndex].set(key, value);
              }
            });
          }
        });
      }
    });
  }

  toJson(): any {
    return {
      _dimensions: this._dimensions,
      selectedDimensionIndex: this.selectedDimensionIndex,
      dimensionLevelValues: this._dimensionLevelValues.map((levelMap: Map<string, boolean>): any => {
        const ret = new Object();
        levelMap.forEach((value: boolean, key: string): void => {
          ret[key] = value;
        });
        return ret;
      })
    };
  }

  static fromJson(json: any): DimensionFilterModel {
    const ret = new DimensionFilterModel();
    ret._dimensions = JSON.parse(JSON.stringify(json._dimensions)) as FilterDimension[];
    ret.selectedDimensionIndex = json.selectedDimensionIndex;
    json.dimensionLevelValues.forEach((valueMap: any): void => {
      const m = new Map<string, boolean>();
      ret._dimensionLevelValues.push(m);
      Object.keys(valueMap).forEach((objectKey: string): void => {
        m.set(objectKey, valueMap[objectKey]);
      });
    });
    return ret;
  }

}