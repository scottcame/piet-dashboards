import type { FilterDimension } from "./Config";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

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

  addDimensionLevels(dimension: FilterDimension, levelValues: Map<string, boolean>): void {
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
      const partition = this.partitionMembers(valueMap);

      let ret = null;

      const formatLevels = function(label: string, levels: string[]): string {
        return label + ": " + levels.join(",");
      };

      if (!partition.allSelected) {
        if (partition.selectedMembers.length < partition.deselectedMembers.length) {
          ret = formatLevels(label, partition.selectedMembers);
        } else {
          ret = "Excluding " + formatLevels(label, partition.deselectedMembers);
        }
      }

      return ret;

    }).filter((value: string): boolean => { return value != null; });
  }

  private partitionMembers(valueMap: Map<string, boolean>): DimensionMemberPartitioning {
    const ret = new DimensionMemberPartitioning(valueMap.size);
    [...valueMap.entries()].forEach((entry: [string, boolean]): void => {
      if (entry[1]) {
        ret.selectedMembers.push(entry[0]);
      } else {
        ret.deselectedMembers.push(entry[0]);
      }
    });
    return ret;
  }

  applyTo(mdx: string): string {
    
    const dimensionReplacementMap = new Map<string, string>();

    this._dimensionLevelValues.forEach((valueMap: Map<string, boolean>, rowIndex: number): void => {
      const partition = this.partitionMembers(valueMap);
      if (!partition.allSelected) {
        const d = this._dimensions[rowIndex].dimension;
        let mdxFunction = "Except";
        let filterMembers = partition.deselectedMembers;
        if (partition.selectedMembers.length < partition.deselectedMembers.length) {
          mdxFunction = "Intersect";
          filterMembers = partition.selectedMembers;
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

class DimensionMemberPartitioning {
  private _levelCount: number;
  constructor(levelCount: number) {
    this._levelCount = levelCount;
  }
  selectedMembers: string[] = [];
  deselectedMembers: string[] = [];
  get allSelected(): boolean {
    return this.selectedMembers.length == this._levelCount;
  }
}