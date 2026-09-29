import { DiffResult } from '../../types';

export interface DiffSummary {
  addedCount: number;
  removedCount: number;
  changedCount: number;
  unchangedCount: number;
  differences: DiffResult[];
}

function isObject(val: any): boolean {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

export function compareJsonPayloads(oldObj: any, newObj: any, currentPath: string = ''): DiffResult[] {
  const results: DiffResult[] = [];

  // If one or both are primitives or different types
  if (oldObj === newObj) {
    if (currentPath) {
      results.push({
        path: currentPath,
        type: 'unchanged',
        oldValue: oldObj,
        newValue: newObj,
      });
    }
    return results;
  }

  // If one is undefined
  if (oldObj === undefined && newObj !== undefined) {
    results.push({
      path: currentPath || 'root',
      type: 'added',
      newValue: newObj,
    });
    return results;
  }

  if (oldObj !== undefined && newObj === undefined) {
    results.push({
      path: currentPath || 'root',
      type: 'removed',
      oldValue: oldObj,
    });
    return results;
  }

  // If types differ or one is null
  if (
    typeof oldObj !== typeof newObj ||
    oldObj === null ||
    newObj === null ||
    Array.isArray(oldObj) !== Array.isArray(newObj)
  ) {
    results.push({
      path: currentPath || 'root',
      type: 'changed',
      oldValue: oldObj,
      newValue: newObj,
    });
    return results;
  }

  // Array comparison
  if (Array.isArray(oldObj) && Array.isArray(newObj)) {
    const maxLen = Math.max(oldObj.length, newObj.length);
    for (let i = 0; i < maxLen; i++) {
      const itemPath = currentPath ? `${currentPath}[${i}]` : `[${i}]`;
      if (i >= oldObj.length) {
        results.push({
          path: itemPath,
          type: 'added',
          newValue: newObj[i],
        });
      } else if (i >= newObj.length) {
        results.push({
          path: itemPath,
          type: 'removed',
          oldValue: oldObj[i],
        });
      } else {
        results.push(...compareJsonPayloads(oldObj[i], newObj[i], itemPath));
      }
    }
    return results;
  }

  // Object comparison
  if (isObject(oldObj) && isObject(newObj)) {
    const allKeys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)])).sort();

    for (const key of allKeys) {
      const fieldPath = currentPath ? `${currentPath}.${key}` : key;
      const hasOld = Object.prototype.hasOwnProperty.call(oldObj, key);
      const hasNew = Object.prototype.hasOwnProperty.call(newObj, key);

      if (!hasOld && hasNew) {
        results.push({
          path: fieldPath,
          type: 'added',
          newValue: newObj[key],
        });
      } else if (hasOld && !hasNew) {
        results.push({
          path: fieldPath,
          type: 'removed',
          oldValue: oldObj[key],
        });
      } else {
        results.push(...compareJsonPayloads(oldObj[key], newObj[key], fieldPath));
      }
    }
    return results;
  }

  // Fallback primitive comparison
  results.push({
    path: currentPath || 'root',
    type: 'changed',
    oldValue: oldObj,
    newValue: newObj,
  });

  return results;
}

export function summarizeJsonDiff(oldObj: any, newObj: any): DiffSummary {
  const differences = compareJsonPayloads(oldObj, newObj);
  let addedCount = 0;
  let removedCount = 0;
  let changedCount = 0;
  let unchangedCount = 0;

  for (const diff of differences) {
    if (diff.type === 'added') addedCount++;
    else if (diff.type === 'removed') removedCount++;
    else if (diff.type === 'changed') changedCount++;
    else if (diff.type === 'unchanged') unchangedCount++;
  }

  return {
    addedCount,
    removedCount,
    changedCount,
    unchangedCount,
    differences,
  };
}
