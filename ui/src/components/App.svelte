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

  import type { Repository } from "../Repository";
  import type { Drake, DragulaOptions } from 'dragula';
  import type { Config, FilterDimension } from "../Config";
  import type { Visualization } from "../Visualization";
  import { UserInterfaceState, WidgetState } from "../UserInterfaceState";

  import dragula from 'dragula';

  import GridRow from './GridRow.svelte';
  import VizMenu from "./VizMenu.svelte";
  import VizWidget from "./VizWidget.svelte";
  import DimensionFilterModal from "./DimensionFilterModal.svelte";
  import AboutModal from "./AboutModal.svelte";

  export let repository: Repository;

  const DEFAULT_TITLE = "Piet Dashboard";
  const MINIMUM_ROWS = 3;
  const COLUMNS = 2;

  let waiting = true;
  let initialized = false;
  let headerTitle = "";
  let appLogoImageUrl: string;
  let footerText: string;
  let currentUiState: UserInterfaceState = new UserInterfaceState();

  let dimensionFilterModalVisible = false;
  let dimensionFilterText: string;

  let aboutModalVisible: boolean = false;
  let aboutContentUrl: string;
  let dataCaveatText: string;

  document.title = DEFAULT_TITLE;

  const dragulaOptions: DragulaOptions = {
    revertOnSpill: true,
    copy: true,
    moves: function(el: Element, _source: Element, _handle: Element, _sibling: Element) {
      return !(el.classList.contains('dragula-div-disabled') || el.classList.contains('viz-widget'));
    },
    accepts: function(_el: Element, target: Element, _handle: Element, _sibling: Element) {
      return target.classList.contains('dragula-drop-target');
    }
  };

  const drake: Drake = dragula(dragulaOptions)
    .on('over', function (_el: Element, container: Element, _source: Element): void {
      if (container.classList.contains('dragula-drop-target')) {
        container.classList.toggle('border-gray-400');
      }
    }).on('out', function (_el: Element, container: Element): void {
      if (container.classList.contains('dragula-drop-target')) {
        container.classList.toggle('border-gray-400');
      }
    }).on('drop', function(element: Element, target: Element, _source: Element, _sibling: Element): void {
      const htmlElement: HTMLElement = element as HTMLElement;
      const htmlTarget: HTMLElement = target as HTMLElement;
      target.removeChild(element);
      const viz = repository.config.findVisualization(htmlElement.dataset.vizId);
      const rowIndex = Number.parseInt(htmlTarget.dataset.rowIndex);
      const colIndex = Number.parseInt(htmlTarget.dataset.colIndex);
      populateViz(viz, htmlTarget);
      initializeGrid();
      currentUiState.widgetStateGrid[rowIndex][colIndex] = new WidgetState(viz.id);
      repository.saveCurrentState(currentUiState);
    });

  function initializeGrid(rowCount=MINIMUM_ROWS): void {
    const addNewRow = function(rowIndex: number) {
      currentUiState.widgetStateGrid.push([]);
      new GridRow({ target: document.querySelector('#viz-container'), props: { columnCount: COLUMNS, rowIndex: rowIndex } });
      document.querySelectorAll('.dragula-container').forEach((el: Element): void => {
        if (!drake.containers.includes(el)) {
          drake.containers.push(el);
        }
      });
    };
    const rowLimit = Math.max(rowCount, MINIMUM_ROWS)
    rowCount = document.querySelectorAll('.grid-row').length;
    while (rowCount < rowLimit || document.querySelector('.grid-row:last-child > div.dragula-occupied')) {
      addNewRow(rowCount);
      rowCount = document.querySelectorAll('.grid-row').length;
    }
  }

  repository.init().then(async (config: Config): Promise<void> => {

    if (config.shortTitle) {
      document.title = config.shortTitle;
    }

    if (config.longTitle) {
      headerTitle = config.longTitle;
    }

    if (config.appLogoImageUrl) {
      appLogoImageUrl = config.appLogoImageUrl;
    }

    footerText = config.disclaimerFooterText;
    aboutContentUrl = config.aboutContentURL;
    dataCaveatText = config.dataCaveatText;

    updateDimensionFilterText();

    return repository.getSavedState().then(async (uiState: UserInterfaceState): Promise<void> => {

      const restoredWidgetStateGrid: WidgetState[][] = uiState.widgetStateGrid;
      
      initialized = true; // this goes here to indicate that state has been initialized, so ui components that need it can proceed

      initializeGrid(restoredWidgetStateGrid.length);

      const targetNodes: NodeListOf<Element> = document.querySelectorAll(".dragula-drop-target");

      if (uiState.dimensionFilterModel) {
        currentUiState.dimensionFilterModel = uiState.dimensionFilterModel;
        repository.dimensionFilterModel = uiState.dimensionFilterModel;
      }

      repository.dimensionFilterModel.selectedDimensionIndex = 0;

      updateDimensionFilterText();
      updateVisualizationsForFilterChange();

      restoredWidgetStateGrid.forEach((row: WidgetState[], rowIdx: number): void => {
        row.forEach((gridState: WidgetState, colIdx: number): void => {
          if (gridState) {
            const viz: Visualization = config.findVisualization(gridState.vizId);
            if (viz) {
              let target: HTMLElement = null;
              targetNodes.forEach((node: Element): void => {
                let htmlElement: HTMLElement = node as HTMLElement;
                const nodeRowIndex: number = Number.parseInt(htmlElement.dataset.rowIndex);
                const nodeColumnIndex: number = Number.parseInt(htmlElement.dataset.colIndex);
                if (nodeRowIndex === rowIdx && nodeColumnIndex === colIdx) {
                  target = htmlElement;
                }
              });
              if (target) {
                populateViz(viz, target);
                currentUiState.widgetStateGrid[rowIdx][colIdx] = new WidgetState(viz.id);
              }
            }
          }
        });
        
      });

      waiting = false;

      return Promise.resolve();

    });

  });

  let widgets: VizWidget[] = [];

  function populateViz(viz: Visualization, target: HTMLElement): void {

    const existingWidget = target.querySelector('.viz-widget');

    if (existingWidget) {
      target.removeChild(existingWidget);
    }

    target.classList.add('dragula-occupied');
    target.classList.remove('border-dashed');
    target.classList.add('border-solid');

    const rowIndex = Number.parseInt(target.dataset.rowIndex);
    const colIndex = Number.parseInt(target.dataset.colIndex);

    const widget = new VizWidget({
      target: target,
      props: {
        viz: viz,
        repository: repository,
        rowIndex: rowIndex,
        colIndex: colIndex
      }
    });
    
    widget.$on('closeWidget', (e: CustomEvent<{divId: string}>) => {
      target.removeChild(document.getElementById(e.detail.divId));
      target.classList.remove('dragula-occupied');
      target.classList.add('border-dashed');
      target.classList.remove('border-solid');
      currentUiState.widgetStateGrid[rowIndex][colIndex] = undefined;
      widgets = widgets.filter((w: VizWidget): boolean => {
        return w.divId !== e.detail.divId;
      })
      repository.saveCurrentState(currentUiState);
    });

    widgets.push(widget);

  }

  function updateVisualizationsForFilterChange(): void {
    widgets.forEach((widget: VizWidget): void => {
      if (widget.hasFilteredVisualization()) {
        widget.renderViz();
      }
    });
  }

  function updateDimensionFilterText(): void {
    if (repository.dimensionFilterModel) {
      dimensionFilterText = repository.dimensionFilterModel.dimensionStateDescriptions.join("; ");
    }
  }

  function showDimensionFilterModal(): void {
    dimensionFilterModalVisible = true;
  }

  function hideDimensionFilterModal(e: CustomEvent): void {
    currentUiState.dimensionFilterModel = repository.dimensionFilterModel;
    repository.saveCurrentState(currentUiState);
    updateDimensionFilterText();
    updateVisualizationsForFilterChange();
    dimensionFilterModalVisible = false;
  }

  function showAboutModal(): void {
    aboutModalVisible = true;
  }

  function hideAboutModal(): void {
    aboutModalVisible = false;
  }

</script>

<nav class="bg-gray-100 p-4 pt-2 pb-2 select-none">
  {#if initialized}
    <div class="flex items-center justify-between flex-row">
      <img src="{appLogoImageUrl}" class="h-16" alt="Logo"/>
      <ul class="border-r-2 ml-4 mr-2 pr-10">
          <li><span class="uppercase text-xl">{headerTitle}</span></li>
          <li class="mt-3 italic"><span class="data-caveat-text">{@html dataCaveatText}</span></li>
      </ul>
      <div class="ml-auto hover:underline cursor-pointer flex-none" on:click="{ e => showAboutModal() }">About this dashboard</div>
    </div>
  {/if}
</nav>

<div class="h-full flex flex-col">
  <div class="h-full flex flex-inline">
    <div class="h-full w-full absolute bg-gray-300 opacity-50 {waiting ? '' : 'hidden'}">
      <div id="wait-spinner"/>
    </div>
    {#if initialized}
      <div class="flex flex-col w-1/5 h-full p-2">
        <VizMenu groups={repository.config.groups} helpVisible={repository.firstVisit}/>
      </div>
    {/if}
    <div class="h-full w-4/5">
      {#if initialized}
        <div class="flex flex-inline h-10 w-full m-1 mr-2 p-1 border rounded border-blue-800 select-none">
          <button
            class="bg-transparent hover:bg-blue-800 text-blue-800 font-semibold hover:text-white py-px px-4 border border-blue-800 hover:border-transparent rounded outline-none focus:outline-none"
            on:click="{e => showDimensionFilterModal()}">
            Filters...
          </button>
          <div class="ml-2 flex items-center">{dimensionFilterText}</div>
        </div>
      {/if}
      <div class="w-full overflow-y-auto dashboard-grid-height">
        <div class="w-full" id="viz-container">
          <!-- container for dashboard visualizations to go (added dynamically at repository init and when a widget is dropped in the current last row) -->
        </div>
      </div>
    </div>
  </div>
  {#if initialized && footerText}
    <div class="w-full text-xs italic px-20 mb-4 text-center">{footerText}</div>
  {/if}
</div>

<DimensionFilterModal
  visible={dimensionFilterModalVisible}
  model={repository.dimensionFilterModel}
  on:close="{e => hideDimensionFilterModal(e)}"/>

<AboutModal visible={aboutModalVisible} contentUrl={aboutContentUrl} on:close="{e => hideAboutModal()}"/>

<style>
  #wait-spinner {
    position: relative;
    left: 50%;
    top: 50%;
    z-index: 1;
    margin: -75px 0 0 -75px;
    border: 16px solid #f3f3f3;
    border-radius: 50%;
    border-top: 16px solid #3498db;
    width: 100px;
    height: 100px;
    -webkit-animation: spin 2s linear infinite;
    animation: spin 2s linear infinite;
  }
  
  @-webkit-keyframes spin {
    0% { -webkit-transform: rotate(0deg); }
    100% { -webkit-transform: rotate(360deg); }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* have to put the :global() here to force the svelte compiler to include this, since the text is dynamically inserted */
  :global(span.data-caveat-text > a) {
    text-decoration: underline;
  }

</style>