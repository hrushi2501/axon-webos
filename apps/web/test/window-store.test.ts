import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { useWindowStore } from "../store/window-store";

const initialState = useWindowStore.getInitialState();

beforeEach(() => {
  useWindowStore.setState(initialState, true);
});

test("reopening a window focuses it and applies the latest launch data", () => {
  useWindowStore.getState().openWindow("files", {
    data: { initialPath: "documents" },
  });
  useWindowStore.getState().openWindow("files", {
    data: { initialPath: "downloads" },
    title: "Downloads",
  });

  const state = useWindowStore.getState();
  assert.equal(state.windowOrder.length, 1);
  assert.equal(state.activeWindowId, "files");
  assert.equal(state.windows.files?.title, "Downloads");
  assert.deepEqual(state.windows.files?.initialData, {
    initialPath: "downloads",
  });
});
