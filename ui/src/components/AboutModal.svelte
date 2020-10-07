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

  const dispatch: (event: string, detail?: any) => void = createEventDispatcher();

  export let visible: boolean;
  export let contentUrl: string;

  function close() {
    dispatch('close');
    visible = false;
  }

</script>

<div class="{visible ? '' : 'hidden'}">
  <div class="h-full w-full fixed top-0 left-0 bg-gray-300 border-gray-500 opacity-75 z-0">
  </div>
  <div class="h-full w-full fixed flex items-center justify-center top-0 left-0 z-10">
    <div class="bg-white rounded shadow w-1/3 max-h-full select-none border border-gray-500">
      <div class="bg-gray-300 p-2 font-semibold">
          <div name="header">About this Dashboard</div>
      </div>
      <div class="mx-2 my-2 text-xs">
        <div class="h-max-screen-50 h-screen-50 overflow-y-auto m-2">
          <iframe src="{contentUrl}" title="About" class="w-full"/>
        </div>
      </div>
      <div class="flex flex-inline justify-center mb-4 mt-2 flex-none">
        <div class="border-2 border-gray-500 mr-2 p-2 hover:bg-gray-200" on:click={e => close()}>OK</div>
      </div>
    </div>
  </div>
</div>