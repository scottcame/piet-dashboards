import { LocalRepository, Repository } from '../src/Repository';
import type { Config } from '../src/Config';
import type { VegaLiteSpec } from '../src/VegaLiteSpec';

const repository: Repository = new LocalRepository();

test('bar viz', async () => {
  return repository.init().then(async (config: Config) => {
    const viz = config.findVisualization("viz-1-1");
    await viz.render(repository, 200, 200).then((spec: VegaLiteSpec): void => {
      expect(spec.mark).toBe("bar");
      expect(spec.encoding).toBeTruthy();
      expect(spec.encoding.x.field).toBe("Units Ordered");
      expect(spec.encoding.x.type).toBe("quantitative");
      expect(spec.encoding.x.axis.format).toBe(".0%");
      expect(spec.encoding.y.field).toBe("y");
      expect(spec.encoding.y.type).toBe("nominal");
      expect(spec.data.values).toHaveLength(3);
    });
  });
});

test('bar viz with excludes', async () => {
  return repository.init().then(async (config: Config) => {
    const viz = config.findVisualization("viz-1-2");
    await viz.render(repository, 200, 200).then((spec: VegaLiteSpec): void => {
      expect(spec.data.values).toHaveLength(2);
    });
  });
});

test('timeline viz', async () => {
  return repository.init().then(async (config: Config) => {
    const viz = config.findVisualization("viz-2-2");
    expect(viz).toBeNull();
  });
});

