<script lang="ts">

  import VegaViz from './VegaViz.svelte';

  import { createEventDispatcher, onMount } from 'svelte';
  import type { VegaLiteSpec } from '../VegaLiteSpec';
  import type { Repository } from '../Repository';
  import type { Visualization } from '../Visualization';

  const dispatch: (event: string, detail: any) => void = createEventDispatcher();

  export let viz: Visualization;
  export let repository: Repository;
  export let rowIndex: number
  export let colIndex: number;
  export const divId = "widget-" + rowIndex + "-" + colIndex;

  const RESIZE_RENDER_WAIT = 250;
  let vegaLiteSpec: VegaLiteSpec;
  let container: HTMLElement;

  let allowVizExport: boolean = repository.config.allowVizExport;

  function closeWidget(): void {
    dispatch('closeWidget', {
      divId: divId
    });
  }

  onMount(() => {
    renderViz();
    let resizeTimer: number;
    const resizeListener = (): void => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout((): void => {
        renderViz();
      }, RESIZE_RENDER_WAIT);
    };
    window.addEventListener('resize', resizeListener);
    return (): void => window.removeEventListener('resize', resizeListener);
  });

  export function renderViz(): void {
    const height = container.clientHeight * .65; // accounts for the card header
    const width = container.clientWidth;
    viz.render(repository, height, width).then((spec: VegaLiteSpec): void => {
      vegaLiteSpec = spec;
    });
  }

  export function hasFilteredVisualization(): boolean {
    return viz.hasFilteredQuery;
  }

</script>

<div class="w-full h-full viz-widget select-none overflow-y-hidden" id={divId} data-viz-id={viz.id} bind:this={container}>
  <div class="w-full flex flex-row justify-between bg-gray-300">
    <div class="p-1 text-pf-blue text-xs font-semibold">
      <div>{viz.panelTitle}</div>
    </div>
    <div class="flex items-center">
      <div class="flex items-center h-8 mr-1 text-gray-700 cursor-pointer" on:click={closeWidget}>
        <svg viewBox="0 0 20 20" class="stroke-current fill-current h-4">
            <g stroke-width=".25" fill-rule="evenodd">
              <g>
                <path d="M11.4142136,10 L14.2426407,7.17157288 L12.8284271,5.75735931 L10,8.58578644 L7.17157288,5.75735931 L5.75735931,7.17157288 L8.58578644,10 L5.75735931,12.8284271 L7.17157288,14.2426407 L10,11.4142136 L12.8284271,14.2426407 L14.2426407,12.8284271 L11.4142136,10 L11.4142136,10 Z M2.92893219,17.0710678 C6.83417511,20.9763107 13.1658249,20.9763107 17.0710678,17.0710678 C20.9763107,13.1658249 20.9763107,6.83417511 17.0710678,2.92893219 C13.1658249,-0.976310729 6.83417511,-0.976310729 2.92893219,2.92893219 C-0.976310729,6.83417511 -0.976310729,13.1658249 2.92893219,17.0710678 L2.92893219,17.0710678 Z M4.34314575,15.6568542 C7.46734008,18.7810486 12.5326599,18.7810486 15.6568542,15.6568542 C18.7810486,12.5326599 18.7810486,7.46734008 15.6568542,4.34314575 C12.5326599,1.21895142 7.46734008,1.21895142 4.34314575,4.34314575 C1.21895142,7.46734008 1.21895142,12.5326599 4.34314575,15.6568542 L4.34314575,15.6568542 Z"></path>
              </g>
            </g>
        </svg>
      </div>
    </div>
  </div>
  <div class="bg-gray-200 text-pf-blue italic text-xxs mx-px my-px pl-1">{viz.headerText}</div>
  <div class="overflow-x-hidden">
    <VegaViz vegaLiteSpec={vegaLiteSpec} exportOption={allowVizExport}/>
  </div>
</div>