const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const mkdirAsync = promisify(fs.mkdir);
const statAsync = promisify(fs.stat);
const readdirAsync = promisify(fs.readdir);

function check(name) {
  if (!fs.existsSync(name)) {
    throw new Error(`no such file or directory：${name}`);
  }
}
function copyFile(source, dest) {
  try {
    check(source);
    const readStream = fs.createReadStream(source);
    const writeStream = fs.createWriteStream(dest);
    readStream.pipe(writeStream);
    return Promise.resolve("ok");
  } catch (error) {
    return Promise.reject(error);
  }
}


function operation(){
  const tasks = [];
  return async function copyDir(source, dest) {
    check(source);
    const stat = await statAsync(source);
    if (!stat.isDirectory()) {
      throw new Error(`${source} is not a directory`);
    }
    try {
      const directory = await readdirAsync(source);
      for (let item of directory) {
        const stat = await statAsync(path.join(source,item));
        if (!stat.isDirectory()) {
         const sourceItem = path.join(source, item);
         const destItem = path.join(dest, item);
         tasks.push(copyFile(sourceItem,destItem)) ; 
       } else {
          const newDestPath = path.join(dest, item);
          const newSourcePath = path.join(source, item);
          if(!fs.existsSync(newDestPath)){
            await mkdirAsync(newDestPath);
          }
          copyDir(newSourcePath, newDestPath);
        }
      }
  
      return Promise.all(tasks);
    } catch (error) {
        console.log(error)
      return Promise.reject(error);
    }
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
    return await operation()(source, dest);
  }
 return await copyFile(source, dest);
}

module.exports = copyDep;