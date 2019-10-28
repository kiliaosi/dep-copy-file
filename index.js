const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const mkdirAsync = promisify(fs.mkdir);
const statAsync = promisify(fs.stat);
const readdirAsync = promisify(fs.readdir);
const copyFileAsync = promisify(fs.copyFile);
function check(name) {
  if (!fs.existsSync(name)) {
    throw new Error(`no such file or directory：${name}`);
  }
}

async function copyDir(source, dest, tasks) {
  check(source);
  const stat = await statAsync(source);
  if (!stat.isDirectory()) {
    throw new Error(`${source} is not a directory`);
  }
  try {
    const directory = await readdirAsync(source);
    for (let item of directory) {
      const stat = await statAsync(path.join(source, item));
      if (!stat.isDirectory()) {
        const sourceItem = path.join(source, item);
        const destItem = path.join(dest, item);
        tasks.push(copyFileAsync(sourceItem, destItem));
      } else {
        const newDestPath = path.join(dest, item);
        const newSourcePath = path.join(source, item);
        if (!fs.existsSync(newDestPath)) {
          await mkdirAsync(newDestPath);
        }
        const handleTask = await copyDir(newSourcePath, newDestPath, []);
        tasks = [...tasks, ...handleTask];
      }
    }

    return tasks;
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
}

async function copyDep(source, dest) {
  if (!fs.existsSync(source)) {
    throw new Error("no such file or directory!");
  }

  const stat = await statAsync(source);

  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      await mkdirAsync(dest, { recursive: true });
    }
    const tasks = await copyDir(source, dest, []);
    return Promise.all(tasks);
  }
  return await copyFileAsync(source, dest);
}

module.exports = copyDep;
