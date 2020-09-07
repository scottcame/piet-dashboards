import { LocalRepository, Repository } from '../src/Repository';
import type { Config } from '../src/Config';

const repository: Repository = new LocalRepository();

test('bar viz', async () => {
  return repository.init().then(async (config: Config) => {
    const viz = config.findVisualization("viz-1-1");
    console.log(viz.buildQuery());
    viz.render(repository, 200, 200).then((spec: any): void => {
      console.log(JSON.stringify(spec));
    });
  });
});

test('bar viz with excludes', async () => {
  return repository.init().then(async (config: Config) => {
    const viz = config.findVisualization("viz-1-2");
    console.log(viz.buildQuery());
    viz.render(repository, 200, 200).then((spec: any): void => {
      console.log(JSON.stringify(spec));
    });
  });
});
