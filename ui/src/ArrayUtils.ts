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