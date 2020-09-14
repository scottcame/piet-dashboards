import { LocalRepository } from "../src/Repository";
import type { Config } from "../src/Config";
import { UserInterfaceState, WidgetState } from "../src/UserInterfaceState";

const repository = new LocalRepository();

test('init', async () => {
  return repository.init().then(async (config: Config) => {
    expect(repository.uiState).toBeTruthy();
    expect(repository.uiState.widgetStateGrid).toHaveLength(0);
  });
});

test('ui state save and retrieve', async () => {
  return repository.init().then(async (_config: Config) => {
    const uiState = new UserInterfaceState();
    uiState.widgetStateGrid.push([]);
    uiState.widgetStateGrid[0] = [];
    uiState.widgetStateGrid[0][0] = new WidgetState();
    uiState.widgetStateGrid[0][0].vizId = "viz1";
    return repository.saveCurrentState(uiState).then(async (): Promise<void> => {
      return repository.getSavedState().then(async (restoredState: UserInterfaceState): Promise<void> => {
        expect(restoredState.widgetStateGrid[0][0].vizId).toBe("viz1");
        return repository.init().then(async (_config: Config) => {
          return repository.getSavedState().then(async (restoredState2: UserInterfaceState): Promise<void> => {
            expect(restoredState2.widgetStateGrid[0][0].vizId).toBe("viz1");
          });
        });
      });
    });
  });
});


