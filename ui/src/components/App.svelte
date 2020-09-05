<script lang="ts">

  import type { Repository } from "../Repository";
  import type { Drake, DragulaOptions } from 'dragula';
  import type { Config } from "../Config";
  import type { Visualization } from "../Visualization";
  import { UserInterfaceState, WidgetState } from "../UserInterfaceState";

  import dragula from 'dragula';

  import GridRow from './GridRow.svelte';
  import VizMenu from "./VizMenu.svelte";

  export let repository: Repository;

  const DEFAULT_TITLE = "Piet Dashboard";
  const MINIMUM_ROWS = 3;
  const COLUMNS = 2;

  let waiting = true;
  let initialized = false;
  let headerTitle = "";
  let appLogoImageUrl: string;
  let footerText: string;
  let currentGridState: WidgetState[][] = [];

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
      // populateViz(viz, target);
      initializeGrid();
      currentGridState[rowIndex][colIndex] = new WidgetState(viz.id);
      repository.saveCurrentState(currentGridState);
      console.log("Dropped viz: " + JSON.stringify(viz));
    });

  function initializeGrid(rowCount=MINIMUM_ROWS): void {
    const addNewRow = function(rowIndex: number) {
      currentGridState.push([]);
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

    return repository.getSavedState().then(async (uiState: UserInterfaceState): Promise<void> => {

      const restoredWidgetStateGrid: WidgetState[][] = uiState.widgetStateGrid;
      
      initializeGrid(restoredWidgetStateGrid.length);

      const targetNodes: NodeListOf<Element> = document.querySelectorAll(".dragula-drop-target");

      restoredWidgetStateGrid.forEach((row: WidgetState[], rowIdx: number): void => {
        row.forEach((gridState: WidgetState, colIdx: number): void => {
          const viz: Visualization = config.findVisualization(gridState.vizId);
          if (viz) {
            let target: Node = null;
            targetNodes.forEach((node: Element): void => {
              let htmlElement: HTMLElement = node as HTMLElement;
              const nodeRowIndex: number = Number.parseInt(htmlElement.dataset.rowIndex);
              const nodeColumnIndex: number = Number.parseInt(htmlElement.dataset.colIndex);
              if (nodeRowIndex === rowIdx && nodeColumnIndex === colIdx) {
                target = node;
              }
            });
            if (target) {
              //populateViz(viz, target);
              currentGridState[rowIdx][colIdx] = new WidgetState(viz.id);
            }
          }
        });
        
      });

      waiting = false;
      initialized = true;

      return Promise.resolve();

    });

  });

</script>

<nav class="flex items-center flex-wrap bg-gray-100 p-4 pt-2 pb-2 select-none">
  <img src="{appLogoImageUrl}" class="h-16" alt="Logo"/>
  <ul class="ml-4">
    {#if initialized}
      <li><span class="uppercase text-base">{headerTitle}</span></li>
    {/if}
  </ul>
</nav>

<div class="h-full flex flex-col">
  <div class="h-full flex flex-inline">
    <div class="h-full w-full absolute bg-gray-300 opacity-50 {waiting ? '' : 'hidden'}">
      <!-- <div id="wait-spinner"/> -->
    </div>
    {#if initialized}
      <div class="flex flex-col w-1/5 h-full p-2">
        <VizMenu groups={repository.config.groups}/>
      </div>
    {/if}
    <div class="h-full w-4/5 overflow-y-auto" id="viz-container">
      <!-- container for dashboard visualizations to go (added dynamically at repository init and when a widget is dropped in the current last row) -->
    </div>
  </div>
  {#if initialized && footerText}
    <div class="w-full text-xs italic px-20 mb-4 text-center">{footerText}</div>
  {/if}
</div>