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

import App from './components/App.svelte';
import { LocalRepository, RemoteRepository } from './Repository';

// these imports cause bundling of polyfills, mostly to support IE 11
// add any other polyfills as imports here, and rollup will include them in bundle.js 
import "core-js/stable";
import "regenerator-runtime/runtime";
import "whatwg-fetch";
import "@webcomponents/webcomponentsjs";

// import the dragula css so containers are rendered (mirrored) in transit
// this import will get resolved by the rollup css-only plugin into bundle.css
import 'dragula/dist/dragula.min.css';

export class AppFactory {

  private static readonly INSTANCE = new AppFactory();

  private constructor() {}

  static getInstance(): AppFactory {
    return AppFactory.INSTANCE;
  }

  makeApp(remote: boolean): App {
    return new App({
      target: document.body,
      props: {
        repository: remote ? new RemoteRepository("") : new LocalRepository()
      }
    });
  }

}
