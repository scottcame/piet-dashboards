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

/* eslint-disable @typescript-eslint/no-explicit-any */

export class ArrayUtils {

  private static arraysEqual(a1: Array<string|number>, a2: Array<string|number>): boolean {
    if (a1.length !== a2.length) {
      return false;
    }
    for(let i=0;i < a1.length;i++) {
      if (a1[i] !== a2[i]) {
        return false;
      }
    }
    return true;
  }
  
  static outerJoin(a: Array<string|number>, b: Array<string|number>, keyVars: string[], mergeVars: string[]): Array<any> {
    const o = [];
    a.forEach(function(v) {
      const aKeyvals = [];
      keyVars.forEach(function(kv) {
        aKeyvals.push(v[kv]);
      });
      let mvo = new Object;
      mergeVars.forEach(function(mv) {
        mvo[mv] = null;
      });
      const no = Object.assign(mvo, v);
      let matchFound = false;
      b.forEach(function(bv) {
        const bKeyvals = [];
        keyVars.forEach(function(kv) {
          bKeyvals.push(bv[kv]);
        });
        if (ArrayUtils.arraysEqual(aKeyvals, bKeyvals)) {
          mvo = new Object;
          mergeVars.forEach(function(mv) {
            const newVal = bv[mv] === undefined ? null : bv[mv];
            mvo[mv] = newVal;
          });
          o.push(Object.assign(mvo, v));
          matchFound = true;
        }
      });
      if (!matchFound) {
        o.push(no);
      }
    });
    return o;
  }

}