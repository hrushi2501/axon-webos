import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { useFileSystem } from "../store/filesystem-store";

const initialState = useFileSystem.getInitialState();

beforeEach(() => {
  useFileSystem.setState(initialState, true);
});

const findChild = (parentId: string, name: string) => {
  const file = useFileSystem
    .getState()
    .getFiles(parentId)
    .find((candidate) => candidate.name === name);

  assert.ok(file, `${name} should exist below ${parentId}`);
  return file;
};

test("moves and restores complete folder trees", () => {
  const filesystem = useFileSystem.getState();
  filesystem.createFolder("Test Folder", "downloads");
  const folder = findChild("downloads", "Test Folder");

  filesystem.createFolder("Nested Folder", folder.id);
  filesystem.createFile("Nested File.txt", folder.id);
  const nestedFolder = findChild(folder.id, "Nested Folder");
  const nestedFile = findChild(folder.id, "Nested File.txt");

  filesystem.moveToTrash(folder.id);

  let files = useFileSystem.getState().files;
  assert.equal(files[folder.id]?.parentId, "trash");
  assert.equal(files[folder.id]?.isInTrash, true);
  assert.equal(files[nestedFolder.id]?.isInTrash, true);
  assert.equal(files[nestedFile.id]?.isInTrash, true);
  assert.equal(files.downloads?.children?.includes(folder.id), false);

  filesystem.restoreFromTrash(folder.id);

  files = useFileSystem.getState().files;
  assert.equal(files[folder.id]?.parentId, "downloads");
  assert.equal(files[folder.id]?.isInTrash, false);
  assert.equal(files[nestedFolder.id]?.isInTrash, false);
  assert.equal(files[nestedFile.id]?.isInTrash, false);
  assert.equal(files.downloads?.children?.includes(folder.id), true);
});

test("permanently deletes every descendant of a trashed folder", () => {
  const filesystem = useFileSystem.getState();
  filesystem.createFolder("Delete Me", "downloads");
  const folder = findChild("downloads", "Delete Me");
  filesystem.createFile("Child.txt", folder.id);
  const child = findChild(folder.id, "Child.txt");

  filesystem.moveToTrash(folder.id);
  filesystem.permanentlyDeleteFile(folder.id);

  const files = useFileSystem.getState().files;
  assert.equal(files[folder.id], undefined);
  assert.equal(files[child.id], undefined);
  assert.equal(files.trash?.children?.includes(folder.id), false);
});
