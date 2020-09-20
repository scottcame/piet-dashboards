import App from './components/App.svelte';
import { LocalRepository, RemoteRepository } from './Repository';

// these imports cause bundling of polyfills, mostly to support IE 11
// add any other polyfills as imports here, and rollup will include them in bundle.js 
import "core-js/stable";
import "regenerator-runtime/runtime";
import "whatwg-fetch";

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
        repository: remote ? new RemoteRepository("/piet-dashboards/") : new LocalRepository()
      }
    });
  }

}
