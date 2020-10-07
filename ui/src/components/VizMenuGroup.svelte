<!--
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
-->
<script lang="ts">

  import type { Group } from '../Config';
  import type { Visualization } from '../Visualization';

  export let group: Group;
  export let expanded: boolean = false;
  export let filterRegex: RegExp = null;

  let menuItemCount: number;

  let visualizations: Visualization[] = [];

  function toggleExpanded() {
    expanded = !expanded;
  }

  $: {
    const newVisualizations: Visualization[] = [];
    if (group) {
      menuItemCount = 0;
      group.visualizationIds.forEach((id: string): void => {
        const viz = group.getVisualization(id);
        if (!filterRegex || filterRegex.test(viz.panelTitle)) {
          newVisualizations[id] = viz;
          menuItemCount++;
        }
      });
    }
    visualizations = newVisualizations;
  }

</script>

<div class="w-full flex flex-col items-center select-none">
  <div class="w-full border rounded overflow-hidden border-blue-800">
    <div class="w-full text-center bg-gray-200 p-2 uppercase font-semibold cursor-pointer" on:click={toggleExpanded}>
      <div class="w-full flex flex-row justify-between items-center">
      <div>{group.header}</div>
      <div class="text-white px-1 text-xs rounded h-5 font-mono leading-none pt-1 bg-blue-800">{menuItemCount}</div>
      </div>
    </div>
    <div class="w-full flex flex-col items-center px-1 my-1 {expanded ? '' : 'hidden'} dragula-container cursor-grab">
      {#each Object.keys(visualizations) as vizKey}
        <div
          data-viz-id={vizKey}
          title={visualizations[vizKey] ? visualizations[vizKey].text: null}
          class="w-full text-center bg-gray-200 p-1 my-px rounded">
          <span>{visualizations[vizKey] ? visualizations[vizKey].panelTitle : null}</span>
        </div>
      {/each}
    </div>
  </div>
</div>