import { LocalRepository, Repository } from '../src/Repository';
import type { Config } from '../src/Config';
import { RadialMarkSpec } from '../src/VegaLiteSpec';
import type { RenderedVisualization } from '../src/Visualization';

const repository: Repository = new LocalRepository();

test('bar viz', async () => {
  return repository.init().then(async (config: Config) => {
    const viz = config.findVisualization("viz-1-1");
    await viz.render(repository, 200, 200).then((renderedVisualization: RenderedVisualization): void => {
      const spec = renderedVisualization.spec;
      expect(spec.mark).toBe("bar");
      expect(spec.encoding).toBeTruthy();
      expect(spec.encoding.x.field).toBe("Units Ordered");
      expect(spec.encoding.x.type).toBe("quantitative");
      expect(spec.encoding.x.axis.format).toBe(".0%");
      expect(spec.encoding.y.field).toBe("y");
      expect(spec.encoding.y.type).toBe("nominal");
      expect(spec.data.values).toHaveLength(3);
      expect(renderedVisualization.visualization.totalN).toBe(227238);
    });
  });
});

test('bar viz with excludes', async () => {
  return repository.init().then(async (config: Config) => {
    const viz = config.findVisualization("viz-1-2");
    await viz.render(repository, 200, 200).then((renderedVisualization: RenderedVisualization): void => {
      const spec = renderedVisualization.spec;
      expect(spec.data.values).toHaveLength(2);
    });
  });
});

test('line viz', async () => {
  return repository.init().then(async (config: Config) => {
    const viz = config.findVisualization("viz-2-2");
    expect(viz).toBeTruthy();
  });
});

test('pie viz', async () => {
  return repository.init().then(async (config: Config) => {
    const viz = config.findVisualization("viz-1-3");
    await viz.render(repository, 200, 200).then((renderedVisualization: RenderedVisualization): void => {
      
      const spec = renderedVisualization.spec;

      expect(spec.mark).toBeUndefined();
      expect(spec.encoding.theta.field).toBe("Units Ordered");
      expect(spec.encoding.theta.stack).toBe(true);
      expect(spec.encoding.color.field).toBe("y");

      expect(spec.layer[0].mark).toBeInstanceOf(RadialMarkSpec);
      let arcMark = spec.layer[0].mark as RadialMarkSpec;
      expect(arcMark.type).toBe("arc");
      expect(arcMark.outerRadius).toBeTruthy();

      expect(spec.layer[1].mark).toBeInstanceOf(RadialMarkSpec);
      arcMark = spec.layer[1].mark as RadialMarkSpec;
      expect(arcMark.type).toBe("text");
      expect(arcMark.radius).toBeTruthy();

      expect(spec.layer[1].encoding.text.field).toBe("Units Ordered");

      expect(spec.data.values).toHaveLength(3);

    });
  });
});

