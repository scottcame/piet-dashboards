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

      return selectedMembers.length == valueMap.size ? null : label + ": " + selectedMembers.join(",");

    }).filter((value: string): boolean => { return value != null; });
  }

  applyTo(mdx: string): string {
    
    const dimensionReplacementMap = new Map<string, string>();

    this._dimensionLevelValues.forEach((valueMap: Map<string, boolean>, rowIndex: number): void => {
      const selectedMembers = [];
      const deselectedMembers = [];
      [...valueMap.entries()].forEach((entry: [string, boolean]): void => {
        if (entry[1]) {
          selectedMembers.push(entry[0]);
        } else {
          deselectedMembers.push(entry[0]);
        }
      });
      if (selectedMembers.length < valueMap.size) {
        const d = this._dimensions[rowIndex].dimension;
        let mdxFunction = "Except";
        let filterMembers = deselectedMembers;
        if (selectedMembers.length < deselectedMembers.length) {
          mdxFunction = "Intersect";
          filterMembers = selectedMembers;
        }
        const memberList = "{" + filterMembers.map((selectedMember: string): string => {
          return d + ".[" + selectedMember + "]";
        }).join(",") + "}";
        dimensionReplacementMap.set(d + ".Members", mdxFunction + "(" + d + ".Members, " + memberList + ")");
      }
    });

    const wheres = [];

    dimensionReplacementMap.forEach((filterMemberString: string, originalDimensionMembersText: string): void => {
      if (mdx.includes(originalDimensionMembersText)) {
        mdx = mdx.replace(originalDimensionMembersText, filterMemberString);
      } else {
        wheres.push(filterMemberString);
      }
    });

    if (wheres.length) {
      mdx = mdx + " where " + wheres.join("*");
    }

    return mdx;

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