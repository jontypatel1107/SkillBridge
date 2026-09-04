// Tiny module-level bridge so any screen can open the Map Picker and receive
// the selected location back — independent of navigator param plumbing.

export interface PickedLocation {
  latitude: number;
  longitude: number;
  label?: string;
}

// The awaitable promise returned by chooseLocation().
let resolveFn: ((loc: PickedLocation | null) => void) | null = null;

// Called by MapPickerScreen on confirm/cancel to deliver the result.
export function completeLocationPick(loc: PickedLocation | null): void {
  if (resolveFn) {
    resolveFn(loc);
    resolveFn = null;
  }
}

/**
 * Returns an async function that opens the MapPicker and awaits the result.
 * Pass it your navigator so the screen can be pushed. Resolves with the picked
 * location, or null if the user cancelled.
 */
export function makeLocationPicker(
  navigate: (name: "MapPicker", params: { initial?: PickedLocation; title?: string }) => void
) {
  return (initial?: PickedLocation, title?: string): Promise<PickedLocation | null> => {
    return new Promise((resolve) => {
      resolveFn = resolve;
      navigate("MapPicker", { initial, title });
    });
  };
}
