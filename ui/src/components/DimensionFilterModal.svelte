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

  import { createEventDispatcher } from 'svelte';
  import type { DimensionFilterModel } from '../DimensionFilterModel';
  import Dropdown from './Dropdown.svelte';

  const dispatch: (event: string, detail: any) => void = createEventDispatcher();

  export let visible: boolean = false;
  export let model: DimensionFilterModel;

  let searchText = "";
  let searchRegex: RegExp;
  let labels: string[];
  let values: boolean[];

  $: {
    try {
      searchRegex = new RegExp(searchText);
    } catch(error: any) {
    }
  }

  function toggleRow(rowIndex: number): void {
    model.toggleSelectedDimensionValue(labels[rowIndex]);
    updateModelView();
  }

  function close() : void {
    dispatch('close', {});
    visible = false;
  }

  function toggleAll(): void {
    model.toggleAllSelectedDimensionLevelValues();
    updateModelView();
  }

  function dimensionSelected(e: CustomEvent<{selectedIndex: number, selectedItem: string}>): void {
    model.selectedDimensionIndex = e.detail.selectedIndex;
  }

  function updateModelView(): void {
    labels = [];
    values = [];
    if (model && model.selectedDimensionLevelValues) {
      model.selectedDimensionLevelValues.forEach((value: boolean, key: string): void => {
        labels.push(key);
        values.push(value);
      });
    }
  }

  $: {
    if (model) {
      updateModelView();
    }
  }

</script>

{#if model && model.dimensions.length} <!-- needed because when first mounted the model doesn't exist yet -->
  <div class="{visible ? '' : 'hidden'}">
    <div class="h-full w-full fixed top-0 left-0 bg-gray-300 border-gray-500 opacity-75 z-0">
      <!-- modal background -->
    </div>
    <div class="h-full w-full fixed flex items-center justify-center top-0 left-0 z-10">
      <div class="bg-white rounded shadow w-1/3 max-h-full select-none border border-gray-500">
        <div class="bg-gray-300 p-2 font-semibold">
            <div name="header">Dashboard Filters</div>
        </div>
        <div class="mx-2 my-2 text-xs">
          <div class="flex flex-inline items-center w-full border border-gray-500 p-1 mb-1">
            Dimension: <Dropdown labels={model.labels} selectedIndex={model.selectedDimensionIndex} on:itemSelected={e => dimensionSelected(e)}/>
          </div>
          <div class="flex flex-inline items-center w-full border border-gray-500 p-1 mb-1">
            <input class="text-xs w-full outline-none" type="search" placeholder="Search..." bind:value={searchText}>
          </div>
          <div class="h-max-screen-25 overflow-y-auto border">
            <table class="table-auto border border-gray-500 w-full">
              <tbody>
                {#each labels as label, rowIndex}
                  <tr class=" {searchText.trim() === "" || searchRegex.test(label) ? '' : 'hidden'}">
                      <td class="w-5">
                          <div class="mr-2 ml-1 border border-gray-300 w-4 h-4 hover:bg-gray-300 {values[rowIndex] ? 'bg-gray-900 hover:bg-gray-900' : ''}" on:click={ e => toggleRow(rowIndex) }></div>
                      </td>
                      <td class="py-1 text-left items-start">{label}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
        <div class="m-2 py-1">
          <div on:click="{e => toggleAll()}" class="cursor-pointer hover:text-blue-900 pl-1 text-blue-700 underline">Toggle All</div>
        </div>
        <div class="flex flex-inline justify-center mb-4 mt-2 flex-none">
          <div class="border-2 border-gray-500 mr-2 p-2 hover:bg-gray-200" on:click={e => close()}>OK</div>
        </div>
      </div>
    </div>
  </div>
{/if}
