import { LocalRepository, Repository } from '../src/Repository';
import type { Config } from '../src/Config';
import { TestData } from './_data/TestData';
import type { VegaLiteSpec } from '../src/VegaLiteSpec';

const repository: Repository = new LocalRepository();

test('bar viz', async () => {
  return repository.init().then(async (config: Config) => {
    const viz = config.findVisualization("viz-1-1");
    await viz.render(repository, 200, 200).then((spec: VegaLiteSpec): void => {
      expect(spec.mark).toBe("bar");
      expect(spec.encoding).toBeTruthy();
      expect(spec.encoding.x.field).toBe("m");
      expect(spec.encoding.x.type).toBe("quantitative");
      expect(spec.encoding.x.axis.format).toBe(".0%");
      expect(spec.encoding.y.field).toBe("x");
      expect(spec.encoding.y.type).toBe("nominal");
      expect(spec.data.values).toEqual(TestData.TEST_RESULTS_1D.values.filter((o: any): boolean => {
        return o.x !== undefined;
      }));
    });
  });
});

test('bar viz with excludes', async () => {
  return repository.init().then(async (config: Config) => {
    const viz = config.findVisualization("viz-1-2");
    await viz.render(repository, 200, 200).then((spec: VegaLiteSpec): void => {
      expect(spec.data.values).toEqual(TestData.TEST_RESULTS_1D_EXCLUDES.values.filter((o: any): boolean => {
        return o.x !== undefined;
      }));
    });
  });
});

test('heatgrid viz', async () => {
  return repository.init().then(async (config: Config) => {
    const viz = config.findVisualization("viz-2-1");
    await viz.render(repository, 200, 200).then((spec: VegaLiteSpec): void => {

      expect(spec.encoding).toBeTruthy();
      expect(spec.encoding.x.field).toBe("x");
      expect(spec.encoding.x.type).toBe("nominal");
      expect(spec.encoding.x.axis.labelAngle).toBe(-30);
      expect(spec.encoding.y.field).toBe("y");
      expect(spec.encoding.y.type).toBe("nominal");

      expect(spec.layer).toBeTruthy();
      expect(spec.layer).toHaveLength(2);
      expect(spec.layer[0].mark).toBe("rect");
      expect(spec.layer[0].encoding.color.field).toBe("m");
      expect(spec.layer[0].encoding.color.type).toBe("quantitative");
      expect(spec.layer[0].encoding.color.scale.type).toBe("linear");
      expect(spec.layer[0].encoding.color.legend.title).toBe("Store size in sq ft");
      expect(spec.layer[0].encoding.color.condition).toBeTruthy();

      expect(spec.layer[1].mark).toBe("text");
      expect(spec.layer[1].encoding.text.field).toBe("m");
      expect(spec.layer[1].encoding.text.type).toBe("quantitative");
      expect(spec.layer[1].encoding.color.value).toBe("black");

      expect(spec.data.values).toEqual(TestData.TEST_RESULTS_2D.values.filter((o: any): boolean => {
        return o.x !== undefined && o.y !== undefined;
      }));

    });
  });
});

test('timeline viz', async () => {
  return repository.init().then(async (config: Config) => {
    const viz = config.findVisualization("viz-2-2");
    //console.log(viz.buildQuery());
  });
});

